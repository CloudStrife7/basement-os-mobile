// Basement OS Mobile v1 ALPHA - Service Worker
// Provides offline functionality and PWA installation capability

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

const urlsToCache = [
    '/basement-os-mobile/',
    '/basement-os-mobile/index.html',
    '/basement-os-mobile/manifest.json',
    '/basement-os-mobile/pwa/icon-192.png',
    '/basement-os-mobile/pwa/icon-512.png',
    // Firebase SDK URLs
    'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/9.0.0/firebase-database-compat.js'
];
