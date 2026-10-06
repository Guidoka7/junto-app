(()=>{
  if(window.Capacitor?.isNativePlatform?.()||!('serviceWorker'in navigator)||!/^https?:$/.test(location.protocol))return;
  window.addEventListener('load',async()=>{
    try{const registration=await navigator.serviceWorker.register('./sw.js');
      const showUpdate=worker=>{if(!worker||document.getElementById('pwa-update'))return;const button=document.createElement('button');button.id='pwa-update';button.className='cloud-account-pill';button.textContent='Nova versão disponível · atualizar';button.onclick=()=>{worker.postMessage({type:'SKIP_WAITING'});};document.querySelector('.topbar')?.after(button);};
      if(registration.waiting)showUpdate(registration.waiting);
      registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)showUpdate(worker);});});
      let refreshed=false;const hadController=Boolean(navigator.serviceWorker.controller);navigator.serviceWorker.addEventListener('controllerchange',()=>{if(hadController&&!refreshed){refreshed=true;location.reload();}});
    }catch(e){console.warn('Não foi possível ativar o modo offline.');}
  });
})();
