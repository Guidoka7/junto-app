(()=>{
  const native=Boolean(window.Capacitor?.isNativePlatform?.());
  let deferredPrompt=null,installed=window.matchMedia?.('(display-mode: standalone)')?.matches||navigator.standalone===true;

  const emit=()=>window.dispatchEvent(new CustomEvent('junto:pwa-status',{detail:{installed,canInstall:Boolean(deferredPrompt)}}));
  window.JuntoPWA=Object.freeze({
    isInstalled:()=>installed,
    canInstall:()=>Boolean(deferredPrompt)&&!installed,
    async install(){
      if(installed)return {installed:true,outcome:'installed'};
      if(!deferredPrompt)return {installed:false,outcome:'unavailable'};
      const prompt=deferredPrompt;deferredPrompt=null;
      await prompt.prompt();
      const choice=await prompt.userChoice.catch(()=>({outcome:'dismissed'}));
      if(choice?.outcome==='accepted')installed=true;
      emit();return {installed,outcome:choice?.outcome||'dismissed'};
    }
  });

  if(native){installed=true;emit();return;}

  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault();deferredPrompt=event;emit();
  });
  window.addEventListener('appinstalled',()=>{installed=true;deferredPrompt=null;emit();});

  if(!('serviceWorker'in navigator)||!/^https?:$/.test(location.protocol)){emit();return;}
  window.addEventListener('load',async()=>{
    try{
      const registration=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
      await registration.update().catch(()=>{});
      if(registration.waiting)registration.waiting.postMessage({type:'SKIP_WAITING'});
      registration.addEventListener('updatefound',()=>{
        const worker=registration.installing;
        worker?.addEventListener('statechange',()=>{
          if(worker.state==='installed')worker.postMessage({type:'SKIP_WAITING'});
        });
      });
      let reloading=false;
      navigator.serviceWorker.addEventListener('controllerchange',()=>{
        if(reloading)return;reloading=true;location.reload();
      });
    }catch{
      console.warn('Não foi possível ativar o modo offline.');
    }finally{emit();}
  });
})();
