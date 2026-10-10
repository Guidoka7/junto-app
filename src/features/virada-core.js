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
// O que ele declarou pesa mais que o extrato (compra em dinheiro não aparece no app).
export function baselineMonthly(id, cfg, reading) {
  const declared = declaredMonthly(id, cfg), detected = reading?.groups?.[id]?.monthly || 0;
  return {monthly: declared || detected, declared, detected, source: declared ? 'declarado' : detected ? 'extrato' : 'nenhum'};
}

export function habitIds(profile) { return Object.keys(VICES).filter(id => profile?.habits?.[id]?.on); }

// Progresso desde o início da virada: o que gastaria − o que gastou de fato.
export function habitProgress(id, profile, reading, {today, now = Date.now()} = {}) {
  const cfg = profile.habits[id], base = baselineMonthly(id, cfg, reading), start = cfg.start || profile.startedAt || today;
  const days = Math.max(0, daysBetween(start, today));
  const daily = base.monthly / MONTH_DAYS;
  const ledger = (reading?.rows || []).filter(r => r.group === id && r.date >= start);
  const logs = (profile.logs || []).filter(l => l.habit === id && l.date >= start && l.date <= today);
  const spent = ledger.reduce((s, r) => s + r.amount, 0) + logs.reduce((s, l) => s + cents(l.amount), 0);
  // Começo do dia escolhido; se a decisão foi tomada hoje, conta a partir do momento exato.
  const startMs = Number.isFinite(cfg.startAt) && iso(new Date(cfg.startAt)) === start ? cfg.startAt : at(start).getTime() - 12 * 3600000;
  const elapsedDays = Math.max(0, (now - startMs) / DAY);
  const would = Math.round(daily * elapsedDays);
  const target = cfg.mode === 'reduzir' ? Math.round(would * (1 - clampPct(cfg.reducePct))) : 0;
  const last = [...ledger.map(r => r.date), ...logs.map(l => l.date)].sort().pop() || null;
  const cleanSince = last && last >= start ? last : start;
  const lastMs = last && last >= start ? at(last).getTime() + 12 * 3600000 - 1 : startMs;
  const cleanDays = Math.max(0, Math.floor((now - lastMs) / DAY));
  let unitsAvoided = 0;
  if (id === 'cigarro' && cents(cfg.packPrice)) {
    const perDay = (Number(cfg.packsPerDay) || base.monthly / MONTH_DAYS / cfg.packPrice) * 20;
    unitsAvoided = Math.max(0, Math.floor(perDay * elapsedDays - spent / cfg.packPrice * 20));
  }
  // Reduzir: só conta a redução combinada; passar do limite desconta. Parar: tudo o que deixou de gastar.
  const share = cfg.mode === 'reduzir' ? clampPct(cfg.reducePct) : 1;
  return {id, label: VICES[id].label, mode: cfg.mode === 'reduzir' ? 'reduzir' : 'parar', share, start, days, elapsedDays, daily, monthly: base.monthly, base, spent, would, target,
    saved: would - Math.max(spent, target), onTrack: spent <= target, cleanSince, cleanDays, cleanMs: Math.max(0, now - lastMs), last, unitsAvoided,
    perSecond: daily * share / 86400};
}
const clampPct = v => Math.max(0.1, Math.min(0.9, Number(v) || 0.5));

export function overview(profile, reading, opts) {
  const ids = habitIds(profile), habits = ids.map(id => habitProgress(id, profile, reading, opts));
  const monthly = habits.reduce((s, h) => s + h.monthly, 0) + (profile.countImpulse ? reading.groups.impulso.monthly : 0);
  // Quanto o plano libera por mês (parar = tudo; reduzir = a parte combinada).
  const freed = Math.round(habits.reduce((s, h) => s + h.monthly * h.share, 0) + (profile.countImpulse ? reading.groups.impulso.monthly * 0.5 : 0));
  const saved = habits.reduce((s, h) => s + h.saved, 0);
  const perSecond = habits.reduce((s, h) => s + h.perSecond, 0);
  const vault = (profile.vault || []).reduce((s, v) => s + cents(v.amount), 0);
  const startedAt = profile.startedAt || ids.map(id => profile.habits[id].start).sort()[0] || opts.today;
  return {habits, monthly, freed, yearly: monthly * 12, saved, perSecond, vault, day: Math.max(1, daysBetween(startedAt, opts.today) + 1), startedAt};
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
  return {v: 1, startedAt: null, setup: false, introSeen: false, countImpulse: false,
    habits: {cigarro: {on: false, packsPerDay: 1, packPrice: DEFAULT_PACK_PRICE, mode: 'parar', reducePct: 0.5, start: today},
      bebida: {on: false, weekly: 0, mode: 'reduzir', reducePct: 0.5, start: today},
      apostas: {on: false, weekly: 0, mode: 'parar', reducePct: 0.5, start: today}},
    logs: [], vault: [], cravings: 0, overrides: {}, prices: {}, picks: ['smartfit-fit', 'ads-ead'], dreams: DEFAULT_DREAMS.map(d => ({...d}))};
}
export function sanitizeProfile(raw, today) {
  const base = emptyProfile(today);
  if (!raw || typeof raw !== 'object' || raw.v !== 1) return base;
  const out = {...base, ...raw, habits: {...base.habits}};
  for (const id of Object.keys(base.habits)) out.habits[id] = {...base.habits[id], ...(raw.habits?.[id] || {})};
  for (const key of ['logs', 'vault', 'picks', 'dreams']) if (!Array.isArray(out[key])) out[key] = base[key];
  for (const key of ['overrides', 'prices']) if (!out[key] || typeof out[key] !== 'object' || Array.isArray(out[key])) out[key] = {};
  out.logs = out.logs.filter(l => VICES[l?.habit] && /^\d{4}-\d{2}-\d{2}$/.test(l.date) && Number.isSafeInteger(l.amount) && l.amount >= 0).slice(-500);
  out.vault = out.vault.filter(v => /^\d{4}-\d{2}-\d{2}$/.test(v?.date) && Number.isSafeInteger(v.amount) && v.amount > 0).slice(-500);
  out.dreams = out.dreams.filter(d => d && typeof d.name === 'string' && Number.isSafeInteger(d.target) && d.target >= 0).slice(0, 8);
  out.cravings = Number.isSafeInteger(out.cravings) && out.cravings >= 0 ? out.cravings : 0;
  return out;
}
export function catalogWithPrices(profile) {
  return CATALOG.map(c => ({...c, price: Number.isSafeInteger(profile?.prices?.[c.id]) && profile.prices[c.id] > 0 ? profile.prices[c.id] : c.price}));
}

// Conta de quem pode ver: hash SHA-256 do e-mail da conta (o e-mail em si não fica no código).
export const PRIVATE_ACCOUNTS = ['23bc0474437f74d987a86b2fa487e0c9febf8aea68287ff2f4accb95be79ea11'];
