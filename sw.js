const CACHE='mountain-family-shell-v3';
const CORE=['./','./index.html','./manifest.webmanifest','./styles-v2.css','./app-v2.js','./assets/mountain-logo-192.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const r=event.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(u.hostname.includes('supabase.co')||u.pathname.includes('/storage/')||u.pathname.includes('/functions/'))return;
 if(r.mode==='navigate'){event.respondWith(fetch(r).then(x=>x).catch(()=>caches.match('./index.html')));return}
 if(u.origin===self.location.origin){event.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(response=>{if(response.ok&&response.type==='basic')caches.open(CACHE).then(cache=>cache.put(r,response.clone()));return response}))) }
});