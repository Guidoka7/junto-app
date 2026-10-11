/* ============================================================
   Player de videoaulas: cenas animadas + narração + trilha
   Narração: áudio pré-gerado (voz de IA) > voz do aparelho > legendas cronometradas
   ============================================================ */
const VICON = {
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
  prev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg>',
  music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  replay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>'
};

/* ---------- narração ---------- */
const NARR = { manifest: null, voice: null, packs: new Map(), el: null, unlocked: false };
const ABASE = () => V.audio || 'audio/';
async function narrManifest() {
  if (NARR.manifest) return NARR.manifest;
  // index.json = áudios empacotados por trilha ([arquivo, início, tamanho]); manifest.json = um arquivo por fala
  for (const f of ['index.json', 'manifest.json']) {
    try {
      const r = await fetch(ABASE() + f, { cache: 'no-cache' });
      if (r.ok) { NARR.manifest = await r.json(); return NARR.manifest; }
    } catch (e) {}
  }
  NARR.manifest = {};
  return NARR.manifest;
}
function packBuf(file) {
  if (!NARR.packs.has(file)) {
    NARR.packs.set(file, fetch(ABASE() + file).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .catch(e => { NARR.packs.delete(file); throw e; }));
  }
  return NARR.packs.get(file);
}
async function audioURL(h) {
  const e = NARR.manifest && NARR.manifest[h];
  if (Array.isArray(e)) {
    const buf = await packBuf(e[0]);
    return URL.createObjectURL(new Blob([buf.slice(e[1], e[1] + e[2])], { type: e[3] || 'audio/webm' }));
  }
  return ABASE() + (typeof e === 'string' ? e : h + '.mp3');
}
/* Plano B: tocar pela Web Audio (não depende de <audio> nem de URLs blob, que alguns apps bloqueiam) */
function narrCtx() {
  if (!NARR.ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) NARR.ctx = new AC(); }
  return NARR.ctx;
}
async function playWA(h, rate, onEnd, onFail) {
  const e = NARR.manifest[h];
  const ctx = narrCtx();
  if (!ctx) return onFail();
  try {
    let buf;
    if (Array.isArray(e)) { const all = await packBuf(e[0]); buf = all.slice(e[1], e[1] + e[2]); }
    else { const r = await fetch(ABASE() + (typeof e === 'string' ? e : h + '.mp3')); if (!r.ok) throw 0; buf = await r.arrayBuffer(); }
    const audio = await new Promise((res, rej) => ctx.decodeAudioData(buf, res, rej));
    if (ctx.state === 'suspended') await ctx.resume().catch(() => {});
    const src = ctx.createBufferSource();
    src.buffer = audio; src.playbackRate.value = rate;
    src.connect(ctx.destination);
    NARR.speaking = true; NARR.speakingVia = 'wa';
    let ended = false;
    src.onended = () => { if (!ended) { ended = true; onEnd(); } };
    src.start();
    return () => { ended = true; try { src.stop(); } catch (x) {} };
  } catch (x) { onFail(); return () => {}; }
}
function hasAI(video) {
  const mf = NARR.manifest || {};
  return video.shots.some(s => s.say && mf[hashStr(s.say)]);
}
function preloadNarration(video) {
  narrManifest().then(mf => {
    const files = new Set();
    video.shots.forEach(s => { const e = s.say && mf[hashStr(s.say)]; if (Array.isArray(e)) files.add(e[0]); });
    files.forEach(f => packBuf(f).catch(() => {}));
  });
}
/* Celulares só deixam tocar áudio depois de um toque. Um único elemento de áudio é
   "destravado" no primeiro toque em qualquer lugar do app e reaproveitado em todas as falas. */
function narrEl() { if (!NARR.el) { NARR.el = new Audio(); NARR.el.preload = 'auto'; } return NARR.el; }
const SILENT = 'data:audio/wav;base64,UklGRrQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZABAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';
function unlockAudio() {
  if (NARR.unlocked) return;
  const a = narrEl();
  try {
    if (!a.src || a.src.startsWith('data:')) {
      a.src = SILENT;
      const p = a.play();
      if (p && p.then) p.then(() => { NARR.unlocked = true; }).catch(() => {}); else NARR.unlocked = true;
    }
  } catch (e) {}
  try { if (SCORE.ctx && SCORE.ctx.state === 'suspended') SCORE.ctx.resume(); } catch (e) {}
  try { const c = narrCtx(); if (c && c.state === 'suspended') c.resume(); } catch (e) {}
  try { const v = instEl(); if (!v.src) { v.src = SILENT; const p = v.play(); if (p && p.catch) p.catch(() => {}); } } catch (e) {}
  try {
    if ('speechSynthesis' in window && !NARR.ttsUnlocked) {
      const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); NARR.ttsUnlocked = true;
    }
  } catch (e) {}
}
['pointerdown', 'touchend', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, unlockAudio, true));

function nativeTTS() {
  if (NARR.noNative) return null;
  try { const p = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech; return p && p.speak ? p : null; } catch (e) { return null; }
}
function webVoice() {
  if (!('speechSynthesis' in window)) return null;
  if (NARR.voice) return NARR.voice;
  const vs = speechSynthesis.getVoices().filter(v => /^pt(-|_)?BR/i.test(v.lang) || /portugu[eê]s.*brasil/i.test(v.name));
  const rank = v => (/natural|neural|online/i.test(v.name) ? 3 : 0) + (/google/i.test(v.name) ? 2 : 0) + (/francisca|antonio|thalita|luciana|daniel/i.test(v.name) ? 1 : 0);
  NARR.voice = vs.sort((a, b) => rank(b) - rank(a))[0] || null;
  return NARR.voice;
}
try { if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => { NARR.voice = null; webVoice(); }; } catch (e) {}
const estMs = (txt, rate) => Math.max(2600, (txt.length / 14.5) * 1000) / rate;

/* fala uma frase; devolve {done: Promise, stop()}
   ordem: voz de IA gravada > voz do aparelho (APK) > voz do navegador > legenda cronometrada */
function narrate(text, rate, voiceMode) {
  let stopped = false, stopFn = () => {};
  const done = new Promise(async resolve => {
    const finish = () => { NARR.speaking = false; resolve(); };
    if (voiceMode === 'off') return fallbackTimer();
    const mf = await narrManifest();
    if (stopped) return;
    const h = hashStr(text);
    if (mf[h] && !NARR.noAI) {
      const viaWA = async () => {
        if (stopped) return;
        NARR.useWA = true;
        const guard = setTimeout(finish, estMs(text, rate) * 3 + 6000);
        let stopSrc = () => {};
        stopFn = () => { clearTimeout(guard); stopSrc(); };
        stopSrc = await playWA(h, rate, () => { clearTimeout(guard); finish(); }, () => { clearTimeout(guard); deviceVoice(); }) || (() => {});
        if (stopped) stopSrc();
      };
      if (NARR.useWA) return viaWA();
      const a = narrEl();
      let url;
      try { url = await audioURL(h); } catch (e) { return deviceVoice(); }
      if (stopped) { if (url.startsWith('blob:')) URL.revokeObjectURL(url); return; }
      let started = false;
      const clean = () => { a.onended = a.onerror = a.onplaying = null; clearTimeout(guard); clearTimeout(stall); if (url.startsWith('blob:')) setTimeout(() => URL.revokeObjectURL(url), 1000); };
      const guard = setTimeout(() => { clean(); try { a.pause(); } catch (e) {} finish(); }, estMs(text, rate) * 3 + 6000);
      // se em 2,5 s o áudio não começou, troca para o plano B
      const stall = setTimeout(() => { if (!started && !stopped) { clean(); try { a.pause(); } catch (e) {} viaWA(); } }, 2500);
      a.onplaying = () => { started = true; NARR.speaking = true; NARR.speakingVia = 'audio'; };
      a.onended = () => { clean(); finish(); };
      a.onerror = () => { clean(); viaWA(); };
      stopFn = () => { clean(); try { a.pause(); } catch (e) {} };
      a.src = url;
      a.playbackRate = rate;
      try { a.defaultPlaybackRate = rate; } catch (e) {}
      const p = a.play();
      if (p && p.catch) p.catch(() => { if (!stopped && !started) { clean(); viaWA(); } });
      return;
    }
    deviceVoice();
    function deviceVoice() {
      if (stopped) return;
      const nat = nativeTTS();
      if (nat) {
        const guard = setTimeout(finish, estMs(text, rate) * 2.5 + 3000);
        stopFn = () => { clearTimeout(guard); try { nat.stop(); } catch (e) {} };
        NARR.speaking = true; NARR.speakingVia = 'tts';
        nat.speak({ text, lang: 'pt-BR', rate: Math.min(2, rate), pitch: 1, volume: 1, category: 'playback' })
          .then(() => { clearTimeout(guard); finish(); }, () => { clearTimeout(guard); NARR.noNative = true; fallbackTimer(); });
        return;
      }
      const v = webVoice();
      if (v) {
        const parts = text.match(/[^.!?]+[.!?]*/g) || [text];
        let i = 0, guard;
        stopFn = () => { clearTimeout(guard); try { speechSynthesis.cancel(); } catch (e) {} };
        const next = () => {
          if (stopped) return;
          if (i >= parts.length) return finish();
          const u = new SpeechSynthesisUtterance(parts[i++].trim());
          u.lang = 'pt-BR'; u.voice = v; u.rate = rate;
          clearTimeout(guard);
          guard = setTimeout(next, estMs(u.text, rate) * 2 + 1500);
          u.onend = () => { clearTimeout(guard); next(); };
          u.onerror = () => { clearTimeout(guard); next(); };
          speechSynthesis.speak(u);
        };
        try { speechSynthesis.cancel(); } catch (e) {}
        NARR.speaking = true; NARR.speakingVia = 'tts';
        next();
        return;
      }
      fallbackTimer();
    }
    function fallbackTimer() { const tm = setTimeout(finish, estMs(text, rate)); stopFn = () => clearTimeout(tm); }
  });
  return { done, stop() { stopped = true; NARR.speaking = false; stopFn(); } };
}
function narrationSource(video) {
  if (video ? hasAI(video) : NARR.manifest && Object.keys(NARR.manifest).length) return 'Voz de IA';
  if (nativeTTS()) return 'Voz do aparelho';
  if (webVoice()) return 'Voz do navegador';
  return 'Sem voz · só legendas';
}

/* ---------- trilha sonora (Web Audio, sem arquivos) ---------- */
const SCORE = { ctx: null, master: null, pad: null };
function scoreStart(hue) {
  try {
    if (!SCORE.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      SCORE.ctx = new AC();
      SCORE.master = SCORE.ctx.createGain(); SCORE.master.gain.value = 0; SCORE.master.connect(SCORE.ctx.destination);
    }
    const c = SCORE.ctx;
    if (c.state === 'suspended') c.resume();
    if (SCORE.pad) return;
    const base = [110, 130.81, 164.81, 220][Math.abs(Math.round(hue / 90)) % 4];
    const filt = c.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 700; filt.Q.value = 0.7;
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 300; lfo.connect(lg); lg.connect(filt.frequency); lfo.start();
    const g = c.createGain(); g.gain.value = 1; filt.connect(g); g.connect(SCORE.master);
    const oscs = [1, 1.5, 2, 2.996].map((m, i) => { const o = c.createOscillator(); o.type = i % 2 ? 'triangle' : 'sine'; o.frequency.value = base * m; o.detune.value = (i - 1.5) * 6; const og = c.createGain(); og.gain.value = [0.5, 0.25, 0.22, 0.12][i]; o.connect(og); og.connect(filt); o.start(); return o; });
    SCORE.pad = { oscs, lfo, g };
    SCORE.master.gain.setTargetAtTime(0.05, c.currentTime, 1.2);
  } catch (e) {}
}
function scoreDuck(on) { try { if (SCORE.ctx && SCORE.pad) SCORE.master.gain.setTargetAtTime(on ? 0.022 : 0.05, SCORE.ctx.currentTime, 0.4); } catch (e) {} }
function scoreStop() {
  try {
    if (!SCORE.pad) return;
    const c = SCORE.ctx, p = SCORE.pad; SCORE.pad = null;
    SCORE.master.gain.setTargetAtTime(0, c.currentTime, 0.5);
    setTimeout(() => { p.oscs.forEach(o => o.stop()); p.lfo.stop(); }, 1800);
  } catch (e) {}
}
function whoosh() {
  try {
    if (!SCORE.ctx || !SCORE.pad) return;
    const c = SCORE.ctx, len = 0.5, buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = c.createBufferSource(); src.buffer = buf;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(400, c.currentTime); bp.frequency.exponentialRampToValueAtTime(3000, c.currentTime + len);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(0.05, c.currentTime + 0.12); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + len);
    src.connect(bp); bp.connect(g); g.connect(c.destination); src.start();
  } catch (e) {}
}

/* ---------- desenho das cenas do vídeo ---------- */
function vShot(s, durMs) {
  const d = Math.max(1500, durMs);
  const box = el('<div class="vshot"></div>');
  const fig = () => '';
  if (s.k === 'title') box.innerHTML = `${fig(s.img)}<div class="vt-eye">${esc(s.eyebrow)}</div><h1 class="vt-title">${inline(s.title)}</h1><div class="vt-sub">${esc(s.sub || '')}</div><i class="vt-line"></i>`;
  else if (s.k === 'emoji') box.innerHTML = `${s.bg ? '' : `<div class="v-emoji">${s.e}</div>`}<h2>${inline(s.h)}</h2><div class="v-p">${md(s.p)}</div>`;
  else if (s.k === 'text') box.innerHTML = `${s.tag ? `<div class="vt-eye">${esc(s.tag)}</div>` : ''}<h2>${inline(s.h)}</h2><div class="v-p">${md(s.p)}</div>`;
  else if (s.k === 'points') box.innerHTML = `${fig(s.img, 'small')}<h2>${inline(s.h)}</h2><ul class="v-list">${s.items.map((x, i) => `<li style="animation-delay:${Math.round((i + 1) * d / (s.items.length + 1.4))}ms">${inline(x)}</li>`).join('')}</ul>`;
  else if (s.k === 'flow') box.innerHTML = `<h2>${inline(s.h)}</h2><div class="v-flow">${s.steps.map((x, i) => `<div class="v-step" style="animation-delay:${Math.round((i + 0.6) * d / (s.steps.length + 0.8))}ms"><em>${i + 1}</em><span>${inline(x)}</span></div>`).join('')}</div>`;
  else if (s.k === 'table') box.innerHTML = `<h2>${inline(s.h)}</h2><div class="tblwrap"><table><thead><tr>${s.cols.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${s.rows.map((r, i) => `<tr style="animation-delay:${Math.round((i + 1) * d / (s.rows.length + 2))}ms">${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  else if (s.k === 'point') box.innerHTML = `<div class="v-num">${String(s.n).padStart(2, '0')}<small>/${String(s.total).padStart(2, '0')}</small></div><p class="v-big">${inline(s.text)}</p>`;
  else if (s.k === 'end') box.innerHTML = `${fig(s.img, 'small')}<div class="vt-eye">CineCode</div><h1 class="vt-title">${inline(s.h)}</h1><div class="vt-sub">${esc(s.p || '')}</div>`;
  else if (s.k === 'code') {
    // gravação de tela: editor real + terminal com a saída de verdade
    const FN = { py: 'main.py', python: 'main.py', sql: 'consulta.sql', js: 'app.js', javascript: 'app.js', ts: 'app.ts', html: 'index.html', css: 'estilo.css', bash: 'terminal', sh: 'terminal', powershell: 'PowerShell', json: 'dados.json', vba: 'Modulo1.bas', dax: 'medidas.dax', m: 'consulta.pq', yaml: 'config.yml', dockerfile: 'Dockerfile', java: 'Main.java', cs: 'Program.cs', go: 'main.go', rust: 'main.rs', c: 'main.c', php: 'index.php', kotlin: 'Main.kt', swift: 'main.swift' };
    const LN = { py: 'Python 3', sql: 'SQLite', js: 'JavaScript', html: 'HTML', css: 'CSS', bash: 'bash' };
    const lang = String(s.lang || '').toLowerCase(), isTerm = /^(bash|sh|powershell|shell)$/.test(lang);
    const fname = FN[lang] || 'arquivo.' + (lang || 'txt');
    box.innerHTML = `<div class="ide ${isTerm ? 'is-term' : ''}">
      <div class="ide-top"><span class="dots"><i></i><i></i><i></i></span><span class="ide-tab">${esc(fname)}</span><span class="ide-app">${isTerm ? 'Terminal' : 'Editor'}</span></div>
      <div class="ide-body"><div class="ide-gutter" aria-hidden="true"></div><pre><code></code></pre></div>
      <div class="ide-term" hidden><div class="ide-term-h"><span>TERMINAL</span><span class="ide-run">▶ executando…</span></div><div class="ide-out"></div></div>
      <div class="ide-status"><span>⎇ main</span><span>${esc(LN[lang] || lang.toUpperCase())}</span><span>UTF-8</span><span class="ln">Ln 1, Col 1</span></div>
    </div>${s.cap ? `<div class="v-p small">${md(s.cap)}</div>` : ''}`;
    const c = $('code', box), gut = $('.ide-gutter', box), lnEl = $('.ln', box), code = s.code;
    const total = Math.min(d * (s.run ? 0.5 : 0.72), s.run ? 6500 : 9000);
    const paintGutter = txt => { const n = txt.split('\n').length; gut.innerHTML = Array.from({ length: n }, (_, i) => i + 1).join('<br>'); const last = txt.split('\n').pop(); lnEl.textContent = `Ln ${n}, Col ${last.length + 1}`; };
    const showOut = async () => {
      if (!s.run || !box.isConnected) return;
      const term = $('.ide-term', box), out = $('.ide-out', box), runl = $('.ide-run', box);
      const cmd = { py: 'python main.py', sql: 'sqlite3 padaria.db < consulta.sql', js: 'node app.js' }[lang];
      if (!cmd) return;
      term.hidden = false;
      out.innerHTML = `<div class="ide-cmd"><b>gui@cinecode</b>:<i>~/aula</i>$ ${esc(cmd)}</div>`;
      let html = '', erro = '';
      try {
        if (lang === 'py') { const r = await runPy(code); if (r.error === EVAL_MSG) { term.hidden = true; return; } html = esc(r.stdout || ''); erro = r.ok ? '' : r.error; }
        else if (lang === 'sql') {
          const r = await runSQL(code);
          if (!r.ok) erro = r.error;
          else if (r.result) html = `<table class="ide-grid"><tr>${r.result.columns.map(x => `<th>${esc(x)}</th>`).join('')}</tr>${r.result.values.slice(0, 8).map(row => `<tr>${row.map(v => `<td>${esc(v === null ? 'NULL' : typeof v === 'number' ? String(Math.round(v * 100) / 100).replace('.', ',') : v)}</td>`).join('')}</tr>`).join('')}</table>${r.result.values.length > 8 ? `<div class="ide-more">… ${r.result.values.length} linhas</div>` : ''}`;
          else html = esc(`${r.changes} linha(s) alterada(s).`);
        } else if (lang === 'js') { const r = await runJS(code); if (r.logs.some(l => l.a === EVAL_MSG)) { term.hidden = true; return; } html = esc(r.logs.filter(l => l.t !== 'err').map(l => Array.isArray(l.a) ? l.a.join(' ') : l.a).join('\n')); erro = r.logs.filter(l => l.t === 'err').map(l => l.a).join('\n'); }
      } catch (e) { erro = e.message; }
      if (!box.isConnected) return;
      runl.textContent = erro ? '✖ erro' : '✔ concluído';
      runl.classList.add(erro ? 'bad' : 'ok');
      const res = document.createElement('div'); res.className = 'ide-res'; res.innerHTML = (html || '') + (erro ? `<div class="ide-err">${esc(erro)}</div>` : '');
      out.appendChild(res);
      if (lang !== 'sql') out.scrollTop = out.scrollHeight;
    };
    if (reduced()) { c.innerHTML = hl(code, s.lang); paintGutter(code); showOut(); }
    else {
      const t0 = performance.now();
      const tick = now => {
        if (!box.isConnected && now - t0 > 50) return;
        const n = Math.min(code.length, Math.ceil(code.length * (now - t0) / total));
        const part = code.slice(0, n);
        c.innerHTML = hl(part, s.lang) + (n < code.length ? '<span class="ide-caret"></span>' : '');
        paintGutter(part);
        if (n < code.length) requestAnimationFrame(tick); else setTimeout(showOut, 350);
      };
      requestAnimationFrame(tick);
    }
  }
  box.classList.add('vk-' + s.k);
  if (s.bg && !reduced()) {
    box.classList.add('has-bg');
    box.insertAdjacentHTML('afterbegin', `<div class="v-bgvid" aria-hidden="true"><video muted loop playsinline autoplay preload="auto" disablepictureinpicture poster="${esc(s.bg.replace(/\.(mp4|webm)$/, '.jpg'))}" src="${esc(s.bg)}"></video><i class="v-shade"></i></div>`);
    const v = $('video', box); v.muted = true; const p = v.play(); if (p && p.catch) p.catch(() => {});
  } else if (s.bg) {
    box.classList.add('has-bg');
    box.insertAdjacentHTML('afterbegin', `<div class="v-bgvid" aria-hidden="true"><img src="${esc(s.bg.replace(/\.(mp4|webm)$/, '.jpg'))}" alt=""><i class="v-shade"></i></div>`);
  }
  if (s.inst) { box.classList.add('has-inst'); box.insertAdjacentHTML('afterbegin', `<div class="v-inst" aria-hidden="true"><img src="${esc(s.inst.v.replace(/\.(mp4|webm)$/, '.jpg'))}" alt=""></div>`); }
  return box;
}

/* vídeo do instrutor: um único elemento reaproveitado (destravado no primeiro toque, como a narração) */
function instEl() {
  if (!NARR.inst) { const v = document.createElement('video'); v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto'; NARR.inst = v; }
  return NARR.inst;
}
function playInstructor(s, box, rate) {
  let stopped = false, stopFn = () => {};
  const done = new Promise(resolve => {
    const v = instEl();
    const slot = $('.v-inst', box);
    if (!slot) return resolve(false);
    slot.appendChild(v);
    const end = ok => { v.onended = v.onerror = null; clearTimeout(guard); NARR.speaking = false; resolve(ok); };
    const guard = setTimeout(() => end(true), 30000);
    v.onended = () => end(true);
    v.onerror = () => end(false);
    stopFn = () => { try { v.pause(); } catch (e) {} end(true); };
    v.src = s.inst.v; v.muted = false; v.playbackRate = rate;
    NARR.speaking = true; NARR.speakingVia = 'inst';
    const p = v.play();
    if (p && p.catch) p.catch(() => { if (!stopped) end(false); });
  });
  return { done, stop() { stopped = true; stopFn(); } };
}

/* ---------- o player ---------- */
function videoPlayer(video, opts = {}) {
  const root = el(`<div class="vp ${opts.full ? 'full' : ''}" style="--hue:${video.hue}">
    <div class="vscreen" tabindex="0" aria-label="Vídeo: ${esc(video.title)}">
      <div class="vbg" aria-hidden="true"></div><div class="vlayer"></div>
      <div class="vcap" aria-live="polite"></div>
      <button class="vbig" type="button" aria-label="Assistir">${VICON.play}<span>Assistir</span></button>
    </div>
    <div class="vbar">
      <button class="vb" data-v="toggle" aria-label="Reproduzir">${VICON.play}</button>
      <button class="vb" data-v="prev" aria-label="Cena anterior">${VICON.prev}</button>
      <div class="vprog">${video.shots.map((_, i) => `<button data-seek="${i}" aria-label="Ir para a parte ${i + 1}"><i></i></button>`).join('')}</div>
      <button class="vb" data-v="next" aria-label="Próxima cena">${VICON.next}</button>
    </div>
    <div class="vopts"><span class="vsrc small muted"></span><span style="flex:1"></span>
      <button class="vchip" data-v="cc" aria-pressed="true">CC</button>
      <button class="vchip" data-v="rate">1x</button>
      <button class="vchip" data-v="voice" aria-pressed="true">Voz</button>
      <button class="vchip" data-v="music" aria-pressed="true" aria-label="Trilha sonora">${VICON.music}</button></div>
  </div>`);
  const layer = $('.vlayer', root), cap = $('.vcap', root), big = $('.vbig', root);

  const prefs = S.video || (S.video = { cc: true, rate: 1, music: true, voice: true });
  let i = -1, playing = false, started = false, cur = null, token = 0, answered = {};
  const segs = $$('.vprog i', root);
  const syncUI = () => {
    $('[data-v="toggle"]', root).innerHTML = playing ? VICON.pause : VICON.play;
    $('[data-v="toggle"]', root).setAttribute('aria-label', playing ? 'Pausar' : 'Reproduzir');
    $('[data-v="cc"]', root).setAttribute('aria-pressed', prefs.cc);
    $('[data-v="rate"]', root).textContent = String(prefs.rate).replace('.', ',') + 'x';
    $('[data-v="music"]', root).setAttribute('aria-pressed', prefs.music);
    $('[data-v="voice"]', root).setAttribute('aria-pressed', prefs.voice);
    cap.hidden = !prefs.cc;
    big.hidden = playing || (started && i >= video.shots.length - 1 && false);
    $('.vsrc', root).textContent = prefs.voice ? narrationSource(video) : 'Sem voz';
  };
  const stopCur = () => { if (cur) { cur.stop(); cur = null; } scoreDuck(false); };
  const paintSegs = (dur) => segs.forEach((s, k) => {
    s.style.transition = 'none';
    s.style.width = k < i ? '100%' : '0%';
    if (k === i) { void s.offsetWidth; s.style.transition = playing ? `width ${dur}ms linear` : 'none'; s.style.width = playing ? '100%' : '0%'; }
  });
  function captions(text, dur) {
    cap.innerHTML = '';
    const words = text.split(' ');
    const chunks = [];
    for (let k = 0; k < words.length; k += 13) chunks.push(words.slice(k, k + 13).join(' '));
    const my = token;
    chunks.forEach((c, k) => setTimeout(() => { if (my === token) cap.innerHTML = `<span>${esc(c)}</span>`; }, (dur / chunks.length) * k));
  }
  async function show(n, autoplay) {
    stopCur();
    const my = ++token;
    i = Math.max(0, Math.min(video.shots.length - 1, n));
    const s = video.shots[i];
    const dur = estMs(s.say || '', prefs.rate);
    const node = vShot(s, dur);
    [...layer.children].forEach(o => { if (o.classList.contains('out')) return; o.classList.add('out'); setTimeout(() => o.remove(), 450); });
    layer.appendChild(node);
    if (playing && i > 0) whoosh();
    if (s.k === 'quiz') return quizShot(s, node, my);
    paintSegs(dur);
    if (!playing) { cap.innerHTML = s.say ? `<span>${esc(s.say)}</span>` : ''; return; }
    scoreDuck(true);
    if (s.inst && prefs.voice) {
      captions(s.inst.t || s.say || '', estMs(s.inst.t || '', 1));
      cur = playInstructor(s, node, prefs.rate);
      const ok = await cur.done;
      if (my !== token) return;
      if (!ok) { captions(s.say || '', dur); cur = narrate(s.say || '', prefs.rate, 'on'); await cur.done; }
    } else {
      captions(s.say || '', dur);
      cur = narrate(s.say || '', prefs.rate, prefs.voice ? 'on' : 'off');
      await cur.done;
    }
    if (my !== token) return;
    scoreDuck(false);
    setTimeout(() => { if (my === token && playing) advance(); }, 550);
  }
  function quizShot(s, node, my) {
    const q = s.q;
    const opts2 = q.t === 'tf' ? ['Verdadeiro', 'Falso'] : q.o;
    const right = q.t === 'tf' ? (q.a ? 0 : 1) : q.a;
    node.innerHTML = `<div class="vt-eye">Pausa para pensar</div><h2>${inline(q.q)}</h2>${q.code ? `<div class="code v-code"><pre><code>${hl(q.code, q.lang || 'py')}</code></pre></div>` : ''}<div class="opts v-opts">${opts2.map((o, k) => `<button class="opt" data-o="${k}"><span class="k">${'ABCD'[k]}</span><span>${inline(o)}</span></button>`).join('')}</div><div class="vbox"></div>`;
    segs.forEach((sg, k) => { sg.style.transition = 'none'; sg.style.width = k < i ? '100%' : k === i ? '50%' : '0%'; });
    cap.innerHTML = `<span>${esc(q.q)}</span>`;
    if (playing) { scoreDuck(true); cur = narrate(s.say, prefs.rate, prefs.voice ? 'on' : 'off'); cur.done.then(() => scoreDuck(false)); }
    if (answered[i] != null) markQuiz(node, right, answered[i]);
    node.addEventListener('click', e => {
      const b = e.target.closest('[data-o]');
      if (!b || answered[i] != null) return;
      const k = +b.dataset.o;
      answered[i] = k;
      stopCur();
      markQuiz(node, right, k);
      if (k === right) vibrate(30); else vibrate([40, 60, 40]);
      opts.onQuiz && opts.onQuiz(q, k === right);
      const say = (k === right ? 'Isso mesmo! ' : 'Quase. ') + speechText(q.w || '');
      cap.innerHTML = `<span>${esc(say)}</span>`;
      if (playing) {
        cur = narrate(say, prefs.rate, prefs.voice ? 'on' : 'off');
        cur.done.then(() => setTimeout(() => { if (my === token && playing) advance(); }, 900));
      }
    });
  }
  function markQuiz(node, right, k) {
    $('.v-opts', node).classList.add('locked');
    $(`[data-o="${k}"]`, node).classList.add(k === right ? 'right' : 'wrong');
    $(`[data-o="${right}"]`, node).classList.add('right');
    const q = video.shots[i].q;
    $('.vbox', node).innerHTML = `<div class="verdict ${k === right ? 'good' : 'badv'}"><b>${k === right ? 'Isso!' : 'Quase.'}</b><span>${inline(q.w || '')}</span></div>`;
  }
  function advance() {
    if (i >= video.shots.length - 1) {
      playing = false; stopCur(); scoreStop(); syncUI();
      big.hidden = false; big.innerHTML = `${VICON.replay}<span>Assistir de novo</span>`;
      opts.onEnd && opts.onEnd();
      return;
    }
    show(i + 1);
  }
  function play() {
    started = true; playing = true;
    big.innerHTML = `${VICON.play}<span>Continuar</span>`;
    if (prefs.music) scoreStart(video.hue);
    if (i >= video.shots.length - 1 && i >= 0) i = -1;
    syncUI();
    show(i < 0 ? 0 : i);
  }
  function pause() { playing = false; token++; stopCur(); scoreStop(); syncUI(); paintSegs(0); }
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-v], [data-seek], .vbig');
    if (!b) { if (e.target.closest('.vscreen') && !e.target.closest('.opt, .code')) (playing ? pause() : play()); return; }
    if (b.classList.contains('vbig')) return play();
    if (b.dataset.seek != null) { const n = +b.dataset.seek; if (!playing) { i = n; play(); } else show(n); return; }
    const a = b.dataset.v;
    if (a === 'toggle') playing ? pause() : play();
    else if (a === 'prev') { if (i > 0) { if (playing) show(i - 1); else { i--; show(i); } } }
    else if (a === 'next') { if (i < video.shots.length - 1) { if (playing) show(i + 1); else { i++; show(i); } } else if (playing) advance(); }
    else if (a === 'cc') { prefs.cc = !prefs.cc; save(); syncUI(); }
    else if (a === 'rate') { const r = [1, 1.25, 1.5, 0.75]; prefs.rate = r[(r.indexOf(prefs.rate) + 1) % r.length]; save(); syncUI(); if (playing) show(i); }
    else if (a === 'music') { prefs.music = !prefs.music; save(); prefs.music && playing ? scoreStart(video.hue) : scoreStop(); syncUI(); }
    else if (a === 'voice') { prefs.voice = !prefs.voice; save(); syncUI(); if (playing) show(i); }
  });
  root.destroy = () => { token++; playing = false; stopCur(); scoreStop(); };
  const mo = new MutationObserver(() => { if (!root.isConnected) { root.destroy(); mo.disconnect(); } });
  setTimeout(() => { if (root.isConnected) mo.observe(document.body, { childList: true, subtree: true }); }, 0);
  narrManifest().then(syncUI);
  preloadNarration(video);
  show(0);
  syncUI();
  root.play = play; root.pause = pause;
  return root;
}

/* vídeo em tela cheia (recapitulação do capítulo) */
function openVideo(video, onEnd) {
  const P = el(`<div class="player" role="dialog" aria-label="${esc(video.title)}" style="--hue:${video.hue}">
    <div class="letterbox top"><button class="iconbtn" data-p="close" aria-label="Fechar">${ICON.x}</button><div class="ptitle"><span class="eyebrow">Vídeo</span><b>${esc(video.title)}</b></div></div>
    <div class="stage vstage"></div><div class="letterbox bottom" style="justify-content:flex-end"></div></div>`);
  const vp = videoPlayer(video, { full: true, onEnd: () => { onEnd && onEnd(); } });
  $('.stage', P).appendChild(vp);
  P.addEventListener('click', e => { if (e.target.closest('[data-p="close"]')) { vp.destroy(); closeOverlay(); } });
  openOverlay(P, () => vp.destroy());
  requestAnimationFrame(() => requestAnimationFrame(() => P.classList.add('open')));
  setTimeout(() => vp.play(), 450);
  return vp;
}
