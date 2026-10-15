// Server only. OAuth endpoints and scope are fixed; credentials never enter a response/log.
const OAUTH_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const encoder = new TextEncoder();
const base64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const encodeJSON = value => base64url(encoder.encode(JSON.stringify(value)));

export class FcmConfigurationError extends Error {
  constructor() { super('FCM_CONFIGURATION_INVALID'); }
}

export function parseServiceAccount(raw, expectedProject) {
  try {
    const value = JSON.parse(raw);
    if (value.type !== 'service_account' || !/^[a-z][a-z0-9-]{4,62}$/.test(value.project_id) ||
        value.project_id !== expectedProject ||
        !/^[a-zA-Z0-9._-]+@[a-z0-9-]+\.iam\.gserviceaccount\.com$/.test(value.client_email) ||
        typeof value.private_key !== 'string' || value.private_key.length > 16384 ||
        !/^-----BEGIN PRIVATE KEY-----\n[\s\S]+\n-----END PRIVATE KEY-----\s*$/.test(value.private_key) ||
        (value.token_uri && value.token_uri !== OAUTH_URL)) throw new Error();
    return { projectId: value.project_id, clientEmail: value.client_email, privateKey: value.private_key };
  } catch { throw new FcmConfigurationError(); }
}

export function notificationFor(kind) {
  const messages = {
    request: 'Você recebeu um pedido para combinar com seu amor.',
    approved: 'Seu amor respondeu ao seu pedido.',
    declined: 'Seu amor respondeu ao seu pedido.',
    purchased: 'Um combinado foi atualizado.',
    cancelled: 'Um combinado foi atualizado.',
    info: 'Há uma novidade da sua dupla. Abra o Juntô para conferir.'
  };
  if (!Object.hasOwn(messages, kind)) throw new Error('INVALID_EVENT_KIND');
  return { title: 'Juntô', body: messages[kind] };
}

export function createFcmClient(account, { fetchImpl = fetch, now = Date.now, cryptoImpl = crypto } = {}) {
  let cached = null, minting = null, keyPromise = null;
  async function mintToken() {
    try {
      keyPromise ??= cryptoImpl.subtle.importKey('pkcs8', Uint8Array.from(atob(account.privateKey
        .replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '')), c => c.charCodeAt(0)),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
      const issued = Math.floor(now() / 1000);
      const unsigned = encodeJSON({ alg: 'RS256', typ: 'JWT' }) + '.' + encodeJSON({
        iss: account.clientEmail, scope: SCOPE, aud: OAUTH_URL, iat: issued, exp: issued + 3600
      });
      const signature = await cryptoImpl.subtle.sign('RSASSA-PKCS1-v1_5', await keyPromise, encoder.encode(unsigned));
      const response = await fetchImpl(OAUTH_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: unsigned + '.' + base64url(new Uint8Array(signature)) }),
        signal: AbortSignal.timeout(8000)
      });
      if (!response.ok) throw new Error();
      const result = await response.json();
      if (typeof result.access_token !== 'string' || !result.access_token ||
          result.token_type?.toLowerCase() !== 'bearer' || !Number.isFinite(result.expires_in) || result.expires_in <= 60) throw new Error();
      cached = { token: result.access_token, expiresAt: now() + Math.min(result.expires_in, 3600) * 1000 };
      return cached.token;
    } catch { throw new Error('FCM_AUTH_UNAVAILABLE'); }
  }
  async function accessToken() {
    if (cached && cached.expiresAt - now() > 60000) return cached.token;
    if (!minting) minting = mintToken().finally(() => { minting = null; });
    return minting;
  }
  async function send(delivery, token) {
    const message = {
      token: delivery.token,
      notification: notificationFor(delivery.kind),
      data: { event_id: delivery.event_id, notification_id: delivery.notification_id, screen: 'notifications' },
      android: { priority: 'high', ttl: '86400s', notification: {
        channel_id: 'junto_avisos', icon: 'ic_junto_push', tag: delivery.event_id, visibility: 'PRIVATE'
      } }
    };
    try {
      const response = await fetchImpl('https://fcm.googleapis.com/v1/projects/' + account.projectId + '/messages:send', {
        method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }), signal: AbortSignal.timeout(10000)
      });
      const body = await response.json().catch(() => null);
      if (response.ok) {
        if (typeof body?.name !== 'string' || !body.name.startsWith('projects/' + account.projectId + '/messages/')) {
          return { outcome: 'unknown', code: 'FCM_RESPONSE_INVALID' };
        }
        return { outcome: 'accepted', code: null };
      }
      const code = body?.error?.details?.find(d => d['@type'] === 'type.googleapis.com/google.firebase.fcm.v1.FcmError')?.errorCode;
      // INVALID_ARGUMENT can be a malformed payload: it must not revoke a valid device.
      if (response.status === 404 && code === 'UNREGISTERED') return { outcome: 'failed', code: 'UNREGISTERED', revoke: true };
      if (response.status >= 500 || response.status === 408) return { outcome: 'unknown', code: 'FCM_DELIVERY_UNCERTAIN' };
      return { outcome: 'failed', code: 'FCM_REJECTED' };
    } catch { return { outcome: 'unknown', code: 'FCM_DELIVERY_UNCERTAIN' }; }
  }
  return { accessToken, send };
}
