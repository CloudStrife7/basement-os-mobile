// Basement OS Mobile v25 - Service Worker
// Provides offline functionality and PWA installation capability

const CACHE_NAME = 'basement-os-mobile-v25';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
    // Firebase SDK URLs
    'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/9.0.0/firebase-database-compat.js'
];

// Install event - cache essential files
self.addEventListener('install', function(event) {
    console.log('🔧 Basement OS Service Worker installing...');
    
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
    
    // Activate immediately
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
    console.log('✅ Basement OS Service Worker activated');
    
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
    
    // Take control of all pages immediately
    return self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', function(event) {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip GitHub Pages API requests - always try network first
    if (event.request.url.includes('cloudstrife7.github.io/basement-os-mobile/') && 
        (event.request.url.includes('.json') || event.request.url.includes('webhook'))) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Return cached version if available
                if (response) {
                    return response;
                }
                
                // Otherwise fetch from network
                return fetch(event.request).catch(function() {
                    // If network fails and we don't have it cached,
                    // return a basic offline message for HTML requests
                    if (event.request.headers.get('accept').includes('text/html')) {
                        return new Response(
                            '<h1>Basement OS Offline</h1><p>Connection to basement monitoring system lost. Please check your network connection.</p>',
                            { headers: { 'Content-Type': 'text/html' } }
                        );
                    }
                });
            })
    );
});

// Handle background sync for when connectivity returns
self.addEventListener('sync', function(event) {
    if (event.tag === 'basement-sync') {
        console.log('🔄 Background sync triggered - basement data sync');
        event.waitUntil(
            // Could implement background data sync here
            Promise.resolve()
        );
    }
});

// Handle push notifications
self.addEventListener('push', function(event) {
    console.log('🔔 Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'Basement activity detected!',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Open Basement OS',
                icon: '/icon-192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icon-192.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Basement OS Mobile', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
    console.log('🖱️ Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        // Open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('🏠 Basement OS Mobile v25 Service Worker loaded');
