/* ============================================================
   CineCode — motor do app
   ============================================================ */
const V = window.CC_VENDOR || {};
const TRACKS = window.CC.tracks.slice().sort((a, b) => a.ord - b.ord);
(window.CC.patches || []).forEach(([p, ex]) => {
  TRACKS.forEach(t => {
    t.lessons.forEach(l => { const x = p[l.id]; if (x) { if (x.rec) l.rec = x.rec; if (x.quiz) l.quiz = [...(l.quiz || []), ...x.quiz]; } });
    if (ex[t.id]) t.exam = [...(t.exam || []), ...ex[t.id]];
  });
});
const TRACK = Object.fromEntries(TRACKS.map(t => [t.id, t]));
const LESSON = {};
TRACKS.forEach(t => t.lessons.forEach((l, i) => { LESSON[l.id] = { t, l, i }; }));

const LV = {
  b: { name: 'Básico', sub: 'Explicado como para uma criança de 5 anos', short: 'como criança de 5 anos' },
  i: { name: 'Intermediário', sub: 'Já sei o básico, quero firmar', short: 'já sei o básico' },
  a: { name: 'Avançado', sub: 'Quero profundidade e detalhes técnicos', short: 'quero profundidade' }
};
const GROUPS = [
  ['Informática do zero', ['inf', 'win', 'hw', 'redes']],
  ['Office e produtividade', ['word', 'excel', 'excelpro', 'ppt', 'ws']],
  ['Primeiros passos em programação', ['fund', 'comp', 'term', 'git']],
  ['Linguagens', ['py', 'langs', 'js', 'web', 'front']],
  ['Dados', ['bd', 'sql', 'nosql', 'dados']],
  ['Backend, hospedagem e nuvem', ['api', 'host', 'devops', 'sec']],
  ['IA e automação', ['llm', 'agent', 'auto']],
  ['Mais fundo', ['algo', 'mob', 'car']]
];
const GOALS = {
  tudo: { t: 'Do zero absoluto ao avançado', s: `Todas as ${TRACKS.length} trilhas, de ligar o computador a agentes de IA`, tracks: TRACKS.map(t => t.id) },
  office: { t: 'Dominar informática e Office', s: 'Computador, Windows, Word, Excel, PowerPoint e Power BI', tracks: ['inf', 'win', 'hw', 'redes', 'word', 'excel', 'excelpro', 'ppt', 'ws', 'sec'] },
  carreira: { t: 'Trabalhar com programação', s: 'Mudar de carreira ou conseguir a primeira vaga', tracks: ['fund', 'comp', 'term', 'git', 'py', 'web', 'js', 'front', 'bd', 'sql', 'api', 'host', 'sec', 'algo', 'car'] },
  auto: { t: 'Automatizar meu trabalho', s: 'Planilhas, cobranças, relatórios e integrações', tracks: ['excel', 'excelpro', 'fund', 'py', 'bd', 'sql', 'api', 'auto', 'llm', 'agent', 'host', 'git'] },
  apps: { t: 'Criar sites e apps', s: 'Do HTML ao APK publicado', tracks: ['fund', 'comp', 'git', 'web', 'js', 'front', 'bd', 'sql', 'api', 'host', 'mob', 'sec'] },
  ia: { t: 'Dados e Inteligência Artificial', s: 'Excel, SQL, Power BI, análise, LLMs e agentes', tracks: ['excel', 'excelpro', 'fund', 'py', 'bd', 'sql', 'dados', 'llm', 'agent', 'auto'] }
};

/* ---------- utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inline = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const md = s => String(s || '').split('\n').filter(x => x.trim()).map(p => `<p>${inline(p)}</p>`).join('');
const el = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayISO = () => iso(new Date());
const parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const fmtDay = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' });
const fmtFull = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const vibrate = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
const hueOf = t => (t ? t.hue : 38);
const setHue = (node, t) => node.style.setProperty('--hue', hueOf(t));

const ICON = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
  tracks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4"/></svg>',
  plan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M8 14h3M8 17h6"/></svg>',
  lab: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M12 15h5"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M5 12l5 5L20 7"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M15 6l-6 6 6 6"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M9 6l6 6-6 6"/></svg>'
};

/* ---------- estado ---------- */
const KEY = 'cinecode.v1';
const DEF = () => ({ name: '', onb: false, intro: false, goal: null, hours: 4, days: 5, tracks: [], levels: {}, done: {}, xp: 0, streak: { n: 0, last: null }, tests: {}, start: todayISO() });
let S = (() => {
  try { const raw = localStorage.getItem(KEY); if (raw) return Object.assign(DEF(), JSON.parse(raw)); } catch (e) {}
  return DEF();
})();
let onSave = null; // a nuvem (src/cloud.js) se pendura aqui para sincronizar
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} if (onSave) onSave(); };

const levelOf = tid => S.levels[tid] || null;
const lessonMin = (t, l, lv) => (l.min[lv || levelOf(t.id) || 'b'] || 15) + 3 + (l.lab ? 6 : 0);
const trackDone = t => t.lessons.filter(l => S.done[l.id]).length;
const isDone = lid => !!S.done[lid];

/* ---------- plano de estudos ---------- */
function planItems() {
  return TRACKS.filter(t => S.tracks.includes(t.id)).flatMap(t => t.lessons.map(l => ({ t, l, min: lessonMin(t, l) })));
}
function buildPlan() {
  const cap = Math.max(30, S.hours * 60);
  const weeks = [];
  let w = [], used = 0;
  for (const it of planItems()) {
    if (used + it.min > cap && w.length) { weeks.push(w); w = []; used = 0; }
    w.push(it); used += it.min;
  }
  if (w.length) weeks.push(w);
  const start = parseISO(S.start);
  return weeks.map((items, i) => ({ items, from: addDays(start, i * 7), to: addDays(start, i * 7 + 6), min: items.reduce((s, x) => s + x.min, 0) }));
}
function nextUp() {
  const it = planItems().find(x => !isDone(x.l.id));
  if (it) return it;
  const any = TRACKS.flatMap(t => t.lessons.map(l => ({ t, l }))).find(x => !isDone(x.l.id));
  return any ? { ...any, min: lessonMin(any.t, any.l) } : null;
}
function currentWeek() { return Math.max(0, Math.floor((parseISO(todayISO()) - parseISO(S.start)) / 864e5 / 7)); }

/* ---------- realce de sintaxe ---------- */
const KW = {
  py: 'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case self',
  js: 'const let var function return if else for while do switch case break continue new class extends import from export default async await try catch finally throw typeof instanceof in of this null undefined true false yield type interface',
  sql: 'select from where and or not in is null as join left right full inner outer cross on group by order having limit offset insert into values update set delete create table view index alter add drop primary key references foreign unique default check distinct case when then else end with recursive union all exists between like asc desc begin commit rollback returning over partition conflict do explain analyze integer text real numeric timestamp extension if enable row level security policy for using',
  bash: 'sudo cd ls git npm npx pip python docker ssh echo export cat grep find mkdir rm cp mv chmod chown source curl apt brew'
};
const BI = {
  py: 'print len range int str float list dict set tuple sum min max sorted enumerate zip map filter open type isinstance round abs any all input super next iter',
  js: 'console document window Math JSON Promise Object Array Number String fetch setTimeout Intl crypto',
  sql: 'count sum avg min max round coalesce rank lag lead strftime upper lower length date now'
};
const ALIAS = { powershell: 'bash', ps: 'bash', vba: 'js', dax: 'sql', m: 'js', python: 'py', ts: 'js', tsx: 'js', javascript: 'js', node: 'js', shell: 'bash', sh: 'bash', dockerfile: 'bash', yaml: 'bash', toml: 'bash', hcl: 'js', json: 'js', http: 'text', text: 'text', css: 'css', html: 'html' };
const kwSets = {};
for (const k of Object.keys(KW)) kwSets[k] = { kw: new Set(KW[k].split(' ')), bi: new Set((BI[k] || '').split(' ')) };
function hl(code, lang) {
  lang = ALIAS[lang] || lang;
  if (lang === 'html') return hlHtml(code);
  if (lang === 'css') return hlCss(code);
  if (lang === 'text') return esc(code);
  const cm = { py: '#.*', bash: '#.*', sql: '--.*', js: '//.*|/\\*[\\s\\S]*?\\*/' }[lang] || '(?!x)x';
  const str = '"""[\\s\\S]*?"""|\'\'\'[\\s\\S]*?\'\'\'|"(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\'|`(?:\\\\.|[^`\\\\])*`';
  const re = new RegExp(`(${cm})|(${str})|(\\b\\d[\\d_]*(?:\\.\\d+)?\\b)|([A-Za-z_$][\\w$]*)`, 'g');
  const set = kwSets[lang] || { kw: new Set(), bi: new Set() };
  let out = '', last = 0, m;
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index));
    const [tok, c, s, n, w] = m;
    if (c) out += `<span class="tok-c">${esc(tok)}</span>`;
    else if (s) out += `<span class="tok-s">${esc(tok)}</span>`;
    else if (n) out += `<span class="tok-n">${tok}</span>`;
    else if (w) {
      const key = lang === 'sql' ? w.toLowerCase() : w;
      const nextCh = code[m.index + tok.length];
      if (set.kw.has(key)) out += `<span class="tok-k">${esc(tok)}</span>`;
      else if (set.bi.has(key)) out += `<span class="tok-b">${esc(tok)}</span>`;
      else if (nextCh === '(') out += `<span class="tok-f">${esc(tok)}</span>`;
      else out += esc(tok);
    }
    last = m.index + tok.length;
  }
  return out + esc(code.slice(last));
}
function hlHtml(code) {
  return esc(code)
    .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="tok-c">$1</span>')
    .replace(/(&lt;\/?)([a-zA-Z][\w-]*)/g, '$1<span class="tok-t">$2</span>')
    .replace(/\s([a-zA-Z-:]+)=(&quot;.*?&quot;)/g, ' <span class="tok-a">$1</span>=<span class="tok-s">$2</span>');
}
function hlCss(code) {
  return esc(code)
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="tok-c">$1</span>')
    .replace(/([a-z-]+)(\s*:\s*)([^;{}\n]+)/g, '<span class="tok-f">$1</span>$2<span class="tok-s">$3</span>')
    .replace(/(@[a-z-]+)/g, '<span class="tok-k">$1</span>');
}

/* ---------- carregamento das máquinas ---------- */
function loadScript(src) {
  return new Promise((ok, no) => {
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = ok;
    s.onerror = () => no(new Error('Não consegui carregar o executor. Confira a internet e tente de novo.'));
    document.head.appendChild(s);
  });
}
let evalOK = null;
function canEval() {
  if (evalOK === null) { try { evalOK = new Function('return 2')() === 2; } catch (e) { evalOK = false; } }
  return evalOK;
}
const EVAL_MSG = 'Este visualizador bloqueia a execução de código. No app instalado (APK) o executor funciona normalmente.';

/* SQL (sql.js / SQLite) */
const SEED = `
CREATE TABLE clientes (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, cidade TEXT, idade INTEGER, email TEXT);
CREATE TABLE produtos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, categoria TEXT, preco REAL);
CREATE TABLE pedidos (id INTEGER PRIMARY KEY, cliente_id INTEGER REFERENCES clientes(id), produto_id INTEGER REFERENCES produtos(id), quantidade INTEGER, data TEXT, status TEXT);
INSERT INTO clientes VALUES
 (1,'Ana Souza','Brasília',34,'ana@email.com'),(2,'Bruno Lima','Planaltina',27,'bruno@email.com'),
 (3,'Carla Dias','Goiânia',41,NULL),(4,'Diego Alves','Brasília',22,'diego@email.com'),
 (5,'Elisa Rocha','São Paulo',30,'elisa@email.com'),(6,'Felipe Melo','Planaltina',52,NULL),
 (7,'Gabi Nunes','Brasília',19,'gabi@email.com'),(8,'Hugo Prado','Goiânia',36,'hugo@email.com'),
 (9,'Íris Castro','São Paulo',45,'iris@email.com');
INSERT INTO produtos VALUES
 (1,'Pão francês','padaria',0.75),(2,'Bolo de cenoura','padaria',28.0),(3,'Café 500g','mercearia',22.9),
 (4,'Leite 1L','laticínios',5.49),(5,'Queijo minas','laticínios',39.9),(6,'Suco de laranja','bebidas',12.0),
 (7,'Croissant','padaria',9.5),(8,'Refrigerante 2L','bebidas',10.99);
INSERT INTO pedidos VALUES
 (1,1,1,10,'2026-09-01','pago'),(2,1,3,1,'2026-09-01','pago'),(3,2,2,1,'2026-09-03','pago'),
 (4,3,5,2,'2026-09-05','cancelado'),(5,4,6,3,'2026-09-07','pago'),(6,5,7,4,'2026-09-10','pago'),
 (7,5,3,2,'2026-09-10','aberto'),(8,6,4,6,'2026-09-12','pago'),(9,7,8,2,'2026-09-15','aberto'),
 (10,8,2,1,'2026-09-18','pago'),(11,1,5,1,'2026-09-20','pago'),(12,2,1,20,'2026-09-22','pago'),
 (13,4,7,2,'2026-09-25','aberto'),(14,7,6,1,'2026-09-28','pago'),(15,2,3,1,'2026-10-01','pago');`;
let sqlP = null;
function sqlEngine() {
  if (!sqlP) {
    sqlP = (async () => { if (!window.initSqlJs) await loadScript(V.sql); return window.initSqlJs(); })();
    sqlP.catch(() => { sqlP = null; });
  }
  return sqlP;
}
function freshDb(SQL) { const db = new SQL.Database(); db.run(SEED); return db; }
function sqlErr(msg) {
  let m;
  if ((m = /no such table: (\S+)/.exec(msg))) return `A tabela "${m[1]}" não existe. Tabelas disponíveis: clientes, produtos, pedidos.`;
  if ((m = /no such column: (\S+)/.exec(msg))) return `A coluna "${m[1]}" não existe. Confira o nome (e o apelido da tabela).`;
  if ((m = /near "(.+?)": syntax error/.exec(msg))) return `Erro de sintaxe perto de "${m[1]}". Confira vírgulas, aspas e a ordem das cláusulas.`;
  if (/incomplete input/.test(msg)) return 'Comando incompleto: faltou terminar a consulta (parêntese ou aspas abertos?).';
  if (/NOT NULL constraint/.test(msg)) return 'Uma coluna obrigatória (NOT NULL) ficou sem valor.';
  if (/UNIQUE constraint/.test(msg)) return 'Esse valor já existe numa coluna que não aceita repetidos (UNIQUE/PRIMARY KEY).';
  return msg;
}
async function runSQL(code) {
  const SQL = await sqlEngine();
  const db = freshDb(SQL);
  try {
    const res = db.exec(code);
    return { ok: true, result: res[res.length - 1] || null, changes: db.getRowsModified() };
  } catch (e) { return { ok: false, error: sqlErr(e.message) }; }
  finally { db.close(); }
}
const norm = res => (res ? res.values.map(r => JSON.stringify(r.map(v => (typeof v === 'number' ? Math.round(v * 100) / 100 : v)))) : []);
function sameRes(a, b, ordered) {
  if (!a || !b || a.columns.length !== b.columns.length) return false;
  const A = norm(a), B = norm(b);
  if (!ordered) { A.sort(); B.sort(); }
  return A.length === B.length && A.every((x, i) => x === B[i]);
}
async function checkSQL(user, lab) {
  const SQL = await sqlEngine();
  const c = lab.check;
  const exec = (code, extra) => {
    const db = freshDb(SQL);
    try { let r = db.exec(code); if (extra) r = db.exec(extra); return { r: r[r.length - 1] || null }; }
    catch (e) { return { e: sqlErr(e.message) }; }
    finally { db.close(); }
  };
  const u = exec(user, c.verify);
  if (u.e) return { ok: false, msg: u.e };
  const x = exec(c.verify ? lab.sol : c.q, c.verify);
  if (sameRes(u.r, x.r, c.ordered)) return { ok: true, result: u.r };
  let msg = 'O resultado ainda não bate com o esperado.';
  if (u.r && x.r && u.r.columns.length !== x.r.columns.length) msg += ` Esperado ${x.r.columns.length} coluna(s), veio ${u.r.columns.length}.`;
  else if (u.r && x.r) msg += ` Esperado ${x.r.values.length} linha(s), veio ${u.r.values.length}.`;
  return { ok: false, msg, result: u.r };
}

/* Python (Skulpt) */
let skP = null;
function skEngine() {
  if (!skP) {
    skP = (async () => {
      if (!window.Sk) await loadScript(V.sk);
      if (!window.Sk.builtinFiles) await loadScript(V.skstd);
      return window.Sk;
    })();
    skP.catch(() => { skP = null; });
  }
  return skP;
}
function pyErr(e) {
  let s = (e && e.toString) ? e.toString() : String(e);
  let m;
  if ((m = /NameError: name '(.+?)' is not defined/.exec(s))) s += `\n→ O nome "${m[1]}" não existe. Faltou criar a variável/função ou tem erro de digitação?`;
  else if (/IndentationError|unindent|expected an indented block/.test(s)) s += '\n→ Problema de indentação: as linhas dentro de if/for/def precisam de 4 espaços a mais.';
  else if (/SyntaxError/.test(s)) s += '\n→ Erro de escrita: confira dois-pontos (:), parênteses e aspas.';
  else if (/ZeroDivisionError/.test(s)) s += '\n→ Divisão por zero.';
  else if (/TypeError/.test(s)) s += '\n→ Tipos incompatíveis: por exemplo, somar texto com número. Use int() ou str().';
  else if (/KeyError/.test(s)) s += '\n→ Essa chave não existe no dicionário. Use .get() para um valor padrão.';
  else if (/IndexError/.test(s)) s += '\n→ Posição fora da lista. Lembre: começa no 0 e vai até len-1.';
  else if (/TimeLimitError|time limit/i.test(s)) s = 'O programa demorou demais (loop infinito?).';
  else if (/ImportError|ModuleNotFoundError/.test(s)) s += '\n→ Este módulo não existe no Python do app. Rode no Python do seu computador.';
  return s;
}
async function runPy(code) {
  if (!canEval()) return { ok: false, stdout: '', error: EVAL_MSG };
  const Sk = await skEngine();
  let buf = '';
  Sk.configure({
    output: t => { buf += t; },
    read: f => { if (!Sk.builtinFiles || Sk.builtinFiles.files[f] === undefined) throw new Error("módulo não encontrado: '" + f + "'"); return Sk.builtinFiles.files[f]; },
    __future__: Sk.python3, execLimit: 8000, yieldLimit: 150,
    inputfun: () => '', inputfunTakesPrompt: true
  });
  try {
    await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, code, true));
    return { ok: true, stdout: buf };
  } catch (e) { return { ok: false, stdout: buf, error: pyErr(e) }; }
}
async function checkPy(user, lab) {
  const c = lab.check;
  if (c.out != null) {
    const r = await runPy(user);
    if (!r.ok) return { ok: false, msg: r.error, stdout: r.stdout };
    const ok = r.stdout.trim() === c.out.trim();
    return { ok, stdout: r.stdout, msg: ok ? '' : `A saída deveria ser exatamente:\n${c.out}` };
  }
  const r = await runPy(user + '\n\n' + c.tests);
  if (r.ok) return { ok: true, stdout: r.stdout };
  let msg = r.error;
  if (/AssertionError/.test(msg)) {
    const m = /AssertionError:?\s*(.*?)\s*on line/.exec(msg);
    msg = 'Um dos testes não passou' + (m && m[1] ? `: ${m[1]}` : '.') + '\nConfira os exemplos da tarefa.';
  }
  return { ok: false, msg, stdout: r.stdout };
}

/* JavaScript (Web Worker isolado) */
const WORKER_SRC = `
const _st = self.setTimeout, _ct = self.clearTimeout, ids = new Set(); let mainDone = false, timers = {};
const send = (t, a) => postMessage({ t, a });
const fmt = v => {
  if (typeof v === 'string') return v;
  if (typeof v === 'bigint') return v + 'n';
  if (v === undefined) return 'undefined';
  if (typeof v === 'function') return '[Function ' + (v.name || 'anônima') + ']';
  if (v instanceof Error) return v.name + ': ' + v.message;
  if (v instanceof Map) return 'Map(' + v.size + ') ' + fmt(Object.fromEntries(v));
  if (v instanceof Set) return 'Set(' + v.size + ') ' + fmt([...v]);
  try { return JSON.stringify(v, (k, x) => typeof x === 'bigint' ? x + 'n' : x === undefined ? null : x); } catch (e) { return String(v); }
};
const log = t => (...a) => send(t, a.map(fmt).join(' '));
self.console = { log: log('log'), info: log('log'), debug: log('log'), warn: log('warn'), error: log('err'),
  table: d => send('log', fmt(d)),
  time: (k = 'default') => { timers[k] = performance.now(); },
  timeEnd: (k = 'default') => send('log', k + ': ' + (performance.now() - (timers[k] || 0)).toFixed(0) + 'ms') };
const check = () => { if (mainDone && ids.size === 0) _st(() => { if (ids.size === 0) send('done'); }, 0); };
self.setTimeout = (f, ms, ...a) => { const id = _st(() => { ids.delete(id); try { f(...a); } catch (e) { send('err', (e.name || 'Erro') + ': ' + e.message); } check(); }, ms); ids.add(id); return id; };
self.clearTimeout = id => { ids.delete(id); _ct(id); check(); };
self.onunhandledrejection = e => { e.preventDefault(); const r = e.reason; send('err', (r && r.name ? r.name + ': ' : '') + (r && r.message || r)); };
self.onmessage = async e => {
  try { const AF = Object.getPrototypeOf(async function () {}).constructor; await new AF(e.data)(); mainDone = true; check(); }
  catch (err) { send('err', (err && err.name ? err.name + ': ' : '') + (err && err.message || err)); send('done'); }
};`;
let workerURL = null;
function runJS(code, onMsg, timeout = 6000) {
  return new Promise(resolve => {
    if (!canEval()) { onMsg && onMsg({ t: 'err', a: EVAL_MSG }); return resolve({ ok: false, logs: [{ t: 'err', a: EVAL_MSG }] }); }
    if (!workerURL) workerURL = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }));
    let w;
    try { w = new Worker(workerURL); } catch (e) { const m = { t: 'err', a: 'Não foi possível iniciar o executor de JavaScript aqui.' }; onMsg && onMsg(m); return resolve({ ok: false, logs: [m] }); }
    const logs = []; let err = false, fin = false;
    const end = (extra) => { if (fin) return; fin = true; clearTimeout(tm); w.terminate(); if (extra) { logs.push(extra); onMsg && onMsg(extra); } resolve({ ok: !err, logs }); };
    const tm = setTimeout(() => end({ t: 'info', a: '(tempo esgotado: o código ainda estava rodando após 6s)' }), timeout);
    w.onmessage = e => { const m = e.data; if (m.t === 'done') return end(); if (m.t === 'err') err = true; logs.push(m); onMsg && onMsg(m); };
    w.onerror = e => { e.preventDefault(); err = true; end({ t: 'err', a: e.message }); };
    w.postMessage(code);
  });
}
async function checkJS(user, lab) {
  const r = await runJS(user + '\n;\n' + lab.check.tests);
  const errs = r.logs.filter(l => l.t === 'err').map(l => l.a);
  return { ok: r.ok && !errs.length, msg: errs.join('\n') || 'Algo não saiu como esperado.', logs: r.logs };
}
function checkHTML(user, lab) {
  try {
    const doc = new DOMParser().parseFromString(user, 'text/html');
    if (!canEval()) return { ok: false, msg: EVAL_MSG };
    new Function('doc', lab.check.tests)(doc);
    return { ok: true };
  } catch (e) { return { ok: false, msg: e.message }; }
}

/* ---------- editor de código ---------- */
const KEYS = {
  py: ['⇥', ':', '(', ')', '"', "'", '=', '[', ']', '{', '}', '#', '_', '.', ','],
  js: ['⇥', '{', '}', '(', ')', ';', '=', '=>', '"', "'", '`', '[', ']', '.', '!'],
  sql: ['*', ',', '(', ')', "'", '=', ';', '%', '<', '>', '.', '_'],
  html: ['<', '>', '/', '=', '"', '{', '}', ':', ';', '.', '#']
};
const LANGNAME = { py: 'Python', js: 'JavaScript', sql: 'SQL · SQLite', html: 'HTML + CSS' };
function makeEditor(code, lang, opts = {}) {
  const ind = lang === 'py' ? '    ' : '  ';
  const box = el(`<div class="code">
    <div class="chead"><span class="dots"><i></i><i></i><i></i></span><span>${LANGNAME[lang] || lang}</span><button class="btn small ghost" data-k="reset" type="button">Restaurar</button></div>
    <div class="ed"><pre aria-hidden="true"><code></code></pre><textarea spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Editor de código ${LANGNAME[lang] || ''}"></textarea></div>
    <div class="keys">${(KEYS[lang] || []).map(k => `<button type="button" data-key="${esc(k)}">${esc(k)}</button>`).join('')}</div>
    <div class="runbar"><span class="small muted">${opts.hint || 'Edite e aperte Rodar'}</span><span class="row">${opts.extra || ''}<button class="btn small primary" data-k="run" type="button">${ICON.play} ${opts.runLabel || 'Rodar'}</button></span></div>
    <div class="out" role="status" aria-live="polite"></div>
  </div>`);
  const ta = $('textarea', box), pre = $('pre code', box), out = $('.out', box);
  const original = code;
  const paint = () => {
    const v = ta.value;
    pre.innerHTML = hl(v, lang) + '\n';
    const lines = v.split('\n');
    const longest = Math.max(20, ...lines.map(l => l.length));
    ta.style.width = `calc(${longest + 3}ch + 32px)`;
    $('.ed pre', box).style.width = ta.style.width;
  };
  ta.value = code; paint();
  const insert = txt => {
    ta.focus();
    let ok = false;
    try { ok = document.execCommand('insertText', false, txt); } catch (e) {}
    if (!ok) { ta.setRangeText(txt, ta.selectionStart, ta.selectionEnd, 'end'); }
    paint();
  };
  ta.addEventListener('input', paint);
  ta.addEventListener('scroll', () => { ta.scrollTop = 0; ta.scrollLeft = 0; });
  ta.addEventListener('keydown', e => {
    if (e.key === 'Tab') { e.preventDefault(); insert(ind); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const before = ta.value.slice(0, ta.selectionStart);
      const line = before.split('\n').pop();
      let lead = (line.match(/^\s*/) || [''])[0];
      if ((lang === 'py' && /:\s*$/.test(line)) || (lang !== 'py' && /[{(\[]\s*$/.test(line))) lead += ind;
      insert('\n' + lead);
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
  });
  box.addEventListener('click', e => {
    const k = e.target.closest('[data-key]');
    if (k) { const v = k.dataset.key; insert(v === '⇥' ? ind : v); return; }
    const b = e.target.closest('[data-k]');
    if (!b) return;
    if (b.dataset.k === 'run') run();
    if (b.dataset.k === 'reset') { ta.value = original; paint(); out.innerHTML = ''; }
  });
  const print = (txt, cls) => { const s = document.createElement('div'); if (cls) s.className = cls; s.textContent = txt; out.appendChild(s); out.scrollTop = out.scrollHeight; };
  const table = res => {
    if (!res) return;
    const wrap = el(`<div class="tblwrap"><table><thead><tr>${res.columns.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${res.values.slice(0, 200).map(r => `<tr>${r.map(v => `<td>${v === null ? '<span class="muted">NULL</span>' : esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
    out.appendChild(wrap);
    print(`${res.values.length} linha(s)`, 'info');
  };
  let busy = false;
  async function run() {
    if (busy) return;
    busy = true; out.innerHTML = '';
    const btn = $('[data-k="run"]', box);
    btn.disabled = true;
    print(opts.onCheck ? 'Conferindo…' : 'Rodando…', 'info');
    const code = ta.value;
    try {
      if (opts.onCheck) { out.innerHTML = ''; await opts.onCheck(code, { print, table, out }); }
      else if (lang === 'sql') {
        const r = await runSQL(code); out.innerHTML = '';
        if (!r.ok) print(r.error, 'err');
        else if (r.result) table(r.result);
        else print(`Comando executado. Linhas afetadas: ${r.changes}.`, 'ok');
        print('(o banco volta ao estado original a cada execução)', 'info');
      } else if (lang === 'py') {
        const r = await runPy(code); out.innerHTML = '';
        if (r.stdout) print(r.stdout.replace(/\n$/, ''));
        if (!r.ok) print(r.error, 'err');
        else if (!r.stdout) print('(rodou sem mostrar nada; use print para ver resultados)', 'info');
      } else if (lang === 'js') {
        out.innerHTML = '';
        const r = await runJS(code, m => print(m.a, m.t === 'err' ? 'err' : m.t === 'info' ? 'info' : ''));
        if (r.ok && !r.logs.length) print('(rodou sem mostrar nada; use console.log)', 'info');
      } else if (lang === 'html') {
        out.innerHTML = '';
        let fr = $('iframe', box);
        if (!fr) { fr = el('<iframe class="preview" sandbox="allow-scripts" title="Pré-visualização"></iframe>'); box.appendChild(fr); }
        fr.srcdoc = code;
      }
    } catch (e) { out.innerHTML = ''; print(e.message || String(e), 'err'); }
    busy = false; btn.disabled = false;
  }
  box.getCode = () => ta.value;
  box.setCode = v => { ta.value = v; paint(); };
  box.run = run;
  return box;
}
function codeBlock(code, lang, type) {
  const box = el(`<div class="code"><div class="chead"><span class="dots"><i></i><i></i><i></i></span><span>${esc(lang)}</span></div><pre><code></code></pre></div>`);
  const c = $('code', box);
  if (!type || reduced()) { c.innerHTML = hl(code, lang); return box; }
  let i = 0; const step = Math.max(2, Math.ceil(code.length / 70));
  const tick = () => {
    if (!box.isConnected && i > 0) return;
    i = Math.min(code.length, i + step);
    c.innerHTML = hl(code.slice(0, i), lang) + (i < code.length ? '<span class="tok-p">▌</span>' : '');
    if (i < code.length) requestAnimationFrame(tick);
  };
  box.addEventListener('click', () => { i = code.length - 1; });
  requestAnimationFrame(tick);
  return box;
}

/* ---------- confete ---------- */
function burst(hue = 38) {
  if (reduced()) return;
  const cv = el('<canvas class="burst"></canvas>');
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d'), W = cv.width = innerWidth * devicePixelRatio, H = cv.height = innerHeight * devicePixelRatio;
  const ps = Array.from({ length: 90 }, () => ({ x: W / 2, y: H * .45, vx: (Math.random() - .5) * 26, vy: -Math.random() * 26 - 6, r: (Math.random() * 5 + 3) * devicePixelRatio, c: `hsl(${Math.random() < .5 ? hue : 38} 90% ${55 + Math.random() * 25}%)`, a: Math.random() * 6 }));
  let f = 0;
  (function loop() {
    ctx.clearRect(0, 0, W, H);
    ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .9; p.vx *= .985; p.a += .2; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.globalAlpha = Math.max(0, 1 - f / 80); ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); ctx.restore(); });
    if (++f < 80) requestAnimationFrame(loop); else cv.remove();
  })();
}
function toast(msg) { $$('.toast').forEach(t => t.remove()); const t = el(`<div class="toast" role="status">${esc(msg)}</div>`); document.body.appendChild(t); setTimeout(() => t.remove(), 2700); }

/* ---------- navegação ---------- */
let current = { v: 'home' };
let overlay = null;
function go(v, arg, replace) {
  const st = { v, arg };
  try { replace ? history.replaceState(st, '') : history.pushState(st, ''); } catch (e) {}
  render(st);
}
let ignorePop = 0;
window.addEventListener('popstate', e => {
  if (ignorePop > 0) { ignorePop--; return; }
  if (overlay) { overlay.close(); return; }
  render(e.state || { v: 'home' });
});
function openOverlay(node, onClose) {
  if (overlay) closeOverlay();
  try { history.pushState({ ...current, ov: 1 }, ''); } catch (e) {}
  document.body.appendChild(node);
  overlay = {
    node,
    close() {
      node.remove();
      overlay = null;
      onClose && onClose();
      render(current);
    }
  };
  return overlay;
}
function closeOverlay() {
  if (!overlay) return;
  overlay.close();
  ignorePop++;
  try { history.back(); } catch (e) { ignorePop--; }
}

/* ---------- telas ---------- */
const view = () => $('#view');
function render(st) {
  current = st;
  const v = st.v;
  $$('.tab').forEach(t => t.setAttribute('aria-current', t.dataset.go === (v === 'track' ? 'trilhas' : v) ? 'page' : 'false'));
  const html = ({ home: vHome, trilhas: vTrilhas, track: vTrack, plano: vPlano, lab: vLab, perfil: vPerfil }[v] || vHome)(st.arg);
  const node = view();
  node.innerHTML = `<div class="wrap">${html}</div>`;
  node.scrollTop = 0;
  if (v === 'lab') mountLab(st.arg || 'sql');
  if (v === 'track') setHue(node, TRACK[st.arg]); else node.style.removeProperty('--hue');
}

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'Boa madrugada' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}
function lvChip(lv) { return lv ? `<span class="chip lv-${lv}">${LV[lv].name}</span>` : '<span class="chip">Nível a definir</span>'; }

function vHome() {
  const nx = nextUp();
  const total = TRACKS.reduce((s, t) => s + t.lessons.length, 0);
  const doneN = Object.keys(S.done).length;
  const plan = buildPlan();
  const wk = Math.min(currentWeek(), Math.max(0, plan.length - 1));
  const todayMin = Math.round(S.hours * 60 / S.days);
  const upcoming = planItems().filter(x => !isDone(x.l.id)).slice(0, 4);
  const going = TRACKS.filter(t => trackDone(t) > 0 && trackDone(t) < t.lessons.length);
  let poster = '';
  if (nx) {
    const lv = levelOf(nx.t.id);
    poster = `<section class="poster" style="--hue:${nx.t.hue}">
      <span class="glyph" aria-hidden="true">${esc(nx.t.glyph)}</span><span class="beam" aria-hidden="true"></span>
      ${mediaBlock(nx.l, 0, 'poster-media')}
      <span class="eyebrow">Em cartaz · próxima aula</span>
      <h2>${esc(nx.l.title)}</h2>
      <span class="meta">${esc(nx.t.name)} · Aula ${nx.t.lessons.indexOf(nx.l) + 1} de ${nx.t.lessons.length} · ${lessonMin(nx.t, nx.l)} min${lv ? ' · ' + LV[lv].name : ''}</span>
      <div class="row"><button class="btn primary" data-act="play" data-id="${nx.l.id}">${ICON.play} ${lv ? 'Assistir agora' : 'Começar'}</button>
      ${lv ? '' : `<button class="btn ghost" data-act="test" data-id="${nx.t.id}">Teste de nível</button>`}</div>
    </section>`;
  } else {
    poster = `<section class="poster"><span class="glyph">★</span><span class="eyebrow">Fim da temporada</span><h2>Você assistiu todas as cenas!</h2><span class="meta">Revise trilhas no nível Avançado ou pratique no Lab.</span></section>`;
  }
  return `
    <header class="hello"><h1>${greeting()}${S.name ? ', ' + esc(S.name) : ''}.</h1>
      <p>${nx ? `Meta de hoje: cerca de ${todayMin} minutos de estudo.` : 'Tudo concluído. Hora de construir projetos!'}</p></header>
    <div class="stats">
      <div class="stat"><b class="num">${S.xp}</b><span>XP</span></div>
      <div class="stat"><b class="num">${streakNow()}</b><span>dias seguidos</span></div>
      <div class="stat"><b class="num">${doneN}<small class="muted" style="font-size:13px">/${total}</small></b><span>aulas feitas</span></div>
    </div>
    ${poster}
    ${homeExtras()}
    ${upcoming.length ? `<section class="list"><div class="section-h"><h2>Próximas no seu plano</h2><button class="btn small ghost" data-act="nav" data-go="plano">Semana ${wk + 1}/${plan.length}</button></div>
      ${upcoming.map(x => lessonRow(x.t, x.l, true)).join('')}</section>` : ''}
    ${going.length ? `<section class="list"><div class="section-h"><h2>Continue de onde parou</h2></div>
      ${going.map(trackRow).join('')}</section>` : ''}
    <section class="list"><div class="section-h"><h2>Praticar agora</h2></div>
      <button class="item" data-act="nav" data-go="lab" style="--hue:175"><span class="ico">SQL</span><span class="txt"><b>Laboratório</b><span>Banco de dados real, Python, JavaScript e HTML rodando aqui no app</span></span><span class="end">${ICON.right}</span></button>
    </section>`;
}
function streakNow() {
  const s = S.streak;
  if (!s.last) return 0;
  const diff = Math.round((parseISO(todayISO()) - parseISO(s.last)) / 864e5);
  return diff <= 1 ? s.n : 0;
}
/* vídeos reais das aulas (media/broll, ver tools/baixar-videos.mjs) */
const brollSrc = (l, n = 0) => { const a = ((window.CC.midia || {}).broll || {})[l.id]; return a && a.length ? a[n % a.length] : ''; };
const iluSrc = brollSrc;
const mediaThumb = l => { const v = brollSrc(l); return v ? `<span class="thumb-media" aria-hidden="true"><img src="${v.replace(/\.(mp4|webm)$/, '.jpg')}" alt="" loading="lazy" decoding="async"></span>` : ''; };
const mediaBlock = (l, n, cls) => { const v = brollSrc(l, n); if (!v) return ''; return /\.jpg$/.test(v) ? `<div class="${cls} kb" aria-hidden="true"><img src="${v}" alt="" decoding="async"></div>` : `<div class="${cls}" aria-hidden="true"><video muted loop playsinline autoplay preload="metadata" poster="${v.replace(/\.(mp4|webm)$/, '.jpg')}" src="${v}"></video></div>`; };
function lessonRow(t, l, showTrack) {
  const done = isDone(l.id);
  return `<button class="item" style="--hue:${t.hue}" data-act="play" data-id="${l.id}">
    ${brollSrc(l) ? mediaThumb(l) : `<span class="ico">${esc(showTrack ? t.glyph : 'C' + (t.lessons.indexOf(l) + 1))}</span>`}
    <span class="txt"><b>${esc(l.title)}</b><span>${showTrack ? esc(t.short) + ' · ' : ''}${lessonMin(t, l)} min${l.lab ? ' · com prática' : ''}</span></span>
    <span class="end">${done ? notaChip(S.done[l.id].nota) : ICON.play}</span></button>`;
}
function notaChip(n) { return typeof n === 'number' ? `<span class="chip nota ${n >= 7 ? 'ok' : 'low'} num">${fmtNota(n)}</span>` : `<span class="done-mark">${ICON.check}</span>`; }
function homeExtras() {
  const due = srsDue().length;
  const ref = (S.reforco || []).filter(id => LESSON[id]).slice(0, 3);
  let h = '';
  if (due) h += `<button class="item review" data-act="review" style="--hue:200"><span class="ico">↻</span><span class="txt"><b>Revisão inteligente</b><span>${due} questão${due > 1 ? 'ões' : ''} para revisar hoje. Leva poucos minutos e fixa o que você errou.</span></span><span class="end">${ICON.play}</span></button>`;
  if (ref.length) h += `<section class="list"><div class="section-h"><h2>Reforço recomendado</h2><span class="small muted">nota abaixo de 7</span></div>${ref.map(id => lessonRow(LESSON[id].t, LESSON[id].l, true)).join('')}</section>`;
  return h;
}
function trackRow(t) {
  const d = trackDone(t), n = t.lessons.length;
  return `<button class="item" style="--hue:${t.hue}" data-act="nav" data-go="track" data-id="${t.id}">
    <span class="ico">${esc(t.glyph)}</span>
    <span class="txt"><b>${esc(t.name)}</b><span class="bar-prog" style="--hue:${t.hue}"><i style="width:${Math.round(d / n * 100)}%"></i></span></span>
    <span class="end num">${d}/${n}</span></button>`;
}

function vTrilhas() {
  return `<header class="hello"><h1>Trilhas</h1><p>${TRACKS.length} trilhas e ${TRACKS.reduce((s, t) => s + t.lessons.length, 0)} aulas, do zero ao avançado. Cada aula tem videoaula, recapitulação, teste e 3 níveis de explicação.</p></header>
    ${GROUPS.map(([g, ids]) => `<section class="list"><h2 class="group-h">${g}</h2><div class="grid">
      ${ids.map(id => TRACK[id]).filter(Boolean).map(t => {
        const d = trackDone(t), n = t.lessons.length;
        return `<button class="tcard" style="--hue:${t.hue}" data-act="nav" data-go="track" data-id="${t.id}">
          <div class="row between"><span class="g">${esc(t.glyph)}</span>${lvChip(levelOf(t.id))}</div>
          <h3>${esc(t.name)}</h3><p>${esc(t.desc)}</p>
          <div class="row between small"><span class="bar-prog" style="flex:1"><i style="width:${Math.round(d / n * 100)}%"></i></span><span class="num muted">${d}/${n}</span>${S.exams && S.exams[t.id] && S.exams[t.id].passed ? '<span class="chip nota ok">Certificado</span>' : ''}</div>
        </button>`;
      }).join('')}</div></section>`).join('')}`;
}

function vTrack(id) {
  const t = TRACK[id];
  if (!t) return vTrilhas();
  const lv = levelOf(t.id);
  const d = trackDone(t);
  const tst = S.tests[t.id];
  return `<button class="back" data-act="back">${ICON.left} Trilhas</button>
    <section class="track-hero">
      <span class="g">${esc(t.glyph)}</span>
      <h1>${esc(t.name)}</h1>
      <p class="muted">${esc(t.desc)}</p>
      <div class="row small muted"><span class="num">${d}/${t.lessons.length} aulas</span>${trackAvg(t) != null ? `<span>·</span><span>média ${fmtNota(trackAvg(t))}</span>` : ''}<span>·</span><span>${t.lessons.reduce((s, l) => s + lessonMin(t, l), 0)} min no seu nível</span>${S.tracks.includes(t.id) ? '<span>·</span><span>no seu plano</span>' : ''}</div>
      <div class="bar-prog"><i style="width:${Math.round(d / t.lessons.length * 100)}%"></i></div>
    </section>
    <section class="panel">
      <div class="section-h"><h2 style="font-size:16px">Seu nível nesta trilha</h2><button class="btn small ghost" data-act="test" data-id="${t.id}">${tst ? 'Refazer teste' : 'Fazer teste'}</button></div>
      <div class="seg" role="group" aria-label="Nível">${['b', 'i', 'a'].map(k => `<button aria-pressed="${lv === k}" data-act="setlv" data-id="${t.id}" data-lv="${k}"><b>${LV[k].name}</b><small>${LV[k].short}</small></button>`).join('')}</div>
      ${tst ? `<p class="small muted">Teste de nível: ${tst.pts} de 12 pontos.</p>` : '<p class="small muted">Não sabe? Faça o teste: as aulas se ajustam ao resultado. Dá para trocar o nível a qualquer momento, até no meio da aula.</p>'}
    </section>
    <section class="list"><div class="section-h"><h2>Aulas</h2>${S.tracks.includes(t.id) ? '' : `<button class="btn small ghost" data-act="addplan" data-id="${t.id}">Adicionar ao plano</button>`}</div>
      ${t.lessons.map(l => lessonRow(t, l, false)).join('')}</section>
    ${chapterPanel(t)}`;
}
function chapterPanel(t) {
  const d = trackDone(t), ex = S.exams && S.exams[t.id];
  return `<section class="panel chapter">
      <span class="eyebrow">Fechamento do capítulo</span>
      <button class="item" data-act="chapter" data-id="${t.id}"><span class="ico">▶</span><span class="txt"><b>Vídeo de recapitulação do capítulo</b><span>Todas as aulas da trilha em poucos minutos</span></span><span class="end">${ICON.play}</span></button>
      <button class="item" data-act="exam" data-id="${t.id}"><span class="ico">✎</span><span class="txt"><b>Prova final</b><span>${ex ? `Melhor nota ${fmtNota(ex.best)}${ex.passed ? ' · aprovado' : ' · mínimo 7,0'}` : `15 questões de todas as aulas · ${d < t.lessons.length ? `recomendado concluir as aulas antes (${d}/${t.lessons.length})` : 'pronto para fazer'}`}</span></span><span class="end">${ICON.play}</span></button>
      ${ex && ex.passed ? `<button class="item" data-act="cert" data-id="${t.id}"><span class="ico">★</span><span class="txt"><b>Certificado</b><span>Trilha concluída com nota ${fmtNota(ex.best)}</span></span><span class="end">${ICON.right}</span></button>` : ''}
    </section>`;
}

function vPlano() {
  const plan = buildPlan();
  const wk = currentWeek();
  const total = plan.reduce((s, w) => s + w.items.length, 0);
  const doneN = plan.reduce((s, w) => s + w.items.filter(x => isDone(x.l.id)).length, 0);
  const end = plan.length ? plan[plan.length - 1].to : null;
  return `<header class="hello"><h1>Plano de estudos</h1><p>${total ? `${total} aulas em ${plan.length} semana${plan.length > 1 ? 's' : ''}. Previsão de término: ${fmtFull.format(end)}.` : 'Escolha trilhas para montar seu plano.'}</p></header>
    <section class="panel">
      <div class="field"><label for="hrs">Horas por semana: <span class="num" id="hrsv">${S.hours}h</span> <span class="muted small">(${Math.round(S.hours * 60 / S.days)} min por dia de estudo)</span></label>
        <input id="hrs" type="range" min="1" max="20" step="1" value="${S.hours}" data-act="hours"></div>
      <div class="field"><label>Dias de estudo por semana</label>
        <div class="row">${[2, 3, 4, 5, 6, 7].map(n => `<button class="chip ${S.days === n ? 'on' : ''}" data-act="days" data-n="${n}" aria-pressed="${S.days === n}">${n} dias</button>`).join('')}</div></div>
      <div class="field"><label>Trilhas no plano (${S.tracks.length} de ${TRACKS.length})</label>
        <div class="row">${TRACKS.map(t => `<button class="chip ${S.tracks.includes(t.id) ? 'on' : ''}" style="--hue:${t.hue}" data-act="toggletrack" data-id="${t.id}" aria-pressed="${S.tracks.includes(t.id)}">${esc(t.short)}</button>`).join('')}</div></div>
      <div class="row between"><span class="small muted">${doneN} de ${total} concluídas</span><button class="btn small ghost" data-act="restartplan">Recomeçar a partir de hoje</button></div>
    </section>
    <section class="list">
      ${plan.map((w, i) => `<div class="week ${i === wk ? 'now' : ''}">
        <h3>Semana ${i + 1} <span>${fmtDay.format(w.from)} – ${fmtDay.format(w.to)} · ${(Math.round(w.min / 6) / 10).toLocaleString('pt-BR')} h${i === wk ? ' · esta semana' : ''}</span></h3>
        ${w.items.map(x => `<button class="wl ${isDone(x.l.id) ? 'ok' : ''}" style="--hue:${x.t.hue}" data-act="play" data-id="${x.l.id}"><span class="dot"></span><span class="t">${esc(x.t.short)} · ${esc(x.l.title)}</span><span class="m num">${x.min} min</span></button>`).join('')}
      </div>`).join('')}
    </section>`;
}

const LAB_DEF = {
  sql: `-- Banco de uma padaria: clientes, produtos, pedidos
SELECT c.nome, COUNT(p.id) AS pedidos
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id
GROUP BY c.id
ORDER BY pedidos DESC;`,
  py: `# Python de verdade, rodando no app
nomes = ["Ana", "Bruno", "Carla"]
for i, nome in enumerate(nomes, start=1):
    print(f"{i}. Olá, {nome}!")

def media(xs):
    return sum(xs) / len(xs)

print("Média:", media([7, 8.5, 9]))`,
  js: `// JavaScript isolado num worker
const pedidos = [120, 80, 300, 45];
const total = pedidos.reduce((s, v) => s + v, 0);
console.log("Total:", total);
console.log("Acima de 100:", pedidos.filter(v => v > 100));`,
  html: `<style>
  body { font-family: system-ui; padding: 16px; background: #fff8ec; }
  .card { padding: 16px; border-radius: 12px; background: white; box-shadow: 0 4px 14px #0002; }
  button { margin-top: 12px; padding: 10px 16px; border-radius: 8px; border: 0; background: #ff9f1c; }
</style>
<div class="card">
  <h1>Olá, mundo!</h1>
  <p>Edite este HTML e aperte Rodar.</p>
  <button onclick="this.textContent='Clicou!'">Clique aqui</button>
</div>`
};
const LAB_SHEET = [
  ['Cliente', 'Cidade', 'Valor', 'Status', 'Multa 2%'],
  ['Ana Souza', 'Brasília', '1200', 'pago', ''],
  ['Bruno Lima', 'Planaltina', '850,5', 'vencido', '=SE(D3="vencido";C3*2%;0)'],
  ['Carla Dias', 'Goiânia', '3100', 'pago', ''],
  ['Diego Alves', 'Brasília', '430', 'vencido', ''],
  ['Elisa Rocha', 'São Paulo', '990', 'aberto', ''],
  ['', '', '', '', ''],
  ['Total', '', '=SOMA(C2:C6)', '', ''],
  ['Vencidos', '', '=CONT.SE(D2:D6;"vencido")', '', ''],
  ['Brasília', '', '=SOMASE(B2:B6;"Brasília";C2:C6)', '', ''],
  ['Valor da Carla', '', '=PROCV("Carla Dias";A2:D6;3;FALSO)', '', '']
];
function vLab(tab = 'sql') {
  return `<header class="hello"><h1>Laboratório</h1><p>Teste livremente. Nada aqui quebra: o banco volta ao original a cada execução.</p></header>
    <div class="subtabs" role="tablist">${[['sql', 'SQL'], ['py', 'Python'], ['js', 'JavaScript'], ['html', 'HTML/CSS'], ['xls', 'Planilha']].map(([k, n]) => `<button class="chip ${tab === k ? 'on' : ''}" role="tab" aria-selected="${tab === k}" data-act="labtab" data-tab="${k}">${n}</button>`).join('')}</div>
    ${tab === 'sql' ? `<section class="panel"><span class="eyebrow">Tabelas disponíveis</span>
      <div class="tblwrap"><table><thead><tr><th>Tabela</th><th>Colunas</th></tr></thead><tbody>
      <tr><td><code>clientes</code></td><td>id, nome, cidade, idade, email</td></tr>
      <tr><td><code>produtos</code></td><td>id, nome, categoria, preco</td></tr>
      <tr><td><code>pedidos</code></td><td>id, cliente_id, produto_id, quantidade, data, status</td></tr></tbody></table></div></section>` : ''}
    <div id="labmount"></div>
    ${tab === 'xls' ? '<p class="small muted">Planilha no padrão do Excel em português: fórmulas começam com =, argumentos separados por ; e decimais com vírgula. Toque numa célula, digite na barra fx e aperte OK. Funciona SOMA, MÉDIA, SE, E, OU, CONT.SE, SOMASE, PROCV, PROCX, ÍNDICE, CORRESP, ARRED, CONCATENAR, ESQUERDA e outras.</p>' : ''}
    ${tab === 'py' ? '<p class="small muted">O Python do app cobre a linguagem essencial (listas, dicts, funções, classes, math, random, collections). Bibliotecas como pandas e requests rodam só no Python do seu computador.</p>' : ''}`;
}
function mountLab(tab) {
  const m = $('#labmount');
  if (!m) return;
  if (tab === 'xls') return m.appendChild(makeSheet(LAB_SHEET, { minRows: 12 }));
  m.appendChild(makeEditor(LAB_DEF[tab], tab, { hint: 'Ctrl+Enter também roda' }));
}

function creditosHTML() {
  const c = (window.CC.midia || {}).creditos || {};
  const ks = Object.keys(c);
  if (!ks.length) return '';
  const nomeAula = k => { const L = LESSON[k.replace(/-\d+$/, '')]; return L ? L.l.title : k; };
  return `<details class="panel creditos"><summary class="small">Créditos dos vídeos (${ks.length})</summary>
    <ul class="small muted">${ks.map(k => { const [autor, lic, url, fonte] = c[k]; return `<li><b>${esc(nomeAula(k))}</b>: ${esc(autor)} · ${esc(lic)} · <a href="${esc(url)}" target="_blank" rel="noopener">${esc(fonte || 'fonte')}</a></li>`; }).join('')}</ul></details>`;
}
function vPerfil() {
  const lvs = TRACKS.filter(t => S.levels[t.id]);
  return `<header class="hello"><h1>Perfil</h1><p>${cloudUser() ? 'Seu progresso fica salvo na nuvem e neste aparelho.' : 'Seu progresso fica salvo neste aparelho.'}</p></header>
    ${cloudPanel()}
    <section class="panel">
      <div class="field"><label for="nm">Seu nome</label><input id="nm" type="text" value="${esc(S.name)}" maxlength="40" data-act="name" placeholder="Como quer ser chamado?"></div>
      <div class="stats"><div class="stat"><b class="num">${S.xp}</b><span>XP total</span></div><div class="stat"><b class="num">${Object.keys(S.done).length}</b><span>aulas</span></div><div class="stat"><b class="num">${streakNow()}</b><span>sequência</span></div></div>
    </section>
    <section class="list"><div class="section-h"><h2>Níveis por trilha</h2></div>
      ${lvs.length ? lvs.map(t => `<button class="item" style="--hue:${t.hue}" data-act="nav" data-go="track" data-id="${t.id}"><span class="ico">${esc(t.glyph)}</span><span class="txt"><b>${esc(t.name)}</b><span>${S.tests[t.id] ? 'definido pelo teste' : 'escolhido por você'}</span></span><span class="end">${lvChip(S.levels[t.id])}</span></button>`).join('') : '<p class="muted small">Nenhum nível definido ainda. Ele é definido no teste de nível ou na primeira aula de cada trilha.</p>'}
    </section>
    <section class="panel">
      <button class="btn" data-act="intro">Rever a abertura</button>
      <button class="btn" data-act="onb">Refazer configuração inicial</button>
      <div id="resetzone"><button class="btn ghost" data-act="askreset" style="color:var(--bad)">Apagar todo o progresso</button></div>
    </section>
    ${creditosHTML()}
    <p class="small muted">CineCode · ${TRACKS.length} trilhas · ${TRACKS.reduce((s, t) => s + t.lessons.length, 0)} aulas em 3 níveis · SQL via SQLite, Python via Skulpt e JavaScript isolado, tudo rodando no aparelho.</p>`;
}

/* ---------- player de aula ---------- */
function quizFor(l, lv) { return (l.quiz || []).filter(q => q.lv === '*' || q.lv === lv); }
function playLesson(lid, lvOverride) {
  const L = LESSON[lid];
  if (!L) return;
  const { t, l } = L;
  if (!lvOverride && !levelOf(t.id)) return askLevel(t, () => playLesson(lid));
  let lv = lvOverride || levelOf(t.id);
  let steps = [], idx = 0, score = 0, quizN = 0, labOk = false, solSeen = false, titleTimer = null, awarded = null, vidOk = 0, vidN = 0, labTries = 0;
  const P = el(`<div class="player" role="dialog" aria-label="Aula: ${esc(l.title)}" style="--hue:${t.hue}">
    <div class="letterbox top"><button class="iconbtn" data-p="close" aria-label="Fechar aula">${ICON.x}</button>
      <div class="ptitle"><span class="eyebrow" data-p="eye"></span><b>${esc(l.title)}</b></div>
      <button class="chip" data-p="lvmenu" aria-haspopup="true"></button></div>
    <div class="segs" aria-hidden="true"></div>
    <div class="stage"></div>
    <div class="letterbox bottom"><button class="iconbtn" data-p="prev" aria-label="Voltar">${ICON.left}</button><span style="flex:1"></span><button class="btn ghost small" data-p="simpler" hidden style="white-space:nowrap">Mais simples</button><button class="btn primary" data-p="next">Continuar ${ICON.right}</button></div>
  </div>`);
  const stage = $('.stage', P);
  const build = () => {
    const scenes = l[lv] || l.i || l.b;
    const qs = quizFor(l, lv);
    quizN = qs.length;
    steps = [{ k: 'title' }, { k: 'video', v: 'aula' }, ...scenes.map(s => ({ k: 'scene', s })), ...(l.lab ? [{ k: 'lab' }] : []), { k: 'video', v: 'recap' }, ...qs.map(q => ({ k: 'quiz', q })), { k: 'end' }];
    $('.segs', P).innerHTML = steps.map(() => '<i></i>').join('');
    $('[data-p="lvmenu"]', P).className = `chip lv-${lv}`;
    $('[data-p="lvmenu"]', P).textContent = LV[lv].name + ' ▾';
  };
  let answered = false;
  const show = (n) => {
    clearTimeout(titleTimer);
    const old = $('.scene', stage);
    const go = () => {
      idx = Math.max(0, Math.min(steps.length - 1, n));
      const st = steps[idx];
      answered = st.k !== 'quiz';
      const sc = renderStep(st);
      stage.innerHTML = '';
      stage.appendChild(sc);
      stage.scrollTop = 0;
      [...sc.children].forEach((c, i) => c.style.setProperty('--i', i));
      $$('.segs i', P).forEach((s, i) => { s.className = i < idx ? 'past' : i === idx ? 'on' : ''; });
      $('[data-p="eye"]', P).textContent = st.k === 'quiz' ? 'Teste da aula' : st.k === 'lab' ? 'Prática' : st.k === 'end' ? 'Resultado' : st.k === 'video' ? (st.v === 'aula' ? 'Videoaula' : 'Recapitulação') : `${t.short} · aula ${t.lessons.indexOf(l) + 1} · ${idx}/${steps.length - 1}`;
      $('[data-p="prev"]', P).disabled = idx === 0;
      const nb = $('[data-p="next"]', P);
      nb.hidden = st.k === 'end';
      nb.disabled = st.k === 'quiz' && !answered;
      nb.innerHTML = st.k === 'lab' && !labOk ? `Pular prática ${ICON.right}` : st.k === 'video' ? `Pular vídeo ${ICON.right}` : `Continuar ${ICON.right}`;
      $('[data-p="simpler"]', P).hidden = !(st.k === 'scene' && lv !== 'b');
      if (st.k === 'video') setTimeout(() => { const vp = $('.vp', sc); if (vp && vp.isConnected) vp.play(); }, 350);
      if (st.k === 'title' && !reduced()) titleTimer = setTimeout(() => { if (steps[idx].k === 'title') show(1); }, 2600);
    };
    if (old && !reduced()) { old.classList.add('leave'); setTimeout(go, 200); } else go();
  };
  function renderStep(st) {
    if (st.k === 'title') {
      return el(`<section class="scene titlecard">${mediaBlock(l, 0, 'lesson-media')}<span class="reel">${esc(t.name)}</span><h1>${esc(l.title)}</h1>
        <span class="chip lv-${lv} lvl">Nível ${LV[lv].name} · ${LV[lv].short}</span>
        <p class="muted small">Videoaula · ${steps.filter(s => s.k === 'scene').length} cenas${l.lab ? ' · prática' : ''} · recapitulação · teste com ${quizN} questões · nota de 0 a 10</p></section>`);
    }
    if (st.k === 'video') return renderVideo(st.v);
    if (st.k === 'scene') return renderScene(st.s);
    if (st.k === 'quiz') return renderQuiz(st.q);
    if (st.k === 'lab') return renderLab();
    return renderEnd();
  }
  function renderVideo(kind) {
    const video = kind === 'aula' ? lessonVideo(t, l, lv) : recapVideo(t, l, lv);
    const sec = el(`<section class="scene top"><span class="eyebrow">${kind === 'aula' ? 'Videoaula' : 'Vídeo de recapitulação'} · ${video.shots.length} partes</span></section>`);
    const vp = videoPlayer(video, {
      onQuiz: (q, ok) => { vidN++; if (ok) vidOk++; if (!ok) srsMark(q.id, false); },
      onEnd: () => { const nb = $('[data-p="next"]', P); if (nb && steps[idx] && steps[idx].k === 'video') nb.innerHTML = `Continuar ${ICON.right}`; }
    });
    sec.appendChild(vp);
    sec.appendChild(el(`<p class="small muted">${kind === 'aula' ? 'Assista, ou pule e leia as cenas. As perguntas no meio do vídeo contam para a sua nota.' : 'Revise as ideias principais antes do teste.'}</p>`));
    return sec;
  }
  let anCount = 0;
  function renderScene(s) {
    const [k] = s;
    const sec = el('<section class="scene"></section>');
    if (k === 't') sec.innerHTML = `<h2>${inline(s[1])}</h2><div class="lead">${md(s[2])}</div>`;
    else if (k === 'an') { sec.innerHTML = `${brollSrc(l) ? mediaBlock(l, ++anCount, 'lesson-media') : `<div class="spot" aria-hidden="true">${s[1]}</div>`}<h2 style="text-align:center">${inline(s[2])}</h2><div class="lead">${md(s[3])}</div>`; }
    else if (k === 'list') sec.innerHTML = `<h2>${inline(s[1])}</h2><ul class="ulist">${s[2].map((x, j) => `<li style="--j:${j}"><span>${inline(x)}</span></li>`).join('')}</ul>`;
    else if (k === 'tip') sec.innerHTML = `<div class="tip"><span class="eyebrow">Dica de bastidor</span><div class="lead" style="font-size:16px">${md(s[1])}</div></div>`;
    else if (k === 'flow') sec.innerHTML = `<h2>${inline(s[1])}</h2><div class="flow">${s[2].map((x, j) => `${j ? `<div class="ar" style="--j:${j}"></div>` : ''}<div class="st" style="--j:${j}"><em>${j + 1}</em><span>${inline(x)}</span></div>`).join('')}</div>`;
    else if (k === 'tbl') sec.innerHTML = `<h2>${inline(s[1])}</h2><div class="tblwrap"><table><thead><tr>${s[2].map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${s[3].map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    else if (k === 'code') { sec.classList.add('top'); sec.appendChild(codeBlock(s[2], s[1], true)); if (s[3]) sec.appendChild(el(`<div class="cap">${md(s[3])}</div>`)); }
    else if (k === 'run') { sec.classList.add('top'); sec.appendChild(el(`<span class="eyebrow">Experimente · ${LANGNAME[s[1]] || s[1]}</span>`)); sec.appendChild(makeEditor(s[2], s[1])); if (s[3]) sec.appendChild(el(`<div class="cap">${md(s[3])}</div>`)); }
    else if (k === 'sheet') { sec.classList.add('top'); sec.appendChild(el(`<h2>${inline(s[1])}</h2>`)); sec.appendChild(makeSheet(s[2], { targets: s[4] || [] })); if (s[3]) sec.appendChild(el(`<div class="cap">${md(s[3])}</div>`)); }
    return sec;
  }
  function renderQuiz(q) {
    const n = steps.filter(s => s.k === 'quiz').indexOf(steps[idx]) + 1;
    return renderQuestion(q, {
      label: `Teste · questão ${n} de ${quizN} · ${TYPE_LABEL[qType(q)]}`,
      onAnswer: ok => { answered = true; if (ok) score++; srsMark(q.id, ok); $('[data-p="next"]', P).disabled = false; }
    });
  }
  function renderLab() {
    const lab = l.lab;
    const sec = el(`<section class="scene top"><span class="eyebrow">Prática · ${LANGNAME[lab.lang] || 'Planilha'}</span><h2>Sua vez</h2><div class="lead" style="font-size:16px">${md(lab.task)}</div><div class="labslot"></div><div class="row"><button class="btn small ghost" data-l="hint">Ver dica</button><button class="btn small ghost" data-l="sol">Ver solução</button></div><div class="vbox"></div></section>`);
    const success = () => {
      if (!labOk) { labOk = true; burst(t.hue); vibrate([30, 40, 30]); }
      $('.vbox', sec).innerHTML = `<div class="verdict good"><b>Mandou bem!</b><span>${solSeen ? 'Funcionou. Da próxima vez, tente antes de ver a solução: a solução vale metade da nota da prática.' : 'Prática concluída com nota máxima.'}</span></div>`;
      $('[data-p="next"]', P).innerHTML = `Continuar ${ICON.right}`;
    };
    const failed = () => {
      labTries++;
      vibrate([40, 60, 40]);
      if (labTries === 2) $('.vbox', sec).innerHTML = `<div class="tip"><span class="eyebrow">Dica automática</span><div>${inline(lab.hint)}</div></div>`;
      if (labTries >= 3 && lv !== 'b') $('.vbox', sec).insertAdjacentHTML('beforeend', '<div class="tip"><span class="eyebrow">Sugestão</span><div>Está difícil? Toque em “Básico ▾” no topo para rever esta aula explicada com mais calma.</div></div>');
    };
    let ed;
    if (lab.lang === 'xls') {
      ed = makeSheet(lab.grid, { targets: lab.targets, onCheck: (sh, io) => {
        const r = checkSheet(sh, lab);
        io.out.innerHTML = `<div class="${r.ok ? 'ok' : 'err'}">${esc(r.ok ? '✓ Planilha correta!' : r.msg)}</div>`;
        r.ok ? success() : failed();
      } });
    } else {
      ed = makeEditor(lab.start, lab.lang, {
        runLabel: 'Conferir', hint: 'Rode para conferir',
        onCheck: async (code, io) => {
          let r;
          if (lab.lang === 'sql') r = await checkSQL(code, lab);
          else if (lab.lang === 'py') r = await checkPy(code, lab);
          else if (lab.lang === 'js') r = await checkJS(code, lab);
          else r = checkHTML(code, lab);
          if (lab.lang === 'sql' && r.result) io.table(r.result);
          if (r.stdout) io.print(r.stdout.replace(/\n$/, ''));
          if (r.logs) r.logs.filter(x => x.t !== 'err').forEach(x => io.print(x.a));
          if (lab.lang === 'html') { let fr = $('iframe', ed); if (!fr) { fr = el('<iframe class="preview" sandbox="allow-scripts" title="Pré-visualização"></iframe>'); ed.appendChild(fr); } fr.srcdoc = code; }
          if (r.ok) { io.print('✓ Passou em todos os testes!', 'ok'); success(); }
          else { io.print(r.msg, 'err'); failed(); }
        }
      });
    }
    $('.labslot', sec).appendChild(ed);
    sec.addEventListener('click', e => {
      const b = e.target.closest('[data-l]');
      if (!b) return;
      if (b.dataset.l === 'hint') $('.vbox', sec).innerHTML = `<div class="tip"><span class="eyebrow">Dica</span><div>${inline(lab.hint)}</div></div>`;
      if (b.dataset.l === 'sol') {
        solSeen = true;
        if (lab.lang === 'xls') { Object.entries(lab.sol).forEach(([k, v]) => ed.sheet.set(k, v)); ed.querySelector('[data-x="check"]').click(); }
        else ed.setCode(lab.sol);
        $('.vbox', sec).innerHTML = '<div class="tip"><span class="eyebrow">Solução</span><div>Solução colocada. Leia com atenção e aperte Conferir.</div></div>';
      }
    });
    return sec;
  }
  function renderEnd() {
    if (!awarded) awarded = finish();
    const a = awarded;
    const idxL = t.lessons.indexOf(l);
    const nextL = t.lessons[idxL + 1];
    const nx = nextL ? { t, l: nextL } : nextUp();
    const ok = a.nota >= 7;
    setTimeout(() => ok && burst(t.hue), 300);
    return el(`<section class="scene credits"><span class="eyebrow">Sua nota nesta aula</span>
      <div class="big num grade ${ok ? '' : 'low'}">${fmtNota(a.nota)}</div>
      <h2>${notaLabel(a.nota)}</h2>
      <div class="roll">
        <span>Teste <b class="num">${score}/${quizN}</b></span>
        ${vidN ? `<span>Perguntas dos vídeos <b class="num">${vidOk}/${vidN}</b></span>` : ''}
        ${l.lab ? `<span>Prática <b>${labOk ? (solSeen ? 'feita com a solução' : 'concluída') : 'pulada'}</b></span>` : ''}
        <span>Nível <b>${LV[lv].name}</b> · <b class="num">+${a.xp} XP</b></span>
        ${a.best > a.nota ? `<span>Sua melhor nota nesta aula continua <b class="num">${fmtNota(a.best)}</b></span>` : ''}
      </div>
      ${ok ? '' : '<div class="tip" style="text-align:left"><span class="eyebrow">Para melhorar</span><div>Esta aula foi para o seu Reforço e as questões erradas entram na Revisão inteligente. Refaça quando quiser: vale a melhor nota.</div></div>'}
      <div class="row" style="justify-content:center">
        ${nx && nx.l.id !== l.id ? `<button class="btn primary" data-p="nextlesson" data-id="${nx.l.id}">${ICON.play} Próxima: ${esc(nx.l.title)}</button>` : ''}
        <button class="btn" data-p="redo">Refazer aula</button><button class="btn ghost" data-p="close">Sair</button>
      </div>
      ${lv !== 'a' ? `<button class="btn small ghost" data-p="deeper">Ver esta aula no nível ${LV[lv === 'b' ? 'i' : 'a'].name}</button>` : ''}
    </section>`);
  }
  function finish() {
    const prev = S.done[l.id];
    const first = !prev;
    const nota = lessonGrade({ quizOk: score, quizN, vidOk, vidN, hasLab: !!l.lab, labOk, solSeen });
    const best = Math.max(nota, prev && typeof prev.nota === 'number' ? prev.nota : 0);
    const xp = first ? 50 + score * 10 + (labOk && !solSeen ? 40 : 0) + (nota >= 9 ? 30 : 0) : 0;
    S.done[l.id] = { lv, at: todayISO(), quiz: `${score}/${quizN}`, lab: labOk, nota: best, last: nota };
    S.reforco = (S.reforco || []).filter(id => id !== l.id);
    if (best < 7) S.reforco.push(l.id);
    if (first) {
      S.xp += xp;
      const today = todayISO();
      if (S.streak.last !== today) {
        const diff = S.streak.last ? Math.round((parseISO(today) - parseISO(S.streak.last)) / 864e5) : 99;
        S.streak = { n: diff === 1 ? S.streak.n + 1 : 1, last: today };
      }
    }
    save();
    return { xp, first, nota, best };
  }
  const reset = () => { score = 0; labOk = false; solSeen = false; answered = false; awarded = null; vidOk = 0; vidN = 0; labTries = 0; };
  const changeLevel = nlv => {
    if (nlv === lv) return;
    lv = nlv; reset();
    build(); show(1); toast(`Agora explicando no nível ${LV[lv].name}`);
  };
  P.addEventListener('click', e => {
    const b = e.target.closest('[data-p]');
    if (!b) { if (steps[idx] && steps[idx].k === 'title' && e.target.closest('.stage')) show(1); return; }
    const a = b.dataset.p;
    if (a === 'close') closeOverlay();
    else if (a === 'next') show(idx + 1);
    else if (a === 'prev') show(idx - 1);
    else if (a === 'simpler') changeLevel(lv === 'a' ? 'i' : 'b');
    else if (a === 'deeper') changeLevel(lv === 'b' ? 'i' : 'a');
    else if (a === 'redo') { reset(); build(); show(1); }
    else if (a === 'nextlesson') { const id = b.dataset.id; closeOverlay(); setTimeout(() => playLesson(id), 120); }
    else if (a === 'lvmenu') {
      const m = $('.lvpop', P);
      if (m) { m.remove(); return; }
      P.appendChild(el(`<div class="lvpop panel" style="position:absolute;right:12px;top:calc(env(safe-area-inset-top,0px) + 60px);z-index:5;width:min(300px,calc(100% - 24px));padding:10px;gap:6px">${['b', 'i', 'a'].map(k => `<button class="choice" data-p="pick" data-lv="${k}" aria-pressed="${k === lv}"><b>${LV[k].name}</b><span>${LV[k].sub}</span></button>`).join('')}</div>`));
    } else if (a === 'pick') { $('.lvpop', P)?.remove(); changeLevel(b.dataset.lv); }
  });
  let tx = 0, ty = 0;
  stage.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener('touchend', e => {
    if (e.target.closest('.code, .tblwrap, textarea, input, .opts, .vp, .qbody')) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 70 && Math.abs(dy) < 60) {
      const nb = $('[data-p="next"]', P);
      if (dx < 0 && !nb.disabled && !nb.hidden) show(idx + 1);
      if (dx > 0 && idx > 0) show(idx - 1);
    }
  });
  const onKey = e => {
    if (!P.isConnected) return document.removeEventListener('keydown', onKey);
    if (e.target.closest && e.target.closest('textarea, input')) return;
    if (e.key === 'ArrowRight' && !$('[data-p="next"]', P).disabled) show(idx + 1);
    if (e.key === 'ArrowLeft' && idx > 0) show(idx - 1);
    if (e.key === 'Escape') closeOverlay();
  };
  document.addEventListener('keydown', onKey);
  build();
  openOverlay(P);
  requestAnimationFrame(() => requestAnimationFrame(() => P.classList.add('open')));
  show(0);
}

/* ---------- escolha de nível e teste de nível ---------- */
function shell(t, title) {
  const P = el(`<div class="player" role="dialog" aria-label="${esc(title)}" style="--hue:${hueOf(t)}">
    <div class="letterbox top"><button class="iconbtn" data-p="close" aria-label="Fechar">${ICON.x}</button><div class="ptitle"><span class="eyebrow">${esc(t ? t.name : 'CineCode')}</span><b>${esc(title)}</b></div></div>
    <div class="segs" aria-hidden="true"></div><div class="stage"></div>
    <div class="letterbox bottom"></div></div>`);
  P.addEventListener('click', e => { if (e.target.closest('[data-p="close"]')) closeOverlay(); });
  openOverlay(P);
  requestAnimationFrame(() => requestAnimationFrame(() => P.classList.add('open')));
  return P;
}
function askLevel(t, then) {
  const P = shell(t, 'Antes de começar');
  const stage = $('.stage', P);
  stage.innerHTML = `<section class="scene"><span class="eyebrow">${esc(t.name)}</span><h2>Quanto você já sabe disso?</h2>
    <p class="muted">As aulas mudam conforme o nível. No Básico, tudo é explicado como para uma criança de 5 anos. Você pode trocar quando quiser.</p>
    <div class="choices">
      <button class="choice" data-c="test" style="border-color:var(--lamp)"><b>Fazer o teste de nível</b><span>6 perguntas, cerca de 2 minutos (recomendado)</span></button>
      ${['b', 'i', 'a'].map(k => `<button class="choice" data-c="${k}"><b>${LV[k].name}</b><span>${LV[k].sub}</span></button>`).join('')}
    </div></section>`;
  [...$('.scene', stage).children].forEach((c, i) => c.style.setProperty('--i', i));
  stage.addEventListener('click', e => {
    const b = e.target.closest('[data-c]');
    if (!b) return;
    const c = b.dataset.c;
    closeOverlay();
    setTimeout(() => { if (c === 'test') levelTest(t, then); else { S.levels[t.id] = c; save(); then && then(); } }, 120);
  });
}
function levelTest(t, then) {
  const P = shell(t, 'Teste de nível');
  const stage = $('.stage', P), segs = $('.segs', P);
  const qs = t.test;
  let i = -1; const got = [];
  segs.innerHTML = qs.map(() => '<i></i>').join('');
  const paint = () => $$('i', segs).forEach((s, k) => { s.className = k < i ? 'past' : k === i ? 'on' : ''; });
  const scene = html => { stage.innerHTML = html; const sc = $('.scene', stage); [...sc.children].forEach((c, k) => c.style.setProperty('--i', k)); stage.scrollTop = 0; return sc; };
  const intro = () => {
    const sc = scene(`<section class="scene titlecard"><span class="reel">Teste de nível</span><h1>${esc(t.name)}</h1>
      <p class="muted">${qs.length} perguntas, das mais fáceis às mais difíceis. Sem pressão: se não souber, toque em “Não sei”. Isso ajuda a acertar o nível.</p>
      <button class="btn primary" data-t="go">Começar</button></section>`);
    $('[data-t="go"]', sc).onclick = () => { i = 0; q(); };
  };
  const q = () => {
    paint();
    const it = qs[i];
    const sc = scene(`<section class="scene"><span class="eyebrow">Pergunta ${i + 1} de ${qs.length} · ${'●'.repeat(it.d)}${'○'.repeat(3 - it.d)}</span><h2>${inline(it.q)}</h2>
      <div class="opts">${it.o.map((o, k) => `<button class="opt" data-o="${k}"><span class="k">${'ABCD'[k]}</span><span>${inline(o)}</span></button>`).join('')}
      <button class="opt" data-o="-1"><span class="k">?</span><span>Não sei</span></button></div></section>`);
    sc.addEventListener('click', e => {
      const b = e.target.closest('[data-o]');
      if (!b) return;
      $('.opts', sc).classList.add('locked');
      const k = +b.dataset.o;
      got.push(k === it.a ? it.d : 0);
      b.style.borderColor = 'var(--tint)';
      setTimeout(() => { i++; i < qs.length ? q() : result(); }, 260);
    });
  };
  const result = () => {
    i = qs.length; paint();
    const pts = got.reduce((s, x) => s + x, 0);
    const lv = pts >= 9 ? 'a' : pts >= 4 ? 'i' : 'b';
    const sc = scene(`<section class="scene titlecard"><span class="reel">Resultado</span>
      <span class="eyebrow">${pts} de 12 pontos</span>
      <h1>${LV[lv].name}</h1>
      <p class="muted">${lv === 'b' ? 'Vamos do começo, com calma e muitos exemplos do dia a dia. Tudo explicado como para uma criança de 5 anos.' : lv === 'i' ? 'Você já tem base. As aulas vão direto aos conceitos, padrões e armadilhas comuns.' : 'Você domina o básico. As aulas focam em detalhes internos, desempenho e boas práticas profissionais.'}</p>
      <div class="row" style="justify-content:center"><button class="btn primary" data-t="ok">Começar no ${LV[lv].name}</button></div>
      <div class="row" style="justify-content:center">${['b', 'i', 'a'].filter(k => k !== lv).map(k => `<button class="btn small ghost" data-t="${k}">Prefiro ${LV[k].name}</button>`).join('')}</div></section>`);
    S.tests[t.id] = { pts, at: todayISO() };
    sc.addEventListener('click', e => {
      const b = e.target.closest('[data-t]');
      if (!b) return;
      S.levels[t.id] = b.dataset.t === 'ok' ? lv : b.dataset.t;
      save(); closeOverlay();
      if (then) setTimeout(then, 150); else toast(`Nível em ${t.short}: ${LV[S.levels[t.id]].name}`);
    });
    if (!reduced()) burst(t.hue);
  };
  intro();
}

/* ---------- abertura cinematográfica ---------- */
function playIntro(done) {
  const N = el(`<div class="intro" role="dialog" aria-label="Abertura"><div class="projector"></div>
    <div class="leader"><canvas></canvas><b>3</b></div><button class="skip">Pular</button></div>`);
  document.body.appendChild(N);
  const cv = $('canvas', N), ctx = cv.getContext('2d'), num = $('.leader b', N);
  const size = () => { const r = cv.getBoundingClientRect(); cv.width = r.width * devicePixelRatio; cv.height = r.height * devicePixelRatio; };
  size();
  let raf, t0 = performance.now(), finished = false;
  const draw = now => {
    const el2 = (now - t0) / 1000;
    const sec = Math.floor(el2), frac = el2 - sec;
    const W = cv.width, H = cv.height, cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#16120c'; ctx.beginPath(); ctx.arc(cx, cy, R * .98, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,190,90,.22)'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R * .98, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(236,230,218,.55)'; ctx.lineWidth = 2 * devicePixelRatio;
    [R * .98, R * .78].forEach(r => { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); });
    ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
    num.textContent = Math.max(1, 3 - sec);
    if (el2 < 3) raf = requestAnimationFrame(draw); else title();
  };
  const title = () => {
    $('.leader', N).remove();
    N.appendChild(el(`<div class="titleout"><div class="logo">CineCode</div>
      <p class="tagline">Programação do zero ao avançado. Cada aula no seu nível, com código rodando de verdade.</p>
      <button class="btn primary cta" data-i="go">Entrar na sala</button></div>`));
    $('[data-i="go"]', N).onclick = end;
    $('.skip', N).textContent = 'Entrar';
  };
  const end = () => {
    if (finished) return; finished = true;
    cancelAnimationFrame(raf);
    N.style.transition = 'opacity .6s'; N.style.opacity = '0';
    setTimeout(() => { N.remove(); S.intro = true; save(); done && done(); }, reduced() ? 0 : 600);
  };
  $('.skip', N).onclick = end;
  if (reduced()) title(); else raf = requestAnimationFrame(draw);
}

/* ---------- configuração inicial ---------- */
function onboarding(done) {
  const O = el('<div class="onb" role="dialog" aria-label="Configuração inicial"><div class="wrap"></div></div>');
  document.body.appendChild(O);
  const W = $('.wrap', O);
  const tmp = { name: S.name, goal: (S.goal && GOALS[S.goal]) ? S.goal : 'tudo', hours: S.hours, days: S.days, tracks: S.tracks.length ? S.tracks.slice() : GOALS.tudo.tracks.slice(), mode: 'test' };
  let step = 0;
  const dots = () => `<div class="steps-dots">${[0, 1, 2, 3, 4].map(k => `<i class="${k <= step ? 'on' : ''}"></i>`).join('')}</div>`;
  let shown = -1;
  const paint = () => {
    const anim = shown !== step; shown = step;
    let body = '';
    if (step === 0) body = `<span class="eyebrow">Bem-vindo à sala</span><h1>Como você quer ser chamado?</h1>
      <input id="onbname" type="text" maxlength="40" value="${esc(tmp.name)}" placeholder="Seu nome" autocomplete="given-name">`;
    if (step === 1) body = `<span class="eyebrow">Objetivo</span><h1>O que você quer conquistar?</h1><div class="choices">
      ${Object.entries(GOALS).map(([k, g]) => `<button class="choice" data-g="${k}" aria-pressed="${tmp.goal === k}"><b>${g.t}</b><span>${g.s}</span></button>`).join('')}</div>`;
    if (step === 2) body = `<span class="eyebrow">Ritmo</span><h1>Quanto tempo por semana?</h1>
      <div class="field"><label for="ohrs">Horas por semana: <span class="num" id="ohv">${tmp.hours}h</span></label><input id="ohrs" type="range" min="1" max="20" value="${tmp.hours}"></div>
      <div class="field"><label>Dias de estudo</label><div class="row">${[2, 3, 4, 5, 6, 7].map(n => `<button class="chip ${tmp.days === n ? 'on' : ''}" data-d="${n}">${n} dias</button>`).join('')}</div></div>
      <p class="muted small">Pouco e todo dia funciona melhor que muito de vez em quando. Dá para mudar depois no Plano.</p>`;
    if (step === 3) body = `<span class="eyebrow">Trilhas</span><h1>O que entra no seu plano?</h1><p class="muted">Sugestão para “${GOALS[tmp.goal].t}”. Toque para incluir ou tirar.</p>
      <div class="row">${TRACKS.map(t => `<button class="chip ${tmp.tracks.includes(t.id) ? 'on' : ''}" style="--hue:${t.hue}" data-t="${t.id}">${esc(t.name)}</button>`).join('')}</div>`;
    if (step === 4) body = `<span class="eyebrow">Nível</span><h1>Como definimos seu nível?</h1><div class="choices">
      <button class="choice" data-m="test" aria-pressed="${tmp.mode === 'test'}"><b>Teste rápido em cada trilha</b><span>Na primeira aula de cada trilha, 6 perguntas definem o nível (recomendado)</span></button>
      <button class="choice" data-m="b" aria-pressed="${tmp.mode === 'b'}"><b>Sou iniciante total</b><span>Começar tudo no Básico, explicado como para uma criança de 5 anos</span></button>
      <button class="choice" data-m="i" aria-pressed="${tmp.mode === 'i'}"><b>Já programo um pouco</b><span>Começar tudo no Intermediário</span></button></div>`;
    W.innerHTML = `${dots()}${body}<div class="row between"><button class="btn ghost" data-n="back" ${step ? '' : 'style="visibility:hidden"'}>Voltar</button>
      <button class="btn primary" data-n="next">${step === 4 ? 'Montar meu plano' : 'Continuar'}</button></div>`;
    [...W.children].forEach((c, k) => { c.style.animation = anim ? `rise .55s cubic-bezier(.2,.8,.2,1) both ${k * 70}ms` : 'none'; });
    const nm = $('#onbname', W); if (nm) { nm.oninput = () => { tmp.name = nm.value.trim(); }; setTimeout(() => nm.focus(), 300); }
    const r = $('#ohrs', W); if (r) r.oninput = () => { tmp.hours = +r.value; $('#ohv', W).textContent = tmp.hours + 'h'; };
  };
  W.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.g) { tmp.goal = b.dataset.g; tmp.tracks = GOALS[tmp.goal].tracks.slice(); paint(); }
    else if (b.dataset.d) { tmp.days = +b.dataset.d; paint(); }
    else if (b.dataset.t) { const id = b.dataset.t; tmp.tracks = tmp.tracks.includes(id) ? tmp.tracks.filter(x => x !== id) : [...tmp.tracks, id]; b.classList.toggle('on'); }
    else if (b.dataset.m) { tmp.mode = b.dataset.m; paint(); }
    else if (b.dataset.n === 'back') { step--; paint(); }
    else if (b.dataset.n === 'next') {
      if (step === 3 && !tmp.tracks.length) return toast('Escolha pelo menos uma trilha');
      if (step < 4) { step++; paint(); return; }
      Object.assign(S, { name: tmp.name, goal: tmp.goal, hours: tmp.hours, days: tmp.days, tracks: tmp.tracks, onb: true, start: todayISO() });
      if (tmp.mode !== 'test') TRACKS.forEach(t => { if (!S.levels[t.id]) S.levels[t.id] = tmp.mode; });
      save();
      O.style.transition = 'opacity .4s'; O.style.opacity = '0';
      setTimeout(() => { O.remove(); done && done(); }, 400);
    }
  });
  paint();
}

/* ---------- ações globais ---------- */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b || b.closest('.player')) return;
  const a = b.dataset.act, id = b.dataset.id;
  switch (a) {
    case 'nav': go(b.dataset.go, id); break;
    case 'back': history.back(); break;
    case 'play': playLesson(id); break;
    case 'test': levelTest(TRACK[id]); break;
    case 'chapter': openVideo(chapterVideo(TRACK[id], levelOf(id) || 'b')); break;
    case 'exam': startExam(TRACK[id]); break;
    case 'cert': showCertificate(TRACK[id]); break;
    case 'review': reviewSession(); break;
    case 'setlv': S.levels[id] = b.dataset.lv; save(); render(current); toast(`${TRACK[id].short}: nível ${LV[b.dataset.lv].name}`); break;
    case 'addplan': if (!S.tracks.includes(id)) S.tracks.push(id); save(); render(current); toast('Trilha adicionada ao plano'); break;
    case 'days': S.days = +b.dataset.n; save(); render(current); break;
    case 'toggletrack': S.tracks = S.tracks.includes(id) ? S.tracks.filter(x => x !== id) : [...S.tracks, id]; save(); render(current); break;
    case 'restartplan': S.start = todayISO(); save(); render(current); toast('Plano recomeçando a partir de hoje'); break;
    case 'labtab': go('lab', b.dataset.tab, true); break;
    case 'intro': playIntro(); break;
    case 'onb': onboarding(() => render(current)); break;
    case 'askreset': $('#resetzone').innerHTML = `<div class="confirm"><b>Apagar XP, cenas concluídas, níveis e plano?</b><span class="small muted">Isso não pode ser desfeito.</span><div class="row"><button class="btn small" data-act="noreset">Cancelar</button><button class="btn small" style="background:var(--bad);color:#200;border-color:var(--bad)" data-act="doreset">Apagar tudo</button></div></div>`; break;
    case 'noreset': render(current); break;
    case 'doreset': S = DEF(); S.intro = true; save(); onboarding(() => go('home', null, true)); break;
  }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset && t.dataset.act === 'hours') { S.hours = +t.value; save(); const v = $('#hrsv'); if (v) v.textContent = S.hours + 'h'; }
  if (t.dataset && t.dataset.act === 'name') { S.name = t.value.trim(); save(); }
});
document.addEventListener('change', e => { if (e.target.dataset && e.target.dataset.act === 'hours') render(current); });

/* plugins nativos do Capacitor (só existem dentro do APK) */
try {
  const cx = window.capacitorExports;
  if (cx && cx.Capacitor && cx.Capacitor.isNativePlatform && cx.Capacitor.isNativePlatform()) {
    cx.registerPlugin('App');
    cx.registerPlugin('TextToSpeech');
  }
} catch (e) {}
/* botão voltar do Android (Capacitor) */
try {
  const App = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
  if (App && App.addListener) Promise.resolve(App.addListener('backButton', () => {
    if (overlay) return closeOverlay();
    if (current.v !== 'home') return go('home', null, true);
    App.exitApp && App.exitApp();
  })).catch(() => {});
} catch (e) {}

/* ---------- partida ---------- */
function grain() {
  try {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'), d = x.createImageData(128, 128);
    for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0);
    $('#grain').style.backgroundImage = `url(${c.toDataURL()})`;
  } catch (e) {}
}
function boot() {
  grain();
  $('.tabs').innerHTML = [['home', 'Início', 'home'], ['trilhas', 'Trilhas', 'tracks'], ['plano', 'Plano', 'plan'], ['lab', 'Lab', 'lab'], ['perfil', 'Perfil', 'user']]
    .map(([v, n, ic]) => `<button class="tab" data-act="nav" data-go="${v}" aria-current="false">${ICON[ic]}<span>${n}</span></button>`).join('');
  const hash = (location.hash || '').slice(1);
  const start = ['trilhas', 'plano', 'lab', 'perfil'].includes(hash) ? hash : 'home';
  go(start, null, true);
  const afterIntro = () => { if (!S.onb) onboarding(() => render(current)); };
  if (!S.intro) playIntro(afterIntro); else afterIntro();
}
