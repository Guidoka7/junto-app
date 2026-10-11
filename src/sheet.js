/* ============================================================
   Planilha interativa: motor de fórmulas no padrão do Excel
   em português (separador ; e vírgula decimal)
   ============================================================ */
const XERR = { div: '#DIV/0!', na: '#N/D', name: '#NOME?', val: '#VALOR!', ref: '#REF!', circ: '#CIRC!' };
const isErr = v => typeof v === 'string' && v.startsWith('#') && Object.values(XERR).includes(v);
const colNum = s => s.split('').reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1;
const colName = n => { let s = ''; n++; while (n) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
const refRC = ref => { const m = /^\$?([A-Z]+)\$?(\d+)$/.exec(ref.toUpperCase()); return m ? [+m[2] - 1, colNum(m[1])] : null; };
const deacc = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();

function xTokens(src) {
  const re = /\s*(?:("(?:[^"]|"")*")|(\$?[A-Za-z]{1,3}\$?\d+(?::\$?[A-Za-z]{1,3}\$?\d+)?)(?![\w(.])|(\d+(?:[.,]\d+)?%?)|([A-Za-zÀ-ú][A-Za-zÀ-ú0-9_.]*)\s*\(|(<=|>=|<>|[-+*/^&=<>(),;%])|([A-Za-zÀ-ú][A-Za-zÀ-ú0-9_]*))/gy;
  const out = []; let m; let pos = 0;
  re.lastIndex = 0;
  while (pos < src.length) {
    re.lastIndex = pos;
    m = re.exec(src);
    if (!m) { if (/^\s*$/.test(src.slice(pos))) break; throw XERR.name; }
    pos = re.lastIndex;
    if (m[1]) out.push({ t: 'str', v: m[1].slice(1, -1).replace(/""/g, '"') });
    else if (m[2]) out.push({ t: 'ref', v: m[2].toUpperCase() });
    else if (m[3]) { let s = m[3]; const pct = s.endsWith('%'); if (pct) s = s.slice(0, -1); out.push({ t: 'num', v: parseFloat(s.replace(',', '.')) / (pct ? 100 : 1) }); }
    else if (m[4]) out.push({ t: 'fn', v: deacc(m[4]) });
    else if (m[5]) out.push({ t: 'op', v: m[5] });
    else if (m[6]) { const w = deacc(m[6]); if (w === 'VERDADEIRO' || w === 'TRUE') out.push({ t: 'num', v: true }); else if (w === 'FALSO' || w === 'FALSE') out.push({ t: 'num', v: false }); else throw XERR.name; }
  }
  return out;
}
function xParse(src) {
  const tk = xTokens(src); let p = 0;
  const peek = () => tk[p], eat = v => { const t = tk[p]; if (!t || (v && t.v !== v)) throw XERR.val; p++; return t; };
  const bin = (next, ops) => () => { let a = next(); while (peek() && peek().t === 'op' && ops.includes(peek().v)) { const op = eat().v; const b = next(); a = { op, a, b }; } return a; };
  const primary = () => {
    const t = peek();
    if (!t) throw XERR.val;
    if (t.t === 'num' || t.t === 'str') { p++; return { lit: t.v }; }
    if (t.t === 'ref') { p++; return { ref: t.v }; }
    if (t.t === 'fn') {
      p++; const args = [];
      if (!(peek() && peek().v === ')')) { args.push(cmp()); while (peek() && (peek().v === ';' || peek().v === ',')) { p++; args.push(cmp()); } }
      eat(')'); return { fn: t.v, args };
    }
    if (t.v === '(') { p++; const e = cmp(); eat(')'); return e; }
    if (t.v === '-') { p++; return { op: 'neg', a: unary() }; }
    if (t.v === '+') { p++; return unary(); }
    throw XERR.val;
  };
  const unary = () => { let e = primary(); while (peek() && peek().v === '%') { p++; e = { op: '%', a: e }; } return e; };
  const pow = bin(unary, ['^']);
  const mul = bin(pow, ['*', '/']);
  const add = bin(mul, ['+', '-']);
  const cat = bin(add, ['&']);
  const cmp = bin(cat, ['=', '<>', '<', '>', '<=', '>=']);
  const e = cmp();
  if (p < tk.length) throw XERR.val;
  return e;
}

class Sheet {
  constructor(grid) { this.raw = grid.map(r => r.map(c => (c == null ? '' : String(c)))); this.cache = new Map(); }
  get rows() { return this.raw.length; }
  get cols() { return Math.max(...this.raw.map(r => r.length)); }
  set(ref, v) { const [r, c] = refRC(ref); while (this.raw.length <= r) this.raw.push([]); this.raw[r][c] = v; this.cache.clear(); }
  getRaw(ref) { const rc = refRC(ref); return rc ? ((this.raw[rc[0]] || [])[rc[1]] ?? '') : ''; }
  value(ref, stack = new Set()) {
    if (this.cache.has(ref)) return this.cache.get(ref);
    if (stack.has(ref)) return XERR.circ;
    stack.add(ref);
    const raw = this.getRaw(ref);
    let v;
    if (raw === '') v = null;
    else if (raw.startsWith('=')) { try { v = this.ev(xParse(raw.slice(1)), stack); if (Array.isArray(v)) v = v[0] ? v[0][0] : null; } catch (e) { v = typeof e === 'string' ? e : XERR.val; } }
    else if (/^-?\d+(?:[.,]\d+)?$/.test(raw.trim())) v = parseFloat(raw.trim().replace(',', '.'));
    else if (/^-?\d+(?:[.,]\d+)?%$/.test(raw.trim())) v = parseFloat(raw.trim().replace(',', '.')) / 100;
    else if (/^(VERDADEIRO|FALSO)$/i.test(raw.trim())) v = /^V/i.test(raw.trim());
    else v = raw;
    stack.delete(ref);
    this.cache.set(ref, v);
    return v;
  }
  range(a, b, stack) {
    const [r1, c1] = refRC(a), [r2, c2] = refRC(b), out = [];
    for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) { const row = []; for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) row.push(this.value(colName(c) + (r + 1), stack)); out.push(row); }
    return out;
  }
  ev(n, st) {
    if ('lit' in n) return n.lit;
    if (n.ref) { if (n.ref.includes(':')) { const [a, b] = n.ref.split(':'); return this.range(a.replace(/\$/g, ''), b.replace(/\$/g, ''), st); } return this.value(n.ref.replace(/\$/g, ''), st); }
    if (n.fn) return xCall(this, n.fn, n.args, st);
    const num = v => { if (isErr(v)) throw v; if (v === null || v === '') return 0; if (typeof v === 'boolean') return v ? 1 : 0; if (typeof v === 'number') return v; const x = parseFloat(String(v).replace(',', '.')); if (isNaN(x)) throw XERR.val; return x; };
    if (n.op === 'neg') return -num(this.ev(n.a, st));
    if (n.op === '%') return num(this.ev(n.a, st)) / 100;
    const a = scal(this.ev(n.a, st)), b = scal(this.ev(n.b, st));
    if (isErr(a)) throw a; if (isErr(b)) throw b;
    switch (n.op) {
      case '+': return num(a) + num(b);
      case '-': return num(a) - num(b);
      case '*': return num(a) * num(b);
      case '/': { const d = num(b); if (d === 0) throw XERR.div; return num(a) / d; }
      case '^': return Math.pow(num(a), num(b));
      case '&': return xText(a) + xText(b);
      default: { const c = xCmp(a, b); return { '=': c === 0, '<>': c !== 0, '<': c < 0, '>': c > 0, '<=': c <= 0, '>=': c >= 0 }[n.op]; }
    }
  }
}
const scal = v => (Array.isArray(v) ? (v[0] ? v[0][0] : null) : v);
const flat = v => (Array.isArray(v) ? v.flat() : [v]);
function xText(v) { if (v === null) return ''; if (typeof v === 'boolean') return v ? 'VERDADEIRO' : 'FALSO'; if (typeof v === 'number') return xFmt(v); return String(v); }
function xCmp(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a === null) a = typeof b === 'number' ? 0 : '';
  if (b === null) b = typeof a === 'number' ? 0 : '';
  if (typeof a === 'number' && typeof b !== 'number') return -1;
  if (typeof b === 'number' && typeof a !== 'number') return 1;
  return deacc(xText(a)).localeCompare(deacc(xText(b)));
}
function xCrit(crit) {
  const c = xText(crit);
  const m = /^(<=|>=|<>|<|>|=)?(.*)$/.exec(c);
  const op = m[1] || '=', rhs = m[2];
  const n = parseFloat(rhs.replace(',', '.'));
  const isN = rhs !== '' && !isNaN(n) && /^-?[\d.,]+$/.test(rhs);
  const wild = !isN && /[*?]/.test(rhs) ? new RegExp('^' + deacc(rhs).replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$') : null;
  return v => {
    if (wild) { const r = wild.test(deacc(xText(v))); return op === '<>' ? !r : r; }
    const c2 = isN ? (typeof v === 'number' ? v - n : NaN) : xCmp(v === null ? '' : v, rhs);
    if (isNaN(c2)) return op === '<>';
    return { '=': c2 === 0, '<>': c2 !== 0, '<': c2 < 0, '>': c2 > 0, '<=': c2 <= 0, '>=': c2 >= 0 }[op];
  };
}
const FN_ALIAS = { SUM: 'SOMA', AVERAGE: 'MEDIA', MAX: 'MAXIMO', MIN: 'MINIMO', COUNT: 'CONT.NUM', COUNTA: 'CONT.VALORES', COUNTIF: 'CONT.SE', COUNTIFS: 'CONT.SES', SUMIF: 'SOMASE', SUMIFS: 'SOMASES', AVERAGEIF: 'MEDIASE', IF: 'SE', AND: 'E', OR: 'OU', NOT: 'NAO', IFERROR: 'SEERRO', VLOOKUP: 'PROCV', XLOOKUP: 'PROCX', INDEX: 'INDICE', MATCH: 'CORRESP', ROUND: 'ARRED', LEFT: 'ESQUERDA', RIGHT: 'DIREITA', MID: 'EXT.TEXTO', LEN: 'NUM.CARACT', UPPER: 'MAIUSCULA', LOWER: 'MINUSCULA', TRIM: 'ARRUMAR', CONCATENATE: 'CONCATENAR', SQRT: 'RAIZ', POWER: 'POTENCIA', SUMPRODUCT: 'SOMARPRODUTO', ROUNDUP: 'ARREDONDAR.PARA.CIMA', ROUNDDOWN: 'ARREDONDAR.PARA.BAIXO', IFS: 'SES', COUNTBLANK: 'CONTAR.VAZIO' };
function xCall(sh, name, args, st) {
  name = FN_ALIAS[name] || name;
  const ev = a => sh.ev(a, st);
  const nums = vals => vals.flatMap(flat).filter(v => typeof v === 'number');
  const N = a => { const v = scal(ev(a)); if (isErr(v)) throw v; if (v === null) return 0; if (typeof v === 'boolean') return +v; const x = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.')); if (isNaN(x)) throw XERR.val; return x; };
  const T = a => { const v = scal(ev(a)); if (isErr(v)) throw v; return xText(v); };
  const B = a => { const v = scal(ev(a)); if (isErr(v)) throw v; return typeof v === 'string' ? /^VERDADEIRO$/i.test(v) : !!v; };
  const all = () => args.map(ev).map(v => { flat(v).forEach(x => { if (isErr(x)) throw x; }); return v; });
  switch (name) {
    case 'SOMA': return nums(all()).reduce((s, x) => s + x, 0);
    case 'MEDIA': { const n = nums(all()); if (!n.length) throw XERR.div; return n.reduce((s, x) => s + x, 0) / n.length; }
    case 'MAXIMO': { const n = nums(all()); return n.length ? Math.max(...n) : 0; }
    case 'MINIMO': { const n = nums(all()); return n.length ? Math.min(...n) : 0; }
    case 'CONT.NUM': return nums(all()).length;
    case 'CONT.VALORES': return all().flatMap(flat).filter(v => v !== null && v !== '').length;
    case 'CONTAR.VAZIO': return all().flatMap(flat).filter(v => v === null || v === '').length;
    case 'CONT.SE': { const r = flat(ev(args[0])), f = xCrit(scal(ev(args[1]))); return r.filter(f).length; }
    case 'SOMASE': case 'MEDIASE': {
      const r = flat(ev(args[0])), f = xCrit(scal(ev(args[1]))), s = args[2] ? flat(ev(args[2])) : r;
      const vals = r.map((v, i) => (f(v) ? s[i] : null)).filter(v => typeof v === 'number');
      if (name === 'SOMASE') return vals.reduce((a, b) => a + b, 0);
      if (!vals.length) throw XERR.div; return vals.reduce((a, b) => a + b, 0) / vals.length;
    }
    case 'CONT.SES': case 'SOMASES': {
      const off = name === 'SOMASES' ? 1 : 0, sumR = off ? flat(ev(args[0])) : null;
      const pairs = []; for (let i = off; i < args.length; i += 2) pairs.push([flat(ev(args[i])), xCrit(scal(ev(args[i + 1])))]);
      const len = pairs[0][0].length; let cnt = 0, sum = 0;
      for (let i = 0; i < len; i++) if (pairs.every(([r, f]) => f(r[i]))) { cnt++; if (off && typeof sumR[i] === 'number') sum += sumR[i]; }
      return off ? sum : cnt;
    }
    case 'SE': return B(args[0]) ? (args[1] ? scal(ev(args[1])) : true) : (args[2] ? scal(ev(args[2])) : false);
    case 'SES': { for (let i = 0; i < args.length; i += 2) if (B(args[i])) return scal(ev(args[i + 1])); throw XERR.na; }
    case 'E': return args.every(a => flat(ev(a)).every(v => !!v));
    case 'OU': return args.some(a => flat(ev(a)).some(v => !!v));
    case 'NAO': return !B(args[0]);
    case 'SEERRO': { try { const v = scal(ev(args[0])); if (isErr(v)) return scal(ev(args[1])); return v; } catch (e) { return scal(ev(args[1])); } }
    case 'PROCV': {
      const key = scal(ev(args[0])), tab = ev(args[1]), col = N(args[2]) - 1, exact = args[3] ? !B(args[3]) : false;
      if (!Array.isArray(tab) || col < 0 || col >= tab[0].length) throw XERR.ref;
      if (exact) { const row = tab.find(r => xCmp(r[0], key) === 0); if (!row) throw XERR.na; return row[col]; }
      let best = null; for (const r of tab) { if (xCmp(r[0], key) <= 0) best = r; else break; } if (!best) throw XERR.na; return best[col];
    }
    case 'PROCX': {
      const key = scal(ev(args[0])), look = flat(ev(args[1])), ret = flat(ev(args[2]));
      const i = look.findIndex(v => xCmp(v, key) === 0);
      if (i < 0) { if (args[3]) return scal(ev(args[3])); throw XERR.na; }
      return ret[i];
    }
    case 'INDICE': { const tab = ev(args[0]); const r = N(args[1]) - 1, c = args[2] ? N(args[2]) - 1 : 0; const row = Array.isArray(tab) ? (tab.length === 1 && !args[2] ? [tab[0][r]] : tab[r]) : null; if (!row || row[c] === undefined) throw XERR.ref; return row[c]; }
    case 'CORRESP': { const key = scal(ev(args[0])), look = flat(ev(args[1])); const i = look.findIndex(v => xCmp(v, key) === 0); if (i < 0) throw XERR.na; return i + 1; }
    case 'ARRED': { const d = args[1] ? N(args[1]) : 0, f = Math.pow(10, d); return Math.round(N(args[0]) * f + Math.sign(N(args[0])) * 1e-9) / f; }
    case 'ARREDONDAR.PARA.CIMA': { const d = args[1] ? N(args[1]) : 0, f = Math.pow(10, d); return Math.ceil(N(args[0]) * f - 1e-9) / f; }
    case 'ARREDONDAR.PARA.BAIXO': { const d = args[1] ? N(args[1]) : 0, f = Math.pow(10, d); return Math.floor(N(args[0]) * f + 1e-9) / f; }
    case 'INT': return Math.floor(N(args[0]));
    case 'ABS': return Math.abs(N(args[0]));
    case 'RAIZ': { const x = N(args[0]); if (x < 0) throw XERR.val; return Math.sqrt(x); }
    case 'POTENCIA': return Math.pow(N(args[0]), N(args[1]));
    case 'MOD': { const d = N(args[1]); if (!d) throw XERR.div; return N(args[0]) % d; }
    case 'SOMARPRODUTO': { const arrs = args.map(a => flat(ev(a))); return arrs[0].reduce((s, _, i) => s + arrs.reduce((p, ar) => p * (typeof ar[i] === 'number' ? ar[i] : 0), 1), 0); }
    case 'CONCATENAR': case 'CONCAT': return args.map(a => flat(ev(a)).map(xText).join('')).join('');
    case 'ESQUERDA': return T(args[0]).slice(0, args[1] ? N(args[1]) : 1);
    case 'DIREITA': { const s = T(args[0]), n = args[1] ? N(args[1]) : 1; return n ? s.slice(-n) : ''; }
    case 'EXT.TEXTO': return T(args[0]).substr(N(args[1]) - 1, N(args[2]));
    case 'NUM.CARACT': return T(args[0]).length;
    case 'MAIUSCULA': return T(args[0]).toUpperCase();
    case 'MINUSCULA': return T(args[0]).toLowerCase();
    case 'PRI.MAIUSCULA': return T(args[0]).toLowerCase().replace(/(^|\s)(\S)/g, (m, a, b) => a + b.toUpperCase());
    case 'ARRUMAR': return T(args[0]).trim().replace(/\s+/g, ' ');
    case 'VERDADEIRO': return true;
    case 'FALSO': return false;
    default: throw XERR.name;
  }
}
function xFmt(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'boolean') return v ? 'VERDADEIRO' : 'FALSO';
  if (typeof v === 'number') { const r = Math.round(v * 1e6) / 1e6; return r.toLocaleString('pt-BR', { maximumFractionDigits: 6 }); }
  return String(v);
}
/* copiar fórmula para baixo, ajustando referências relativas */
function shiftFormula(f, dr, dc) {
  return f.replace(/("(?:[^"]|"")*")|(\$?)([A-Z]{1,3})(\$?)(\d+)(?![\w(])/gi, (m, str, cAbs, col, rAbs, row) => {
    if (str) return str;
    const c = cAbs ? col.toUpperCase() : colName(colNum(col.toUpperCase()) + dc);
    const r = rAbs ? row : String(+row + dr);
    return `${cAbs}${c}${rAbs}${r}`;
  });
}

/* ---------- componente visual ---------- */
function makeSheet(grid, opts = {}) {
  const sh = new Sheet(grid);
  const targets = new Set((opts.targets || []).map(s => s.toUpperCase()));
  let sel = opts.targets && opts.targets[0] ? opts.targets[0].toUpperCase() : 'A1';
  const box = el(`<div class="code xsheet">
    <div class="chead"><span class="dots"><i></i><i></i><i></i></span><span>Planilha</span><span class="small muted">; separa argumentos</span></div>
    <div class="xbar"><span class="xref mono">A1</span><span class="xfx">fx</span><input class="xin mono" type="text" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Barra de fórmulas"><button class="btn small primary" data-x="ok">OK</button></div>
    <div class="xgrid tblwrap"></div>
    <div class="keys">${['=', ';', '(', ')', ':', '"', '$', '+', '-', '*', '/', '>', '<', 'SOMA(', 'SE(', 'PROCV('].map(k => `<button type="button" data-key="${esc(k)}">${esc(k)}</button>`).join('')}</div>
    <div class="runbar"><button class="btn small ghost" data-x="down" type="button">Copiar para baixo ↓</button><span class="row">${opts.extra || ''}${opts.onCheck ? `<button class="btn small primary" data-x="check" type="button">${ICON.play} Conferir</button>` : ''}</span></div>
    <div class="out" role="status" aria-live="polite"></div></div>`);
  const gridEl = $('.xgrid', box), inp = $('.xin', box), refEl = $('.xref', box), out = $('.out', box);
  const paint = () => {
    const R = Math.max(sh.rows, opts.minRows || 0), C = Math.max(sh.cols, opts.minCols || 0);
    let h = '<table class="xt"><thead><tr><th></th>' + Array.from({ length: C }, (_, c) => `<th>${colName(c)}</th>`).join('') + '</tr></thead><tbody>';
    for (let r = 0; r < R; r++) {
      h += `<tr><th>${r + 1}</th>`;
      for (let c = 0; c < C; c++) {
        const ref = colName(c) + (r + 1), v = sh.value(ref), raw = sh.getRaw(ref);
        const cls = [ref === sel ? 'sel' : '', targets.has(ref) ? 'tgt' : '', isErr(v) ? 'xerr' : '', typeof v === 'number' ? 'xnum' : '', raw.startsWith('=') ? 'xf' : '', r === 0 && opts.header !== false ? 'xhead' : ''].join(' ');
        h += `<td class="${cls}" data-c="${ref}">${esc(xFmt(v))}</td>`;
      }
      h += '</tr>';
    }
    gridEl.innerHTML = h + '</tbody></table>';
    refEl.textContent = sel;
    if (document.activeElement !== inp) inp.value = sh.getRaw(sel);
  };
  const commit = () => { sh.set(sel, inp.value.trim()); paint(); };
  const insert = t => { inp.focus(); const s = inp.selectionStart ?? inp.value.length; inp.setRangeText(t, s, inp.selectionEnd ?? s, 'end'); };
  box.addEventListener('click', e => {
    const td = e.target.closest('td[data-c]');
    if (td) { if (document.activeElement === inp && inp.value.startsWith('=') && td.dataset.c !== sel) { insert(td.dataset.c); return; } sel = td.dataset.c; paint(); inp.focus(); return; }
    const k = e.target.closest('[data-key]'); if (k) return insert(k.dataset.key);
    const b = e.target.closest('[data-x]'); if (!b) return;
    if (b.dataset.x === 'ok') { commit(); inp.blur(); }
    if (b.dataset.x === 'down') {
      const raw = sh.getRaw(sel); const [r, c] = refRC(sel);
      if (!raw.startsWith('=')) return toast('Selecione uma célula com fórmula');
      let n = 0;
      for (let rr = r + 1; rr < sh.rows; rr++) { const left = c > 0 ? sh.getRaw(colName(c - 1) + (rr + 1)) : sh.getRaw(colName(c + 1) + (rr + 1)); if (left === '' && sh.getRaw(colName(0) + (rr + 1)) === '') break; sh.set(colName(c) + (rr + 1), shiftFormula(raw, rr - r, 0)); n++; }
      paint(); toast(n ? `Fórmula copiada para ${n} linha(s)` : 'Nada abaixo para preencher');
    }
    if (b.dataset.x === 'check') { commit(); opts.onCheck(sh, { out }); }
  });
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); commit(); const [r, c] = refRC(sel); if (r + 1 < sh.rows) sel = colName(c) + (r + 2); paint(); } });
  paint();
  box.sheet = sh;
  return box;
}
function checkSheet(sh, lab) {
  const ref = new Sheet(lab.grid);
  Object.entries(lab.sol).forEach(([k, v]) => ref.set(k, v));
  for (const t of lab.targets) {
    const raw = sh.getRaw(t);
    if (lab.formula !== false && !raw.startsWith('=')) return { ok: false, msg: `A célula ${t} precisa de uma fórmula (comece com =).` };
    const a = sh.value(t), b = ref.value(t);
    const same = typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) < 1e-6 : xText(a) === xText(b);
    if (!same) return { ok: false, msg: `${t} deu ${xFmt(a) || '(vazio)'}; o esperado é ${xFmt(b)}.` };
  }
  return { ok: true };
}
