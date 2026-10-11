// Monta duas saídas a partir de src/:
//  dist/web/cinecode.html  → versão publicada como página (bibliotecas via CDN, fontes Google)
//  www/index.html          → versão do APK, 100% offline (bibliotecas e fontes locais)
import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const rd = p => fs.readFileSync(path.join(root, p), 'utf8');
const contentDir = path.join(root, 'src/content');
const content = fs.readdirSync(contentDir).filter(f => f.endsWith('.js')).sort()
  .map(f => fs.readFileSync(path.join(contentDir, f), 'utf8')).join('\n');
const css = rd('src/styles.css');

// ---- mídia real: vídeos de fundo (media/broll) e aberturas do instrutor (media/instrutor) ----
// gerados no GitHub por tools/baixar-videos.mjs (Pexels) e tools/gerar-instrutor.mjs (HeyGen)
const MEDIA = path.join(root, 'media');
const midia = { broll: {}, instrutor: {}, creditos: {} };
const mediaFiles = [];
if (fs.existsSync(path.join(MEDIA, 'broll'))) {
  for (const f of fs.readdirSync(path.join(MEDIA, 'broll')).filter(f => f.endsWith('.webm')).sort()) {
    const id = f.replace(/-\d+\.webm$/, '');
    (midia.broll[id] ||= []).push('media/broll/' + f);
    mediaFiles.push('broll/' + f, 'broll/' + f.replace(/\.webm$/, '.jpg'));
  }
}
if (fs.existsSync(path.join(MEDIA, 'instrutor'))) {
  for (const f of fs.readdirSync(path.join(MEDIA, 'instrutor')).filter(f => f.endsWith('.webm')).sort()) {
    const id = f.replace(/\.webm$/, ''), txt = path.join(MEDIA, 'instrutor', id + '.txt');
    midia.instrutor[id] = { v: 'media/instrutor/' + f, t: fs.existsSync(txt) ? fs.readFileSync(txt, 'utf8').trim() : '' };
    mediaFiles.push('instrutor/' + f, 'instrutor/' + id + '.jpg');
  }
}
if (fs.existsSync(path.join(MEDIA, 'creditos.json'))) {
  const c = JSON.parse(fs.readFileSync(path.join(MEDIA, 'creditos.json'), 'utf8'));
  for (const [k, v] of Object.entries(c)) if (fs.existsSync(path.join(MEDIA, 'broll', k + '.webm'))) midia.creditos[k] = [v.autor, v.licenca || 'livre', v.url, v.fonte];
}
const writeMedia = dir => {
  fs.rmSync(path.join(dir, 'media'), { recursive: true, force: true });
  for (const f of mediaFiles) { const src = path.join(MEDIA, f); if (!fs.existsSync(src)) continue; fs.mkdirSync(path.dirname(path.join(dir, 'media', f)), { recursive: true }); fs.copyFileSync(src, path.join(dir, 'media', f)); }
};
const app = ['src/app.js', 'src/videogen.js', 'src/video.js', 'src/assess.js', 'src/sheet.js', 'src/cloud.js'].map(rd).join('\n') + `
window.CineCode = { S: () => S, playLesson, levelTest, runSQL, runPy, runJS, checkSQL, checkPy, checkJS, checkHTML, TRACKS, LESSON, lessonVideo, recapVideo, chapterVideo, openVideo, startExam, reviewSession, showCertificate, renderQuestion, normAns, Sheet, checkSheet, xFmt, lessonGrade, QB, srsDue };
boot();`;
// Supabase (login e progresso na nuvem). A chave publicável é pública por natureza; a segurança vem das regras RLS do banco.
const SUPABASE = { url: process.env.SUPABASE_URL || 'https://qiwihyxrfhnyahhhnxyb.supabase.co', key: process.env.SUPABASE_KEY || 'sb_publishable_wKHPVi36bsEXMwAc2RCoNQ_bZcNlVCa' };
const safe = s => s.replace(/<\/script/gi, '<\\/script');
const js = vendor => `window.CC={tracks:[],patches:[],midia:${JSON.stringify(midia)},patch(p,ex){this.patches.push([p,ex||{}])}};window.CC_VENDOR=${JSON.stringify({ ...vendor, sb: SUPABASE, ...(process.env.AUDIO_URL ? { audio: process.env.AUDIO_URL } : {}) })};\n${content}\n(() => {\n'use strict';\n${app}\n})();`;
const body = `<div id="grain" aria-hidden="true"></div>
<div id="app"><main id="view" tabindex="-1"></main><nav class="tabs" aria-label="Navegação principal"></nav></div>`;

// ---- versão web (artefato) ----
const webVendor = {
  sql: 'https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/sql-asm.js',
  sk: 'https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js',
  skstd: 'https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js'
};
const web = `<title>CineCode</title>
<meta name="description" content="Escola de programação cinematográfica: 32 trilhas, do zero ao avançado.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=JetBrains+Mono:wght@400;600&family=Unbounded:wght@600;700&display=swap">
<style>${css}</style>
${body}
<script>${safe(js(webVendor))}</script>
`;
fs.mkdirSync(path.join(root, 'dist/web'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/web/cinecode.html'), web);
writeMedia(path.join(root, 'dist/web'));

// ---- versão APK (offline) ----
const www = path.join(root, 'www');
fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(path.join(www, 'vendor'), { recursive: true });
fs.mkdirSync(path.join(www, 'fonts'), { recursive: true });
for (const f of ['sql-asm.js', 'skulpt.min.js', 'skulpt-stdlib.js']) fs.copyFileSync(path.join(root, 'src/vendor', f), path.join(www, 'vendor', f));
// ponte JS do Capacitor (registra os plugins nativos: botão voltar e voz do aparelho)
const capCore = path.join(root, 'node_modules/@capacitor/core/dist/capacitor.js');
const hasCap = fs.existsSync(capCore);
if (hasCap) fs.copyFileSync(capCore, path.join(www, 'vendor', 'capacitor.js'));
const fonts = [
  ['Unbounded', 600, '@fontsource/unbounded/files/unbounded-latin-600-normal.woff2'],
  ['Unbounded', 700, '@fontsource/unbounded/files/unbounded-latin-700-normal.woff2'],
  ['Atkinson Hyperlegible', 400, '@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-400-normal.woff2'],
  ['Atkinson Hyperlegible', 700, '@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-700-normal.woff2'],
  ['JetBrains Mono', 400, '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2'],
  ['JetBrains Mono', 600, '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-600-normal.woff2']
];
let face = '';
for (const [fam, w, p] of fonts) {
  const src = path.join(root, 'node_modules', p);
  if (!fs.existsSync(src)) continue;
  const name = path.basename(p);
  fs.copyFileSync(src, path.join(www, 'fonts', name));
  face += `@font-face{font-family:"${fam}";font-weight:${w};font-style:normal;font-display:swap;src:url(fonts/${name}) format("woff2")}\n`;
}
const apk = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0a0c11">
<title>CineCode</title>
<style>${face}
[hidden]{display:none!important}img{max-width:100%}
${css}</style>
</head>
<body>
${body}
${hasCap ? '<script src="vendor/capacitor.js"></script>' : ''}
<script>${safe(js({ sql: 'vendor/sql-asm.js', sk: 'vendor/skulpt.min.js', skstd: 'vendor/skulpt-stdlib.js' }))}</script>
</body>
</html>
`;
fs.writeFileSync(path.join(www, 'index.html'), apk);
writeMedia(www);
console.log('mídia real:', Object.keys(midia.broll).length, 'aulas com vídeo de fundo,', Object.keys(midia.instrutor).length, 'aberturas do instrutor');
// narração com voz de IA (gerada por tools/narrar.mjs): vai junto no APK se existir
// narração com voz de IA: audio/pack (empacotada por trilha) ou audio/ (um arquivo por fala)
// AUDIO_URL=https://seu-cdn/audio/ faz o app buscar os áudios na internet em vez de embutir
const audioDir = path.join(root, 'audio');
const packDir = path.join(audioDir, 'pack');
const webAudio = path.join(root, 'dist/web/audio');
fs.rmSync(webAudio, { recursive: true, force: true });
if (!process.env.AUDIO_URL) {
  if (fs.existsSync(path.join(packDir, 'index.json'))) {
    fs.cpSync(packDir, path.join(www, 'audio'), { recursive: true });
    fs.cpSync(packDir, webAudio, { recursive: true });
    console.log('narração de IA incluída (pacotes):', Object.keys(JSON.parse(fs.readFileSync(path.join(packDir, 'index.json'), 'utf8'))).length, 'falas');
  } else if (fs.existsSync(path.join(audioDir, 'manifest.json'))) {
    fs.cpSync(audioDir, path.join(www, 'audio'), { recursive: true });
    console.log('narração de IA incluída:', Object.keys(JSON.parse(fs.readFileSync(path.join(audioDir, 'manifest.json'), 'utf8'))).length, 'falas');
  }
}
const kb = n => (n / 1024).toFixed(0) + ' KB';
console.log('web:', kb(web.length), '| apk index:', kb(apk.length));
