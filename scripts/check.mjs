// Verificação rápida antes de publicar: arquivos obrigatórios e sintaxe dos scripts.
import { access, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const must = ['src/index.html', 'src/css/app.css', 'src/css/mobile-compact.css', 'src/js/app.js', 'src/manifest.webmanifest', 'src/sw.js', 'src/icons/icon-512.png', 'capacitor.config.json'];
let ok = true;
for (const f of must) {
  try { await access(join(root, f)); } catch { console.error(`✗ falta ${f}`); ok = false; }
}
for (const f of await readdir(join(root, 'src/js'))) {
  try { execFileSync(process.execPath, ['--check', join(root, 'src/js', f)], { stdio: 'pipe' }); console.log(`✓ ${f}`); }
  catch (e) { console.error(`✗ erro de sintaxe em ${f}\n${e.stderr}`); ok = false; }
}
if (!ok) process.exit(1);
console.log('✓ tudo certo');
