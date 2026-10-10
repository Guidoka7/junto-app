// Firebase Cloud Messaging no APK (Capacitor 8).
// Não faz envio no cliente. Tokens são registrados no Supabase apenas após login e consentimento.
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

const nativeAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
const configured = nativeAndroid && window.JuntoCloudConfig?.pushEnabled === true;
const OPT_IN = 'junto-push-opt-in-v1';
const DEVICE_ID = 'junto-push-device-id-v1';
let userId = null;
let currentToken = null;
let listenersReady = false;
let registering = false;
let pendingOpen = false;
let lastSaved = { userId: null, token: null, at: 0 };
let status = configured ? 'Desativadas neste aparelho' : 'Firebase ainda não configurado neste APK';
const optedIn = () => localStorage.getItem(OPT_IN) === 'yes';

function deviceId() {
  let value = localStorage.getItem(DEVICE_ID);
  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID, value);
  }
  return value;
}

function setStatus(value) {
  status = value;
  const el = document.getElementById('junto-push-status');
  if (el) el.textContent = value;
}

async function authInfo() {
  const uid = window.JuntoCloud?.getUserId?.();
  const accessToken = await window.JuntoCloud?.getAccessToken?.();
  if (!uid || !accessToken || uid !== userId) throw new Error('Entre no Juntô para ativar as notificações.');
  return { uid, accessToken };
}

async function storeToken(token) {
  if (!configured || !optedIn() || !token || !userId) return;
  const { uid, accessToken } = await authInfo();
  if (lastSaved.userId === uid && lastSaved.token === token && Date.now() - lastSaved.at < 86400000) {
    setStatus('Ativas neste aparelho · conectado');
    return;
  }
  const url = window.JuntoCloudConfig.url + '/rest/v1/junto_push_devices?on_conflict=user_id,device_id';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: window.JuntoCloudConfig.publishableKey,
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify({
      user_id: uid, device_id: deviceId(), token, platform: 'android',
      enabled: true, updated_at: new Date().toISOString()
    })
  });
  if (!response.ok) throw new Error(response.status === 404 || response.status === 400
    ? 'Execute a configuração de dispositivos push no Supabase.'
    : 'O token não pôde ser salvo no Supabase (HTTP ' + response.status + ').');
  if (userId === uid) {
    lastSaved = { userId: uid, token, at: Date.now() };
    setStatus('Ativas neste aparelho · conectado');
  }
}

async function saveRegisteredToken(token) {
  currentToken = token;
  try { await storeToken(token); }
  catch (error) { setStatus('Firebase conectado · ' + error.message); }
}

async function openFromPush() {
  if (!pendingOpen || !userId || !window.JuntoApp?.hasAccess?.()) return;
  pendingOpen = false;
  try { await window.JuntoCloud?.synchronize?.(); } catch { /* A tela usa os dados disponíveis. */ }
  document.querySelector('[data-action="notifications"]')?.click();
}

async function initListeners() {
  if (!configured || listenersReady) return;
  listenersReady = true;
  await PushNotifications.addListener('registration', ({ value }) => { void saveRegisteredToken(value); });
  await PushNotifications.addListener('registrationError', () => {
    setStatus('Falha no registro do Firebase · tente novamente');
  });
  await PushNotifications.addListener('pushNotificationReceived', () => {
    void window.JuntoCloud?.synchronize?.();
  });
  await PushNotifications.addListener('pushNotificationActionPerformed', () => {
    pendingOpen = true;
    void openFromPush();
  });
}

async function register(interactive = false) {
  if (!configured) throw new Error('Este APK ainda não contém a configuração do Firebase.');
  if (!userId) throw new Error('Entre na sua conta do Juntô primeiro.');
  if (registering) return;
  registering = true;
  try {
    await initListeners();
    let permission = await PushNotifications.checkPermissions();
    if (interactive && permission.receive !== 'granted') {
      permission = await PushNotifications.requestPermissions();
    }
    if (permission.receive !== 'granted') {
      setStatus('Permissão de notificações desativada no Android');
      return;
    }
    try {
      await PushNotifications.createChannel({
        id: 'junto_avisos', name: 'Avisos do Juntô',
        description: 'Pedidos, respostas e lembretes do Juntô',
        importance: 4, visibility: 1, vibration: true
      });
    } catch { /* Android anterior ao 8 usa o canal padrão. */ }
    if (interactive) localStorage.setItem(OPT_IN, 'yes');
    if (!optedIn()) return;
    setStatus('Aguardando token do Firebase…');
    await PushNotifications.register();
  } finally { registering = false; }
}

async function removeDevice() {
  const { accessToken } = await authInfo();
  const url = window.JuntoCloudConfig.url + '/rest/v1/junto_push_devices?device_id=eq.' + encodeURIComponent(deviceId());
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { apikey: window.JuntoCloudConfig.publishableKey, Authorization: 'Bearer ' + accessToken }
  });
  if (!response.ok) throw new Error('Não foi possível desvincular o aparelho (HTTP ' + response.status + ').');
}

async function unlink() {
  if (!nativeAndroid || !configured) return;
  try { if (userId) await removeDevice(); } finally {
    // Invalida o token local mesmo se a remoção remota falhar, para evitar envio ao usuário anterior.
    try { await PushNotifications.unregister(); } catch { /* Sem token válido. */ }
    currentToken = null;
    lastSaved = { userId: null, token: null, at: 0 };
  }
}

async function disable() {
  localStorage.removeItem(OPT_IN);
  try { await unlink(); setStatus('Desativadas neste aparelho'); }
  catch (error) { setStatus('Desativadas neste aparelho · ' + error.message); }
}

function settingsHTML() {
  if (!nativeAndroid) return '';
  const ready = Boolean(userId) && configured;
  const active = optedIn();
  return '<div class="feature-card"><div><span class="feature-eyebrow">Avisos no celular</span>' +
    '<h3>Notificações do Juntô</h3>' +
    '<p id="junto-push-status">' + status + '</p></div>' +
    (active ? '<button class="btn secondary" data-feature="push-disable">Desativar neste aparelho</button>'
      : '<button class="btn primary" data-feature="push-activate"' + (ready ? '' : ' disabled') + '>Ativar notificações</button>') +
    '</div>';
}

window.addEventListener('junto:auth-changed', event => {
  const next = event.detail?.userId || null;
  if (next !== userId) {
    currentToken = null;
    lastSaved = { userId: null, token: null, at: 0 };
  }
  userId = next;
  if (userId && optedIn()) void register(false).catch(() => setStatus('Não foi possível registrar este aparelho.'));
  void openFromPush();
});
window.addEventListener('junto:native-resume', () => {
  if (configured && userId && optedIn()) void register(false).catch(() => {});
  void openFromPush();
});
document.addEventListener('click', async event => {
  const button = event.target.closest('[data-feature="push-activate"],[data-feature="push-disable"]');
  if (!button) return;
  event.preventDefault();
  button.disabled = true;
  try {
    if (button.dataset.feature === 'push-activate') await register(true);
    else await disable();
  } catch (error) { setStatus(error.message || 'Falha ao configurar notificações.'); }
  // Reabre os ajustes para refletir o estado sem trocar a navegação do aplicativo.
  document.querySelector('[data-action="settings"]')?.click();
});
window.JuntoPush = { settingsHTML, unlink, isConfigured: () => configured };
