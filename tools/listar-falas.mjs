#!/usr/bin/env node
/* Lista todas as falas das videoaulas: [{ h: hash, t: trilha, text }]
   Ordem: nível Básico de todas as trilhas, depois Intermediário, depois Avançado. */
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export function listarFalas() {
  const dir = path.join(root, 'src/content');
  const content = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort().map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
  const vg = fs.readFileSync(path.join(root, 'src/videogen.js'), 'utf8');
  const { CC, lessonVideo, recapVideo, chapterVideo, hashStr } = new Function('window', `var CC = window.CC = {tracks: [], patches: [], patch(p, ex) { this.patches.push([p, ex || {}]); }};\n${content}\n${vg}\nreturn { CC, lessonVideo, recapVideo, chapterVideo, hashStr };`)({});
  const T = CC.tracks.sort((a, b) => (a.ord || 0) - (b.ord || 0));
  CC.patches.forEach(([p, ex]) => T.forEach(t => {
    t.lessons.forEach(l => { const x = p[l.id]; if (x) { if (x.rec) l.rec = x.rec; if (x.quiz) l.quiz = [...(l.quiz || []), ...x.quiz]; } });
    if (ex[t.id]) t.exam = [...(t.exam || []), ...ex[t.id]];
  }));
  const out = [], seen = new Set();
  const add = (t, s) => { if (!s || seen.has(s)) return; seen.add(s); out.push({ h: hashStr(s), t: t.id, text: s }); };
  for (const lv of ['b', 'i', 'a']) for (const t of T) {
    t.lessons.forEach(l => { lessonVideo(t, l, lv).shots.forEach(x => add(t, x.say)); recapVideo(t, l, lv).shots.forEach(x => add(t, x.say)); });
    chapterVideo(t, lv).shots.forEach(x => add(t, x.say));
  }
  return out;
}
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const f = listarFalas();
  if (process.argv.includes('--faltando')) {
    const pk = path.join(root, 'audio/pack/index.json'), mf = path.join(root, 'audio/manifest.json');
    const have = new Set([...(fs.existsSync(pk) ? Object.keys(JSON.parse(fs.readFileSync(pk, 'utf8'))) : []), ...(fs.existsSync(mf) ? Object.keys(JSON.parse(fs.readFileSync(mf, 'utf8'))) : [])]);
    console.log(f.filter(x => !have.has(x.h)).length);
  } else process.stdout.write(JSON.stringify(f));
}
