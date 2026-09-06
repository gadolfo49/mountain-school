/* Cache only this pilot's public app shell. Never cache GPS, API responses or tiles. */
const CACHE='mcs-transporte-demo-v1';
const SHELL=['./','./index.html','./style.css','./core.js','./app.js','./icon.svg','./manifest.webmanifest'];
const allowed=new Set(SHELL.map(p=>new URL(p,self.registration.scope).href));
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('mcs-transporte-demo-')&&k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||!allowed.has(e.request.url))return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(e.request,copy)));}return r;}).catch(()=>caches.match(e.request)));});
