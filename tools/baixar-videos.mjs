#!/usr/bin/env node
/* ============================================================
   CineCode — vídeos reais das aulas (Pixabay ou Pexels)
   Para cada aula, busca 2 vídeos reais (src/midia.json), corta 6 s,
   enquadra em 4:5, comprime e grava em media/broll/<aula>-<n>.mp4
   + media/broll/<aula>-<n>.jpg (quadro de capa) + media/creditos.json.

   Uso:  PIXABAY_API_KEY=... node tools/baixar-videos.mjs [--refazer]
         (ou PEXELS_API_KEY=...)
   Precisa de ffmpeg. Só baixa o que ainda não existe.
   Licenças Pixabay e Pexels: uso comercial liberado, sem atribuição
   obrigatória (o app mostra os créditos mesmo assim).
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(root, 'media/broll');
const CRED = path.join(root, 'media/creditos.json');
const KEY = process.env.PEXELS_API_KEY;
const PIXA = process.env.PIXABAY_API_KEY;
const refazer = process.argv.includes('--refazer');
if (!KEY && !PIXA) { console.log('Sem PIXABAY_API_KEY nem PEXELS_API_KEY — nada a fazer.'); process.exit(0); }

fs.mkdirSync(OUT, { recursive: true });
const midia = JSON.parse(fs.readFileSync(path.join(root, 'src/midia.json'), 'utf8')).aulas;
const cred = fs.existsSync(CRED) ? JSON.parse(fs.readFileSync(CRED, 'utf8')) : {};
const usados = new Set(Object.values(cred).map(c => c.id));
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function pexels(query, orientation) {
  const u = new URL('https://api.pexels.com/videos/search');
  u.searchParams.set('query', query); u.searchParams.set('per_page', '20'); u.searchParams.set('size', 'medium');
  if (orientation) u.searchParams.set('orientation', orientation);
  for (let t = 0; t < 4; t++) {
    const r = await fetch(u, { headers: { Authorization: KEY } });
    if (r.status === 429) { await sleep(15000 * (t + 1)); continue; }
    if (!r.ok) throw new Error(`Pexels ${r.status}: ${(await r.text()).slice(0, 150)}`);
    return (await r.json()).videos || [];
  }
  return [];
}
/* Pixabay: converte o resultado para o mesmo formato usado com o Pexels */
async function pixabay(query) {
  const u = new URL('https://pixabay.com/api/videos/');
  u.searchParams.set('key', PIXA); u.searchParams.set('q', query.slice(0, 100)); u.searchParams.set('per_page', '30');
  u.searchParams.set('safesearch', 'true'); u.searchParams.set('video_type', 'film'); u.searchParams.set('lang', 'en');
  for (let t = 0; t < 4; t++) {
    const r = await fetch(u);
    if (r.status === 429) { await sleep(20000 * (t + 1)); continue; }
    if (!r.ok) throw new Error(`Pixabay ${r.status}: ${(await r.text()).slice(0, 150)}`);
    return ((await r.json()).hits || []).map(h => ({
      id: 'px' + h.id, duration: h.duration, url: h.pageURL,
      user: { name: h.user, url: `https://pixabay.com/users/${h.user}-${h.user_id}/` },
      video_files: Object.values(h.videos || {}).filter(f => f && f.url).map(f => ({ link: f.url, width: f.width, height: f.height, file_type: 'video/mp4' }))
    }));
  }
  return [];
}
async function buscar(q) {
  if (PIXA) return pixabay(q);
  let lista = await pexels(q, 'portrait');
  if (lista.filter(v => v.duration >= 5).length < 3) lista = lista.concat(await pexels(q));
  return lista;
}
function melhorArquivo(v) {
  const mp4 = (v.video_files || []).filter(f => /mp4/.test(f.file_type || '') && f.width && f.height);
  // perto de 720p (bom para recortar 480x600 sem pesar no download)
  return mp4.sort((a, b) => Math.abs(Math.min(a.width, a.height) - 720) - Math.abs(Math.min(b.width, b.height) - 720))[0];
}
async function baixar(url, dest) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('download ' + r.status);
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
}

let novos = 0, falhas = 0;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'broll-'));
for (const [aula, buscas] of Object.entries(midia)) {
  for (let i = 0; i < buscas.length; i++) {
    const nome = `${aula}-${i + 1}`;
    const mp4 = path.join(OUT, nome + '.webm');
    if (!refazer && fs.existsSync(mp4)) continue;
    try {
      const lista = await buscar(buscas[i]);
      const v = lista.find(x => x.duration >= 5 && !usados.has(x.id) && melhorArquivo(x));
      if (!v) { console.warn(`  sem vídeo para "${buscas[i]}" (${nome})`); falhas++; continue; }
      const f = melhorArquivo(v);
      const src = path.join(tmp, 'src.mp4');
      await baixar(f.link, src);
      const ss = Math.min(2, Math.max(0, v.duration / 2 - 3)).toFixed(1);
      // 6 s, 400x500 (4:5), 24 fps, sem áudio, leve para o celular
      execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', ss, '-i', src, '-t', '6',
        '-vf', 'scale=400:500:force_original_aspect_ratio=increase,crop=400:500,fps=24,eq=saturation=1.05',
        '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '38', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p',
        '-an', mp4]);
      execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', mp4, '-vframes', '1', '-q:v', '6', path.join(OUT, nome + '.jpg')]);
      cred[nome] = { id: v.id, autor: v.user && v.user.name, perfil: v.user && v.user.url, url: v.url, fonte: PIXA ? 'Pixabay' : 'Pexels', busca: buscas[i] };
      usados.add(v.id); novos++;
      fs.writeFileSync(CRED, JSON.stringify(cred, null, 1));
      process.stdout.write(`  ✓ ${nome} ← ${buscas[i]} (${(fs.statSync(mp4).size / 1024).toFixed(0)} KB)\n`);
      await sleep(400);
    } catch (e) { console.warn(`  ✗ ${nome}: ${e.message}`); falhas++; if (/(Pexels|Pixabay) 40[013]/.test(e.message)) process.exit(1); }
  }
}
fs.rmSync(tmp, { recursive: true, force: true });
const total = fs.readdirSync(OUT).filter(f => f.endsWith('.webm'));
const mb = total.reduce((s, f) => s + fs.statSync(path.join(OUT, f)).size, 0) / 1048576;
console.log(`Vídeos reais: ${novos} novos · ${total.length} no total · ${mb.toFixed(1)} MB${falhas ? ` · ${falhas} sem resultado` : ''}`);
