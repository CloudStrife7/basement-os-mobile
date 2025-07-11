// Service Worker for Lower Level 2.0 Basement Monitor PWA
// Handles offline functionality, caching, and background sync

const CACHE_NAME = 'basement-monitor-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// Install event - cache important files
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Caching app files');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ Service Worker installed successfully');
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker activated');
            return self.clients.claim();
        })
    );
});

// Fetch event - handle network requests with cache fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Handle GitHub API requests (always try network first for fresh data)
    if (url.hostname.includes('github.io') || url.pathname.includes('activity')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // If successful, update cache and return response
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // If network fails, try cache
                    return caches.match(request).then((cachedResponse) => {
                        if (cachedResponse) {
                            console.log('📱 Serving cached data for:', request.url);
                            return cachedResponse;
                        }
                        // Return offline fallback
                        return new Response(JSON.stringify({
                            total_count: 0,
                            friend_count: 0,
                            visitor_count: 0,
                            event: 'offline',
                            timestamp: Math.floor(Date.now() / 1000)
                        }), {
                            headers: { 'Content-Type': 'application/json' }
                        });
                    });
                })
        );
        return;
    }
    
    // Handle other requests (app files) - cache first
    event.respondWith(
        caches.match(request)
            .then((response) => {
                // Return cached version if available
                if (response) {
                    return response;
                }
                
                // Otherwise fetch from network
                return fetch(request).then((response) => {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone and cache the response
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                    
                    return response;
                });
            })
    );
});

// Push notification handling
self.addEventListener('push', (event) => {
    console.log('📨 Push notification received');
    
    const options = {
        body: 'Check the basement activity!',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'basement-activity',
        data: {
            url: '/'
        },
        actions: [
            {
                action: 'open',
                title: 'Open App',
                icon: '/icon-192.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };
    
    if (event.data) {
        try {
            const payload = event.data.json();
            options.body = payload.message || options.body;
            options.data = payload.data || options.data;
        } catch (error) {
            console.error('Error parsing push payload:', error);
        }
    }
    
    event.waitUntil(
        self.registration.showNotification('🏠 Lower Level 2.0', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'dismiss') {
        return;
    }
    
    // Open or focus the app
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // If app is already open, focus it
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // Otherwise open new window
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'basement-status-sync') {
        event.waitUntil(syncBasementStatus());
    }
});

async function syncBasementStatus() {
    try {
        console.log('🔄 Syncing basement status in background...');
        
        // Notify all connected clients about the sync
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'BACKGROUND_SYNC',
                message: 'Syncing basement status...'
            });
        });
        
        // You can add logic here to fetch latest data
        // and update any pending offline actions
        
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Message handling from main app
self.addEventListener('message', (event) => {
    console.log('📧 Message received from main app:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_UPDATE') {
        // Force cache update
        caches.delete(CACHE_NAME).then(() => {
            console.log('🔄 Cache cleared for update');
        });
    }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
    console.log('⏰ Periodic sync triggered:', event.tag);
    
    if (event.tag === 'basement-check') {
        event.waitUntil(checkBasementActivity());
    }
});

async function checkBasementActivity() {
    try {
        console.log('⏰ Periodic basement check...');
        
        // This would check the GitHub endpoint for updates
        // and potentially show notifications for major changes
        
        const response = await fetch('https://YOURUSERNAME.github.io/lowerlevel-activity/current_activity.json');
        const data = await response.json();
        
        // Store the data for comparison
        const prevData = await getStoredData('lastActivity');
        await storeData('lastActivity', data);
        
        // Check for significant changes
        if (prevData && shouldNotifyOfChange(prevData, data)) {
            await self.registration.showNotification('🏠 Lower Level 2.0', {
                body: `Basement activity changed! ${data.friend_count} friends + ${data.visitor_count} visitors`,
                icon: '/icon-192.png',
                tag: 'basement-activity-update'
            });
        }
        
    } catch (error) {
        console.error('Periodic check failed:', error);
    }
}

function shouldNotifyOfChange(oldData, newData) {
    // Only notify if friend count increased significantly
    const oldFriends = oldData.friend_count || 0;
    const newFriends = newData.friend_count || 0;
    
    return newFriends >= 2 && newFriends > oldFriends;
}

// Helper functions for data storage
async function storeData(key, data) {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(JSON.stringify(data));
    await cache.put(`/data/${key}`, response);
}

async function getStoredData(key) {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(`/data/${key}`);
    if (response) {
        return await response.json();
    }
    return null;
}

// Error handling
self.addEventListener('error', (event) => {
    console.error('❌ Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Service Worker unhandled promise rejection:', event.reason);
    event.preventDefault();
});