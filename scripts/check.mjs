// Verificação rápida antes de publicar: arquivos obrigatórios e sintaxe dos scripts.
import { access, readdir, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const must = ['src/index.html', 'src/css/app.css', 'src/css/mobile-compact.css', 'src/css/refine.css', 'src/js/app.js', 'src/js/banking.js', 'src/js/cloud.js', 'src/features/app-api.js', 'src/features/sync-core.js', 'src/manifest.webmanifest', 'src/sw.js', 'src/icons/icon-512.png', 'capacitor.config.json'];
let ok = true;
for (const f of must) {
  try { await access(join(root, f)); } catch { console.error(`✗ falta ${f}`); ok = false; }
}
for (const f of await readdir(join(root, 'src/js'))) {
  try { execFileSync(process.execPath, ['--check', join(root, 'src/js', f)], { stdio: 'pipe' }); console.log(`✓ ${f}`); }
  catch (e) { console.error(`✗ erro de sintaxe em ${f}\n${e.stderr}`); ok = false; }
}
// Verifica também módulos que são empacotados/inseridos no build.
for (const dir of ['src/features', 'api']) {
  try {
    for (const f of await readdir(join(root, dir))) {
      if (!f.endsWith('.js')) continue;
      try { execFileSync(process.execPath, ['--check', join(root, dir, f)], { stdio: 'pipe' }); console.log(`✓ ${dir}/${f}`); }
      catch (e) { console.error(`✗ erro de sintaxe em ${dir}/${f}\n${e.stderr}`); ok = false; }
    }
  } catch {}
}

// HTML estático não pode repetir ids: isso quebra labels, foco e seletores.
try {
  const html = await readFile(join(root, 'src/index.html'), 'utf8');
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m => m[1]);
  const duplicates = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  if (duplicates.length) { console.error('✗ ids HTML duplicados:', duplicates.join(', ')); ok = false; }
  else console.log(`✓ ${ids.length} ids HTML estáticos sem duplicidade`);
} catch (e) {
  console.error('✗ não foi possível auditar ids do HTML:', e.message);
  ok = false;
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

for (const rel of ['src/js/banking.js','src/js/cloud.js']) {
  try {
    const src = await readFile(join(root, rel), 'utf8');
    const unique = xs => [...new Set(xs)].sort();
    const features = unique([...src.matchAll(/data-feature=["'`]([^"'\`$<>{}\s]+)["'`]/g)].map(m => m[1]));
    const handlers = unique([...src.matchAll(/action===['"]([^'"]+)['"]/g)].map(m => m[1]));
    const missing = features.filter(x => !handlers.includes(x));
    if (missing.length) { console.error(`✗ ${rel} tem ações sem handler:`, missing.join(', ')); ok = false; }
    else console.log(`✓ ${rel}: ${features.length} ações externas têm handler`);

    const forms = unique([...src.matchAll(/data-feature-form=["'`]([^"'\`$<>{}\s]+)["'`]/g)].map(m => m[1]));
    const formHandlers = unique([...src.matchAll(/(?:form\.dataset\.featureForm|type)===['"]([^'"]+)['"]/g)].map(m => m[1]));
    const missingForms = forms.filter(x => !formHandlers.includes(x));
    if (missingForms.length) { console.error(`✗ ${rel} tem formulários sem handler:`, missingForms.join(', ')); ok = false; }
    else console.log(`✓ ${rel}: ${forms.length} formulários externos têm handler`);
  } catch (e) {
    console.error(`✗ não foi possível auditar ${rel}:`, e.message);
    ok = false;
  }
}

if (!ok) process.exit(1);
console.log('✓ tudo certo');
