// Juntô · emissor de push (Firebase Cloud Messaging HTTP v1).
// Chamado pelo app logo depois de sincronizar. Só envia avisos que já estão salvos no
// espaço da dupla, para a outra pessoa do mesmo espaço, uma única vez por aviso.
// Secrets necessários na Edge Function: FIREBASE_SERVICE_ACCOUNT (JSON da conta de serviço).
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já existem no ambiente das Edge Functions.
import {createClient} from 'npm:@supabase/supabase-js@2.117.2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {status, headers: {...cors, 'Content-Type': 'application/json'}});
const MAX_AGE_MS = 6 * 3600 * 1000;

type ServiceAccount = {project_id: string; client_email: string; private_key: string};
let cachedToken: {value: string; exp: number} | null = null;

function b64url(data: ArrayBuffer | string) {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
  let bin = ''; for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function accessToken(sa: ServiceAccount) {
  if (cachedToken && cachedToken.exp > Date.now() + 60000) return cachedToken.value;
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({alg: 'RS256', typ: 'JWT'}));
  const claims = b64url(JSON.stringify({iss: sa.client_email, scope: 'https://www.googleapis.com/auth/firebase.messaging', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600}));
  const pem = sa.private_key.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const der = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, {name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256'}, false, ['sign']);
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${header}.${claims}`));
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${header}.${claims}.${b64url(signature)}`}),
  });
  if (!response.ok) throw new Error(`OAUTH_${response.status}`);
  const data = await response.json();
  cachedToken = {value: data.access_token, exp: Date.now() + (data.expires_in || 3600) * 1000};
  return cachedToken.value;
}
const clip = (text: unknown, max: number) => String(text ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', {headers: cors});
  if (req.method !== 'POST') return json({error: 'METHOD'}, 405);
  const raw = Deno.env.get('FIREBASE_SERVICE_ACCOUNT');
  if (!raw) return json({error: 'PUSH_NOT_CONFIGURED'}, 503);
  let sa: ServiceAccount;
  try { sa = JSON.parse(raw); if (!sa.project_id || !sa.client_email || !sa.private_key) throw 0; }
  catch { return json({error: 'PUSH_NOT_CONFIGURED'}, 503); }

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {auth: {persistSession: false}});
  const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const {data: auth, error: authError} = await admin.auth.getUser(jwt);
  if (authError || !auth?.user) return json({error: 'LOGIN_REQUIRED'}, 401);

  let ids: string[] = [];
  try { const body = await req.json(); ids = (Array.isArray(body?.ids) ? body.ids : []).map(String).filter((x: string) => x.length > 0 && x.length <= 80).slice(0, 20); }
  catch { return json({error: 'INVALID_PAYLOAD'}, 400); }
  if (!ids.length) return json({sent: 0});

  const {data: me} = await admin.from('junto_members').select('space_id, slot').eq('user_id', auth.user.id).maybeSingle();
  if (!me) return json({error: 'ACCESS_DENIED'}, 403);
  const [{data: members}, {data: snapshot}] = await Promise.all([
    admin.from('junto_members').select('user_id, slot').eq('space_id', me.space_id),
    admin.from('junto_snapshots').select('payload').eq('space_id', me.space_id).maybeSingle(),
  ]);
  const notices = Array.isArray(snapshot?.payload?.notifications) ? snapshot.payload.notifications : [];
  let sent = 0, skipped = 0;
  for (const id of ids) {
    // O texto vem do espaço salvo no servidor, nunca do pedido: o cliente não injeta mensagens.
    const notice = notices.find((n: any) => n?.id === id);
    if (!notice || notice.read || notice.to === me.slot || !['a', 'b'].includes(notice.to) || Date.now() - Number(notice.createdAt || 0) > MAX_AGE_MS) { skipped++; continue; }
    const recipient = members?.find(m => m.slot === notice.to);
    if (!recipient) { skipped++; continue; }
    const {error: dup} = await admin.from('junto_push_log').insert({space_id: me.space_id, notification_id: id, recipient: recipient.user_id});
    if (dup) { skipped++; continue; } // já enviado (chave única)
    const {data: devices} = await admin.from('junto_push_devices').select('token').eq('user_id', recipient.user_id).eq('enabled', true);
    if (!devices?.length) continue;
    const bearer = await accessToken(sa);
    for (const {token} of devices) {
      const response = await fetch(`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`, {
        method: 'POST', headers: {Authorization: `Bearer ${bearer}`, 'Content-Type': 'application/json'},
        body: JSON.stringify({message: {token,
          notification: {title: clip(notice.title, 80) || 'Juntô', body: clip(notice.body, 160) || 'Você tem um aviso novo.'},
          data: {kind: 'junto-notice', notification_id: id},
          android: {priority: 'HIGH', notification: {channel_id: 'junto_avisos', icon: 'ic_junto_push', color: '#19233A', visibility: 'PRIVATE', tag: id}}}}),
      });
      if (response.ok) { sent++; continue; }
      const detail = await response.text();
      // Token desinstalado ou inválido: remove para não tentar de novo.
      if (response.status === 404 || /UNREGISTERED|INVALID_ARGUMENT/.test(detail)) await admin.from('junto_push_devices').delete().eq('token', token);
    }
  }
  return json({sent, skipped});
});
