(()=>{
  const native=Boolean(window.Capacitor?.isNativePlatform?.());
  let deferredPrompt=null,waitingWorker=null,reloading=false;
  let installed=window.matchMedia?.('(display-mode: standalone)')?.matches||navigator.standalone===true;

  const emit=()=>window.dispatchEvent(new CustomEvent('junto:pwa-status',{detail:{
    installed,canInstall:Boolean(deferredPrompt),updateAvailable:Boolean(waitingWorker)
  }}));
  window.JuntoPWA=Object.freeze({
    isInstalled:()=>installed,
    canInstall:()=>Boolean(deferredPrompt)&&!installed,
    hasUpdate:()=>Boolean(waitingWorker),
    async install(){
      if(installed)return {installed:true,outcome:'installed'};
      if(!deferredPrompt)return {installed:false,outcome:'unavailable'};
      const prompt=deferredPrompt;deferredPrompt=null;
      await prompt.prompt();
      const choice=await prompt.userChoice.catch(()=>({outcome:'dismissed'}));
      if(choice?.outcome==='accepted')installed=true;
      emit();return {installed,outcome:choice?.outcome||'dismissed'};
    },
    applyUpdate(){
      if(!waitingWorker)return false;
      waitingWorker.postMessage({type:'SKIP_WAITING'});
      return true;
    }
  });

  if(native){installed=true;emit();return;}
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredPrompt=event;emit();});
  window.addEventListener('appinstalled',()=>{installed=true;deferredPrompt=null;emit();});

  if(!('serviceWorker'in navigator)||!/^https?:$/.test(location.protocol)){emit();return;}
  const hadController=Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(reloading)return;
    // The first service-worker claim should be invisible to the user. Reload only
    // when replacing an already-controlled app after an explicit update.
    if(!hadController&&!waitingWorker){emit();return;}
    reloading=true;location.reload();
  });
  window.addEventListener('load',async()=>{
    try{
      const registration=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
      if(registration.waiting){waitingWorker=registration.waiting;emit();}
      registration.addEventListener('updatefound',()=>{
        const worker=registration.installing;
        worker?.addEventListener('statechange',()=>{
          if(worker.state==='installed'&&navigator.serviceWorker.controller){waitingWorker=worker;emit();}
        });
      });
      await registration.update().catch(()=>{});
    }catch{
      console.warn('Não foi possível ativar o modo offline.');
    }finally{emit();}
  });
})();
