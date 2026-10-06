const VERSION='__VERSION__';
const PRECACHE=__PRECACHE__;
const PREFIX=`junto-${encodeURIComponent(new URL(self.registration.scope).pathname)}-`;
const CACHE=PREFIX+VERSION;

self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(PRECACHE);
  await self.skipWaiting();
})()));

self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});

self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));

async function networkFirst(request,cache){
  try{
    const fresh=await fetch(request,{cache:'no-store'});
    if(fresh&&fresh.ok)cache.put(request,fresh.clone()).catch(()=>{});
    return fresh;
  }catch{
    return (await cache.match(request)) || Response.error();
  }
}

self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;

  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);

    if(request.mode==='navigate'){
      try{
        const fresh=await fetch(request,{cache:'no-store'});
        if(fresh&&fresh.ok)cache.put(new URL('./index.html',self.registration.scope),fresh.clone()).catch(()=>{});
        return fresh;
      }catch{
        return (await cache.match(new URL('./index.html',self.registration.scope))) || Response.error();
      }
    }

    if(/\.(?:js|css|json)$/i.test(url.pathname)||url.pathname.endsWith('/sw.js')){
      return networkFirst(request,cache);
    }

    const cached=await cache.match(request);
    if(cached)return cached;
    const fresh=await fetch(request);
    if(fresh&&fresh.ok)cache.put(request,fresh.clone()).catch(()=>{});
    return fresh;
  })());
});
