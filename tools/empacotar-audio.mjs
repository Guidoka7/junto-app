#!/usr/bin/env node
/* Junta a narração em um pacote por trilha:
   audio/pack/<trilha>.webm + audio/pack/index.json  { hash: [arquivo, início, tamanho, tipo?] }
   Fontes: áudios avulsos de audio/ (manifest.json) e o pacote anterior (falas que não mudaram).
   Falas que não existem mais no curso ficam de fora. O app baixa o pacote da trilha
   uma vez e toca cada fala recortando o trecho. */
import fs from 'node:fs';
import path from 'node:path';
import { listarFalas } from './listar-falas.mjs';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const A = path.join(root, 'audio'), P = path.join(A, 'pack');
const read = f => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {});
const mf = read(path.join(A, 'manifest.json'));
const oldIdx = read(path.join(P, 'index.json'));
const oldBufs = {};
const oldSlice = e => {
  oldBufs[e[0]] ||= fs.existsSync(path.join(P, e[0])) ? fs.readFileSync(path.join(P, e[0])) : null;
  return oldBufs[e[0]] ? Buffer.from(oldBufs[e[0]].subarray(e[1], e[1] + e[2])) : null;
};
const typeOf = f => (f.endsWith('.mp3') ? 'audio/mpeg' : f.endsWith('.ogg') ? 'audio/ogg' : 'audio/webm');
const groups = {};
let novos = 0, mantidos = 0;
for (const { h, t } of listarFalas()) {
  let b = null, type = 'audio/webm';
  if (mf[h] && fs.existsSync(path.join(A, mf[h]))) { b = fs.readFileSync(path.join(A, mf[h])); type = typeOf(mf[h]); novos++; }
  else if (oldIdx[h]) { b = oldSlice(oldIdx[h]); type = oldIdx[h][3] || 'audio/webm'; if (b) mantidos++; }
  if (b) (groups[t] ||= []).push([h, b, type]);
}
const VOZ = fs.existsSync(path.join(P, 'VOZ.txt')) ? fs.readFileSync(path.join(P, 'VOZ.txt'), 'utf8') : null;
fs.rmSync(P, { recursive: true, force: true });
fs.mkdirSync(P, { recursive: true });
const index = {}; let total = 0;
for (const [t, items] of Object.entries(groups)) {
  const file = t + '.webm'; let off = 0;
  for (const [h, b, type] of items) { index[h] = type === 'audio/webm' ? [file, off, b.length] : [file, off, b.length, type]; off += b.length; }
  fs.writeFileSync(path.join(P, file), Buffer.concat(items.map(x => x[1]))); total += off;
}
fs.writeFileSync(path.join(P, 'index.json'), JSON.stringify(index));
if (VOZ) fs.writeFileSync(path.join(P, 'VOZ.txt'), VOZ);
console.log(`Pacotes: ${Object.keys(groups).length} trilhas · ${Object.keys(index).length} falas (${novos} de audio/, ${mantidos} do pacote anterior) · ${(total / 1048576).toFixed(1)} MB`);
