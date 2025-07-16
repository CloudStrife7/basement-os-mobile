// Basement OS Mobile v1 ALPHA - Service Worker
// Provides offline functionality and PWA installation capability

const CACHE_NAME = 'basement-os-v1'; // Using your original cache name
const urlsToCache = [
    '/basement-os-mobile/',
    '/basement-os-mobile/index.html',
    '/basement-os-mobile/pwa/manifest.json',
    '/basement-os-mobile/pwa/icon-192.png',
    '/basement-os-mobile/pwa/icon-512.png',
    // Firebase SDK URLs
    'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/9.0.0/firebase-database-compat.js',
    'https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installing…');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.warn('⚠️ Service Worker: Failed to cache some resources', error);
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
            .catch(() => {
                // If both cache and network fail, return offline page
                if (event.request.destination === 'document') {
                    return caches.match('/basement-os-mobile/index.html');
                }
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Activating…');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
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
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Service Worker: Notification clicked');
    event.notification.close();
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow('/basement-os-mobile/')
        );
    }
});

console.log('✅ Service Worker: Loaded successfully');
