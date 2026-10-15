import { createFcmClient, parseServiceAccount } from './fcm.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const KINDS = new Set(['info', 'request', 'approved', 'declined', 'purchased', 'cancelled']);

export function createRepository(env, fetchImpl = fetch) {
  const base = env('SUPABASE_URL');
  if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(base || '')) throw new Error('BACKEND_UNAVAILABLE');
  let publishable, service;
  try {
    publishable = JSON.parse(env('SUPABASE_PUBLISHABLE_KEYS') || '{}').default || env('SUPABASE_ANON_KEY');
    service = JSON.parse(env('SUPABASE_SECRET_KEYS') || '{}').default || env('SUPABASE_SERVICE_ROLE_KEY');
  } catch { throw new Error('BACKEND_UNAVAILABLE'); }
  if (typeof publishable !== 'string' || !publishable || typeof service !== 'string' || !service) throw new Error('BACKEND_UNAVAILABLE');
  const serviceBearer = service.startsWith('sb_secret_') ? null : service;
  async function request(path, key, bearer, body) {
    const response = await fetchImpl(base + path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { apikey: key, ...(bearer ? { Authorization: 'Bearer ' + bearer } : {}), 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error('BACKEND_UNAVAILABLE');
    return response.json();
  }
  return {
    async authenticate(token) {
      const response = await fetchImpl(base + '/auth/v1/user', {
        headers: { apikey: publishable, Authorization: 'Bearer ' + token }, signal: AbortSignal.timeout(8000)
      });
      if (response.status === 401 || response.status === 403) return null;
      if (!response.ok) throw new Error('BACKEND_UNAVAILABLE');
      return response.json();
    },
    async membership(userId, token) {
      const rows = await request('/rest/v1/junto_members?select=space_id,slot&user_id=eq.' + userId, publishable, token);
      return rows.length === 1 ? rows[0] : null;
    },
    claim: (spaceId, actorId, sessionId) => request('/rest/v1/rpc/junto_push_claim', service, serviceBearer, { p_space_id: spaceId, p_actor_id: actorId, p_session_id: sessionId }),
    active: delivery => request('/rest/v1/rpc/junto_push_active', service, serviceBearer, { p_delivery_id: delivery.delivery_id, p_claim_id: delivery.claim_id }),
    finish: (delivery, result) => request('/rest/v1/rpc/junto_push_finish', service, serviceBearer, {
      p_delivery_id: delivery.delivery_id, p_claim_id: delivery.claim_id,
      p_outcome: result.outcome, p_code: result.code, p_revoke: result.revoke === true
    })
  };
}

export function createHandler({ env, repository, fcmFactory = createFcmClient }) {
  let fcm;
  const allowedOrigins = new Set((env('JUNTO_PUSH_ALLOWED_ORIGINS') ||
    'https://junto-app-tan.vercel.app,https://localhost,capacitor://localhost').split(',').map(s => s.trim()));
  return async request => {
    const origin = request.headers.get('Origin');
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin' };
    if (origin && allowedOrigins.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
    const reply = (status, value) => new Response(JSON.stringify(value), { status, headers });
    if (origin && !allowedOrigins.has(origin)) return reply(403, { error: 'ORIGIN_DENIED' });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
      ...headers, 'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info'
    } });
    if (request.method !== 'POST') return reply(405, { error: 'METHOD_NOT_ALLOWED' });
    const bearer = /^Bearer ([A-Za-z0-9_.-]+)$/.exec(request.headers.get('Authorization') || '')?.[1];
    if (!bearer) return reply(401, { error: 'LOGIN_REQUIRED' });
    try {
      const user = await repository.authenticate(bearer);
      if (!user || !UUID.test(user.id)) return reply(401, { error: 'LOGIN_REQUIRED' });
      if (user.is_anonymous === true) return reply(403, { error: 'ACCOUNT_REQUIRED' });
      // Read claims only after Auth validated this bearer; metadata never authorizes a send.
      let claims;
      try { claims = JSON.parse(atob(bearer.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch { return reply(401, { error: 'LOGIN_REQUIRED' }); }
      if (claims.sub !== user.id || claims.role !== 'authenticated' || !UUID.test(claims.session_id) ||
          !Number.isFinite(claims.exp) || claims.exp * 1000 <= Date.now()) return reply(401, { error: 'LOGIN_REQUIRED' });
      if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return reply(415, { error: 'JSON_REQUIRED' });
      // Read with a strict cap rather than trusting Content-Length.
      const reader = request.body?.getReader();
      if (!reader) return reply(400, { error: 'INVALID_REQUEST' });
      let size = 0, text = '';
      const decoder = new TextDecoder();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 1024) { await reader.cancel(); return reply(413, { error: 'REQUEST_TOO_LARGE' }); }
        text += decoder.decode(value, { stream: true });
      }
      text += decoder.decode();
      let body;
      try { body = JSON.parse(text); } catch { return reply(400, { error: 'INVALID_REQUEST' }); }
      if (!body || Array.isArray(body) || Object.keys(body).length !== 1 || !UUID.test(body.spaceId)) {
        return reply(400, { error: 'INVALID_REQUEST' });
      }
      const member = await repository.membership(user.id, bearer);
      if (member?.space_id !== body.spaceId || !['a', 'b'].includes(member?.slot)) return reply(403, { error: 'ACCESS_DENIED' });
      if (env('JUNTO_FCM_ENABLED') !== 'true') return reply(503, { error: 'PUSH_NOT_ENABLED' });
      try {
        fcm ??= fcmFactory(parseServiceAccount(env('FIREBASE_SERVICE_ACCOUNT_JSON'), env('FIREBASE_PROJECT_ID')));
      } catch { return reply(503, { error: 'FCM_CONFIGURATION_INVALID' }); }
      // Verify OAuth before consuming any delivery in the persistent dedupe ledger.
      let accessToken;
      try { accessToken = await fcm.accessToken(); } catch { return reply(503, { error: 'FCM_AUTH_UNAVAILABLE' }); }
      const deliveries = await repository.claim(body.spaceId, user.id, claims.session_id);
      const counts = { accepted: 0, failed: 0, unknown: 0, skipped: 0 };
      async function deliver(delivery) {
        if (!UUID.test(delivery.delivery_id) || !UUID.test(delivery.claim_id) || !UUID.test(delivery.event_id) ||
            !KINDS.has(delivery.kind) || typeof delivery.notification_id !== 'string' ||
            typeof delivery.token !== 'string' || !delivery.token) throw new Error('BACKEND_UNAVAILABLE');
        let result;
        try {
          if (await repository.active(delivery) !== true) result = { outcome: 'skipped', code: 'RECIPIENT_INACTIVE' };
          else result = await fcm.send(delivery, accessToken);
          if (!Object.hasOwn(counts, result.outcome)) throw new Error();
          if (await repository.finish(delivery, result) !== true) throw new Error();
        } catch {
          // Never repeat a consumed send after an ambiguous network/database failure.
          result = { outcome: 'unknown', code: 'FCM_DELIVERY_UNCERTAIN' };
          try { await repository.finish(delivery, result); } catch { /* Processing rows are never reclaimed. */ }
        }
        counts[result.outcome]++;
      }
      // Bound simultaneous FCM requests and stay below the Edge Function wall-clock limit.
      let cursor = 0;
      await Promise.all(Array.from({ length: Math.min(3, deliveries.length) }, async () => {
        while (cursor < deliveries.length) await deliver(deliveries[cursor++]);
      }));
      return reply(200, counts);
    } catch { return reply(503, { error: 'BACKEND_UNAVAILABLE' }); }
  };
}
