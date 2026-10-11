#!/usr/bin/env node
/* ============================================================
   CineCode — gerador de narração com voz de IA
   Lê todas as videoaulas, gera um áudio por fala e grava em audio/
   (audio/<hash>.<ext> + audio/manifest.json). O build coloca essa
   pasta dentro do APK; o app toca esses áudios e, se faltar algum,
   usa a voz do aparelho.

   Uso:
     node tools/narrar.mjs --estimar            # só conta falas e custo
     node tools/narrar.mjs --amostra 5          # gera 5 falas para ouvir a voz
     node tools/narrar.mjs                      # gera tudo o que falta
     node tools/narrar.mjs --tudo               # refaz o curso inteiro com outra voz
     node tools/narrar.mjs --limpar             # apaga áudios que não são mais usados
   Depois: node tools/empacotar-audio.mjs  (junta tudo em audio/pack, que vai para o app)

   Provedores (escolhe o primeiro com chave configurada, ou --provedor):
     azure       AZURE_SPEECH_KEY + AZURE_SPEECH_REGION   (voz: AZURE_VOICE, padrão pt-BR-FranciscaNeural)
     openai      OPENAI_API_KEY                           (voz: OPENAI_VOICE, padrão nova)
     elevenlabs  ELEVENLABS_API_KEY + ELEVENLABS_VOICE_ID

   É incremental: falas que já têm áudio não são geradas de novo,
   então ao editar uma aula você só paga pelas frases novas.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(root, 'audio');
const args = process.argv.slice(2);
const flag = n => args.includes('--' + n);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };

/* ---------- 1. carregar roteiros ---------- */
function loadNarrations() {
  const dir = path.join(root, 'src/content');
  const content = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort()
    .map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
  const vg = fs.readFileSync(path.join(root, 'src/videogen.js'), 'utf8');
  const make = new Function('window', `var CC = window.CC = {tracks: [], patches: [], patch(p, ex) { this.patches.push([p, ex || {}]); }};
${content}
${vg}
return { CC, allNarrations, hashStr };`);
  const { CC, allNarrations, hashStr } = make({});
  const T = CC.tracks.sort((a, b) => (a.ord || 0) - (b.ord || 0));
  // mesmas regras do app (src/app.js) para aplicar os complementos das aulas
  CC.patches.forEach(([p, ex]) => T.forEach(t => {
    t.lessons.forEach(l => { const x = p[l.id]; if (x) { if (x.rec) l.rec = x.rec; if (x.quiz) l.quiz = [...(l.quiz || []), ...x.quiz]; } });
    if (ex[t.id]) t.exam = [...(t.exam || []), ...ex[t.id]];
  }));
  return allNarrations(T).map(text => ({ text, h: hashStr(text) }));
}

/* ---------- 2. provedores ---------- */
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const PROVIDERS = {
  azure: {
    ok: () => process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION,
    ext: 'webm', // Opus 24 kbps: voz limpa com metade do tamanho de um MP3
    pricePerMillion: 16, // US$ por 1 milhão de caracteres (voz neural); 0,5 mi/mês grátis no plano F0
    async speak(text) {
      const voice = process.env.AZURE_VOICE || 'pt-BR-FranciscaNeural';
      const rate = process.env.AZURE_RATE || '+4%';
      const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="pt-BR"><voice name="${voice}"><mstts:express-as style="${process.env.AZURE_STYLE || 'friendly'}"><prosody rate="${rate}">${esc(text)}</prosody></mstts:express-as></voice></speak>`;
      const r = await fetch(`https://${process.env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'webm-24khz-16bit-24kbps-mono-opus',
          'User-Agent': 'cinecode-narrar'
        },
        body: ssml
      });
      if (!r.ok) throw new Error(`Azure ${r.status}: ${(await r.text()).slice(0, 200)}`);
      return Buffer.from(await r.arrayBuffer());
    }
  },
  openai: {
    ok: () => process.env.OPENAI_API_KEY,
    ext: 'ogg',
    pricePerMillion: 15,
    async speak(text) {
      const model = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
      const body = { model, voice: process.env.OPENAI_VOICE || 'nova', input: text, response_format: 'opus' };
      if (model.includes('4o')) body.instructions = process.env.OPENAI_INSTRUCTIONS ||
        'Fale em português do Brasil, com sotaque brasileiro natural. Tom de professor de cursinho: claro, caloroso, animado e confiante, ritmo de narração de documentário.';
      const r = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!r.ok) throw new Error(`OpenAI ${r.status}: ${(await r.text()).slice(0, 200)}`);
      return Buffer.from(await r.arrayBuffer());
    }
  },
  elevenlabs: {
    ok: () => process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID,
    ext: 'mp3',
    pricePerMillion: 180, // aproximado; depende do plano
    async speak(text) {
      const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}?output_format=mp3_22050_32`, {
        method: 'POST',
        headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text, model_id: process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2', language_code: 'pt',
          voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.25, use_speaker_boost: true }
        })
      });
      if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${(await r.text()).slice(0, 200)}`);
      return Buffer.from(await r.arrayBuffer());
    }
  }
};

/* ---------- 3. execução ---------- */
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fmtUSD = n => 'US$ ' + n.toFixed(2).replace('.', ',');

async function main() {
  const all = loadNarrations();
  const chars = all.reduce((s, x) => s + x.text.length, 0);
  fs.mkdirSync(OUT, { recursive: true });
  const mfPath = path.join(OUT, 'manifest.json');
  const manifest = fs.existsSync(mfPath) ? JSON.parse(fs.readFileSync(mfPath, 'utf8')) : {};
  // confere que os arquivos do manifesto existem
  for (const [h, f] of Object.entries(manifest)) if (!fs.existsSync(path.join(OUT, f))) delete manifest[h];
  // falas que já estão no pacote (audio/pack) também contam como prontas, a não ser com --tudo (trocar a voz do curso inteiro)
  const pk = path.join(OUT, 'pack', 'index.json');
  const packed = !flag('tudo') && fs.existsSync(pk) ? JSON.parse(fs.readFileSync(pk, 'utf8')) : {};
  const todo = all.filter(x => !manifest[x.h] && !packed[x.h]);
  const todoChars = todo.reduce((s, x) => s + x.text.length, 0);
  const minutes = chars / 14.5 / 60;

  console.log(`Falas no curso: ${all.length} (${chars.toLocaleString('pt-BR')} caracteres, ~${(minutes / 60).toFixed(1)} h de áudio)`);
  console.log(`Já geradas: ${all.length - todo.length} · Faltam: ${todo.length} (${todoChars.toLocaleString('pt-BR')} caracteres)`);

  if (flag('limpar')) {
    const used = new Set(all.map(x => x.h));
    let n = 0;
    for (const [h, f] of Object.entries(manifest)) if (!used.has(h)) { fs.rmSync(path.join(OUT, f), { force: true }); delete manifest[h]; n++; }
    fs.writeFileSync(mfPath, JSON.stringify(manifest));
    console.log(`Removidos ${n} áudios que não são mais usados.`);
    return;
  }
  if (flag('estimar')) {
    console.log('\nCusto estimado para gerar o que falta:');
    for (const [k, p] of Object.entries(PROVIDERS)) console.log(`  ${k.padEnd(11)} ${fmtUSD(todoChars / 1e6 * p.pricePerMillion)}`);
    console.log('  (Azure tem 500 mil caracteres grátis por mês no plano F0.)');
    return;
  }

  const name = opt('provedor', Object.keys(PROVIDERS).find(k => PROVIDERS[k].ok()));
  const prov = PROVIDERS[name];
  if (!prov || !prov.ok()) {
    console.log('\nNenhuma chave de voz configurada — nada a fazer. O app usará a voz do aparelho.');
    console.log('Configure AZURE_SPEECH_KEY + AZURE_SPEECH_REGION, OPENAI_API_KEY ou ELEVENLABS_API_KEY + ELEVENLABS_VOICE_ID.');
    return;
  }
  const limit = flag('amostra') ? Number(opt('amostra', 5)) : Infinity;
  const queue = todo.slice(0, limit);
  console.log(`\nGerando ${queue.length} falas com ${name}...`);

  let done = 0, failed = 0, sinceSave = 0;
  const save = () => fs.writeFileSync(mfPath, JSON.stringify(manifest));
  const conc = Number(opt('paralelo', name === 'elevenlabs' ? 2 : 4));
  async function worker() {
    while (queue.length) {
      const item = queue.shift();
      let ok = false;
      for (let tent = 0; tent < 5 && !ok; tent++) {
        try {
          const buf = await prov.speak(item.text);
          if (buf.length < 500) throw new Error('áudio vazio');
          const file = `${item.h}.${prov.ext}`;
          fs.writeFileSync(path.join(OUT, file), buf);
          manifest[item.h] = file;
          ok = true;
        } catch (e) {
          // chave inválida ou créditos acabaram: para tudo (as falas já feitas ficam salvas)
          if (/\b(401|402|403)\b|quota|insufficient|credits/i.test(e.message)) { console.error('Parando: ' + e.message); queue.length = 0; failed++; break; }
          const wait = /429|5\d\d/.test(e.message) ? 4000 * (tent + 1) : 1500;
          if (tent === 4) { failed++; console.warn(`  ✗ ${item.h}: ${e.message}`); } else await sleep(wait);
        }
      }
      done++;
      if (++sinceSave >= 25) { save(); sinceSave = 0; }
      if (done % 50 === 0 || !queue.length) process.stdout.write(`  ${done}/${done + queue.length}\n`);
    }
  }
  await Promise.all(Array.from({ length: conc }, worker));
  save();
  const mb = fs.readdirSync(OUT).reduce((s, f) => s + fs.statSync(path.join(OUT, f)).size, 0) / 1048576;
  console.log(`\nPronto: ${Object.keys(manifest).length}/${all.length} falas com voz de IA · ${mb.toFixed(1)} MB em audio/` + (failed ? ` · ${failed} falharam (rode de novo para tentar)` : ''));
}
main().catch(e => { console.error(e); process.exit(1); });
