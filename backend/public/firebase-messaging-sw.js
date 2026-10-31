importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC7Qyb6hVrX4t8iMadEl4WIC94hPQiuvwI",
  authDomain: "volt-94f9f.firebaseapp.com",
  projectId: "volt-94f9f",
  storageBucket: "volt-94f9f.firebasestorage.app",
  messagingSenderId: "370469332401",
  appId: "1:370469332401:web:6ed1e408b07cf9cdcb8990"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  if (payload.notification) {
    return;
  }

  const data = payload.data || {};
  let title = data.title || "Volt";
  let body = data.body || "";

  if (title === "Volt" || !title) {
    title = body;
    body = "";
  }

  self.registration.showNotification(title, {
    body: body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: data
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification?.data?.url || "/?page=dashboard";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
