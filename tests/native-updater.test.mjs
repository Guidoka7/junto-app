import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const java=readFileSync(new URL('../android/app/src/main/java/br/com/junto/app/JuntoUpdaterPlugin.java',import.meta.url),'utf8');
const manifest=readFileSync(new URL('../android/app/src/main/AndroidManifest.xml',import.meta.url),'utf8');
const ui=readFileSync(new URL('../src/js/updates.js',import.meta.url),'utf8');

test('instalador nativo baixa no cache do Juntô, verifica integridade e abre apenas Package Installer',()=>{
  assert.match(java,/downloadAndInstall\(PluginCall call\)/);
  assert.match(java,/getCacheDir\(\)/);
  assert.match(java,/HttpURLConnection/);
  assert.match(java,/SHA-256/);
  assert.match(java,/sha256\(target\)/);
  assert.match(java,/approvedDownload\(url\)/);
  assert.match(java,/approvedRedirect\(url\)/);
  assert.match(java,/verifyPackage\(target\)/);
  assert.match(java,/Arrays\.equals\(oldCerts, newCerts\)/);
  assert.match(java,/FileProvider\.getUriForFile/);
  assert.match(java,/Intent\.ACTION_VIEW/);
  assert.match(java,/APPLICATION_ID|packageName|applicationId/i);
  assert.match(java,/canRequestPackageInstalls\(\)/);
  assert.match(java,/ACTION_MANAGE_UNKNOWN_APP_SOURCES/);
  assert.match(java,/downloadProgress/);
  // Capacitor mapeia 5.000.000 para Integer, não Long: não usar getLong isoladamente.
  assert.match(java,/getData\(\)\.opt\("apkSize"\)/);
  assert.doesNotMatch(java,/call\.getLong\("apkSize"\)/);
  assert.doesNotMatch(java,/CATEGORY_BROWSABLE|Intent\.ACTION_SEND|\.openDownload\(/);
  assert.match(manifest,/REQUEST_INSTALL_PACKAGES/);
});

test('modal baixa e instala dentro do app, oferece progresso e não abre browser nem GitHub',()=>{
  assert.match(ui,/downloadAndInstall\(/);
  assert.match(ui,/installDownloaded\(/);
  assert.match(ui,/downloadProgress/);
  assert.match(ui,/update-cancel/);
  assert.match(ui,/update-install/);
  assert.doesNotMatch(ui,/window\.open\(|\.openDownload\(/);
  assert.match(ui,/Baixar e instalar dentro do app/);
});
