const VERSION='__VERSION__';
const PRECACHE=__PRECACHE__;
const PREFIX=`junto-${encodeURIComponent(new URL(self.registration.scope).pathname)}-`;
const CACHE=PREFIX+VERSION;
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(PRECACHE))));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    if(request.mode==='navigate'){const shell=await cache.match(new URL('./index.html',self.registration.scope));return shell||fetch(request);}
    const cached=await cache.match(request);return cached||fetch(request);
  })());
});
