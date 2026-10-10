import {parseApkRelease,isNewerApk} from '../features/update-core.js';

(() => {
  const native = Boolean(window.Capacitor?.isNativePlatform?.());
  const releaseUrl = 'https://api.github.com/repos/Guidoka7/junto-app/releases/tags/latest';
  const SNOOZE_KEY = 'junto-apk-update-dismissed-v1';
  const INTERVAL = 60 * 60 * 1000;
  const state = {current:null,latest:null,error:'',checking:false,lastCheck:0};
  const transfer = {phase:'idle',percent:0,bytes:0,total:0,error:'',version:''};
  let pending=null,offeredVersion='',promise=null,downloadPromise=null;
  const $ = id => document.getElementById(id);
  const safe = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pretty = x => String(x||'—').slice(0,80);
  const available = () => native && isNewerApk(state.current,state.latest);
  const capable = () => Boolean(window.JuntoNativeUpdater?.downloadAndInstall && window.JuntoNativeUpdater?.installDownloaded);
  function summary() {
    if (native && transfer.phase==='downloading') return 'Baixando atualização: '+transfer.percent+'%.';
    if (native && available()) return 'Nova versão '+state.latest.version+' disponível.';
    if (state.checking) return 'Procurando versões novas…';
    if (state.error) return 'Sem conexão com a central. Verifique novamente.';
    return native ? 'Instalado: '+pretty(state.current?.version) : 'Versão web com atualizações automáticas.';
  }
  function emit() {
    window.dispatchEvent(new CustomEvent('junto:update-status',{detail:{available:available(),latest:state.latest?.version||null,transfer:transfer.phase}}));
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
  function transferMessage() {
    if (transfer.phase==='downloading') return 'Baixando com segurança dentro do Juntô. Não feche o aplicativo até terminar.';
    if (transfer.phase==='permission') return 'O download terminou e foi verificado. Autorize o Juntô a instalar atualizações nas configurações do Android e volte para tocar em Instalar.';
    if (transfer.phase==='installer') return 'O instalador do Android foi aberto. Confirme a atualização por cima do Juntô. Seus dados ficam preservados.';
    if (transfer.phase==='error') return transfer.error;
    return 'O APK é baixado e verificado dentro do Juntô. Só a confirmação final é feita pelo instalador oficial do Android.';
  }
  function modalIsUpdate() {return $('modal')?.open && $('modal')?.dataset.kind==='updates';}
  function updateProgressUI() {
    if (!modalIsUpdate()) return;
    const bar=$('junto-update-progress-bar');
    const text=$('junto-update-progress-text');
    if (bar) bar.style.width=transfer.percent+'%';
    if (text) text.textContent=transfer.percent+'% · '+Math.round(transfer.bytes/1024/1024*10)/10+' MB de '+Math.round(transfer.total/1024/1024*10)/10+' MB';
    emit();
  }
  function showModal(automatic=false) {
    if (!hasAccess()) return;
    const latest=state.latest;
    const newer=available(), current=pretty(state.current?.version);
    const webUpdate=Boolean(window.JuntoPWA?.hasUpdate?.());
    const title=automatic?'Uma nova versão do Juntô chegou!':'Atualizações';
    const version=latest?.version||'—';
    const download=native && newer;
    const inProgress=download && transfer.phase==='downloading';
    const needsPermission=download && transfer.phase==='permission' && transfer.version===version;
    const waitingInstaller=download && transfer.phase==='installer' && transfer.version===version;
    const problem=download && transfer.phase==='error' && transfer.version===version;
    const canDownload=download && capable() && !inProgress;
    const body=`<div class="junto-update-card ${download?'is-new':''}">
      <div class="junto-update-icon" aria-hidden="true">↻</div>
      <span class="junto-update-kicker">${state.checking?'CONSULTANDO A CENTRAL':inProgress?'BAIXANDO NO JUNTÔ':download?'ATUALIZAÇÃO DISPONÍVEL':webUpdate?'NOVA VERSÃO WEB':'JUNTÔ ATUALIZADO'}</span>
      <h3>${inProgress?'Preparando sua atualização':download?'Seu Juntô tem novidades':webUpdate?'Nova versão pronta':state.error?'Não foi possível consultar':'Tudo em dia por aqui'}</h3>
      <p>${download?capable()?safe(transferMessage()):'O aplicativo instalado ainda usa o instalador antigo. É necessária uma última atualização manual para ativar o download interno.':webUpdate?'Atualize o aplicativo web quando terminar o que estiver fazendo.':state.error?'Confira sua conexão e tente novamente.':'O Juntô verifica automaticamente as novas versões.'}</p>
      <div class="junto-update-versions"><span><small>INSTALADA</small><strong>${safe(current)}</strong></span><span><small>${native?'DISPONÍVEL':'TIPO'}</small><strong>${native?safe(version):'Web / PWA'}</strong></span></div>
      ${inProgress?`<div class="junto-update-progress" role="status" aria-live="polite"><div class="junto-update-progress-track"><div id="junto-update-progress-bar" style="width:${transfer.percent}%"></div></div><small id="junto-update-progress-text">${transfer.percent}%</small></div>`:''}
      ${problem?`<p class="junto-update-error" role="alert">${safe(transfer.error)}</p>`:''}
    </div>
    <div class="junto-update-actions">
      ${canDownload && !needsPermission && !waitingInstaller?'<button class="btn primary wide" data-action="update-download">Baixar e instalar dentro do app ↓</button>':''}
      ${needsPermission?'<button class="btn primary wide" data-action="update-install">Instalar atualização no Android ✓</button>':''}
      ${waitingInstaller?'<button class="btn primary wide" data-action="update-install">Reabrir instalação</button>':''}
      ${inProgress?'<button class="btn secondary wide" data-action="update-cancel">Cancelar download</button>':''}
      ${!native && webUpdate?'<button class="btn primary wide" data-action="pwa-update">Atualizar agora</button>':''}
      <button class="btn secondary wide" data-action="update-check" ${state.checking||inProgress?'disabled':''}>${state.checking?'Verificando…':'Verificar atualizações'}</button>
      <button class="btn ghost wide" data-action="update-later">${automatic?'Agora não':'Fechar'}</button>
    </div><p class="junto-update-foot">O APK é conferido por SHA-256 e assinatura. O Android sempre solicita sua autorização para instalar. Não é necessário abrir GitHub nem procurar arquivos.</p>`;
    window.JuntoApp.openModal(title,body,'updates');
    if(inProgress)updateProgressUI();
  }
  async function check({manual=false,offer=false}={}) {
    if (promise) return promise;
    if (transfer.phase==='downloading') return null;
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
        if (transfer.version && transfer.version!==parsed.version) Object.assign(transfer,{phase:'idle',percent:0,bytes:0,total:0,error:'',version:''});
      } catch {state.error='Consulta indisponível';state.lastCheck=Date.now();}
      finally {clearTimeout(timeout);state.checking=false;emit();}
      if (manual) showModal();
      else if (offer && !state.error) showOffer();
      return state.latest;
    })().finally(()=>{promise=null;});
    return promise;
  }
  async function beginDownload() {
    if (!native || !available() || !capable() || downloadPromise) return;
    const candidate=state.latest;
    if (!candidate?.sha256 || !candidate?.apkSize || !candidate?.downloadUrl) return;
    Object.assign(transfer,{phase:'downloading',percent:0,bytes:0,total:candidate.apkSize,error:'',version:candidate.version});
    showModal();
    downloadPromise=(async()=>{
      try {
        const result=await window.JuntoNativeUpdater.downloadAndInstall({
          url:candidate.downloadUrl,sha256:candidate.sha256,apkSize:candidate.apkSize
        });
        if (candidate.version!==state.latest?.version) return;
        transfer.phase=result?.status==='permissionRequired'?'permission':'installer';
        if (result?.status==='permissionRequired') window.JuntoApp.toast('APK baixado e verificado.','Autorize a instalação nas configurações do Android e volte ao Juntô.');
        else window.JuntoApp.toast('APK pronto.','Confirme a instalação na janela oficial do Android.');
      } catch(error) {
        transfer.phase='error';
        transfer.error=String(error?.message||'Não foi possível baixar a atualização.').slice(0,220);
      } finally {
        downloadPromise=null;
        emit();
        if (modalIsUpdate()) showModal();
      }
    })();
    return downloadPromise;
  }
  async function installAgain() {
    if (!native || !available() || !capable() || downloadPromise) return;
    try {
      const latest=state.latest;
      const result=await window.JuntoNativeUpdater.installDownloaded({sha256:latest.sha256,apkSize:latest.apkSize});
      transfer.phase=result?.status==='permissionRequired'?'permission':'installer';
      transfer.error='';
    } catch(error) {
      transfer.phase='error';
      transfer.error=String(error?.message||'Não foi possível iniciar a instalação.').slice(0,220);
    }
    emit();
    if (modalIsUpdate()) showModal();
  }
  function open() {
    if (!hasAccess()) return;
    showModal();
    check({manual:true});
  }
  window.JuntoUpdates=Object.freeze({
    open,check,summary,hasUpdate:available,
    getStatus:()=>({...state,newer:available(),transfer:{...transfer}})
  });
  if (native && window.JuntoNativeUpdater?.addListener) {
    window.JuntoNativeUpdater.addListener('downloadProgress',e=>{
      if (transfer.phase!=='downloading') return;
      transfer.bytes=Number(e.bytes)||0;
      transfer.total=Number(e.total)||transfer.total;
      transfer.percent=Math.max(0,Math.min(100,Math.floor(Number(e.percent)||0)));
      updateProgressUI();
    }).catch(()=>{});
  }
  document.addEventListener('click',async event=>{
    const button=event.target.closest('[data-action]');
    if (!button) return;
    const action=button.dataset.action;
    if (action==='update-check') {await check({manual:true});return;}
    if (action==='update-later') {
      if (available()) try{localStorage.setItem(SNOOZE_KEY,state.latest.version);}catch{}
      pending=null;window.JuntoApp.closeModal();return;
    }
    if (action==='update-download') {await beginDownload();return;}
    if (action==='update-install') {await installAgain();return;}
    if (action==='update-cancel') {
      await window.JuntoNativeUpdater?.cancelDownload?.().catch(()=>{});
      return;
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
  if (native) setInterval(()=>{if(hasAccess() && !document.hidden && Date.now()-state.lastCheck >= INTERVAL)check({offer:true});},INTERVAL);
  window.addEventListener('junto:pwa-status',()=>{
    if (!native) {
      emit();
      if (modalIsUpdate()) showModal();
    }
  });
  const modal=$('modal');
  if (modal) new MutationObserver(()=>{if(pending&&!modal.open)setTimeout(showOffer,100);}).observe(modal,{attributes:true,attributeFilter:['open']});
  if (hasAccess()) setTimeout(()=>check({offer:true}),700);
  readInstalled();
})();
