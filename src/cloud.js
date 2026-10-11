/* ============================================================
   Conta e progresso na nuvem (Supabase)
   Sem biblioteca: fala direto com a API de Auth e REST do Supabase.
   O app continua 100% funcional sem conta e sem internet; a nuvem
   só guarda uma cópia do progresso e junta com o do aparelho.
   ============================================================ */
const SB = V.sb && V.sb.url && V.sb.key ? V.sb : null;
const AKEY = 'cinecode.auth';
let AUTH = (() => { try { return JSON.parse(localStorage.getItem(AKEY) || 'null'); } catch (e) { return null; } })();
const CLOUD = { syncing: false, last: null, error: null, timer: null, pending: false };
const saveAuth = () => { try { AUTH ? localStorage.setItem(AKEY, JSON.stringify(AUTH)) : localStorage.removeItem(AKEY); } catch (e) {} };
const cloudUser = () => (SB && AUTH ? AUTH.user : null);

const PT_ERR = [
  [/invalid login credentials/i, 'E-mail ou senha incorretos.'],
  [/email not confirmed/i, 'Confirme seu e-mail pelo link que enviamos e depois toque em Entrar.'],
  [/already registered|already been registered|user already exists/i, 'Esse e-mail já tem conta. Use “Entrar”.'],
  [/password should be at least|weak password/i, 'A senha precisa ter pelo menos 6 caracteres.'],
  [/unable to validate email|invalid email|email address .* is invalid/i, 'Esse e-mail não parece válido.'],
  [/rate limit|too many/i, 'Muitas tentativas. Espere um pouco e tente de novo.'],
  [/failed to fetch|network/i, 'Sem conexão com a internet.']
];
const ptErr = m => { for (const [re, t] of PT_ERR) if (re.test(m)) return t; return m; };

async function sbRaw(path, body, method = 'POST', token) {
  const h = { apikey: SB.key, 'Content-Type': 'application/json' };
  if (token) h.Authorization = 'Bearer ' + token;
  let r;
  try { r = await fetch(SB.url + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined }); }
  catch (e) { throw new Error('Sem conexão com a internet.'); }
  const txt = await r.text();
  let j = null; try { j = txt ? JSON.parse(txt) : null; } catch (e) {}
  if (!r.ok) { const e = new Error(ptErr((j && (j.msg || j.error_description || j.message || j.error)) || 'Erro ' + r.status)); e.status = r.status; throw e; }
  return j;
}
function setSession(j) {
  AUTH = { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + (j.expires_in || 3600) * 1000, user: { id: j.user.id, email: j.user.email } };
  saveAuth();
}
async function token() {
  if (!AUTH) throw new Error('Entre na sua conta.');
  if (Date.now() > AUTH.expires_at - 60000) {
    try { setSession(await sbRaw('/auth/v1/token?grant_type=refresh_token', { refresh_token: AUTH.refresh_token })); }
    catch (e) { if (e.status >= 400 && e.status < 500) { AUTH = null; saveAuth(); } throw e; }
  }
  return AUTH.access_token;
}

/* ---------- juntar o progresso do aparelho com o da nuvem ---------- */
function mergeState(a, b) {
  if (!b || typeof b !== 'object') return a;
  const out = Object.assign({}, b, a);
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[k], y = b[k];
    if (y === undefined) continue;
    if (x === undefined || x === null || x === '' ) { out[k] = y; continue; }
    if (k === 'done') {
      const d = Object.assign({}, y);
      for (const [id, v] of Object.entries(x)) { const w = d[id]; if (!w || (v.nota ?? 0) >= (w.nota ?? 0)) d[id] = v; }
      out.done = d;
    } else if (k === 'streak') {
      out.streak = (y.last || '') > (x.last || '') ? y : x;
    } else if (typeof x === 'number' && typeof y === 'number') {
      out[k] = Math.max(x, y);
    } else if (Array.isArray(x) && Array.isArray(y)) {
      const seen = new Set(), arr = [];
      for (const v of [...x, ...y]) { const key = JSON.stringify(v); if (!seen.has(key)) { seen.add(key); arr.push(v); } }
      out[k] = arr;
    } else if (x && y && typeof x === 'object' && typeof y === 'object') {
      out[k] = Object.assign({}, y, x);
    } else if (typeof x === 'boolean') {
      out[k] = x || y;
    }
  }
  return out;
}

async function cloudPull(quiet) {
  if (!cloudUser()) return;
  CLOUD.syncing = true; paintCloud();
  try {
    const tk = await token();
    const rows = await sbRaw(`/rest/v1/progress?user_id=eq.${AUTH.user.id}&select=state,updated_at`, null, 'GET', tk);
    if (rows && rows[0] && rows[0].state) {
      const merged = mergeState(S, rows[0].state);
      Object.keys(S).forEach(k => { if (!(k in merged)) delete S[k]; });
      Object.assign(S, merged);
      try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
    }
    await cloudPush(true);
    if (!quiet) toast('Progresso sincronizado');
    try { render(current); } catch (e) {}
  } catch (e) {
    CLOUD.error = e.message;
    if (!quiet) toast(e.message);
  } finally { CLOUD.syncing = false; paintCloud(); }
}
async function cloudPush(now) {
  if (!cloudUser()) return;
  clearTimeout(CLOUD.timer);
  const run = async () => {
    try {
      const tk = await token();
      await fetch(SB.url + '/rest/v1/progress?on_conflict=user_id', {
        method: 'POST',
        headers: { apikey: SB.key, Authorization: 'Bearer ' + tk, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ user_id: AUTH.user.id, state: S, xp: S.xp || 0, lessons_done: Object.keys(S.done || {}).length })
      }).then(r => { if (!r.ok) throw new Error('Erro ' + r.status); });
      CLOUD.last = new Date(); CLOUD.error = null; CLOUD.pending = false;
    } catch (e) { CLOUD.error = e.message; CLOUD.pending = true; }
    paintCloud();
  };
  if (now) return run();
  CLOUD.pending = true;
  CLOUD.timer = setTimeout(run, 2500);
}
onSave = () => { if (cloudUser()) cloudPush(false); };
window.addEventListener('online', () => { if (cloudUser() && CLOUD.pending) cloudPush(true); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && cloudUser() && CLOUD.pending) cloudPush(true); });

/* ---------- tela de conta (aba Perfil) ---------- */
function cloudStatus() {
  if (CLOUD.syncing) return 'Sincronizando…';
  if (CLOUD.error) return 'Não sincronizou: ' + CLOUD.error;
  if (CLOUD.last) return 'Salvo na nuvem às ' + CLOUD.last.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return 'Conectado';
}
function cloudPanel() {
  if (!SB) return '';
  const u = cloudUser();
  if (u) {
    return `<section class="panel cloud" id="cloudbox">
      <div class="section-h"><h2>Sua conta</h2></div>
      <p class="small">Conectado como <b>${esc(u.email)}</b></p>
      <p class="small muted" data-cloud-status>${esc(cloudStatus())}</p>
      <div class="row-btns"><button class="btn" data-cloud="sync">Sincronizar agora</button><button class="btn ghost" data-cloud="logout">Sair</button></div>
    </section>`;
  }
  return `<section class="panel cloud" id="cloudbox">
    <div class="section-h"><h2>Crie sua conta grátis</h2></div>
    <p class="small muted">Salve o progresso na nuvem e continue de onde parou no celular, no tablet ou no computador.</p>
    <form data-cloud-form autocomplete="on" novalidate>
      <div class="field"><label for="ce">E-mail</label><input id="ce" type="email" name="email" autocomplete="email" inputmode="email" required></div>
      <div class="field"><label for="cp">Senha</label><input id="cp" type="password" name="password" autocomplete="current-password" minlength="6" required></div>
      <p class="small" data-cloud-msg role="status" aria-live="polite"></p>
      <div class="row-btns"><button class="btn primary" type="submit" data-cloud="login">Entrar</button><button class="btn" type="button" data-cloud="signup">Criar conta</button></div>
      <button class="btn ghost small" type="button" data-cloud="forgot">Esqueci a senha</button>
    </form>
  </section>`;
}
function paintCloud() {
  const st = document.querySelector('[data-cloud-status]');
  if (st) st.textContent = cloudStatus();
}
function cloudMsg(t, bad) { const m = document.querySelector('[data-cloud-msg]'); if (m) { m.textContent = t; m.style.color = bad ? 'var(--bad)' : ''; } }
async function cloudAction(act) {
  const f = document.querySelector('[data-cloud-form]');
  const email = f ? f.email.value.trim() : '', password = f ? f.password.value : '';
  const busy = on => document.querySelectorAll('[data-cloud]').forEach(b => { b.disabled = on; });
  try {
    if (act === 'login' || act === 'signup') {
      if (!/^\S+@\S+\.\S+$/.test(email)) return cloudMsg('Digite um e-mail válido.', true);
      if (password.length < 6) return cloudMsg('A senha precisa ter pelo menos 6 caracteres.', true);
      busy(true); cloudMsg(act === 'login' ? 'Entrando…' : 'Criando sua conta…');
      if (act === 'login') {
        setSession(await sbRaw('/auth/v1/token?grant_type=password', { email, password }));
      } else {
        const j = await sbRaw('/auth/v1/signup', { email, password, data: { name: S.name || '' } });
        if (j && j.access_token) setSession(j);
        else { busy(false); return cloudMsg('Conta criada! Abra o e-mail que enviamos, confirme e depois toque em “Entrar”.'); }
      }
      render(current);
      await cloudPull(false);
    } else if (act === 'forgot') {
      if (!/^\S+@\S+\.\S+$/.test(email)) return cloudMsg('Digite seu e-mail acima e toque de novo em “Esqueci a senha”.', true);
      busy(true);
      await sbRaw('/auth/v1/recover', { email });
      cloudMsg('Se esse e-mail tiver conta, enviamos um link para criar uma nova senha.');
    } else if (act === 'sync') {
      await cloudPull(false);
    } else if (act === 'logout') {
      if (CLOUD.pending) await cloudPush(true);
      try { await sbRaw('/auth/v1/logout', null, 'POST', AUTH.access_token); } catch (e) {}
      AUTH = null; saveAuth();
      toast('Você saiu da conta. O progresso continua neste aparelho.');
      render(current);
    }
  } catch (e) { cloudMsg(e.message, true); }
  finally { busy(false); }
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-cloud]');
  if (!b || !SB) return;
  e.preventDefault();
  cloudAction(b.dataset.cloud);
});
document.addEventListener('submit', e => {
  if (!e.target.matches('[data-cloud-form]')) return;
  e.preventDefault();
  cloudAction('login');
});
if (SB && AUTH) setTimeout(() => cloudPull(true), 1200);
