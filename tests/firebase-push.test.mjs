import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('Capacitor 8: plugin push registrado e pinado no lockfile', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  assert.equal(pkg.dependencies['@capacitor/push-notifications'], '8.0.0');
  assert.equal(lock.packages[''].dependencies['@capacitor/push-notifications'], '8.0.0');
  assert.equal(lock.packages['node_modules/@capacitor/push-notifications'].version, '8.0.0');
});

test('o cliente push exige login, permissão e consentimento', () => {
  const src = read('src/js/push.js');
  for (const word of ['getAccessToken', 'getUserId', 'checkPermissions', 'requestPermissions', 'OPT_IN']) {
    assert.ok(src.includes(word), word);
  }
  assert.ok(src.includes('if (!configured || !optedIn() || !token || !userId) return'));
  assert.ok(src.includes('PushNotifications.unregister()'));
});

test('tabela de tokens protegida por RLS por conta', () => {
  const sql = read('supabase/push-devices.sql');
  assert.match(sql, /enable row level security/i);
  for (const operation of ['select', 'insert', 'update', 'delete']) {
    assert.match(sql, new RegExp('for ' + operation + ' to authenticated', 'i'));
  }
  assert.match(sql, /user_id\s*=\s*\(select auth\.uid\(\)\)/i);
  assert.match(sql, /revoke all on public\.junto_push_devices from public, anon, authenticated/i);
});

test('build não permite push habilitado sem JSON do pacote correto', () => {
  const build = read('scripts/build.mjs');
  const action = read('.github/workflows/android.yml');
  assert.ok(build.includes('JUNTO_PUSH_ENABLED'));
  assert.ok(build.includes('google-services.json'));
  assert.ok(build.includes('br.com.junto.app'));
  assert.ok(action.includes('secrets.FIREBASE_GOOGLE_SERVICES_JSON_BASE64'));
});
