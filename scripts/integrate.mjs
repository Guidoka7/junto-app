// One-time integration into the existing app. The app-api source stays separate
// so it is reviewable; build.mjs inserts it into app.js at the marker below.
import {readFile,writeFile} from 'node:fs/promises';
const url=new URL('../src/js/app.js',import.meta.url);
let text=await readFile(url,'utf8');
if (!text.includes('/* JUNTO_APP_API */')) {
  text=text.replace('  function persist(){state.updatedAt=Date.now();try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}try{channel?.postMessage(state);}catch{}render();}',
    '  function persist(){state.updatedAt=Date.now();try{localStorage.setItem(KEY,JSON.stringify(state));}catch{toast("Não foi possível salvar no aparelho.","Exporte uma cópia dos dados e confira o armazenamento.");}try{channel?.postMessage(state);}catch{}render();publishChange();}');
  text=text.replace('  function render(){if(isSolo())', '  function render(){if(cloudSlot)active=cloudSlot;if(isSolo())');
  text=text.replace("    if(action==='route')", "    if(cloudSlot&&['switch','profile-photo-switch','reset-solo','reset-couple','reset-confirm','onboard'].includes(action)){toast('Seu perfil está conectado.','Use sua própria conta para registrar movimentos. Exporte um backup antes de sair.');return;}\n    if(action==='route')");
  text=text.replace("    if(action==='connect')", "    if(action==='connect'&&window.JuntoCloud){window.JuntoCloud.open();return;}\n    if(action==='connect')");
  text=text.replace("    openModal('Ajustes da dupla',`${geminiCard}", "    openModal('Ajustes da dupla',`${window.JuntoFeatures?.settingsHTML?.()||''}${geminiCard}");
  text=text.replace("  if(rollRecurring())state.updatedAt=Date.now();", "  /* JUNTO_APP_API */\n  if(rollRecurring())state.updatedAt=Date.now();");
  // Shared profiles must never run the same auto-income on both devices.
  text=text.replace('state.incomes.filter(i=>i.auto)', 'state.incomes.filter(i=>i.auto&&(!cloudSlot||i.person===cloudSlot))');
  await writeFile(url,text);
}
