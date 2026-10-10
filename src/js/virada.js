// A Virada — espaço privado do Guilherme para cortar cigarro, bebida e impulsos.
// Só aparece para a conta autorizada (hash do e-mail). Lê a parte dele no extrato,
// sem alterar o estado da dupla; tudo o que é da Virada fica neste aparelho, na chave da conta.
import {escapeHTML as esc, formatMoney, localDate, parseCents} from '../features/ui.js';
import {personalFinance} from '../features/personal-core.js';
import * as V from '../features/virada-core.js';

const app = window.JuntoApp;
const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
let account = null, allowed = false, profile = null, checking = null;
let root = null, live = {saved: 0, perSecond: 0, at: Date.now()}, ticker = null, embers = null;
let years = 5, rowFilter = 'cut', wizard = null, introTimers = [], sos = null, focusBefore = null, dirty = false;

// ---------- Acesso e armazenamento ----------
const today = () => localDate();
const storeKey = () => `junto-virada-v1:${account.id}`;
function load() {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(storeKey()) || 'null'); } catch {}
  profile = V.sanitizeProfile(raw, today());
}
function save() {
  dirty = true;
  try { localStorage.setItem(storeKey(), JSON.stringify(profile)); }
  catch { toast('Não foi possível salvar.', 'Libere espaço no aparelho e tente de novo.'); }
}
async function sha256(text) {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function checkAccess() {
  const acc = window.JuntoCloud?.account?.();
  if (!acc?.id || !acc.email || !window.crypto?.subtle) return revoke();
  const hash = await sha256(String(acc.email).trim().toLowerCase());
  const list = [...V.PRIVATE_ACCOUNTS, ...(Array.isArray(window.JuntoCloudConfig?.privateAccounts) ? window.JuntoCloudConfig.privateAccounts : [])];
  if (!list.includes(hash) || !app.hasAccess()) return revoke();
  const changed = account?.id !== acc.id;
  account = {id: acc.id}; if (changed || !profile) load();
  if (!allowed || changed) { allowed = true; app.refresh?.(); }
  startTicker();
}
function revoke() {
  closeOverlay(true);
  const was = allowed; allowed = false; account = null; profile = null;
  if (was) app.refresh?.();
}
window.addEventListener('junto:access-ready', () => { checking = checkAccess().catch(revoke); });
window.addEventListener('junto:access-lost', revoke);
window.addEventListener('junto:state-changed', () => { if (allowed && root) renderMain(); });

// ---------- Dados ----------
const person = () => app.getSlot() || app.getActive();
const myName = () => {
  const s = app.getState(), u = s.users.find(x => x.id === person());
  return String(u?.name || 'Guilherme').trim().split(/\s+/)[0] || 'Guilherme';
};
function snapshot() {
  const state = app.getState(), finance = personalFinance(state, person());
  const reading = V.readSpending(finance, {today: today(), overrides: profile.overrides});
  const o = V.overview(profile, reading, {today: today(), now: Date.now()});
  const debt = state.settings?.personalBudget?.[person()]?.debtPrincipal;
  const dreams = [...profile.dreams];
  if (Number.isSafeInteger(debt) && debt > 0 && !dreams.some(d => d.id === 'divida')) dreams.unshift({id: 'divida', name: 'Quitar a dívida', target: debt, icon: 'shield', fromBudget: true});
  return {reading, o, catalog: V.catalogWithPrices(profile), dreams};
}

// ---------- Formatação ----------
const money = c => formatMoney(Math.round(c || 0));
const money0 = c => new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL', maximumFractionDigits: 0}).format(Math.round(c || 0) / 100);
const n1 = x => (Math.round(x * 10) / 10).toLocaleString('pt-BR', {maximumFractionDigits: 1});
const int = x => Math.floor(x || 0).toLocaleString('pt-BR');
const plural = (n, one, many) => `${int(n)} ${Math.floor(n) === 1 ? one : many}`;
const dm = d => new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'}).replace('.', '');
const centsInput = v => { const c = parseCents(String(v || '').replace(/^R\$\s*/, '')); return Number.isSafeInteger(c) && c >= 0 ? c : NaN; };
const moneyField = c => (c / 100).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});

const ICON = {
  flame: '<path d="M12 22c4.4 0 7-2.9 7-6.8 0-3.5-2.3-5.6-3.6-7.6-.6 1.6-1.6 2.6-2.8 3 .3-3.3-1.2-6.5-4.1-8.6.2 3.6-2.5 5.4-3.6 8.1C4.3 12 5 13.3 5 15.2 5 19.1 7.6 22 12 22Z"/><path d="M12 22c-1.7 0-3-1.3-3-3.2 0-1.7 1.4-2.8 2.1-4.1.8 1 1.6 1.6 2.6 1.9.6.2 1.3 1 1.3 2.2 0 1.9-1.3 3.2-3 3.2Z"/>',
  leaf: '<path d="M5 19c8 0 14-5 14-15C10 4 5 9 5 15v4Z"/><path d="M5 19 14 10"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  gym: '<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>',
  grad: '<path d="m2 9 10-5 10 5-10 5Z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6"/>',
  code: '<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-12-2 18"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9S14.5 18.3 12 21c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.4 8.3 8 9 4.6-.7 8-4 8-9V6Z"/><path d="m9 12 2 2 4-4"/>',
  laptop: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7Z"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9Z"/>',
  share: '<path d="M12 15V3m-5 5 5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
  sos: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m5.6 5.6 3.6 3.6m5.6 5.6 3.6 3.6m0-12.8-3.6 3.6m-5.6 5.6-3.6 3.6"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  piggy: '<path d="M19 9c1 .6 1.7 1.6 2 3h-2.2a7 7 0 0 1-2.8 4.3V19h-3v-1.5h-3V19H7v-2.8A6.5 6.5 0 0 1 5.4 7.6 6.7 6.7 0 0 1 12 5c2.3 0 4.6.9 6 2.4Z"/><path d="M16 11h.01M2.5 9.5c1 0 2 .6 2.5 1.5"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  cig: '<path d="M2 15h15v4H2zM17 15h2v4h-2zM20 15h2v4h-2zM18 3c0 2-2 2-2 4s2 2 2 4M21 3c0 2-2 2-2 4s2 2 2 4"/>',
  beer: '<path d="M5 8h10v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z"/><path d="M15 11h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2M5 8a3 3 0 0 1 3-4 3 3 0 0 1 5 0 2.5 2.5 0 0 1 2 4"/>',
  dice: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 8.5h.01M15.5 15.5h.01M12 12h.01M15.5 8.5h.01M8.5 15.5h.01"/>',
  bag: '<path d="M6 7h12l1 14H5Z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
};
const icon = (name, cls = '') => `<svg class="vr-i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[name] || ''}</svg>`;
const HABIT_ICON = {cigarro: 'cig', bebida: 'beer', apostas: 'dice', impulso: 'bag', essencial: 'check'};

// ---------- Cartão na tela inicial ----------
function homeHTML({hidden = false} = {}) {
  if (!allowed || !profile) return '';
  if (!profile.setup) {
    return `<button type="button" class="vr-home vr-home-new" data-vr="open"><span class="vr-home-embers" aria-hidden="true"></span>
      <span class="vr-home-tag">${icon('lock')} Só você vê</span>
      <b class="vr-home-title">A Virada</b>
      <span class="vr-home-copy">Quanto o cigarro e a bebida te custam — e no que esse dinheiro vira se você cortar.</span>
      <span class="vr-home-cta">Descobrir em 30 segundos ${icon('arrow')}</span></button>`;
  }
  const {o, catalog} = snapshot();
  setLive(o);
  const gym = catalog.find(c => c.id === (profile.picks[0] || 'smartfit-fit')) || catalog[0];
  const covered = gym.price ? Math.max(0, o.saved) / gym.price : 0;
  return `<button type="button" class="vr-home" data-vr="open" aria-label="Abrir A Virada"><span class="vr-home-embers" aria-hidden="true"></span>
    <span class="vr-home-tag">${icon('flame')} A Virada · dia ${o.day}</span>
    <b class="vr-home-value num" ${hidden ? '' : 'data-vr-live'}>${hidden ? 'R$ •••••' : money(o.saved)}</b>
    <span class="vr-home-copy">que não viraram fumaça${profile.habits.bebida.on ? ' nem ressaca' : ''}. ${hidden ? '' : covered >= 1 ? `Já paga ${n1(covered)} ${covered < 2 ? 'mês' : 'meses'} de ${esc(gym.name)}.` : `${Math.round(covered * 100)}% de um mês de ${esc(gym.name)}.`}</span>
    <span class="vr-home-cta">Abrir minha virada ${icon('arrow')}</span></button>`;
}

// ---------- Overlay ----------
function openOverlay() {
  if (!allowed || !profile) return;
  if (!root) {
    focusBefore = document.activeElement;
    document.body.insertAdjacentHTML('beforeend', `<div class="vr-root" id="virada" role="dialog" aria-modal="true" aria-label="A Virada">
      <canvas class="vr-embers" aria-hidden="true"></canvas><div class="vr-grain" aria-hidden="true"></div>
      <header class="vr-top"><span class="vr-brand">${icon('flame')}<b>A Virada</b><small>${icon('lock')} só sua</small></span>
        <span class="vr-top-actions"><button type="button" class="vr-icon-btn" data-vr="settings" aria-label="Ajustes da Virada">${icon('gear')}</button><button type="button" class="vr-icon-btn" data-vr="close" aria-label="Fechar">${icon('close')}</button></span></header>
      <main class="vr-scroll" id="vr-scroll"></main><div class="vr-sheet-layer" id="vr-sheet" hidden></div><div class="vr-toasts" id="vr-toasts" role="status" aria-live="polite"></div></div>`);
    root = document.getElementById('virada');
    document.documentElement.classList.add('vr-open');
    startEmbers();
  }
  if (!profile.setup) { renderMain(); return openWizard(); }
  renderMain();
  if (!profile.introSeen) playIntro();
  else root.querySelector('[data-vr="close"]')?.focus();
}
function closeOverlay(silent = false) {
  if (!root) return false;
  introTimers.forEach(clearTimeout); introTimers = []; stopSOS();
  embers?.stop(); embers = null; root.remove(); root = null; wizard = null;
  document.documentElement.classList.remove('vr-open');
  if (!silent) { if (dirty) app.refresh?.(); dirty = false; focusBefore?.focus?.(); }
  return true;
}
// Botão voltar do Android: fecha a camada de cima primeiro.
function closeTop() {
  if (!root) return false;
  if (root.querySelector('.vr-intro')) { finishIntro(); return true; }
  const layer = root.querySelector('#vr-sheet');
  if (layer && !layer.hidden) { closeSheet(); return true; }
  return closeOverlay();
}

function setLive(o) { live = {saved: o.saved, perSecond: o.perSecond, at: Date.now()}; }
function startTicker() {
  if (ticker) return;
  ticker = setInterval(() => {
    if (!allowed || document.hidden) return;
    const value = live.saved + live.perSecond * (Date.now() - live.at) / 1000;
    document.querySelectorAll('[data-vr-live]').forEach(el => { el.textContent = money(value); });
  }, 250);
}

// ---------- Cenas ----------
function renderMain() {
  if (!root) return;
  const scroll = root.querySelector('#vr-scroll'), top = scroll.scrollTop;
  const snap = snapshot(), {o} = snap;
  setLive(o);
  scroll.innerHTML = profile.setup ? [heroScene(snap), costScene(snap), paysScene(snap), timelineScene(snap), readScene(snap), healthScene(snap), storyScene(snap), footerScene()].join('') : `<section class="vr-scene vr-hero"><p class="vr-kicker">Preparando sua virada…</p></section>`;
  scroll.scrollTop = top;
  if (profile.setup) drawStory();
}

function heroScene({o}) {
  const cig = o.habits.find(h => h.id === 'cigarro'), beb = o.habits.find(h => h.id === 'bebida'), bet = o.habits.find(h => h.id === 'apostas');
  const stats = [
    cig && (cig.mode === 'parar' ? [int(cig.cleanDays), cig.cleanDays === 1 ? 'dia sem fumar' : 'dias sem fumar'] : [int(cig.cleanDays), 'dias desde o último maço']),
    cig && cig.unitsAvoided > 0 && [int(cig.unitsAvoided), 'cigarros não fumados'],
    beb && [int(beb.cleanDays), beb.mode === 'parar' ? (beb.cleanDays === 1 ? 'dia sem beber' : 'dias sem beber') : 'dias desde a última bebida'],
    bet && [int(bet.cleanDays), 'dias sem apostar'],
    profile.cravings ? [int(profile.cravings), profile.cravings === 1 ? 'fissura vencida' : 'fissuras vencidas'] : null,
  ].filter(Boolean).slice(0, 4);
  const vaultPct = o.saved > 0 ? Math.min(100, Math.round(o.vault / o.saved * 100)) : 0;
  return `<section class="vr-scene vr-hero" aria-labelledby="vr-hero-title">
    <p class="vr-kicker">${esc(myName())} · dia ${o.day} da virada</p>
    <h1 id="vr-hero-title" class="vr-sr">Quanto você já economizou</h1>
    <div class="vr-big num" data-vr-live>${money(o.saved)}</div>
    <p class="vr-lede">que não viraram fumaça${profile.habits.bebida.on ? ' nem ressaca' : ''}. Contando agora, a cada segundo.</p>
    <div class="vr-stats">${stats.map(([v, l]) => `<div><b class="num">${v}</b><span>${esc(l)}</span></div>`).join('')}</div>
    <div class="vr-hero-actions">
      <button type="button" class="vr-btn vr-btn-sos" data-vr="sos">${icon('sos')}<span><b>Bateu a vontade?</b><small>3 minutos comigo</small></span></button>
      <button type="button" class="vr-btn" data-vr="vault">${icon('piggy')}<span><b>Guardei de verdade</b><small>${money0(o.vault)} no cofre</small></span></button>
      <button type="button" class="vr-btn vr-btn-quiet" data-vr="relapse">${icon('undo')}<span><b>Tive uma recaída</b><small>Sem julgamento</small></span></button>
    </div>
    ${o.saved > 0 ? `<div class="vr-vault"><div class="vr-vault-bar"><i style="width:${vaultPct}%"></i></div><small>${vaultPct}% do que você economizou já está guardado de verdade. Economia no papel só vira futuro quando sai da conta.</small></div>` : ''}
    <span class="vr-scroll-hint" aria-hidden="true">role pra ver o que isso vira</span>
  </section>`;
}

function costScene({o, reading}) {
  const rows = o.habits.map(h => ({id: h.id, label: h.label, monthly: h.monthly, source: h.base.source, detected: h.base.detected}));
  if (profile.countImpulse && reading.groups.impulso.monthly) rows.push({id: 'impulso', label: 'Delivery e impulsos', monthly: reading.groups.impulso.monthly, source: 'extrato', detected: reading.groups.impulso.monthly});
  const max = Math.max(1, ...rows.map(r => r.monthly)), ten = V.futureValue(o.monthly, 120);
  return `<section class="vr-scene" aria-labelledby="vr-cost-title">
    <p class="vr-kicker">Capítulo 1 · o preço real</p>
    <h2 id="vr-cost-title" class="vr-h">Todo mês, <em class="num">${money0(o.monthly)}</em> vão embora.</h2>
    <div class="vr-bars">${rows.map(r => `<div class="vr-bar-row"><span class="vr-bar-label">${icon(HABIT_ICON[r.id])}${esc(r.label)}</span><span class="vr-bar"><i style="width:${Math.max(4, r.monthly / max * 100)}%"></i></span><b class="num">${money0(r.monthly)}</b><small>${r.source === 'declarado' ? `pelo que você contou${r.detected ? ` · ${money0(r.detected)} no extrato` : ''}` : r.source === 'extrato' ? 'lido no seu extrato' : 'sem registro ainda'}</small></div>`).join('')}</div>
    <div class="vr-trio">
      <div><small>por mês</small><b class="num">${money0(o.monthly)}</b></div>
      <div><small>por ano</small><b class="num">${money0(o.yearly)}</b></div>
      <div class="vr-hot"><small>em 10 anos, investido</small><b class="num">${money0(ten)}</b></div>
    </div>
    <p class="vr-note">Projeção com ${esc(V.YIELD.label)} (${esc(V.YIELD.source)}), antes do imposto. A taxa muda com o tempo; o hábito é o que você controla.</p>
  </section>`;
}

function paysScene({o, catalog}) {
  const freed = o.freed, picks = catalog.filter(c => profile.picks.includes(c.id)), pack = picks.reduce((s, c) => s + c.price, 0);
  const cover = pack ? freed / pack : 0;
  const card = c => {
    const ratio = V.pays(freed, c.price), already = c.price ? Math.max(0, o.saved) / c.price : 0, on = profile.picks.includes(c.id);
    return `<article class="vr-card vr-card-${c.area}${on ? ' is-pick' : ''}">
      <header>${icon(c.icon)}<span>${c.area === 'corpo' ? 'Corpo' : 'Mente'}</span><button type="button" class="vr-pick" data-vr="pick" data-id="${c.id}" aria-pressed="${on}" aria-label="${on ? 'Tirar dos' : 'Colocar nos'} meus objetivos">${icon('star')}</button></header>
      <b class="vr-card-ratio num">${ratio >= 1 ? `${n1(ratio)}×` : `${Math.round(ratio * 100)}%`}</b>
      <p class="vr-card-copy">${ratio >= 1 ? `O que você libera por mês paga ${n1(ratio)} ${ratio < 2 ? 'mensalidade' : 'mensalidades'} de` : 'de uma mensalidade de'}</p>
      <h3>${esc(c.name)}</h3><p class="vr-card-plan">${esc(c.plan)} · <b class="num">${money(c.price)}</b>/${esc(c.unit)}</p>
      <div class="vr-card-progress"><i style="width:${Math.min(100, already * 100)}%"></i></div>
      <small>${already >= 1 ? `Sua economia até hoje já paga ${n1(already)} ${already < 2 ? 'mês' : 'meses'}.` : `Até hoje: ${Math.round(already * 100)}% do primeiro mês.`}</small>
      <a class="vr-src" href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.note)} · ${esc(c.source)}</a>
    </article>`;
  };
  return `<section class="vr-scene" aria-labelledby="vr-pays-title">
    <p class="vr-kicker">Capítulo 2 · o que isso paga</p>
    <h2 id="vr-pays-title" class="vr-h">O mesmo dinheiro, <em>outra vida</em>.</h2>
    <div class="vr-pack ${cover >= 1 ? 'is-full' : ''}">
      <small>Seu pacote · toque na ★ pra escolher</small>
      <b>${picks.length ? picks.map(c => esc(c.name)).join(' + ') : 'Escolha até 3 objetivos'}</b>
      ${picks.length ? `<div class="vr-pack-bar"><i style="width:${Math.min(100, cover * 100)}%"></i></div>
      <p>${money(pack)} por mês. ${cover >= 1 ? `A virada cobre tudo e ainda sobra <b class="num">${money(freed - pack)}</b>.` : `A virada cobre <b>${Math.round(cover * 100)}%</b>. Faltam ${money(pack - freed)} por mês.`}</p>` : ''}
    </div>
    <div class="vr-carousel" role="list">${catalog.map(c => `<div role="listitem">${card(c)}</div>`).join('')}</div>
    <div class="vr-free"><b>${icon('code')} Dá pra começar hoje, de graça</b>${V.FREE_STARTS.map(f => `<a href="${esc(f.url)}" target="_blank" rel="noopener"><span>${esc(f.name)}</span><small>${esc(f.note)}</small></a>`).join('')}</div>
    <p class="vr-note">Preços de referência para comparação. Confira com cada lugar antes de contratar; você pode trocar os valores nos ajustes.</p>
  </section>`;
}

function timelineScene({o, catalog, dreams}) {
  const t = V.timeline(o.freed, years, {catalog, dreams}), picks = catalog.filter(c => profile.picks.includes(c.id));
  const ads = catalog.find(c => c.id === 'ads-ead');
  const lines = [
    ...picks.map(c => c.durationMonths && t.invested >= c.price * c.durationMonths
      ? `<li class="done">${icon('check')}<span><b>${esc(c.name)} inteira</b><small>${c.durationMonths} meses × ${money(c.price)}</small></span></li>`
      : `<li>${icon(c.icon)}<span><b>${t.invested / c.price >= 24 ? `${int(t.invested / c.price / 12)} anos` : plural(t.invested / c.price, 'mês', 'meses')} de ${esc(c.name)}</b><small>${money(c.price)} por mês</small></span></li>`),
    ...(!picks.some(c => c.id === 'ads-ead') && ads && t.invested >= ads.price * ads.durationMonths ? [`<li class="done">${icon('grad')}<span><b>A faculdade de ADS inteira</b><small>e ainda sobra ${money0(t.invested - ads.price * ads.durationMonths)}</small></span></li>`] : []),
  ];
  const goals = t.goals.slice().sort((a, b) => (a.month ?? 1e9) - (b.month ?? 1e9));
  return `<section class="vr-scene" aria-labelledby="vr-time-title">
    <p class="vr-kicker">Capítulo 3 · a linha do tempo</p>
    <h2 id="vr-time-title" class="vr-h">Se você segurar por <em><output id="vr-years-out">${years} ${years === 1 ? 'ano' : 'anos'}</output></em>…</h2>
    <input class="vr-range" type="range" min="1" max="10" step="1" value="${years}" data-vr-range="years" aria-label="Anos de virada">
    <div class="vr-ticks" aria-hidden="true">${Array.from({length: 10}, (_, i) => `<span>${i + 1}</span>`).join('')}</div>
    <div class="vr-future"><small>você terá</small><b class="num">${money0(t.invested)}</b><span>${money0(t.plain)} guardados + <em>${money0(t.interest)}</em> de rendimento</span></div>
    ${goals.some(g => g.month) ? `<div class="vr-track" aria-hidden="true">${goals.map((g, i) => g.month ? `<span class="vr-dot ${g.reached ? 'on' : ''}" style="left:${Math.min(100, g.month / t.months * 100)}%"><i>${i + 1}</i></span>` : '').join('')}<span class="vr-track-end">${years} ${years === 1 ? 'ano' : 'anos'}</span></div>` : ''}
    <ul class="vr-list">${lines.join('')}${goals.map((g, i) => `<li class="${g.reached ? 'done' : ''}"><span class="vr-num">${i + 1}</span><span><b>${esc(g.name)}</b><small>${g.month ? `${g.reached ? 'Chega no' : 'Chegaria no'} mês ${g.month} · ${money0(g.target)}` : `Defina o valor em ajustes`}</small></span></li>`).join('')}</ul>
  </section>`;
}

function readScene({reading}) {
  const filters = [['cut', 'Pra cortar'], ['vicio', 'Vícios'], ['impulso', 'Impulsos'], ['essencial', 'Necessário'], ['all', 'Tudo']];
  const rows = reading.rows.filter(r => rowFilter === 'all' || (rowFilter === 'cut' ? r.kind !== 'essencial' : r.kind === rowFilter)).slice(0, 60);
  const groups = ['cigarro', 'bebida', 'apostas', 'impulso'].map(id => reading.groups[id]).filter(g => g.total > 0);
  const max = Math.max(1, ...groups.map(g => g.monthly));
  return `<section class="vr-scene" aria-labelledby="vr-read-title">
    <p class="vr-kicker">Capítulo 4 · a leitura dos seus gastos</p>
    <h2 id="vr-read-title" class="vr-h">${reading.rows.length ? `<em class="num">${Math.round(reading.cutShare * 100)}%</em> do que você gastou dava pra cortar.` : 'Seu extrato ainda está vazio.'}</h2>
    <p class="vr-lede">${reading.rows.length ? `Últimos ${reading.coverage} ${reading.coverage === 1 ? 'dia' : 'dias'}: ${money(reading.cut)} em vícios e impulsos, só a sua parte. ${reading.reliable ? '' : 'Com menos de 14 dias de registro, a média ainda oscila.'}` : 'Registre os gastos no Juntô (ou confirme os movimentos do banco) e a Virada separa sozinha o que é vício, impulso e necessidade.'}</p>
    ${groups.length ? `<div class="vr-bars">${groups.map(g => `<div class="vr-bar-row"><span class="vr-bar-label">${icon(HABIT_ICON[g.id])}${esc(g.label)}</span><span class="vr-bar"><i style="width:${Math.max(4, g.monthly / max * 100)}%"></i></span><b class="num">${money0(g.monthly)}</b><small>por mês · ${plural(g.count, 'compra', 'compras')}</small></div>`).join('')}</div>` : ''}
    ${reading.rows.length ? `<div class="vr-chips" role="group" aria-label="Filtrar gastos">${filters.map(([v, l]) => `<button type="button" data-vr="filter" data-value="${v}" aria-pressed="${rowFilter === v}">${l}</button>`).join('')}</div>
    <ul class="vr-rows">${rows.map(r => `<li><button type="button" data-vr="reclass" data-id="${esc(r.id)}"><span class="vr-row-ic vr-k-${r.kind}">${icon(HABIT_ICON[r.group])}</span><span class="vr-row-main"><b>${esc(r.name)}</b><small>${dm(r.date)} · ${esc(V.GROUPS[r.group].label)}${r.overridden ? ' · você marcou' : r.certain ? '' : ' · provável'}</small></span><b class="num">${money(r.amount)}</b></button></li>`).join('') || '<li class="vr-empty">Nada nesse filtro.</li>'}</ul>
    <p class="vr-note">Toque num gasto para corrigir a leitura. Sua correção fica só aqui e vale para as próximas contas.</p>` : ''}
  </section>`;
}

function healthScene({o}) {
  const cig = o.habits.find(h => h.id === 'cigarro');
  if (!cig || cig.mode !== 'parar') return '';
  const steps = V.healthProgress(cig.cleanMs);
  return `<section class="vr-scene" aria-labelledby="vr-health-title">
    <p class="vr-kicker">Capítulo 5 · o corpo agradece</p>
    <h2 id="vr-health-title" class="vr-h">Desde o último cigarro, <em>${cig.cleanDays ? plural(cig.cleanDays, 'dia', 'dias') : 'hoje'}</em>.</h2>
    <ol class="vr-health">${steps.map(s => `<li class="${s.done ? 'done' : ''}"><span class="vr-health-when">${esc(s.when)}</span><span class="vr-health-text">${esc(s.text)}<i style="width:${Math.round(s.pct * 100)}%"></i></span></li>`).join('')}</ol>
    <p class="vr-note">Marcos publicados pela Organização Mundial da Saúde. O SUS tem tratamento gratuito para parar de fumar: procure a UBS mais perto ou ligue 136 (Disque Saúde).</p>
  </section>`;
}

function storyScene() {
  return `<section class="vr-scene vr-story-scene" aria-labelledby="vr-story-title">
    <p class="vr-kicker">Capítulo 6 · pra postar</p>
    <h2 id="vr-story-title" class="vr-h">Mostra a virada <em>pro mundo</em>.</h2>
    <p class="vr-lede">Um card no formato do story, com seus números e sem mostrar nada além do que você escolher.</p>
    <div class="vr-story-opts" role="group" aria-label="O que mostrar no story">
      <label><input type="checkbox" data-vr-story="money" ${profile.story?.money !== false ? 'checked' : ''}> Valor economizado</label>
      <label><input type="checkbox" data-vr-story="days" ${profile.story?.days !== false ? 'checked' : ''}> Dias de virada</label>
      <label><input type="checkbox" data-vr-story="pays" ${profile.story?.pays !== false ? 'checked' : ''}> O que isso paga</label>
    </div>
    <div class="vr-story-preview"><canvas id="vr-story-canvas" width="1080" height="1920" aria-label="Prévia do story"></canvas></div>
    <button type="button" class="vr-btn vr-btn-primary" data-vr="share">${icon('share')}<span><b>Compartilhar no story</b><small>Instagram, WhatsApp ou salvar</small></span></button>
  </section>`;
}

function footerScene() {
  return `<footer class="vr-scene vr-foot"><p>${icon('lock')} A Virada é só sua. Fica salva neste aparelho, na sua conta, e não vai para a dupla. O Juntô só lê a sua parte dos gastos — nada é alterado.</p>
    <button type="button" class="vr-link" data-vr="close">Voltar ao Juntô</button></footer>`;
}

// ---------- Story (1080×1920) ----------
async function drawStory() {
  const canvas = root?.querySelector('#vr-story-canvas'); if (!canvas) return null;
  const {o, catalog} = snapshot(), ctx = canvas.getContext('2d'), W = 1080, H = 1920, opts = {money: true, days: true, pays: true, ...(profile.story || {})};
  try { await Promise.all([document.fonts.load('800 120px Manrope'), document.fonts.load('600 40px Manrope')]); } catch {}
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#07070b'); g.addColorStop(.55, '#140b07'); g.addColorStop(1, '#0a1a12');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * .5, H * .78, 40, W * .5, H * .78, 900);
  glow.addColorStop(0, 'rgba(255,106,43,.45)'); glow.addColorStop(.5, 'rgba(255,106,43,.08)'); glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 140; i++) { const y = H * (.35 + rnd() * .65), r = 1.5 + rnd() * 5; ctx.fillStyle = `rgba(${rnd() > .7 ? '61,220,151' : '255,' + Math.round(120 + rnd() * 80) + ',60'},${(.15 + rnd() * .6) * (y / H)})`; ctx.beginPath(); ctx.arc(rnd() * W, y, r, 0, Math.PI * 2); ctx.fill(); }
  const font = (w, s) => `${w} ${s}px Manrope, "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = 'left'; ctx.fillStyle = '#ff7a3d'; ctx.font = font(800, 42); ctx.fillText('A VIRADA', 96, 190);
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.font = font(600, 34); ctx.fillText(`${myName().toUpperCase()}${opts.days ? ` · DIA ${o.day}` : ''}`, 96, 246);
  let y = 560;
  if (opts.money) {
    ctx.fillStyle = '#fff'; ctx.font = font(800, money0(o.saved).length > 9 ? 150 : 180); ctx.fillText(money0(Math.max(0, o.saved)), 90, y);
    ctx.fillStyle = 'rgba(255,255,255,.78)'; ctx.font = font(600, 50); ctx.fillText('que não viraram fumaça.', 96, y + 90); y += 250;
  } else if (opts.days) {
    ctx.fillStyle = '#fff'; ctx.font = font(800, 220); ctx.fillText(String(o.day), 90, y);
    ctx.fillStyle = 'rgba(255,255,255,.78)'; ctx.font = font(600, 50); ctx.fillText(o.day === 1 ? 'dia de virada.' : 'dias de virada.', 96, y + 90); y += 250;
  }
  const cig = o.habits.find(h => h.id === 'cigarro');
  if (opts.days && cig?.unitsAvoided) { ctx.fillStyle = '#3ddc97'; ctx.font = font(800, 64); ctx.fillText(`${int(cig.unitsAvoided)} cigarros não fumados`, 96, y); y += 120; }
  if (opts.pays) {
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.font = font(700, 34); ctx.fillText('ISSO VIRA, POR MÊS:', 96, y + 40); y += 160;
    const items = catalog.filter(c => profile.picks.includes(c.id)).slice(0, 3);
    for (const c of (items.length ? items : catalog.slice(0, 2))) {
      const ratio = V.pays(o.freed, c.price);
      ctx.fillStyle = 'rgba(255,255,255,.08)'; roundRect(ctx, 80, y - 70, W - 160, 120, 28); ctx.fill();
      ctx.fillStyle = '#f5c46b'; ctx.font = font(800, 54); ctx.fillText(ratio >= 1 ? `${n1(ratio)}×` : `${Math.round(ratio * 100)}%`, 120, y + 10);
      ctx.fillStyle = '#fff'; ctx.font = font(650, 44); ctx.fillText(fit(ctx, c.name, W - 460), 340, y + 8); y += 150;
    }
  }
  ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.font = font(600, 32); ctx.fillText('feito no Juntô', 96, H - 120);
  return canvas;
}
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function fit(ctx, text, width) { let t = text; while (ctx.measureText(t).width > width && t.length > 4) t = t.slice(0, -2); return t === text ? t : t.trim() + '…'; }
async function shareStory() {
  const canvas = await drawStory(); if (!canvas) return;
  const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
  const file = blob && new File([blob], `virada-dia-${snapshot().o.day}.png`, {type: 'image/png'});
  try {
    if (file && navigator.canShare?.({files: [file]})) { await navigator.share({files: [file], title: 'A Virada'}); return; }
  } catch (e) { if (e?.name === 'AbortError') return; }
  if (document.documentElement.classList.contains('native-app')) {
    openSheet('Seu story', `<img class="vr-story-full" src="${canvas.toDataURL('image/png')}" alt="Story da Virada"><p class="vr-note">Tire um print desta tela e poste no story.</p>`);
    return;
  }
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = file.name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1500);
  toast('Imagem salva.', 'Agora é só postar no story.');
}

// ---------- Folhas (bottom sheets) ----------
function openSheet(title, body, kind = '') {
  const layer = root?.querySelector('#vr-sheet'); if (!layer) return;
  const open = !layer.hidden && layer.querySelector('.vr-sheet');
  if (open && open.className === `vr-sheet ${kind}`) {
    layer.querySelector('#vr-sheet-title').textContent = title;
    layer.querySelector('.vr-sheet-body').innerHTML = body;
    return;
  }
  layer.hidden = false;
  layer.innerHTML = `<div class="vr-sheet-backdrop" data-vr="sheet-close"></div><div class="vr-sheet ${kind}" role="dialog" aria-modal="true" aria-labelledby="vr-sheet-title"><div class="vr-sheet-grip" aria-hidden="true"></div><header><h2 id="vr-sheet-title">${esc(title)}</h2><button type="button" class="vr-icon-btn" data-vr="sheet-close" aria-label="Fechar">${icon('close')}</button></header><div class="vr-sheet-body">${body}</div></div>`;
  requestAnimationFrame(() => layer.querySelector('input,button.vr-btn,select,[data-vr-step] button')?.focus());
}
function closeSheet() {
  stopSOS();
  const layer = root?.querySelector('#vr-sheet'); if (!layer) return;
  layer.hidden = true; layer.innerHTML = '';
  if (!profile.setup) closeOverlay();
}

function relapseSheet() {
  const habits = V.habitIds(profile), first = habits[0] || 'cigarro', price = profile.habits.cigarro.packPrice || V.DEFAULT_PACK_PRICE;
  openSheet('Recaída faz parte', `<p class="vr-sheet-lede">Não apaga o que você já fez. Registra, respira e segue — a próxima escolha é a que conta.</p>
    <form class="vr-form" data-vr-form="relapse">
      <fieldset class="vr-seg"><legend>O quê?</legend>${habits.map(id => `<label><input type="radio" name="habit" value="${id}" ${id === first ? 'checked' : ''}><span>${icon(HABIT_ICON[id])}${esc(V.VICES[id].label)}</span></label>`).join('')}</fieldset>
      <label class="vr-field"><span>Quanto foi? (se pagou no dinheiro ou não registrou no Juntô)</span><input name="amount" inputmode="decimal" value="${moneyField(first === 'cigarro' ? price : 0)}" autocomplete="off"></label>
      <label class="vr-field"><span>Quando?</span><input name="date" type="date" value="${today()}" max="${today()}"></label>
      <p class="vr-error" role="alert"></p>
      <button class="vr-btn vr-btn-primary" type="submit"><span><b>Registrar e recomeçar</b></span></button>
      <p class="vr-note">Se essa compra já está no extrato do Juntô, deixe o valor em zero: a Virada já leu.</p>
    </form>`);
}
function vaultSheet() {
  const {o} = snapshot(), suggestion = Math.max(0, o.saved - o.vault);
  openSheet('Guardei de verdade', `<p class="vr-sheet-lede">Transferiu pra poupança, caixinha ou investimento? Registra aqui. Economia que fica parada na conta corrente costuma virar outra compra.</p>
    <form class="vr-form" data-vr-form="vault">
      <label class="vr-field"><span>Quanto você separou?</span><input name="amount" inputmode="decimal" value="${moneyField(Math.round(suggestion / 100) * 100)}" autocomplete="off" required></label>
      <p class="vr-error" role="alert"></p>
      <button class="vr-btn vr-btn-primary" type="submit"><span><b>Pôr no cofre</b></span></button>
    </form>${profile.vault.length ? `<ul class="vr-mini">${profile.vault.slice(-5).reverse().map(v => `<li><span>${dm(v.date)}</span><b class="num">${money(v.amount)}</b></li>`).join('')}</ul>` : ''}`);
}
function reclassSheet(id) {
  const row = snapshot().reading.rows.find(r => r.id === id); if (!row) return;
  const opts = [['cigarro', 'Cigarro'], ['bebida', 'Bebida'], ['apostas', 'Apostas'], ['impulso', 'Impulso'], ['need', 'Foi necessário']];
  const current = profile.overrides[id] || (row.group === 'essencial' ? 'need' : row.group);
  openSheet(row.name, `<p class="vr-sheet-lede">${dm(row.date)} · ${money(row.amount)} · categoria ${esc(row.category)} no Juntô. O que esse gasto foi pra você?</p>
    <div class="vr-choice">${opts.map(([v, l]) => `<button type="button" class="${current === v ? 'on' : ''}" data-vr="reclass-set" data-id="${esc(id)}" data-value="${v}">${icon(v === 'need' ? 'check' : HABIT_ICON[v])}${l}</button>`).join('')}</div>
    ${profile.overrides[id] ? `<button type="button" class="vr-link" data-vr="reclass-set" data-id="${esc(id)}" data-value="">Voltar à leitura automática</button>` : ''}`);
}
function settingsSheet() {
  const catalog = V.catalogWithPrices(profile);
  openSheet('Ajustes da Virada', `<div class="vr-form">
    <button type="button" class="vr-btn" data-vr="wizard">${icon('flame')}<span><b>Refazer meu ponto de partida</b><small>Hábitos, valores e se é pra parar ou reduzir</small></span></button>
    <label class="vr-switch"><input type="checkbox" data-vr-toggle="countImpulse" ${profile.countImpulse ? 'checked' : ''}><span><b>Contar delivery e impulsos</b><small>Inclui metade do que vai em delivery e lanches no que a virada libera</small></span></label>
    </div>
    <form class="vr-form" data-vr-form="prices"><h3>Preços de referência</h3>${catalog.map(c => `<label class="vr-field vr-field-row"><span>${esc(c.name)}<small>${esc(c.plan)}</small></span><input name="${c.id}" inputmode="decimal" value="${moneyField(c.price)}"></label>`).join('')}
      <h3>Sonhos (valor total)</h3>${profile.dreams.map((d, i) => `<div class="vr-field-row vr-dream-row"><input name="dream-name-${i}" value="${esc(d.name)}" maxlength="40" aria-label="Nome do sonho"><input name="dream-target-${i}" inputmode="decimal" value="${moneyField(d.target)}" aria-label="Valor de ${esc(d.name)}"></div>`).join('')}
      ${profile.dreams.length < 6 ? '<div class="vr-field-row vr-dream-row"><input name="dream-name-new" placeholder="Novo sonho" maxlength="40" aria-label="Nome do novo sonho"><input name="dream-target-new" inputmode="decimal" placeholder="0,00" aria-label="Valor do novo sonho"></div>' : ''}
      <p class="vr-note">Para remover um sonho, deixe o valor em zero.</p>
      <p class="vr-error" role="alert"></p>
      <button class="vr-btn vr-btn-primary" type="submit"><span><b>Salvar valores</b></span></button>
    </form>
    <div class="vr-danger"><button type="button" class="vr-link" data-vr="reset">Apagar a Virada deste aparelho</button></div>`);
}

// ---------- Fissura: 3 minutos guiados ----------
const SOS_LINES = [
  'Inspira pelo nariz… segura… solta devagar pela boca.',
  'A vontade vem em onda. Ela sobe, chega no topo e passa.',
  'Bebe um copo d’água gelada. Agora.',
  'Levanta, anda até a outra ponta da casa e volta.',
  'Esse maço é {pack}% da mensalidade da {goal}.',
  'Você já está há {days} nessa. Não troca isso por 5 minutos.',
  'Manda mensagem pra alguém, ouve uma música, mexe as mãos.',
  'Quase lá. Mais uma respiração longa.',
];
function sosSheet() {
  const {o, catalog} = snapshot(), goal = catalog.find(c => c.id === profile.picks[0]) || catalog[0];
  const pack = profile.habits.cigarro.packPrice || V.DEFAULT_PACK_PRICE, h = o.habits[0];
  const lines = profile.habits.cigarro.on ? SOS_LINES : SOS_LINES.filter(l => !l.includes('{pack}'));
  const fill = s => s.replace('{pack}', Math.round(pack / goal.price * 100)).replace('{goal}', goal.name).replace('{days}', h ? plural(h.cleanDays || 0, 'dia', 'dias') : 'um tempo');
  openSheet('Respira comigo', `<div class="vr-sos">
    <div class="vr-breath" aria-hidden="true"><span></span><b id="vr-sos-phase">Inspira</b></div>
    <p class="vr-sos-line" id="vr-sos-line" aria-live="polite">${esc(fill(lines[0]))}</p>
    <b class="vr-sos-time num" id="vr-sos-time">3:00</b>
    <button type="button" class="vr-btn vr-btn-primary" data-vr="sos-win"><span><b>Passou. Venci essa.</b></span></button>
  </div>`, 'vr-sheet-sos');
  const started = Date.now(), total = 180;
  sos = setInterval(() => {
    const el = root?.querySelector('#vr-sos-time'); if (!el) return stopSOS();
    const left = Math.max(0, total - Math.floor((Date.now() - started) / 1000));
    el.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    const cycle = ((Date.now() - started) / 1000) % 10;
    root.querySelector('#vr-sos-phase').textContent = cycle < 4 ? 'Inspira' : 'Solta';
    const line = lines[Math.floor((Date.now() - started) / 22500) % lines.length];
    const out = root.querySelector('#vr-sos-line'), text = fill(line);
    if (out.textContent !== text) out.textContent = text;
    if (!left) { stopSOS(); el.textContent = 'Passou.'; }
  }, 250);
}
function stopSOS() { clearInterval(sos); sos = null; }

// ---------- Ponto de partida (assistente) ----------
function openWizard() {
  const h = profile.habits;
  wizard = {step: 1, on: {cigarro: h.cigarro.on || !profile.setup, bebida: h.bebida.on || !profile.setup, apostas: h.apostas.on},
    packsPerDay: h.cigarro.packsPerDay || 1, packPrice: h.cigarro.packPrice || V.DEFAULT_PACK_PRICE, beerWeekly: h.bebida.weekly || 0, betWeekly: h.apostas.weekly || 0,
    mode: {cigarro: h.cigarro.mode, bebida: h.bebida.mode, apostas: h.apostas.mode}, pct: {cigarro: h.cigarro.reducePct, bebida: h.bebida.reducePct, apostas: h.apostas.reducePct},
    start: profile.setup ? (h.cigarro.start || today()) : today()};
  renderWizard();
}
function renderWizard() {
  const w = wizard, {reading} = snapshot(), det = id => reading.groups[id]?.monthly || 0;
  const steps = [];
  steps.push(`<div data-vr-step="1"><p class="vr-kicker">Passo 1</p><h3 class="vr-wh">O que você quer cortar, ${esc(myName())}?</h3>
    <div class="vr-choice vr-choice-big">${['cigarro', 'bebida', 'apostas'].map(id => `<button type="button" class="${w.on[id] ? 'on' : ''}" data-vr="wz-toggle" data-id="${id}" aria-pressed="${w.on[id]}">${icon(HABIT_ICON[id])}${esc(V.VICES[id].label)}${det(id) ? `<small>${money0(det(id))}/mês no extrato</small>` : ''}</button>`).join('')}</div>
    <p class="vr-note">Delivery e lanches a Virada lê sozinha; você decide nos ajustes se entram na conta.</p></div>`);
  steps.push(`<div data-vr-step="2"><p class="vr-kicker">Passo 2 · seja honesto, ninguém vê</p><h3 class="vr-wh">Quanto vai nisso hoje?</h3><form class="vr-form" data-vr-form="wz-amounts">
    ${w.on.cigarro ? `<div class="vr-field"><span>Maços por dia</span><div class="vr-stepper"><button type="button" data-vr="wz-packs" data-value="-0.25" aria-label="Menos">−</button><output class="num" id="vr-packs">${n1(w.packsPerDay)}</output><button type="button" data-vr="wz-packs" data-value="0.25" aria-label="Mais">+</button></div><small id="vr-packs-cig">${int(w.packsPerDay * 20)} cigarros por dia</small></div>
      <label class="vr-field"><span>Preço do maço que você compra</span><input name="packPrice" inputmode="decimal" value="${moneyField(w.packPrice)}"></label>` : ''}
    ${w.on.bebida ? `<label class="vr-field"><span>Bebida por semana (bar, latão, adega, Zé Delivery…)</span><input name="beerWeekly" inputmode="decimal" value="${moneyField(w.beerWeekly || Math.round(det('bebida') / (52 / 12)))}"></label>` : ''}
    ${w.on.apostas ? `<label class="vr-field"><span>Apostas por semana</span><input name="betWeekly" inputmode="decimal" value="${moneyField(w.betWeekly || Math.round(det('apostas') / (52 / 12)))}"></label>` : ''}
    <p class="vr-error" role="alert"></p></form>
    <p class="vr-note">Conta também o que você paga no dinheiro: isso não aparece no extrato.</p></div>`);
  const ids = Object.keys(w.on).filter(id => w.on[id]);
  steps.push(`<div data-vr-step="3"><p class="vr-kicker">Passo 3</p><h3 class="vr-wh">Parar de vez ou reduzir?</h3>
    ${ids.map(id => `<div class="vr-mode"><b>${icon(HABIT_ICON[id])}${esc(V.VICES[id].label)}</b><div class="vr-seg2"><button type="button" class="${w.mode[id] !== 'reduzir' ? 'on' : ''}" data-vr="wz-mode" data-id="${id}" data-value="parar">Parar</button><button type="button" class="${w.mode[id] === 'reduzir' ? 'on' : ''}" data-vr="wz-mode" data-id="${id}" data-value="reduzir">Reduzir ${Math.round((w.pct[id] || .5) * 100)}%</button></div>
      ${w.mode[id] === 'reduzir' ? `<input class="vr-range" type="range" min="25" max="75" step="5" value="${Math.round((w.pct[id] || .5) * 100)}" data-vr-range="pct" data-id="${id}" aria-label="Quanto reduzir de ${esc(V.VICES[id].label)}">` : ''}</div>`).join('')}
    <label class="vr-field"><span>Começa quando?</span><input type="date" data-vr-start value="${w.start}" max="${today()}"></label>
    <p class="vr-note">Já parou faz uns dias? Põe a data: a Virada conta desde lá.</p></div>`);
  const body = `<div class="vr-wizard"><div class="vr-wz-dots" aria-hidden="true">${[1, 2, 3].map(i => `<i class="${i <= w.step ? 'on' : ''}"></i>`).join('')}</div>${steps[w.step - 1]}
    <div class="vr-wz-nav">${w.step > 1 ? '<button type="button" class="vr-link" data-vr="wz-back">Voltar</button>' : '<span></span>'}<button type="button" class="vr-btn vr-btn-primary" data-vr="wz-next" ${ids.length ? '' : 'disabled'}><span><b>${w.step === 3 ? 'Começar a virada' : 'Continuar'}</b></span>${icon('arrow')}</button></div></div>`;
  openSheet(profile.setup ? 'Ponto de partida' : 'A Virada', body, 'vr-sheet-tall');
}
function readWizardAmounts() {
  const form = root.querySelector('[data-vr-form="wz-amounts"]'); if (!form) return true;
  const data = new FormData(form), err = form.querySelector('.vr-error');
  for (const [name, label] of [['packPrice', 'o preço do maço'], ['beerWeekly', 'o valor da bebida'], ['betWeekly', 'o valor das apostas']]) {
    if (!data.has(name)) continue;
    const c = centsInput(data.get(name));
    if (!Number.isSafeInteger(c) || c > 10000000) { err.textContent = `Confira ${label}.`; return false; }
    wizard[name] = c;
  }
  if (wizard.on.cigarro && !(wizard.packPrice > 0)) { err.textContent = 'Informe o preço do maço.'; return false; }
  return true;
}
function finishWizard() {
  const w = wizard, first = !profile.setup;
  const start = /^\d{4}-\d{2}-\d{2}$/.test(w.start) && w.start <= today() ? w.start : today();
  // Começando hoje, a contagem parte de agora — não credita as horas antes da decisão.
  const keep = id => profile.habits[id].start === start && Number.isFinite(profile.habits[id].startAt) ? profile.habits[id].startAt : null;
  const startAt = id => keep(id) ?? (start === today() ? Date.now() : null);
  profile.habits.cigarro = {...profile.habits.cigarro, on: w.on.cigarro, packsPerDay: w.packsPerDay, packPrice: w.packPrice, mode: w.mode.cigarro === 'reduzir' ? 'reduzir' : 'parar', reducePct: w.pct.cigarro || .5, start, startAt: startAt('cigarro')};
  profile.habits.bebida = {...profile.habits.bebida, on: w.on.bebida, weekly: w.beerWeekly, mode: w.mode.bebida === 'reduzir' ? 'reduzir' : 'parar', reducePct: w.pct.bebida || .5, start, startAt: startAt('bebida')};
  profile.habits.apostas = {...profile.habits.apostas, on: w.on.apostas, weekly: w.betWeekly, mode: w.mode.apostas === 'reduzir' ? 'reduzir' : 'parar', reducePct: w.pct.apostas || .5, start, startAt: startAt('apostas')};
  profile.startedAt = first || !profile.startedAt || start < profile.startedAt ? start : profile.startedAt;
  profile.setup = true; save(); wizard = null;
  const layer = root.querySelector('#vr-sheet'); layer.hidden = true; layer.innerHTML = '';
  renderMain();
  if (first || !profile.introSeen) playIntro(); else toast('Ponto de partida atualizado.');
}

// ---------- Abertura cinematográfica ----------
function playIntro() {
  if (!root) return;
  const {o, catalog} = snapshot(), ten = V.futureValue(o.monthly, 120), gym = catalog[0], ads = catalog.find(c => c.id === 'ads-ead');
  const lines = [
    `<span class="vr-intro-name">${esc(myName())}.</span>`,
    `Todo mês, <b class="num" data-vr-count="${o.monthly}">R$ 0</b><br>viram fumaça${profile.habits.bebida.on ? ' e ressaca' : ''}.`,
    `Em um ano: <b class="num">${money0(o.yearly)}</b>.`,
    `Em dez anos, investido:<br><b class="vr-intro-huge num">${money0(ten)}</b>`,
    `Isso é ${n1(V.pays(o.freed, gym.price))}× ${esc(gym.name)} por mês.<br>Ou a ${esc(ads.name)} inteira em ${V.monthsToReach(ads.price * ads.durationMonths, o.freed) || '—'} meses.`,
    `<span class="vr-intro-turn">Começa a virada.</span>`,
  ];
  root.insertAdjacentHTML('beforeend', `<div class="vr-intro" role="presentation"><div class="vr-intro-stage" aria-live="polite"></div><button type="button" class="vr-intro-skip" data-vr="intro-skip">Pular</button></div>`);
  const stage = root.querySelector('.vr-intro-stage'), step = reduced() ? 900 : 2600;
  lines.forEach((html, i) => introTimers.push(setTimeout(() => {
    stage.innerHTML = `<p class="vr-intro-line">${html}</p>`;
    const counter = stage.querySelector('[data-vr-count]');
    if (counter) countUp(counter, Number(counter.dataset.vrCount), reduced() ? 0 : 1600);
    if (i === lines.length - 1) embers?.turn();
  }, i * step)));
  introTimers.push(setTimeout(finishIntro, lines.length * step + 400));
}
function countUp(el, target, ms) {
  const start = performance.now();
  const frame = t => { const p = ms ? Math.min(1, (t - start) / ms) : 1, e = 1 - Math.pow(1 - p, 3); el.textContent = money0(target * e); if (p < 1 && el.isConnected) requestAnimationFrame(frame); };
  requestAnimationFrame(frame);
}
function finishIntro() {
  introTimers.forEach(clearTimeout); introTimers = [];
  const intro = root?.querySelector('.vr-intro'); if (!intro) return;
  intro.classList.add('is-out'); setTimeout(() => intro.remove(), reduced() ? 0 : 600);
  embers?.turn();
  if (!profile.introSeen) { profile.introSeen = true; save(); }
  root.querySelector('[data-vr="close"]')?.focus();
}

// ---------- Brasas (canvas de fundo) ----------
function startEmbers() {
  const canvas = root.querySelector('.vr-embers'), ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1, raf = 0, mix = profile.introSeen ? 1 : 0, target = mix, alive = true;
  const parts = Array.from({length: reduced() ? 0 : 56}, () => spawn(true));
  function spawn(any) { return {x: Math.random(), y: any ? Math.random() : 1.05, r: .6 + Math.random() * 2.4, v: .0006 + Math.random() * .0018, s: Math.random() * Math.PI * 2, a: .25 + Math.random() * .6, green: Math.random()}; }
  function size() { dpr = Math.min(2, window.devicePixelRatio || 1); w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * dpr; canvas.height = h * dpr; }
  function frame() {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    if (document.hidden) return;
    mix += (target - mix) * .02;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.y -= p.v; p.s += .02; if (p.y < -.05) Object.assign(p, spawn(false));
      const turn = p.green < mix * .55, x = (p.x + Math.sin(p.s) * .01) * w, y = p.y * h, fade = Math.min(1, p.y * 1.4);
      ctx.fillStyle = turn ? `rgba(61,220,151,${p.a * fade * .8})` : `rgba(255,${110 + Math.round(p.green * 70)},45,${p.a * fade})`;
      ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI * 2); ctx.fill();
    }
  }
  size(); window.addEventListener('resize', size); if (parts.length) frame();
  embers = {turn() { target = 1; }, stop() { alive = false; cancelAnimationFrame(raf); window.removeEventListener('resize', size); }};
}

// ---------- Avisos dentro da Virada ----------
function toast(title, body = '') {
  const zone = root?.querySelector('#vr-toasts');
  if (!zone) return app.toast(title, body);
  const el = document.createElement('div'); el.className = 'vr-toast';
  el.innerHTML = `${icon('check')}<div><b>${esc(title)}</b>${body ? `<p>${esc(body)}</p>` : ''}</div>`;
  zone.append(el); setTimeout(() => el.remove(), 4200);
}

// ---------- Eventos ----------
document.addEventListener('click', event => {
  const el = event.target.closest('[data-vr]'); if (!el || !allowed || !profile) return;
  const action = el.dataset.vr, id = el.dataset.id, value = el.dataset.value;
  if (action === 'open') return openOverlay();
  if (!root) return;
  if (action === 'close') return closeOverlay();
  if (action === 'settings') return settingsSheet();
  if (action === 'sheet-close') return closeSheet();
  if (action === 'intro-skip') return finishIntro();
  if (action === 'sos') return sosSheet();
  if (action === 'sos-win') { profile.cravings++; save(); closeSheet(); renderMain(); return toast('Fissura vencida.', `${plural(profile.cravings, 'vez', 'vezes')} que você ganhou da vontade.`); }
  if (action === 'relapse') return relapseSheet();
  if (action === 'vault') return vaultSheet();
  if (action === 'share') return shareStory();
  if (action === 'pick') {
    const set = new Set(profile.picks); set.has(id) ? set.delete(id) : set.size < 3 ? set.add(id) : toast('Até 3 objetivos.', 'Tire um para escolher outro.');
    profile.picks = [...set]; save(); renderMain(); drawStory(); return;
  }
  if (action === 'filter') { rowFilter = value; return renderMain(); }
  if (action === 'reclass') return reclassSheet(id);
  if (action === 'reclass-set') { if (value) profile.overrides[id] = value; else delete profile.overrides[id]; save(); closeSheet(); renderMain(); drawStory(); return toast('Leitura corrigida.'); }
  if (action === 'wizard') return openWizard();
  if (action === 'reset') { el.outerHTML = '<span class="vr-note">Isso apaga hábitos, cofre e registros da Virada neste aparelho.</span><button type="button" class="vr-btn vr-btn-danger" data-vr="reset-confirm"><span><b>Apagar de vez</b></span></button>'; return; }
  if (action === 'reset-confirm') { try { localStorage.removeItem(storeKey()); } catch {} load(); closeOverlay(); return; }
  if (action === 'wz-toggle') { wizard.on[id] = !wizard.on[id]; return renderWizard(); }
  if (action === 'wz-packs') { if (!readWizardAmounts()) return; wizard.packsPerDay = Math.max(0.25, Math.min(4, wizard.packsPerDay + Number(value))); return renderWizard(); }
  if (action === 'wz-mode') { wizard.mode[id] = value; return renderWizard(); }
  if (action === 'wz-back') { if (wizard.step === 2 && !readWizardAmounts()) return; wizard.step--; return renderWizard(); }
  if (action === 'wz-next') {
    if (wizard.step === 2 && !readWizardAmounts()) return;
    if (wizard.step < 3) { wizard.step++; return renderWizard(); }
    return finishWizard();
  }
});
document.addEventListener('input', event => {
  if (!root) return;
  const range = event.target.closest('[data-vr-range]');
  if (range?.dataset.vrRange === 'years') {
    years = Number(range.value) || 5;
    const scene = range.closest('.vr-scene'), html = timelineScene(snapshot()), tmp = document.createElement('div'); tmp.innerHTML = html;
    const fresh = tmp.firstElementChild;
    for (const sel of ['.vr-h', '.vr-future', '.vr-track', '.vr-list']) { const a = scene.querySelector(sel), b = fresh.querySelector(sel); if (a && b) a.replaceWith(b); else if (b && !a) scene.querySelector('.vr-future').after(b); else a?.remove(); }
    return;
  }
  if (range?.dataset.vrRange === 'pct' && wizard) { wizard.pct[range.dataset.id] = Number(range.value) / 100; const btn = range.parentElement.querySelector('[data-value="reduzir"]'); if (btn) btn.textContent = `Reduzir ${range.value}%`; return; }
  if (event.target.matches('[data-vr-start]') && wizard) { wizard.start = event.target.value; return; }
  if (event.target.matches('[data-vr-story]')) { profile.story = {...(profile.story || {}), [event.target.dataset.vrStory]: event.target.checked}; save(); drawStory(); return; }
  if (event.target.matches('[data-vr-toggle]')) { profile[event.target.dataset.vrToggle] = event.target.checked; save(); renderMain(); }
});
document.addEventListener('submit', event => {
  const form = event.target.closest('[data-vr-form]'); if (!form || !root) return;
  event.preventDefault();
  const type = form.dataset.vrForm, data = new FormData(form), err = form.querySelector('.vr-error');
  if (type === 'relapse') {
    const habit = data.get('habit'), amount = centsInput(data.get('amount')), date = String(data.get('date'));
    if (!V.VICES[habit] || !Number.isSafeInteger(amount) || amount > 10000000 || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today()) { err.textContent = 'Confira o valor e a data.'; return; }
    profile.logs.push({habit, date, amount, at: Date.now()}); save(); closeSheet(); renderMain();
    return toast('Registrado. Recomeça agora.', 'Uma recaída não desfaz os dias que você já venceu.');
  }
  if (type === 'vault') {
    const amount = centsInput(data.get('amount'));
    if (!Number.isSafeInteger(amount) || amount <= 0 || amount > 10000000) { err.textContent = 'Informe quanto você separou.'; return; }
    profile.vault.push({date: today(), amount}); save(); closeSheet(); renderMain();
    return toast('No cofre.', `${money(amount)} guardados de verdade.`);
  }
  if (type === 'prices') {
    const prices = {}, dreams = [];
    for (const c of V.CATALOG) { const v = centsInput(data.get(c.id)); if (!Number.isSafeInteger(v) || v <= 0 || v > 10000000) { err.textContent = `Confira o preço de ${c.name}.`; return; } if (v !== c.price) prices[c.id] = v; }
    const rows = profile.dreams.map((d, i) => [d, data.get(`dream-name-${i}`), data.get(`dream-target-${i}`)]);
    if (data.get('dream-name-new')) rows.push([{id: `d${Date.now()}`, icon: 'star'}, data.get('dream-name-new'), data.get('dream-target-new')]);
    for (const [d, name, target] of rows) {
      const t = centsInput(target), n = String(name || '').trim().slice(0, 40);
      if (!n || !Number.isSafeInteger(t) || t > 1000000000) { err.textContent = 'Confira nome e valor dos sonhos.'; return; }
      if (t > 0) dreams.push({...d, name: n, target: t});
    }
    profile.prices = prices; profile.dreams = dreams; save(); closeSheet(); renderMain(); drawStory();
    return toast('Valores salvos.');
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && root) { event.preventDefault(); event.stopPropagation(); closeTop(); }
}, true);
document.addEventListener('visibilitychange', () => { if (!document.hidden && root) renderMain(); });

window.JuntoPrivate = Object.freeze({homeHTML, closeTop, isOpen: () => Boolean(root), ready: () => checking});
