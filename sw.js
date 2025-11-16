/**
 * Service Worker - Radar do Bairro
 * Gerencia cache offline e push notifications
 */

const CACHE_NAME = 'radar-do-bairro-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/config.js',
    '/js/storage.js',
    '/js/theme.js',
    '/js/api.js',
    '/js/map.js',
    '/js/posts.js',
    '/js/chat.js',
    '/js/notifications.js',
    '/js/app.js',
    '/manifest.json',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

/**
 * Instalação do Service Worker
 */
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Cache aberto');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[SW] Arquivos em cache com sucesso');
                return self.skipWaiting();
            })
    );
});

/**
 * Ativação do Service Worker
 */
self.addEventListener('activate', (event) => {
    console.log('[SW] Ativando Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Service Worker ativado');
            return self.clients.claim();
        })
    );
});

/**
 * Interceptar requisições
 * Estratégia: Network First, fallback para Cache
 */
self.addEventListener('fetch', (event) => {
    // Ignorar requisições que não são GET
    if (event.request.method !== 'GET') {
        return;
    }

    // Ignorar requisições de API (sempre buscar da rede)
    if (event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Se a resposta é válida, clone e adicione ao cache
                if (response && response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                }
                return response;
            })
            .catch(() => {
                // Se a rede falhar, tente buscar do cache
                return caches.match(event.request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            console.log('[SW] Servindo do cache:', event.request.url);
                            return cachedResponse;
                        }

                        // Se não estiver em cache, retorne página offline
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

/**
 * Push Notifications
 */
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification recebida');

    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Radar do Bairro';
    const options = {
        body: data.body || 'Novo acontecimento próximo a você!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        tag: data.tag || 'radar-notification',
        data: data.data || {},
        actions: [
            {
                action: 'open',
                title: 'Ver agora',
                icon: '/icons/icon-72x72.png'
            },
            {
                action: 'close',
                title: 'Fechar'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

/**
 * Clique em notificação
 */
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notificação clicada:', event.action);
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

/**
 * Background Sync (para posts offline)
 */
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);

    if (event.tag === 'sync-posts') {
        event.waitUntil(syncPosts());
    }
});

/**
 * Sincronizar posts offline
 */
async function syncPosts() {
    try {
        // Implementar lógica de sincronização de posts offline
        console.log('[SW] Sincronizando posts...');
        // TODO: Buscar posts salvos no IndexedDB e enviar para API
    } catch (error) {
        console.error('[SW] Erro ao sincronizar:', error);
    }
}
