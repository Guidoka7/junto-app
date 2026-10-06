(()=>{
  if(window.Capacitor?.isNativePlatform?.()||!('serviceWorker'in navigator)||!/^https?:$/.test(location.protocol))return;

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
        if(reloading)return;
        reloading=true;
        location.reload();
      });
    }catch(e){
      console.warn('Não foi possível ativar o modo offline.');
    }
  });
})();
