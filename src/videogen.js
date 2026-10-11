/* ============================================================
   Roteiros das videoaulas (sem DOM — também roda no Node,
   no gerador de narração tools/narrar.mjs)
   ============================================================ */
const LVNAME = { b: 'Básico', i: 'Intermediário', a: 'Avançado' };
/* mídia real de cada aula (montada pelo build a partir de media/):
   broll = vídeos reais de fundo; instrutor = abertura gravada pelo instrutor */
const MID = (typeof window !== 'undefined' && window.CC && window.CC.midia) || {};
const brollOf = l => ((MID.broll || {})[l.id]) || [];
const instOf = l => ((MID.instrutor || {})[l.id]) || null;
const iluOf = brollOf;

function speechText(s) {
  return String(s || '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\p{Extended_Pictographic}|️|‍/gu, '')
    .replace(/→|=>/g, ', ')
    .replace(/·/g, ',')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();
}
function hashStr(s) {
  let h = 0x811c9dc5;
  for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}
const endDot = s => (/[.!?:]$/.test(s) ? s : s + '.');
const sayJoin = (...parts) => parts.filter(Boolean).map(p => endDot(speechText(p))).join(' ');

function sceneShot(s) {
  const k = s[0];
  if (k === 't') return { k: 'text', h: s[1], p: s[2], say: sayJoin(s[1], s[2]) };
  if (k === 'an') return { k: 'emoji', e: s[1], h: s[2], p: s[3], say: sayJoin(s[2], s[3]) };
  if (k === 'list') return { k: 'points', h: s[1], items: s[2], say: sayJoin(s[1], ...s[2]) };
  if (k === 'flow') return { k: 'flow', h: s[1], steps: s[2], say: sayJoin(s[1], ...s[2].map((x, i) => `Passo ${i + 1}: ${x}`)) };
  if (k === 'tbl') return { k: 'table', h: s[1], cols: s[2], rows: s[3], say: sayJoin(s[1], 'Observe a tabela na tela.') };
  if (k === 'sheet') return { k: 'table', h: s[1], cols: s[2][0], rows: s[2].slice(1), say: sayJoin(s[1], s[3] || 'Observe a planilha na tela.') };
  if (k === 'tip') return { k: 'text', tag: 'Dica de bastidor', h: 'Dica', p: s[1], say: sayJoin('Uma dica', s[1]) };
  if (k === 'code' || k === 'run') return { k: 'code', run: k === 'run', lang: s[1], code: s[2], cap: s[3], say: sayJoin(s[3] || 'Observe este código com atenção.') };
  return null;
}
function firstQuiz(l, lv) {
  return (l.quiz || []).find(q => (q.lv === '*' || q.lv === lv) && (!q.t || q.t === 'mc' || q.t === 'tf'));
}
function quizShot(q) {
  return q ? { k: 'quiz', q, say: sayJoin('Pausa para pensar', q.q) } : null;
}
function recPoints(l, lv) {
  if (l.rec && l.rec.length) return l.rec;
  return (l[lv] || l.b || []).map(s => (s[0] === 'an' ? s[2] : s[0] === 'tip' ? null : s[1])).filter(x => x && !/^(py|js|sql|html|css|bash)$/.test(x)).slice(0, 5);
}

/* videoaula: a teoria da aula narrada, com pergunta no meio */
function lessonVideo(t, l, lv) {
  const scenes = (l[lv] || l.i || l.b).map(sceneShot).filter(Boolean);
  const intro = { b: 'Vamos aprender juntos, com calma e muitos exemplos.', i: 'Vamos direto aos conceitos e às armadilhas mais comuns.', a: 'Vamos aos detalhes que fazem diferença no trabalho de verdade.' }[lv];
  const im = brollOf(l);
  const shots = [{ k: 'title', eyebrow: `${t.name} · Videoaula`, title: l.title, sub: `Nível ${LVNAME[lv]}`, bg: im[0], inst: instOf(l), say: sayJoin(`Videoaula: ${l.title}`, intro) }];
  scenes.forEach((sc, k) => { if (im.length && sc.k !== 'code') sc.bg = im[(k + 1) % im.length]; });
  const mid = Math.max(1, Math.ceil(scenes.length / 2));
  scenes.forEach((s, i) => { shots.push(s); if (i === mid - 1) { const q = quizShot(firstQuiz(l, lv)); if (q) shots.push(q); } });
  shots.push({ k: 'end', h: 'Fim da videoaula', p: 'Agora explore as cenas, rode os exemplos e pratique.', bg: im[1] || im[0], say: sayJoin('Fim da videoaula', 'Agora explore as cenas, rode os exemplos e pratique') });
  return { id: `v-${l.id}-${lv}`, kind: 'aula', title: l.title, hue: t.hue, shots };
}

/* recapitulação de uma aula */
function recapVideo(t, l, lv) {
  const pts = recPoints(l, lv);
  const shots = [{ k: 'title', eyebrow: `${t.name} · Recapitulação`, title: l.title, sub: `${pts.length} ideias para não esquecer`, bg: brollOf(l)[1] || brollOf(l)[0], say: sayJoin(`Recapitulando: ${l.title}`, `Vamos revisar as ${pts.length} ideias principais`) }];
  pts.forEach((p, i) => {
    shots.push({ k: 'point', n: i + 1, total: pts.length, text: p, bg: brollOf(l)[i % 2], say: sayJoin(p) });
    if (i === Math.max(0, Math.floor(pts.length / 2) - 1)) {
      const qs = (l.quiz || []).filter(q => !q.t || q.t === 'mc' || q.t === 'tf');
      const q = quizShot(qs[qs.length - 1]);
      if (q) shots.push(q);
    }
  });
  shots.push({ k: 'end', h: 'Recapitulação concluída', p: 'Agora o teste: mostre que aprendeu.', say: sayJoin('Recapitulação concluída', 'Agora vem o teste. Mostre que aprendeu') });
  return { id: `r-${l.id}-${lv}`, kind: 'recap', title: `Recapitulando: ${l.title}`, hue: t.hue, shots };
}

/* recapitulação do capítulo (trilha inteira) */
function chapterVideo(t, lv) {
  const shots = [{ k: 'title', eyebrow: 'Recapitulação do capítulo', title: t.name, sub: `${t.lessons.length} aulas em poucos minutos`, bg: brollOf(t.lessons[0])[0], say: sayJoin(`Recapitulação do capítulo ${t.name}`, `${t.lessons.length} aulas em poucos minutos`) }];
  t.lessons.forEach((l, i) => {
    const pts = recPoints(l, lv).slice(0, 3);
    shots.push({ k: 'points', h: `Aula ${i + 1}: ${l.title}`, items: pts, bg: brollOf(l)[0], say: sayJoin(`Aula ${i + 1}: ${l.title}`, ...pts) });
  });
  const q = (t.exam || []).find(x => !x.t || x.t === 'mc' || x.t === 'tf');
  if (q) shots.push(quizShot(q));
  shots.push({ k: 'end', h: 'Pronto para a prova final', p: 'Mostre o que aprendeu e ganhe o certificado da trilha.', say: sayJoin('Você está pronto para a prova final', 'Mostre o que aprendeu e ganhe o certificado da trilha') });
  return { id: `c-${t.id}-${lv}`, kind: 'chapter', title: `Capítulo: ${t.name}`, hue: t.hue, shots };
}

/* todas as falas de todos os vídeos (usado pelo gerador de narração) */
function allNarrations(tracks) {
  const out = new Set();
  for (const t of tracks) for (const lv of ['b', 'i', 'a']) {
    for (const l of t.lessons) {
      lessonVideo(t, l, lv).shots.forEach(s => s.say && out.add(s.say));
      recapVideo(t, l, lv).shots.forEach(s => s.say && out.add(s.say));
    }
    chapterVideo(t, lv).shots.forEach(s => s.say && out.add(s.say));
  }
  return [...out];
}
