/* ============================================================
   Avaliação: tipos de questão, nota da aula, prova final,
   certificado e revisão espaçada (repetição inteligente)
   ============================================================ */
const QB = {};               // banco global: id -> {q, t, l}
TRACKS.forEach(t => {
  t.lessons.forEach(l => (l.quiz || []).forEach((q, k) => { q.id = q.id || `${l.id}#${k}`; QB[q.id] = { q, t, l }; }));
  (t.exam || []).forEach((q, k) => { q.id = q.id || `${t.id}!${k}`; QB[q.id] = { q, t, l: null }; });
});
const qType = q => q.t || 'mc';
const normAns = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/'/g, '"').replace(/\s+/g, ' ').replace(/\s*([(),;=:+\-*/<>[\]{}])\s*/g, '$1').replace(/;$/, '').trim();
const shuffle = a => { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
const TYPE_LABEL = { mc: 'Múltipla escolha', tf: 'Verdadeiro ou falso', fill: 'Complete', order: 'Coloque em ordem' };

/* desenha uma questão. opts.onAnswer(correct, given). opts.exam = sem correção imediata */
function renderQuestion(q, opts = {}) {
  const tp = qType(q);
  const sec = el(`<section class="scene qscene"><span class="eyebrow">${opts.label || TYPE_LABEL[tp] || 'Pergunta'}</span><h2>${inline(q.q)}</h2>
    ${q.code ? `<div class="code"><div class="chead"><span class="dots"><i></i><i></i><i></i></span><span>${esc(q.lang || 'py')}</span></div><pre><code>${hl(q.code, q.lang || 'py')}</code></pre></div>` : ''}
    <div class="qbody"></div><div class="vbox"></div></section>`);
  const body = $('.qbody', sec), vbox = $('.vbox', sec);
  let done = false;
  const finish = (ok, given, reveal) => {
    if (done) return; done = true;
    if (!opts.exam) {
      if (ok) vibrate(30); else vibrate([40, 60, 40]);
      vbox.innerHTML = `<div class="verdict ${ok ? 'good' : 'badv'}"><b>${ok ? 'Isso!' : 'Quase.'}</b>${!ok && reveal ? `<span>Resposta: <code>${esc(reveal)}</code></span>` : ''}<span>${inline(q.w || '')}</span></div>`;
    }
    opts.onAnswer && opts.onAnswer(ok, given);
  };
  if (tp === 'mc' || tp === 'tf') {
    const os = tp === 'tf' ? ['Verdadeiro', 'Falso'] : q.o;
    const right = tp === 'tf' ? (q.a ? 0 : 1) : q.a;
    body.innerHTML = `<div class="opts">${os.map((o, i) => `<button class="opt" data-o="${i}"><span class="k">${tp === 'tf' ? (i ? 'F' : 'V') : 'ABCD'[i]}</span><span>${inline(o)}</span></button>`).join('')}</div>`;
    body.addEventListener('click', e => {
      const b = e.target.closest('[data-o]');
      if (!b || done) return;
      const k = +b.dataset.o;
      $('.opts', body).classList.add('locked');
      if (opts.exam) b.classList.add('picked');
      else { b.classList.add(k === right ? 'right' : 'wrong'); if (k !== right) $(`[data-o="${right}"]`, body).classList.add('right'); }
      finish(k === right, os[k]);
    });
  } else if (tp === 'fill') {
    body.innerHTML = `<div class="fill"><input type="text" class="fillin" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="${esc(q.ph || 'Digite a resposta')}" aria-label="Resposta"><button class="btn primary" data-f="ok">Confirmar</button></div>`;
    const inp = $('input', body);
    const go = () => {
      if (done || !inp.value.trim()) return;
      const ok = q.ans.some(a => normAns(a) === normAns(inp.value));
      inp.disabled = true; $('[data-f="ok"]', body).disabled = true;
      inp.classList.add(opts.exam ? 'picked' : ok ? 'right' : 'wrong');
      finish(ok, inp.value, q.ans[0]);
    };
    $('[data-f="ok"]', body).onclick = go;
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  } else if (tp === 'order') {
    const pool = shuffle(q.items.map((x, i) => ({ x, i })));
    const picked = [];
    const draw = () => {
      body.innerHTML = `<ol class="ord-pick">${picked.map(p => `<li>${inline(p.x)}</li>`).join('') || '<li class="muted ph">Toque nos itens abaixo na ordem certa</li>'}</ol>
        <div class="ord-pool">${pool.map((p, k) => picked.includes(p) ? '' : `<button class="chip ordc" data-k="${k}">${inline(p.x)}</button>`).join('')}</div>
        ${picked.length && !done ? '<button class="btn small ghost" data-u="1">Desfazer</button>' : ''}`;
    };
    draw();
    body.addEventListener('click', e => {
      if (done) return;
      const c = e.target.closest('[data-k]'), u = e.target.closest('[data-u]');
      if (u) { picked.pop(); return draw(); }
      if (!c) return;
      picked.push(pool[+c.dataset.k]);
      draw();
      if (picked.length === pool.length) {
        const ok = picked.every((p, k) => p.i === k);
        $$('.ord-pick li', body).forEach((li, k) => li.classList.add(opts.exam ? 'picked' : picked[k].i === k ? 'right' : 'wrong'));
        finish(ok, picked.map(p => p.x).join(' → '), q.items.join(' → '));
      }
    });
  }
  return sec;
}

/* ---------- revisão espaçada ---------- */
const BOX_DAYS = [0, 1, 3, 7, 16, 35];
function srsMark(id, ok) {
  if (!id) return;
  S.srs = S.srs || {};
  const cur = S.srs[id];
  if (!ok) S.srs[id] = { box: 1, due: todayISO() };
  else if (cur) {
    const box = cur.box + 1;
    if (box >= BOX_DAYS.length) delete S.srs[id];
    else S.srs[id] = { box, due: iso(addDays(new Date(), BOX_DAYS[box])) };
  }
  save();
}
function srsDue() { const t = todayISO(); return Object.entries(S.srs || {}).filter(([id, v]) => v.due <= t && QB[id]).map(([id]) => id); }

function reviewSession() {
  const ids = shuffle(srsDue()).slice(0, 12);
  if (!ids.length) return toast('Nenhuma revisão pendente hoje');
  const P = shell(null, 'Revisão inteligente');
  const stage = $('.stage', P), segs = $('.segs', P), bottom = $('.letterbox.bottom', P);
  segs.innerHTML = ids.map(() => '<i></i>').join('');
  let k = 0, right = 0;
  const step = () => {
    $$('i', segs).forEach((s, j) => { s.className = j < k ? 'past' : j === k ? 'on' : ''; });
    if (k >= ids.length) {
      stage.innerHTML = `<section class="scene titlecard"><span class="reel">Revisão concluída</span><h1 class="num">${right}/${ids.length}</h1><p class="muted">As que você errou voltam amanhã. As que acertou voltam em alguns dias, cada vez mais espaçadas, até ficarem gravadas.</p><button class="btn primary" data-p="close">Concluir</button></section>`;
      bottom.innerHTML = '';
      if (right === ids.length) burst(38);
      return;
    }
    const { q, t } = QB[ids[k]];
    P.style.setProperty('--hue', t.hue);
    const sec = renderQuestion(q, { label: `Revisão · ${t.short}`, onAnswer: ok => { srsMark(q.id, ok); if (ok) right++; bottom.innerHTML = `<span style="flex:1"></span><button class="btn primary" data-r="next">Continuar ${ICON.right}</button>`; } });
    stage.innerHTML = ''; stage.appendChild(sec);
    [...sec.children].forEach((c, j) => c.style.setProperty('--i', j));
    bottom.innerHTML = '';
  };
  bottom.style.justifyContent = 'flex-end';
  P.addEventListener('click', e => { if (e.target.closest('[data-r="next"]')) { k++; step(); } });
  step();
}

/* ---------- nota da aula ---------- */
function lessonGrade({ quizOk, quizN, vidOk, vidN, hasLab, labOk, solSeen }) {
  const q = quizN ? quizOk / quizN : 1;
  const v = vidN ? vidOk / vidN : q;
  const lab = !hasLab ? null : labOk ? (solSeen ? 0.5 : 1) : 0;
  const n = lab === null ? q * 0.85 + v * 0.15 : q * 0.6 + lab * 0.3 + v * 0.1;
  return Math.round(n * 100) / 10;
}
const fmtNota = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
function notaLabel(n) { return n >= 9 ? 'Excelente' : n >= 7 ? 'Aprovado' : n >= 5 ? 'Quase lá' : 'Precisa rever'; }
function trackAvg(t) {
  const ns = t.lessons.map(l => S.done[l.id] && S.done[l.id].nota).filter(n => typeof n === 'number');
  return ns.length ? Math.round(ns.reduce((s, n) => s + n, 0) / ns.length * 10) / 10 : null;
}

/* ---------- prova final da trilha ---------- */
function examPool(t) {
  const lv = levelOf(t.id) || 'b';
  const byLesson = t.lessons.map(l => shuffle((l.quiz || []).filter(q => q.lv === '*' || q.lv === lv || (lv === 'a' && q.lv === 'i'))));
  const pick = [];
  byLesson.forEach(qs => { if (qs[0]) pick.push(qs.shift()); });
  const rest = shuffle([...(t.exam || []), ...byLesson.flat()]);
  for (const q of rest) { if (pick.length >= 15) break; if (!pick.includes(q)) pick.push(q); }
  return shuffle(pick).slice(0, 15);
}
function startExam(t) {
  const qs = examPool(t);
  const P = shell(t, 'Prova final');
  const stage = $('.stage', P), segs = $('.segs', P), bottom = $('.letterbox.bottom', P);
  bottom.style.justifyContent = 'flex-end';
  const res = [];
  let k = -1;
  segs.innerHTML = qs.map(() => '<i></i>').join('');
  const paint = () => $$('i', segs).forEach((s, j) => { s.className = j < k ? 'past' : j === k ? 'on' : ''; });
  const intro = () => {
    stage.innerHTML = `<section class="scene titlecard"><span class="reel">Prova final</span><h1>${esc(t.name)}</h1>
      <p class="muted">${qs.length} questões de todas as aulas. A correção aparece só no final. Nota mínima para o certificado: 7,0.</p>
      <button class="btn primary" data-x="go">Começar a prova</button></section>`;
  };
  const next = () => {
    k++; paint(); bottom.innerHTML = '';
    if (k >= qs.length) return result();
    const q = qs[k];
    const sec = renderQuestion(q, { exam: true, label: `Questão ${k + 1} de ${qs.length} · ${TYPE_LABEL[qType(q)]}`, onAnswer: (ok, given) => { res.push({ q, ok, given }); setTimeout(next, 450); } });
    stage.innerHTML = ''; stage.appendChild(sec);
    [...sec.children].forEach((c, j) => c.style.setProperty('--i', j));
  };
  const result = () => {
    const right = res.filter(r => r.ok).length;
    const nota = Math.round(right / res.length * 100) / 10;
    const passed = nota >= 7;
    const prev = S.exams && S.exams[t.id];
    S.exams = S.exams || {};
    S.exams[t.id] = { best: Math.max(nota, prev ? prev.best : 0), last: nota, passed: passed || !!(prev && prev.passed), at: todayISO(), lv: levelOf(t.id) || 'b' };
    res.forEach(r => srsMark(r.q.id, r.ok));
    const weak = [];
    t.lessons.forEach(l => { const rs = res.filter(r => QB[r.q.id] && QB[r.q.id].l === l); if (rs.length && rs.some(r => !r.ok)) weak.push(l.id); });
    S.reforco = [...new Set([...(S.reforco || []).filter(id => !t.lessons.some(l => l.id === id)), ...weak])];
    if (passed && !(prev && prev.passed)) S.xp += 200;
    save();
    stage.innerHTML = `<section class="scene top credits"><span class="eyebrow">Resultado da prova</span>
      <div class="big num">${fmtNota(nota)}</div><h2>${passed ? 'Aprovado!' : 'Ainda não foi desta vez'}</h2>
      <p class="muted">${right} de ${res.length} questões certas. ${passed ? (prev && prev.passed ? '' : '+200 XP. ') + 'Seu certificado está liberado.' : 'Nota mínima: 7,0. Revise as aulas indicadas e tente de novo.'}</p>
      <div class="row" style="justify-content:center">${passed ? '<button class="btn primary" data-x="cert">Ver certificado</button>' : ''}<button class="btn" data-x="again">Refazer prova</button></div>
      ${weak.length ? `<div class="panel" style="text-align:left"><b>Revise estas aulas</b>${weak.map(id => `<span class="small">• ${esc(LESSON[id].l.title)}</span>`).join('')}<span class="small muted">Elas aparecem em “Reforço” na tela inicial, e as questões erradas entram na sua revisão.</span></div>` : ''}
      <div class="list" style="text-align:left">${res.map((r, j) => `<div class="rv ${r.ok ? 'ok' : 'no'}"><b>${j + 1}. ${inline(r.q.q)}</b>
        <span>${r.ok ? '✓ Certa' : `✗ Sua resposta: ${esc(r.given)} · Correta: ${esc(correctText(r.q))}`}</span>${r.ok ? '' : `<span class="muted">${inline(r.q.w || '')}</span>`}</div>`).join('')}</div></section>`;
    if (passed) burst(t.hue);
  };
  P.addEventListener('click', e => {
    const b = e.target.closest('[data-x]');
    if (!b) return;
    if (b.dataset.x === 'go') next();
    if (b.dataset.x === 'again') { closeOverlay(); setTimeout(() => startExam(t), 150); }
    if (b.dataset.x === 'cert') { closeOverlay(); setTimeout(() => showCertificate(t), 150); }
  });
  intro();
}
function correctText(q) {
  const tp = qType(q);
  if (tp === 'tf') return q.a ? 'Verdadeiro' : 'Falso';
  if (tp === 'fill') return q.ans[0];
  if (tp === 'order') return q.items.join(' → ');
  return q.o[q.a];
}
function showCertificate(t) {
  const ex = S.exams && S.exams[t.id];
  if (!ex || !ex.passed) return toast('Passe na prova final para liberar o certificado');
  const code = hashStr(`${S.name}|${t.id}|${ex.at}|${ex.best}`).toUpperCase();
  const P = shell(t, 'Certificado');
  $('.stage', P).innerHTML = `<section class="scene"><div class="cert">
    <span class="cert-reel">CineCode · Certificado de conclusão</span>
    <p class="muted">Certificamos que</p>
    <h1>${esc(S.name || 'Aluno CineCode')}</h1>
    <p>concluiu a trilha <b>${esc(t.name)}</b> (${t.lessons.length} aulas) no nível <b>${LV[ex.lv || 'b'].name}</b>, com nota final <b>${fmtNota(ex.best)}</b> na prova.</p>
    <div class="cert-foot"><span>${fmtFull.format(parseISO(ex.at))}</span><span class="mono">Código ${code.slice(0, 4)}-${code.slice(4)}</span></div>
  </div><p class="small muted" style="text-align:center">Tire um print para compartilhar. Na versão online, o código poderá ser validado no site.</p></section>`;
  burst(t.hue);
}
