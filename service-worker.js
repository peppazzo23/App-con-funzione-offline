const CACHE_NAME = 'corriere-clienti-cache-v1';
const urlsToCache = [
    '/', // L'index.html
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/icon.png', // Assicurati che il percorso sia corretto per la tua icona
    '/Giuseppe.png', // Assicurati che il percorso sia corretto per la tua immagine del camion
    '/mappa.png'    // Assicurati che il percorso sia corretto per la tua immagine della mappa
];

// Evento 'install': chiamato quando il Service Worker viene installato per la prima volta
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                // Aggiunge tutte le risorse definite in urlsToCache alla cache
                return cache.addAll(urlsToCache);
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
                    return response;
                }
                // Altrimenti, recuperala dalla rete
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
                // Se la rete è offline e la risorsa non è nella cache, puoi servire una pagina offline di fallback
                // Per ora, non ho una pagina offline specifica, quindi potrebbe semplicemente fallire
                // o potresti aggiungere una logica per una pagina offline predefinita
                console.log('Network request failed and no cache match for:', event.request.url);
                // Puoi aggiungere qui la logica per servire una pagina offline specifica
                // es: return caches.match('/offline.html');
            })
    );
});

// Evento 'activate': chiamato quando il Service Worker viene attivato
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Elimina le cache vecchie che non corrispondono al CACHE_NAME attuale
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
