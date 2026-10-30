const CACHE = 'familyhub-v2-icloud-1';
const ASSETS = ['./','./index.html','./workspace.js','./handy-export.js','./manifest.json','./apple-touch-icon.png'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => { if(event.request.method!=='GET')return; event.respondWith(fetch(event.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(event.request,c));return r;}).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html')))); });
