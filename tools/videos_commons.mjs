#!/usr/bin/env node
/* ============================================================
   CineCode — vídeos reais grátis, sem chave (Wikimedia Commons)
   Para cada aula (src/midia.json), procura vídeos com licença livre
   (CC0, domínio público, CC BY, CC BY-SA), corta 6 s em 4:5 e grava
   media/broll/<aula>-<n>.webm + .jpg, com autor e licença em
   media/creditos.json (o app mostra os créditos).
   Também gera media/_revisao/folha-*.jpg para revisar o que veio.

   Uso: node tools/videos_commons.mjs [--refazer]   (precisa de internet e ffmpeg)
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(root, 'media/broll');
const CRED = path.join(root, 'media/creditos.json');
const REV = path.join(root, 'media/_revisao');
const refazer = process.argv.includes('--refazer');
const UA = 'CineCodeBot/1.0 (curso de programação; github.com/Guidoka7/cinecode)';
const sleep = ms => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(REV, { recursive: true });

const cfg = JSON.parse(fs.readFileSync(path.join(root, 'src/midia.json'), 'utf8'));
const midia = cfg.aulas, evitar = new Set(cfg.evitar || []);
const cred = fs.existsSync(CRED) ? JSON.parse(fs.readFileSync(CRED, 'utf8')) : {};
const usados = new Set(Object.values(cred).map(c => c.arquivo));
const LIVRE = /^(cc0|public domain|pd|cc[ -]by(-sa)?([ -]\d(\.\d)?)?)/i;
const strip = h => String(h || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function api(params) {
  const u = new URL('https://commons.wikimedia.org/w/api.php');
  Object.entries({ format: 'json', formatversion: '2', ...params }).forEach(([k, v]) => u.searchParams.set(k, v));
  for (let t = 0; t < 4; t++) {
    const r = await fetch(u, { headers: { 'User-Agent': UA } });
    if (r.status === 429 || r.status >= 500) { await sleep(5000 * (t + 1)); continue; }
    return r.json();
  }
  return {};
}
async function procurar(q) {
  const j = await api({ action: 'query', generator: 'search', gsrsearch: `${q} filetype:video`, gsrnamespace: '6', gsrlimit: '20',
    prop: 'videoinfo', viprop: 'url|size|mime|derivatives|extmetadata' });
  const pages = (j.query && j.query.pages) || [];
  return pages.map(p => {
    const vi = (p.videoinfo || [])[0] || {};
    const md = vi.extmetadata || {};
    const deriv = (vi.derivatives || []).filter(d => /webm|mp4/.test(d.type || '') && d.height >= 300)
      .sort((a, b) => Math.abs(a.height - 480) - Math.abs(b.height - 480));
    return {
      titulo: p.title, url: vi.descriptionurl, duracao: vi.duration || 0, largura: vi.width, altura: vi.height,
      licenca: strip(md.LicenseShortName && md.LicenseShortName.value), autor: strip(md.Artist && md.Artist.value) || 'Wikimedia Commons',
      fonte: deriv[0] ? deriv[0].src : vi.url
    };
  }).filter(v => v.fonte && v.duracao >= 4 && LIVRE.test(v.licenca) && !evitar.has(v.titulo) && !usados.has(v.titulo));
}
async function baixar(url, dest) {
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error('download ' + r.status);
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'commons-'));
let novos = 0, sem = [];
for (const [aula, buscas] of Object.entries(midia)) {
  for (let i = 0; i < buscas.length; i++) {
    const nome = `${aula}-${i + 1}`, dest = path.join(OUT, nome + '.webm');
    if (!refazer && fs.existsSync(dest)) continue;
    // tenta a busca completa e depois versões mais curtas
    const palavras = buscas[i].split(' ');
    const tentativas = [buscas[i], palavras.slice(0, 2).join(' '), palavras.slice(-2).join(' ')].filter((x, k, a) => x && a.indexOf(x) === k);
    let v = null;
    for (const q of tentativas) { const r = await procurar(q); v = r[0]; if (v) break; await sleep(300); }
    if (!v) { sem.push(`${nome} (${buscas[i]})`); continue; }
    try {
      const src = path.join(tmp, 'src');
      await baixar(v.fonte, src);
      const ss = Math.max(0, Math.min(v.duracao * 0.15, v.duracao - 6.5)).toFixed(1);
      execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', ss, '-i', src, '-t', '6',
        '-vf', 'scale=400:500:force_original_aspect_ratio=increase,crop=400:500,fps=24',
        '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '38', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '3', '-pix_fmt', 'yuv420p', '-an', dest]);
      execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', '1', '-i', dest, '-vframes', '1', '-q:v', '6', path.join(OUT, nome + '.jpg')]);
      cred[nome] = { arquivo: v.titulo, autor: v.autor, licenca: v.licenca, url: v.url, fonte: 'Wikimedia Commons', busca: buscas[i] };
      usados.add(v.titulo); novos++;
      fs.writeFileSync(CRED, JSON.stringify(cred, null, 1));
      console.log(`  ✓ ${nome} ← ${v.titulo} [${v.licenca}]`);
    } catch (e) { console.warn(`  ✗ ${nome}: ${e.message}`); }
    await sleep(500);
  }
}
fs.rmSync(tmp, { recursive: true, force: true });

// folhas de revisão: capas com o nome da aula (para conferir se o vídeo combina)
const capas = fs.readdirSync(OUT).filter(f => f.endsWith('.jpg')).sort();
for (let k = 0; k * 30 < capas.length; k++) {
  const grupo = capas.slice(k * 30, k * 30 + 30);
  const lista = path.join(REV, 'lista.txt');
  fs.writeFileSync(lista, grupo.map(f => `file '${path.join(OUT, f)}'`).join('\n'));
  try {
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lista,
      '-vf', `scale=160:200,drawtext=text='%{metadata\\:lavf.image2dec.source_basename}':fontcolor=white:fontsize=12:box=1:boxcolor=black@0.6:x=4:y=4,tile=6x5`,
      '-frames:v', '1', path.join(REV, `folha-${k + 1}.jpg`)]);
  } catch (e) {
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lista, '-vf', 'scale=160:200,tile=6x5', '-frames:v', '1', path.join(REV, `folha-${k + 1}.jpg`)]);
  }
  fs.writeFileSync(path.join(REV, `folha-${k + 1}.txt`), grupo.join('\n'));
}
fs.rmSync(path.join(REV, 'lista.txt'), { force: true });
console.log(`Commons: ${novos} vídeos novos · ${capas.length} no total · sem resultado: ${sem.length}`);
if (sem.length) fs.writeFileSync(path.join(REV, 'sem-resultado.txt'), sem.join('\n'));
