// Verificação rápida antes de publicar: arquivos obrigatórios e sintaxe dos scripts.
import { access, readdir, readFile } from 'node:fs/promises';
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
// Impede publicar controles visuais sem fluxo correspondente.
try {
  const app = await readFile(join(root, 'src/js/app.js'), 'utf8');
  const unique = xs => [...new Set(xs)].sort();
  const actions = unique([...app.matchAll(/data-action=["'`]([^"'`$<>{}\s]+)["'`]/g)].map(m => m[1]));
  const actionHandlers = unique([...app.matchAll(/action===['"]([^'"]+)['"]/g)].map(m => m[1]));
  const missingActions = actions.filter(a => !actionHandlers.includes(a));
  if (missingActions.length) {
    console.error('✗ botões sem handler:', missingActions.join(', '));
    ok = false;
  } else {
    console.log(`✓ ${actions.length} ações estáticas têm handler`);
  }

  const forms = unique([...app.matchAll(/data-form=["'`]([^"'`$<>{}\s]+)["'`]/g)].map(m => m[1]));
  const formHandlers = unique([...app.matchAll(/type===['"]([^'"]+)['"]/g)].map(m => m[1]));
  const missingForms = forms.filter(name => !formHandlers.includes(name));
  if (missingForms.length) {
    console.error('✗ formulários sem submit handler:', missingForms.join(', '));
    ok = false;
  } else {
    console.log(`✓ ${forms.length} formulários estáticos têm submit handler`);
  }
} catch (e) {
  console.error('✗ não foi possível auditar ações e formulários:', e.message);
  ok = false;
}

if (!ok) process.exit(1);
console.log('✓ tudo certo');
