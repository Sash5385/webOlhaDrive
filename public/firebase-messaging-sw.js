importScripts('https://www.gstatic.com/firebasejs/12.13.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging-compat.js')

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => self.clients.claim())

firebase.initializeApp({
  apiKey: "AIzaSyCkkR95_vT4sYJBxwPeDT4bfkO-E7PVXe0",
  authDomain: "olhadrive-booking.firebaseapp.com",
  databaseURL: "https://olhadrive-booking-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "olhadrive-booking",
  storageBucket: "olhadrive-booking.firebasestorage.app",
  messagingSenderId: "956727837484",
  appId: "1:956727837484:web:3ca5f08dbeaa6368b02289"
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  // Data-only push (без top-level/webpush "notification") — інакше браузер
  // додатково показав би те саме сповіщення сам, і виходив дубль.
  const title = payload.data?.title || 'OlhaDrive'
  const options = {
    body: payload.data?.body || '',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: payload.data?.tag || 'admin',
    data: payload.data || {}
  }
  self.registration.showNotification(title, options)
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) return c.focus()
      }
      if (clients.openWindow) return clients.openWindow('/')
    })
  )
})
