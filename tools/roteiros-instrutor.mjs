#!/usr/bin/env node
/* Roteiros das aberturas do instrutor (uma por aula). Uso: node tools/roteiros-instrutor.mjs > roteiros.json */
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export function roteiros() {
  const dir = path.join(root, 'src/content');
  const content = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort().map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
  const CC = new Function('window', `var CC = window.CC = {tracks: [], patches: [], patch() {}};\n${content}\nreturn CC;`)({});
  const clean = s => String(s || '').replace(/\*\*|`/g, '').replace(/ & /g, ' e ').replace(/\p{Extended_Pictographic}|️/gu, '').trim();
  const out = [];
  const tpl = [
    (t, l, n, gancho) => `Oi! Bem-vindo à aula ${n} de ${t}. Hoje o assunto é ${l}. ${gancho} Bora começar?`,
    (t, l, n, gancho) => `Olá! Na aula ${n} de ${t}, vamos estudar ${l}. ${gancho} Presta atenção nos exemplos, porque no final tem prática.`,
    (t, l, n, gancho) => `E aí, tudo certo? Chegou a hora de aprender ${l}, aula ${n} de ${t}. ${gancho} Vem comigo!`,
    (t, l, n, gancho) => `Seja bem-vindo! Esta é a aula ${n} de ${t}: ${l}. ${gancho} No final, você faz um teste e recebe a sua nota.`
  ];
  CC.tracks.sort((a, b) => a.ord - b.ord).forEach(t => t.lessons.forEach((l, i) => {
    const an = (l.b || []).find(s => s[0] === 'an' || s[0] === 't');
    const h = an ? clean(an[0] === 'an' ? an[2] : an[1]).replace(/[.!?:]$/, '') : '';
    const gancho = !an ? '' : an[0] === 'an' ? `Vou te explicar com uma comparação do dia a dia: ${h.charAt(0).toLowerCase() + h.slice(1)}.` : `A gente começa por aqui: ${h.charAt(0).toLowerCase() + h.slice(1)}.`;
    out.push({ id: l.id, texto: tpl[out.length % tpl.length](clean(t.name), clean(l.title), i + 1, gancho) });
  }));
  return out;
}


if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) process.stdout.write(JSON.stringify(roteiros()));
