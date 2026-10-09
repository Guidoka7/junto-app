import {parseApkRelease,isNewerApk} from '../features/update-core.js';

(() => {
  const native = Boolean(window.Capacitor?.isNativePlatform?.());
  const releaseUrl = 'https://api.github.com/repos/Guidoka7/junto-app/releases/tags/latest';
  const SNOOZE_KEY = 'junto-apk-update-dismissed-v1';
  const INTERVAL = 4 * 60 * 60 * 1000;
  const state = {current:null,latest:null,error:'',checking:false,lastCheck:0};
  let pending=null,offeredVersion='',promise=null;
  const $ = id => document.getElementById(id);
  const safe = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pretty = x => String(x||'—').slice(0,80);
  const available = () => native && isNewerApk(state.current,state.latest);
  function summary() {
    if (native && available()) return 'Nova versão '+state.latest.version+' disponível.';
    if (state.checking) return 'Procurando versões novas…';
    if (state.error) return 'Sem conexão com a central. Verifique novamente.';
    return native ? 'Instalado: '+pretty(state.current?.version) : 'Versão web com atualizações automáticas.';
  }
  function emit() {
    window.dispatchEvent(new CustomEvent('junto:update-status',{detail:{available:available(),latest:state.latest?.version||null}}));
    document.querySelectorAll('[data-update-summary]').forEach(el=>el.textContent=summary());
    document.querySelectorAll('[data-update-indicator]').forEach(el=>{el.hidden=!available();});
  }
  async function readInstalled() {
    if (state.current) return state.current;
    try {
      const response = await fetch('./version.json',{cache:'no-store'});
      if (!response.ok) throw new Error('Versão local não encontrada');
      const data = await response.json();
      if (typeof data.version !== 'string') throw new Error('Metadados inválidos');
      state.current = data;
    } catch {
      state.current = {version:'Não identificada',runNumber:null};
    }
    emit(); return state.current;
  }
  function hasAccess() {return Boolean(window.JuntoApp?.hasAccess?.());}
  function showOffer() {
    if (!native || !available() || !hasAccess() || !state.latest || offeredVersion===state.latest.version) return;
    if ($('modal')?.open) {pending=state.latest.version;return;}
    pending=null;
    try {if (localStorage.getItem(SNOOZE_KEY)===state.latest.version) return;} catch {}
    offeredVersion=state.latest.version;
    showModal(true);
  }
  function showModal(automatic=false) {
    if (!hasAccess()) return;
    const latest=state.latest;
    const newer=available();
    const current=pretty(state.current?.version);
    const webUpdate=Boolean(window.JuntoPWA?.hasUpdate?.());
    const title=automatic?'Uma nova versão do Juntô chegou!':'Atualizações';
    const version=latest?.version||'—';
    const download=native && newer;
    const body=`<div class="junto-update-card ${download?'is-new':''}">
      <div class="junto-update-icon" aria-hidden="true">↻</div>
      <span class="junto-update-kicker">${state.checking?'CONSULTANDO A CENTRAL':download?'ATUALIZAÇÃO DISPONÍVEL':webUpdate?'NOVA VERSÃO WEB':'JUNTÔ ATUALIZADO'}</span>
      <h3>${download?'Seu Juntô tem novidades':webUpdate?'Nova versão pronta':state.error?'Não foi possível consultar':'Tudo em dia por aqui'}</h3>
      <p>${download?'A atualização é opcional e mantém seu espaço financeiro. Você confirma a instalação no Android.':webUpdate?'Atualize o aplicativo web quando terminar o que estiver fazendo.':state.error?'Confira sua conexão e tente novamente.':'O Juntô verifica automaticamente as novas versões.'}</p>
      <div class="junto-update-versions"><span><small>INSTALADA</small><strong>${safe(current)}</strong></span><span><small>${native?'DISPONÍVEL':'TIPO'}</small><strong>${native?safe(version):'Web / PWA'}</strong></span></div>
    </div>
    <div class="junto-update-actions">
      ${download?'<button class="btn primary wide" data-action="update-download">Baixar APK atualizado ↗</button>':''}
      ${!native && webUpdate?'<button class="btn primary wide" data-action="pwa-update">Atualizar agora</button>':''}
      <button class="btn secondary wide" data-action="update-check" ${state.checking?'disabled':''}>${state.checking?'Verificando…':'Verificar atualizações'}</button>
      <button class="btn ghost wide" data-action="update-later">${automatic?'Agora não':'Fechar'}</button>
    </div><p class="junto-update-foot">O APK vem da central oficial do Juntô. A instalação depende de sua confirmação e de uma assinatura compatível com o APK anterior.</p>`;
    window.JuntoApp.openModal(title,body,'updates');
  }
  async function check({manual=false,offer=false}={}) {
    if (promise) return promise;
    if (!native) {
      state.error='';
      if ('serviceWorker' in navigator) {
        try {const reg=await navigator.serviceWorker.getRegistration();if(reg)await reg.update();}
        catch {state.error='Não foi possível verificar agora.';}
      }
      if (manual) showModal();
      emit();return null;
    }
    promise=(async()=>{
      state.checking=true;state.error='';emit();
      await readInstalled();
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),9500);
      try {
        const response=await fetch(releaseUrl,{cache:'no-store',headers:{Accept:'application/vnd.github+json'},signal:controller.signal});
        if (!response.ok) throw new Error('HTTP '+response.status);
        const parsed=parseApkRelease(await response.json());
        if (!parsed) throw new Error('Release inválida');
        state.latest=parsed;state.lastCheck=Date.now();
      } catch {state.error='Consulta indisponível';state.lastCheck=Date.now();}
      finally {clearTimeout(timeout);state.checking=false;emit();}
      if (manual) showModal();
      else if (offer && !state.error) showOffer();
      return state.latest;
    })().finally(()=>{promise=null;});
    return promise;
  }
  function open() {
    if (!hasAccess()) return;
    showModal();
    check({manual:true});
  }
  window.JuntoUpdates=Object.freeze({
    open,check,summary,hasUpdate:available,
    getStatus:()=>({...state,newer:available()})
  });
  document.addEventListener('click',async event=>{
    const button=event.target.closest('[data-action]');
    if (!button) return;
    const action=button.dataset.action;
    if (action==='update-center') {open();return;}
    if (action==='update-check') {await check({manual:true});return;}
    if (action==='update-later') {
      if (available()) try{localStorage.setItem(SNOOZE_KEY,state.latest.version);}catch{}
      pending=null;window.JuntoApp.closeModal();return;
    }
    if (action==='update-download' && available()) {
      try {
        if (native) {
          if (!window.JuntoNativeUpdater?.openDownload) throw new Error('Instalador indisponível');
          await window.JuntoNativeUpdater.openDownload();
        } else {
          window.open(state.latest.downloadUrl,'_blank','noopener,noreferrer');
        }
      } catch {
        window.JuntoApp.toast('Não foi possível abrir o download.','Abra junto-updates.vercel.app no navegador.');
      }
    }
    if (action==='close' && pending) setTimeout(()=>{if(pending)showOffer();},200);
  });
  window.addEventListener('junto:access-ready',()=>{
    if (native) setTimeout(()=>check({offer:true}),700);
    else readInstalled();
  });
  window.addEventListener('junto:native-resume',()=>{
    if (native && Date.now()-state.lastCheck > INTERVAL) check({offer:true});
  });
  window.addEventListener('junto:pwa-status',()=>{
    if (!native) {
      emit();
      if ($('modal')?.open && $('modal')?.dataset.kind==='updates') showModal();
    }
  });
  const modal=$('modal');
  if (modal) new MutationObserver(()=>{if(pending&&!modal.open)setTimeout(showOffer,100);}).observe(modal,{attributes:true,attributeFilter:['open']});
  if (hasAccess()) setTimeout(()=>check({offer:true}),700);
  readInstalled();
})();
