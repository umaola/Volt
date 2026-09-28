importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC7Qyb6hVrX4t8iMadEl4WIC94hPQiuvwI",
  authDomain: "volt-test-e8e0b.firebaseapp.com",
  projectId: "volt-test-e8e0b",
  storageBucket: "volt-test-e8e0b.firebasestorage.app",
  messagingSenderId: "370469332401",
  appId: "1:370469332401:web:6ed1e408b07cf9cdcb8990"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/favicon.ico"
  });
});
