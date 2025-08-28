const VERSION='ovra-v4-20250828a';
const PRECACHE=['/','/index.html','/styles.css?v=20250828a','/src/main.js?v=20250828a','/manifest.json'];

self.addEventListener('install',e=>{
  e.waitUntil((async()=>{const c=await caches.open(VERSION);await c.addAll(PRECACHE);self.skipWaiting()})());
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{const ks=await caches.keys();await Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)));await self.clients.claim()})());
});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  const isStatic=/\.(css|js|png|svg|webp)$/.test(url.pathname);
  if(isStatic){
    e.respondWith(caches.match(e.request).then(cached=>{
      const fetched=fetch(e.request).then(resp=>{caches.open(VERSION).then(c=>c.put(e.request,resp.clone()));return resp}).catch(()=>cached);
      return cached||fetched;
    }));
  }
});
