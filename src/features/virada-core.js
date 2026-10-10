// A Virada — módulo privado de corte de hábitos (cigarro, bebida e impulsos).
// Funções puras: leem a projeção individual (personalFinance) e nunca mudam o estado da dupla.
// Valores em centavos inteiros, como o restante do Juntô.
import {classifyExpense} from './savings-core.js';

export const norm = value => String(value ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const DAY = 86400000;
const MONTH_DAYS = 30.44;
const WEEKS_PER_MONTH = 52 / 12;
const cents = value => Number.isSafeInteger(value) && value > 0 ? value : 0;
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const at = date => new Date(`${date}T12:00:00`);
export const daysBetween = (from, to) => Math.round((at(to) - at(from)) / DAY);
export const addDays = (date, n) => iso(new Date(at(date).getTime() + n * DAY));

// Referência de rendimento usada nas projeções (100% do CDI, antes do IR).
export const YIELD = {annual: 0.1365, label: 'CDI de 13,65% ao ano', source: 'Selic 13,75% · Copom de 16/set/2026'};

// ---------- Leitura dos gastos ----------
export const VICES = {
  cigarro: {id: 'cigarro', label: 'Cigarro', kind: 'vicio', item: 'Cigarro',
    re: /cigarr|\bmaco\b|tabac|palheiro|\bvapes?\b|\bpods?\b|narguil|isqueiro|\bfumo\b|marlboro|lucky strike|dunhill|rothmans|chesterfield|\bcamel\b|\bwinston\b|\bkent\b|elf ?bar|ignite/},
  bebida: {id: 'bebida', label: 'Bebida', kind: 'vicio', item: 'Bebida',
    re: /cerveja|\bbreja\b|latao|latinha|\bskol\b|brahma|heineken|amstel|itaipava|budweiser|\bcorona\b|stella artois|spaten|\bpetra\b|devassa|bohemia|antarctica|cachaca|\bpinga\b|vodka|whisk|\bgin\b|catuaba|vinho|smirnoff|caipiri|caipiroska|\bchop+e?\b|boteco|buteco|\bbar\b|adega|distribuidora(?!.*\bgas\b)|deposito de bebida|tequila|jurupinga|corote|\bdrinks?\b|ze delivery|bebida alcoolica|\bbebidas?\b/},
  apostas: {id: 'apostas', label: 'Apostas', kind: 'vicio', item: 'Apostas',
    re: /aposta|\bbets?\b|bet365|betano|sportingbet|blaze|cassino|tigrinho|raspadinha|jogo do bicho|loteria|mega.?sena/},
};
export const GROUPS = {
  ...VICES,
  impulso: {id: 'impulso', label: 'Delivery, lanches e impulsos', kind: 'impulso'},
  essencial: {id: 'essencial', label: 'Necessário', kind: 'essencial'},
};

export function detectVice(row) {
  const item = String(row?.item || '');
  for (const vice of Object.values(VICES)) if (item === vice.item) return vice.id;
  const text = norm([row?.name, row?.item, row?.note].filter(Boolean).join(' '));
  // "Álcool" no posto é combustível; só conta como bebida com contexto de bebida.
  for (const vice of Object.values(VICES)) if (vice.re.test(text)) return vice.id;
  return null;
}

// Classificação de uma linha, com a escolha manual do Guilherme prevalecendo.
export function classifyRow(row, override) {
  if (override === 'need') return {group: 'essencial', kind: 'essencial', certain: true, overridden: true};
  if (override && GROUPS[override] && override !== 'essencial') return {group: override, kind: GROUPS[override].kind, certain: true, overridden: true};
  if (row.expenseContext === 'necessary') return {group: 'essencial', kind: 'essencial', certain: true, overridden: false};
  const vice = detectVice(row);
  if (vice) return {group: vice, kind: 'vicio', certain: Boolean(row.item === VICES[vice].item || row.category === 'Hábitos'), overridden: false};
  const reading = classifyExpense(row);
  if (reading.kind === 'optional' && reading.group !== 'tobacco') return {group: 'impulso', kind: 'impulso', certain: false, overridden: false};
  return {group: 'essencial', kind: 'essencial', certain: reading.kind === 'essential', overridden: false};
}

// finance: resultado de personalFinance(state, pessoa) — só a parte dele em cada gasto.
export function readSpending(finance, {today, overrides = {}, windowDays = 90} = {}) {
  const from = addDays(today, -(windowDays - 1));
  const all = (finance?.transactions || []).filter(t => cents(t.amount) && /^\d{4}-\d{2}-\d{2}$/.test(t.date || '') && t.date <= today && !t.billId);
  const recent = all.filter(t => t.date >= from);
  const firstDate = recent.reduce((min, t) => (t.date < min ? t.date : min), today);
  const coverage = recent.length ? Math.max(1, daysBetween(firstDate, today) + 1) : 0;
  const groups = Object.fromEntries(Object.keys(GROUPS).map(id => [id, {id, label: GROUPS[id].label, kind: GROUPS[id].kind, total: 0, count: 0, monthly: 0, month: 0, lastDate: null}]));
  const ym = today.slice(0, 7);
  const rows = recent.map(t => {
    const reading = classifyRow(t, overrides[t.id]);
    const g = groups[reading.group];
    g.total += t.amount; g.count++;
    if (t.date.slice(0, 7) === ym) g.month += t.amount;
    if (!g.lastDate || t.date > g.lastDate) g.lastDate = t.date;
    return {id: t.id, name: t.name || t.item || 'Gasto', date: t.date, amount: t.amount, category: t.category || 'Outros', ...reading};
  }).sort((a, b) => (a.date === b.date ? b.amount - a.amount : a.date < b.date ? 1 : -1));
  for (const g of Object.values(groups)) g.monthly = coverage ? Math.round(g.total / coverage * MONTH_DAYS) : 0;
  const total = rows.reduce((s, r) => s + r.amount, 0);
  const cut = rows.filter(r => r.kind !== 'essencial').reduce((s, r) => s + r.amount, 0);
  return {rows, groups, coverage, reliable: coverage >= 14, total, cut, cutShare: total ? cut / total : 0,
    cutMonthly: coverage ? Math.round(cut / coverage * MONTH_DAYS) : 0, from, today};
}

// ---------- Hábitos declarados ----------
export const DEFAULT_PACK_PRICE = 1200; // referência editável; o preço mínimo legal subiu em 2026.
export function declaredMonthly(id, cfg = {}) {
  if (!cfg.on) return 0;
  if (id === 'cigarro') return Math.round((Number(cfg.packsPerDay) || 0) * cents(cfg.packPrice) * MONTH_DAYS);
  return Math.round(cents(cfg.weekly) * WEEKS_PER_MONTH);
}
export function habitIds(profile) { return Object.keys(VICES).filter(id => profile?.habits?.[id]?.on); }
const clampPct = v => Math.max(0.1, Math.min(0.9, Number(v) || 0.5));
export const TRACKED = ['cigarro', 'bebida', 'apostas', 'impulso'];
export const BASE_WINDOW = 60; // dias antes da virada usados para a base diária
export const IMPULSE_SHARE = 0.5; // impulsos: a meta é cortar metade, sem proibir
const dayStart = date => at(date).getTime() - 12 * 3600000;

// Início da virada (o mais antigo entre os hábitos ativos).
export function viradaStart(profile, today) {
  const dates = habitIds(profile).map(id => profile.habits[id].start).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d || ''));
  return [profile.startedAt, ...dates].filter(Boolean).sort()[0] || today;
}
function startMsOf(cfg, start) {
  return Number.isFinite(cfg?.startAt) && iso(new Date(cfg.startAt)) === start ? cfg.startAt : dayStart(start);
}

// Livro diário: base por dia (antes da virada) × o que saiu de verdade em cada dia desde então.
// A base de cada grupo é a média diária do extrato nos 60 dias anteriores; para vícios,
// vale o maior entre o extrato e o que ele declarou (compra em dinheiro não aparece no app).
export function dailyBook(finance, profile, {today, now = Date.now(), overrides = {}, chartDays = 30} = {}) {
  const start = viradaStart(profile, today), baseFrom = addDays(start, -BASE_WINDOW);
  const from = [baseFrom, addDays(today, -(chartDays - 1))].sort()[0];
  const rows = (finance?.transactions || [])
    .filter(t => cents(t.amount) && /^\d{4}-\d{2}-\d{2}$/.test(t.date || '') && t.date >= from && t.date <= today && !t.billId)
    .map(t => ({id: t.id, name: t.name || t.item || 'Gasto', date: t.date, amount: t.amount, ...classifyRow(t, overrides[t.id])}))
    .filter(r => TRACKED.includes(r.group));
  const logs = (profile.logs || []).filter(l => TRACKED.includes(l.habit) && l.date >= from && l.date <= today);
  const spentOn = (g, d) => rows.filter(r => r.group === g && r.date === d).reduce((s, r) => s + r.amount, 0) + logs.filter(l => l.habit === g && l.date === d).reduce((s, l) => s + l.amount, 0);

  const pre = rows.filter(r => r.date < start && r.date >= baseFrom);
  const preFirst = pre.reduce((m, r) => (r.date < m ? r.date : m), start);
  const preDays = pre.length ? Math.max(1, daysBetween(preFirst, start)) : 0;
  const groups = {};
  for (const g of TRACKED) {
    const vice = VICES[g], cfg = profile.habits?.[g];
    const active = vice ? Boolean(cfg?.on) : Boolean(profile.countImpulse);
    const ledgerDaily = preDays ? pre.filter(r => r.group === g).reduce((s, r) => s + r.amount, 0) / preDays : 0;
    const declaredDaily = vice ? declaredMonthly(g, cfg) / MONTH_DAYS : 0;
    const baseDaily = active ? Math.max(ledgerDaily, declaredDaily) : 0;
    const share = !active ? 0 : vice ? (cfg.mode === 'reduzir' ? clampPct(cfg.reducePct) : 1) : IMPULSE_SHARE;
    const gStart = vice && cfg?.start && cfg.start >= start ? cfg.start : start;
    groups[g] = {id: g, label: GROUPS[g].label, active, vice: Boolean(vice), mode: vice ? (cfg?.mode === 'reduzir' ? 'reduzir' : 'parar') : 'reduzir',
      share, start: gStart, startMs: startMsOf(cfg, gStart), ledgerDaily, declaredDaily, baseDaily,
      source: !active ? 'nenhum' : declaredDaily > 0 && declaredDaily >= ledgerDaily ? 'declarado' : ledgerDaily > 0 ? 'extrato' : 'nenhum',
      monthly: Math.round(baseDaily * MONTH_DAYS), spent: 0, would: 0, saved: 0, last: null};
  }

  // Cada dia desde o início: base proporcional ao tempo decorrido e gasto real.
  const days = [];
  for (let d = start; d <= today; d = addDays(d, 1)) {
    const row = {date: d, base: 0, actual: 0, saved: 0, by: {}};
    for (const g of TRACKED) {
      const G = groups[g], begin = Math.max(dayStart(d), G.startMs), end = Math.min(dayStart(d) + DAY, now);
      const frac = d < G.start ? 0 : Math.max(0, Math.min(1, (end - begin) / DAY));
      const actual = d >= G.start ? spentOn(g, d) : 0;
      row.by[g] = actual; row.actual += actual;
      if (!G.active) continue;
      const base = G.baseDaily * frac;
      G.would += base; G.spent += actual; if (actual) G.last = d;
      row.base += base; row.saved += base - actual;
    }
    days.push(row);
  }
  // Economia por grupo no período inteiro: parar = tudo que deixou de gastar;
  // reduzir = só a redução combinada (gastar menos que o limite não infla a conta; passar dele desconta).
  for (const G of Object.values(groups)) {
    const target = G.would * (1 - G.share);
    G.saved = Math.round(G.would - Math.max(G.spent, target));
    G.would = Math.round(G.would);
  }

  // Série dos últimos dias (inclui antes da virada) para a leitura diária.
  const series = [];
  for (let d = addDays(today, -(chartDays - 1)); d <= today; d = addDays(d, 1)) {
    const by = Object.fromEntries(TRACKED.map(g => [g, spentOn(g, d)]));
    series.push({date: d, by, total: Object.values(by).reduce((a, b) => a + b, 0), after: d >= start});
  }
  const baseDaily = TRACKED.reduce((s, g) => s + groups[g].baseDaily, 0);
  const elapsed = Math.max(0, (now - Math.min(...TRACKED.map(g => groups[g].startMs))) / DAY);
  const spentSince = TRACKED.reduce((s, g) => s + (groups[g].active ? groups[g].spent : 0), 0);
  const paceDaily = elapsed >= 1 ? spentSince / elapsed : null;
  const day = d => series.find(x => x.date === d) || {date: d, by: {}, total: 0};
  return {start, baseFrom, preDays, reliable: preDays >= 14, groups, days, series, baseDaily, paceDaily, elapsed,
    today: day(today), yesterday: day(addDays(today, -1)), rows};
}

// Visão geral usada pela tela: projeções a partir da base diária.
export function overview(profile, finance, {today, now = Date.now(), overrides = {}} = {}) {
  const book = dailyBook(finance, profile, {today, now, overrides});
  const ids = habitIds(profile);
  const habits = ids.map(id => {
    const G = book.groups[id], cfg = profile.habits[id];
    const lastMs = G.last ? dayStart(G.last) + DAY - 1 : G.startMs;
    const cleanMs = Math.max(0, now - Math.max(lastMs, G.startMs));
    let unitsAvoided = 0;
    if (id === 'cigarro' && cents(cfg.packPrice)) {
      const perDay = G.baseDaily / cfg.packPrice * 20, elapsed = Math.max(0, (now - G.startMs) / DAY);
      unitsAvoided = Math.max(0, Math.floor(perDay * elapsed - G.spent / cfg.packPrice * 20));
    }
    return {...G, cleanDays: Math.floor(cleanMs / DAY), cleanMs, unitsAvoided,
      base: {declared: Math.round(G.declaredDaily * MONTH_DAYS), detected: Math.round(G.ledgerDaily * MONTH_DAYS), source: G.source}};
  });
  const active = TRACKED.map(g => book.groups[g]).filter(G => G.active);
  const monthly = Math.round(book.baseDaily * MONTH_DAYS);
  const freed = Math.round(active.reduce((s, G) => s + G.baseDaily * G.share, 0) * MONTH_DAYS);
  const saved = active.reduce((s, G) => s + G.saved, 0);
  const perSecond = active.reduce((s, G) => s + G.baseDaily * G.share, 0) / 86400;
  const vault = (profile.vault || []).reduce((s, v) => s + cents(v.amount), 0);
  const desists = (profile.vault || []).filter(v => v.kind === 'desistencia');
  const startedAt = book.start;
  const paceSaving = book.paceDaily == null ? null : Math.round((book.baseDaily - book.paceDaily) * MONTH_DAYS);
  return {habits, groups: active, book, monthly, freed, yearly: monthly * 12, saved, perSecond, vault, desists: desists.length,
    desisted: desists.reduce((s, v) => s + v.amount, 0), paceSaving, day: Math.max(1, daysBetween(startedAt, today) + 1), startedAt};
}

// Valor típico de uma compra do hábito (mediana do extrato), para registrar uma desistência rápido.
export function typicalPurchase(id, profile, rows = []) {
  const amounts = rows.filter(r => r.group === id).map(r => r.amount).sort((a, b) => a - b);
  if (amounts.length) return amounts[Math.floor(amounts.length / 2)];
  if (id === 'cigarro') return cents(profile?.habits?.cigarro?.packPrice) || DEFAULT_PACK_PRICE;
  if (id === 'bebida') return Math.min(cents(profile?.habits?.bebida?.weekly) || 1500, 3000);
  if (id === 'apostas') return Math.min(cents(profile?.habits?.apostas?.weekly) || 2000, 5000);
  return 3000;
}

// ---------- Projeções ----------
export function futureValue(monthly, months, annual = YIELD.annual) {
  if (!monthly || months <= 0) return 0;
  const i = Math.pow(1 + annual, 1 / 12) - 1;
  return Math.round(i ? monthly * ((Math.pow(1 + i, months) - 1) / i) : monthly * months);
}
export function monthsToReach(target, monthly, annual = YIELD.annual) {
  if (!(target > 0) || !(monthly > 0)) return null;
  for (let n = 1; n <= 600; n++) if (futureValue(monthly, n, annual) >= target) return n;
  return null;
}
// Quantas mensalidades de algo o gasto mensal paga.
export function pays(monthly, price) { return price > 0 ? monthly / price : 0; }

// O que dá pra pagar em N anos: itens mensais (quantos meses cobertos) e sonhos (se já alcançou).
export function timeline(monthly, years, {catalog = CATALOG, dreams = []} = {}) {
  const months = Math.round(years * 12), plain = monthly * months, invested = futureValue(monthly, months);
  const items = catalog.map(c => ({...c, months: c.price ? invested / c.price : 0}));
  const goals = dreams.filter(d => d.target > 0).map(d => ({...d, month: monthsToReach(d.target, monthly)})).map(d => ({...d, reached: d.month != null && d.month <= months}));
  return {months, plain, invested, interest: invested - plain, items, goals};
}

// ---------- Catálogo do que o dinheiro vira (preços de referência, editáveis) ----------
export const CATALOG = [
  {id: 'smartfit-fit', area: 'corpo', name: 'Smart Fit Planaltina', plan: 'Plano Fit', price: 11990, unit: 'mês', icon: 'gym',
    note: 'Com fidelidade · adesão de R$ 9,90', source: 'smartfit.com.br · consultado em 10/out/2026', url: 'https://www.smartfit.com.br/academias/planaltina-centro'},
  {id: 'smartfit-black', area: 'corpo', name: 'Smart Fit Black', plan: '2.000+ academias', price: 15990, unit: 'mês', icon: 'gym',
    note: 'Com fidelidade · leva um amigo', source: 'smartfit.com.br · consultado em 10/out/2026', url: 'https://www.smartfit.com.br/academias/planaltina-centro'},
  {id: 'bluefit-gold', area: 'corpo', name: 'Bluefit Planaltina', plan: 'Plano Gold', price: 14990, unit: 'mês', icon: 'gym',
    note: 'Valor aproximado no DF', source: 'Correio Braziliense · mai/2026', url: 'https://www.correiobraziliense.com.br/aqui/2026/05/09/smart-fit-ou-bluefit-comparamos-os-planos-das-academias-no-df/'},
  {id: 'ads-ead', area: 'mente', name: 'Faculdade de ADS', plan: 'EAD ou semipresencial', price: 14900, unit: 'mês', icon: 'grad', durationMonths: 30,
    note: 'A partir de · tecnólogo de cerca de 2,5 anos', source: 'Anhanguera · atualizado mai/2026', url: 'https://blog.anhanguera.com/analise-e-desenvolvimento-de-sistemas-preco-do-curso/'},
  {id: 'cursos-tech', area: 'mente', name: 'Cursos de Python e dev', plan: 'Plataforma de aulas gravadas', price: 6000, unit: 'mês', icon: 'code',
    note: 'Faixa de R$ 20 a R$ 100 por mês', source: 'Catraca Livre · jan/2026', url: 'https://catracalivre.com.br/saude-bem-estar/quanto-custa-um-curso-de-ingles-e-qual-vale-mais-a-pena/'},
  {id: 'ingles', area: 'mente', name: 'Inglês online ao vivo', plan: 'Turma com professor', price: 25000, unit: 'mês', icon: 'globe',
    note: 'Faixa de R$ 150 a R$ 450 por mês', source: 'Catraca Livre · jan/2026', url: 'https://catracalivre.com.br/saude-bem-estar/quanto-custa-um-curso-de-ingles-e-qual-vale-mais-a-pena/'},
];
export const FREE_STARTS = [
  {name: 'Python do zero — Curso em Vídeo', note: 'Grátis, com o Guanabara. Dá pra começar hoje à noite.', url: 'https://www.cursoemvideo.com/curso/python-3-mundo-1/'},
  {name: 'IFB · Campus Planaltina', note: 'Cursos técnicos e de qualificação gratuitos, por edital.', url: 'https://www.ifb.edu.br/planaltina'},
];
export const DEFAULT_DREAMS = [
  {id: 'reserva', name: 'Reserva de emergência', target: 500000, icon: 'shield'},
  {id: 'notebook', name: 'Notebook pra programar', target: 350000, icon: 'laptop'},
  {id: 'eletrico', name: 'Entrada do carro elétrico', target: 3000000, icon: 'bolt'},
];

// Organização Mundial da Saúde — benefícios de parar de fumar ao longo do tempo.
export const HEALTH = [
  {minutes: 20, when: '20 minutos', text: 'Frequência cardíaca e pressão começam a baixar.'},
  {minutes: 12 * 60, when: '12 horas', text: 'O monóxido de carbono no sangue volta ao normal.'},
  {minutes: 14 * 1440, when: '2 semanas', text: 'Circulação e função do pulmão começam a melhorar (2 a 12 semanas).'},
  {minutes: 30 * 1440, when: '1 mês', text: 'Tosse e falta de ar diminuem (1 a 9 meses).'},
  {minutes: 365 * 1440, when: '1 ano', text: 'O risco de doença coronariana cai para metade do de quem fuma.'},
  {minutes: 5 * 365 * 1440, when: '5 anos', text: 'O risco de AVC pode chegar ao de quem não fuma (5 a 15 anos).'},
  {minutes: 10 * 365 * 1440, when: '10 anos', text: 'O risco de câncer de pulmão cai para cerca da metade.'},
  {minutes: 15 * 365 * 1440, when: '15 anos', text: 'O risco de doença coronariana fica igual ao de quem não fuma.'},
];
export function healthProgress(cleanMs) {
  const minutes = Math.max(0, cleanMs / 60000);
  return HEALTH.map(h => ({...h, done: minutes >= h.minutes, pct: Math.min(1, minutes / h.minutes)}));
}

// ---------- Perfil privado ----------
export function emptyProfile(today) {
  return {v: 1, rev: 2, startedAt: null, setup: false, introSeen: false, countImpulse: true,
    habits: {cigarro: {on: false, packsPerDay: 1, packPrice: DEFAULT_PACK_PRICE, mode: 'parar', reducePct: 0.5, start: today},
      bebida: {on: false, weekly: 0, mode: 'reduzir', reducePct: 0.5, start: today},
      apostas: {on: false, weekly: 0, mode: 'parar', reducePct: 0.5, start: today}},
    logs: [], vault: [], cravings: 0, overrides: {}, prices: {}, picks: ['smartfit-fit', 'ads-ead'], dreams: DEFAULT_DREAMS.map(d => ({...d}))};
}
export function sanitizeProfile(raw, today) {
  const base = emptyProfile(today);
  if (!raw || typeof raw !== 'object' || raw.v !== 1) return base;
  const out = {...base, ...raw, habits: {...base.habits}};
  // Revisão 2: impulsos passam a entrar na base diária por padrão.
  if ((raw.rev || 1) < 2) out.countImpulse = true;
  out.rev = 2;
  for (const id of Object.keys(base.habits)) out.habits[id] = {...base.habits[id], ...(raw.habits?.[id] || {})};
  for (const key of ['logs', 'vault', 'picks', 'dreams']) if (!Array.isArray(out[key])) out[key] = base[key];
  for (const key of ['overrides', 'prices']) if (!out[key] || typeof out[key] !== 'object' || Array.isArray(out[key])) out[key] = {};
  out.logs = out.logs.filter(l => VICES[l?.habit] && /^\d{4}-\d{2}-\d{2}$/.test(l.date) && Number.isSafeInteger(l.amount) && l.amount >= 0).slice(-500);
  out.vault = out.vault.filter(v => /^\d{4}-\d{2}-\d{2}$/.test(v?.date) && Number.isSafeInteger(v.amount) && v.amount > 0)
    .map(v => ({...v, kind: v.kind === 'desistencia' && TRACKED.includes(v.habit) ? 'desistencia' : 'deposito'})).slice(-1000);
  out.dreams = out.dreams.filter(d => d && typeof d.name === 'string' && Number.isSafeInteger(d.target) && d.target >= 0).slice(0, 8);
  out.cravings = Number.isSafeInteger(out.cravings) && out.cravings >= 0 ? out.cravings : 0;
  return out;
}
export function catalogWithPrices(profile) {
  return CATALOG.map(c => ({...c, price: Number.isSafeInteger(profile?.prices?.[c.id]) && profile.prices[c.id] > 0 ? profile.prices[c.id] : c.price}));
}

// Conta de quem pode ver: hash SHA-256 do e-mail da conta (o e-mail em si não fica no código).
export const PRIVATE_ACCOUNTS = ['23bc0474437f74d987a86b2fa487e0c9febf8aea68287ff2f4accb95be79ea11'];
