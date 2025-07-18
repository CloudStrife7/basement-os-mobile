// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase config (use YOUR existing config)
const firebaseConfig = {
    apiKey: "AIzaSyCmp0gJNFkRqUMpmeV_yk9batETciCiON8",
    authDomain: "basement-chat.firebaseapp.com",
    databaseURL: "https://basement-chat-default-rtdb.firebaseio.com",
    projectId: "basement-chat",
    storageBucket: "basement-chat.firebasestorage.app",
    messagingSenderId: "113802900843",
    appId: "1:113802900843:web:659af7a3f62446ac96882e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Background message received:', payload);
    
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/basement-os-mobile/pwa/icon-192.png'
    };
    
    self.registration.showNotification(notificationTitle, notificationOptions);
});
