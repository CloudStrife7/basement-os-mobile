// Basement OS Mobile - Service Worker v1.0
const CACHE_NAME = ‘basement-os-v1’;
const urlsToCache = [
‘/basement-os-mobile/’,
‘/basement-os-mobile/index.html’,
‘/basement-os-mobile/pwa/manifest.json’,
‘/basement-os-mobile/pwa/icon-192.png’,
‘/basement-os-mobile/pwa/icon-512.png’
];

// Install event - cache essential files
self.addEventListener(‘install’, (event) => {
console.log(‘🔧 Service Worker: Installing…’);
event.waitUntil(
caches.open(CACHE_NAME)
.then((cache) => {
console.log(‘📦 Service Worker: Caching app shell’);
return cache.addAll(urlsToCache);
})
.catch((error) => {
console.warn(‘⚠️ Service Worker: Failed to cache some resources’, error);
})
);
});

// Fetch event - serve from cache when offline
self.addEventListener(‘fetch’, (event) => {
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
if (event.request.destination === ‘document’) {
return caches.match(’/basement-os-mobile/index.html’);
}
})
);
});

// Activate event - clean up old caches
self.addEventListener(‘activate’, (event) => {
console.log(‘🚀 Service Worker: Activating…’);
event.waitUntil(
caches.keys().then((cacheNames) => {
return Promise.all(
cacheNames.map((cacheName) => {
if (cacheName !== CACHE_NAME) {
console.log(‘🗑️ Service Worker: Deleting old cache:’, cacheName);
return caches.delete(cacheName);
}
})
);
})
);
});

// Push event - handle push notifications
self.addEventListener(‘push’, (event) => {
console.log(‘📱 Service Worker: Push notification received’);

let notificationData = {
title: ‘Basement OS’,
body: ‘You have a new basement notification!’,
icon: ‘./icon-192.png’,
badge: ‘./icon-72.png’,
tag: ‘basement-notification’
};

// Parse push data if available
if (event.data) {
try {
const data = event.data.json();
notificationData = { …notificationData, …data };
} catch (e) {
notificationData.body = event.data.text();
}
}

event.waitUntil(
self.registration.showNotification(notificationData.title, {
body: notificationData.body,
icon: notificationData.icon,
badge: notificationData.badge,
tag: notificationData.tag,
requireInteraction: true,
actions: [
{
action: ‘open’,
title: ‘Open Basement OS’
},
{
action: ‘close’,
title: ‘Dismiss’
}
]
})
);
});

// Notification click event
self.addEventListener(‘notificationclick’, (event) => {
console.log(‘🔔 Service Worker: Notification clicked’);

event.notification.close();

if (event.action === ‘open’ || !event.action) {
event.waitUntil(
clients.openWindow(’/basement-os-mobile/’)
);
}
});

// Background sync event (future feature)
self.addEventListener(‘sync’, (event) => {
console.log(‘🔄 Service Worker: Background sync triggered’);

if (event.tag === ‘background-sync’) {
event.waitUntil(
// Future: sync basement data when coming back online
console.log(‘📡 Background sync completed’)
);
}
});

console.log(‘✅ Service Worker: Loaded successfully’);