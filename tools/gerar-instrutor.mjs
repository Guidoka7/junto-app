#!/usr/bin/env node
/* ============================================================
   CineCode — instrutor realista (avatar HeyGen)
   Gera um vídeo do instrutor abrindo cada aula (≈10 s, voz humana,
   gestos e boca sincronizada) em media/instrutor/<aula>.mp4.

   Uso:
     HEYGEN_API_KEY=... HEYGEN_AVATAR_ID=... node tools/gerar-instrutor.mjs [--estimar] [--limite 5]
   Opcional: HEYGEN_VOICE_ID (senão escolhe uma voz pt-BR da conta).
   Só gera o que ainda não existe (pode rodar várias vezes).
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(root, 'media/instrutor');
const KEY = process.env.HEYGEN_API_KEY, AVATAR = process.env.HEYGEN_AVATAR_ID;
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

import { roteiros } from './roteiros-instrutor.mjs';

async function api(p, body) {
  const r = await fetch('https://api.heygen.com' + p, {
    method: body ? 'POST' : 'GET',
    headers: { 'X-Api-Key': KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`HeyGen ${r.status}: ${JSON.stringify(j.error || j).slice(0, 200)}`);
  return j.data;
}
async function vozPt() {
  if (process.env.HEYGEN_VOICE_ID) return process.env.HEYGEN_VOICE_ID;
  const d = await api('/v2/voices');
  const vs = (d.voices || []).filter(v => /portug/i.test(v.language || '') );
  const br = vs.find(v => /brazil|brasil|pt-br/i.test(`${v.language} ${v.name}`)) || vs[0];
  if (!br) throw new Error('Nenhuma voz em português na conta HeyGen; defina HEYGEN_VOICE_ID.');
  console.log('Voz escolhida:', br.name, `(${br.voice_id})`);
  return br.voice_id;
}

async function main() {
  const todos = roteiros();
  fs.mkdirSync(OUT, { recursive: true });
  const falta = todos.filter(r => !fs.existsSync(path.join(OUT, r.id + '.webm')));
  const seg = falta.reduce((s, r) => s + r.texto.length / 14, 0);
  console.log(`Aberturas: ${todos.length} aulas · faltam ${falta.length} (~${(seg / 60).toFixed(0)} min de vídeo de avatar)`);
  if (args.includes('--estimar')) return;
  if (!KEY || !AVATAR) { console.log('Sem HEYGEN_API_KEY/HEYGEN_AVATAR_ID — nada a fazer.'); return; }
  const voz = await vozPt();
  const fila = falta.slice(0, Number(opt('limite', 1e9)));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'inst-'));
  let ok = 0;
  const trabalhar = async () => {
    while (fila.length) {
      const r = fila.shift();
      try {
        const { video_id } = await api('/v2/video/generate', {
          video_inputs: [{
            character: { type: 'avatar', avatar_id: AVATAR, avatar_style: 'normal' },
            voice: { type: 'text', input_text: r.texto, voice_id: voz, speed: 1.0 },
            background: { type: 'color', value: '#0b0d12' }
          }],
          dimension: { width: 720, height: 1280 }
        });
        let st;
        for (let k = 0; k < 120; k++) { await sleep(10000); st = await api('/v1/video_status.get?video_id=' + video_id); if (st.status === 'completed' || st.status === 'failed') break; }
        if (!st || st.status !== 'completed') throw new Error('falhou: ' + JSON.stringify(st && st.error || st && st.status));
        const src = path.join(tmp, r.id + '.mp4');
        fs.writeFileSync(src, Buffer.from(await (await fetch(st.video_url)).arrayBuffer()));
        // 400x500 (4:5), recorte de busto, áudio mono leve
        execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', src,
          '-vf', 'scale=400:-2,crop=400:500:0:ih*0.05,fps=25', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '36', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p',
          '-c:a', 'libopus', '-b:a', '40k', '-ac', '1', path.join(OUT, r.id + '.webm')]);
        execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', path.join(OUT, r.id + '.webm'), '-vframes', '1', '-q:v', '5', path.join(OUT, r.id + '.jpg')]);
        fs.writeFileSync(path.join(OUT, r.id + '.txt'), r.texto);
        ok++; console.log(`  ✓ ${r.id}`);
      } catch (e) {
        console.warn(`  ✗ ${r.id}: ${e.message}`);
        if (/40[12]|quota|credit|insufficient/i.test(e.message)) { fila.length = 0; }
      }
    }
  };
  await Promise.all([trabalhar(), trabalhar(), trabalhar()]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`Instrutor: ${ok} vídeos novos.`);
}
main().catch(e => { console.error(e); process.exit(1); });
