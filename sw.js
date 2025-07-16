// Basement OS Mobile v1 ALPHA - Service Worker
const CACHE_NAME = 'basement-os-v1';
const urlsToCache = [
    '/basement-os-mobile/',
    '/basement-os-mobile/index.html',
    '/basement-os-mobile/pwa/manifest.json',
    '/basement-os-mobile/pwa/icon-192.png',
    '/basement-os-mobile/pwa/icon-512.png'
];

// Your original working service worker code here...
// (Just add the push handler we need)

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
