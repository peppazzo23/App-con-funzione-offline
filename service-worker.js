const CACHE_NAME = 'corriere-clienti-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/icon.png',
    '/Giuseppe.png',
    '/mappa.png'
];

// Evento 'install': chiamato quando il Service Worker viene installato per la prima volta
self.addEventListener('install', (event) => {
    console.log('Service Worker: Evento di Installazione');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Cache aperta, aggiungo risorse.');
                // Aggiunge tutte le risorse definite in urlsToCache alla cache
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('Service Worker: Errore durante il caching delle risorse:', err);
            })
    );
});

// Evento 'fetch': intercetta le richieste di rete
self.addEventListener('fetch', (event) => {
    // Risponde con la risorsa dalla cache se disponibile, altrimenti la recupera dalla rete
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Se la risorsa è nella cache, restituiscila
                if (response) {
                    console.log('Service Worker: Servendo dalla cache:', event.request.url);
                    return response;
                }
                // Altrimenti, recuperala dalla rete
                console.log('Service Worker: Risorsa non trovata in cache, fetching dalla rete:', event.request.url);
                return fetch(event.request).then(
                    (response) => {
                        // Controlla se abbiamo ricevuto una risposta valida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clona la risposta perché una risposta è un flusso e può essere consumata solo una volta
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
            .catch(() => {
                console.log('Service Worker: Network request failed and no cache match for:', event.request.url);
                // Puoi aggiungere qui la logica per servire una pagina offline specifica
                // es: return caches.match('/offline.html');
            })
    );
});

// Evento 'activate': chiamato quando il Service Worker viene attivato
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Evento di Attivazione');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Elimina le cache vecchie che non corrispondono al CACHE_NAME attuale
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Eliminando vecchia cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
