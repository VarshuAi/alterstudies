// Compat SW for Firebase Web Push
importScripts('https://www.gstatic.com/firebasejs/10.12.3/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.3/firebase-messaging-compat.js');

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

firebase.initializeApp({ messagingSenderId: "1011970592751" }); // replace if your senderId differs
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || 'AlterStudies';
  const body = (payload.notification && payload.notification.body) || '';
  const icon = '/alterstudies-icon.svg';
  self.registration.showNotification(title, { body, icon, data: payload.data || {} });
});
