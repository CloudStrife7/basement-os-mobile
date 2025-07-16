// Basement OS Mobile ALPHA - Service Worker
// Provides offline functionality and PWA installation capability

const CACHE_NAME = 'basement-os-mobile-alpha-v1';
const urlsToCache = [
    '/basement-os-mobile/',
    '/basement-os-mobile/index.html',
    '/basement-os-mobile/manifest.json',
    '/basement-os-mobile/pwa/icon-192.png',
    '/basement-os-mobile/pwa/icon-512.png',
    // Firebase SDK URLs
    'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/9.0.0/firebase-database-compat.js',
    'https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js'
];

// Install event - cache essential files
self.addEventListener('install', function(event) {
    console.log('🔧 Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('📦 Caching basement OS files');
                return cache.addAll(urlsToCache.filter(url => !url.startsWith('https://')));
            })
            .catch(function(error) {
                console.warn('⚠️ Cache setup failed (some files missing):', error);
            })
    );
    
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
    console.log('✅ Service Worker activated');
    
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    return self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', function(event) {
    if (event.request.method !== 'GET') return;
    
    if (event.request.url.includes('cloudstrife7.github.io/basement-os-mobile/') && 
        (event.request.url.includes('.json') || event.request.url.includes('webhook'))) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    return response;
                }
                
                return fetch(event.request).catch(function() {
                    if (event.request.headers.get('accept').includes('text/html')) {
                        return new Response(
                            '<h1>Basement OS Offline</h1><p>Connection lost. Please check network.</p>',
                            { headers: { 'Content-Type': 'text/html' } }
                        );
                    }
                });
            })
    );
});

// PUSH NOTIFICATIONS - Handle background push messages
self.addEventListener('push', function(event) {
    console.log('🔔 Background push received');
    
    let notificationData = {
        title: 'Basement OS',
        body: 'You have basement activity!',
        icon: '/basement-os-mobile/pwa/icon-192.png',
        badge: '/basement-os-mobile/pwa/icon-192.png'
    };

    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = { ...notificationData, ...data };
        } catch (e) {
            notificationData.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
    console.log('🖱️ Notification clicked');
    
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/basement-os-mobile/')
    );
});

console.log('🏠 Basement OS Mobile ALPHA Service Worker loaded');