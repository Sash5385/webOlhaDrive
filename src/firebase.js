import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCkkR95_vT4sYJBxwPeDT4bfkO-E7PVXe0",
  authDomain: "olhadrive-booking.firebaseapp.com",
  databaseURL: "https://olhadrive-booking-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "olhadrive-booking",
  storageBucket: "olhadrive-booking.firebasestorage.app",
  messagingSenderId: "956727837484",
  appId: "1:956727837484:web:3ca5f08dbeaa6368b02289"
};

const VAPID_KEY = "BJzB84MYVCjYxFGRJa1t2hTyMjlyYhCfDBz_wgD8VCX84rUA1ircVYMkCEe8gYrKkceaM6Mweup8AW9DoFUyncY";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

export async function registerAdminFCM() {
  if (!("Notification" in window)) { console.warn("FCM: Notification API not supported"); return; }
  try {
    const permission = await Notification.requestPermission();
    console.log("FCM permission:", permission);
    if (permission !== "granted") return;

    let swReg
    try {
      // Firebase push SW must live on its OWN scope so it never replaces the
      // PWA app SW at "/" (that conflict broke the "update available" flow).
      // "/firebase-cloud-messaging-push-scope" is FCM's default scope.
      const FCM_SCOPE = '/firebase-cloud-messaging-push-scope'
      const regs = await navigator.serviceWorker.getRegistrations()
      const isFbSw = r => (r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || '').includes('firebase-messaging-sw')
      // Migration: remove any legacy firebase SW registered at the root scope.
      for (const r of regs) {
        if (isFbSw(r) && new URL(r.scope).pathname === '/') {
          await r.unregister().catch(() => {})
        }
      }
      const fresh = await navigator.serviceWorker.getRegistrations()
      swReg = fresh.find(isFbSw)
        || await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: FCM_SCOPE })
    } catch (_) {
      swReg = undefined
    }
    console.log("FCM SW scope:", swReg?.scope);

    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg });
    console.log("FCM token obtained:", !!token, token?.slice(0, 20));

    if (token) {
      await set(ref(db, "admin/fcmToken"), token);
      console.log("FCM token saved to admin/fcmToken");
    } else {
      console.warn("FCM: empty token returned");
    }
  } catch (e) {
    console.error("Admin FCM error:", e.code, e.message);
  }
}

export function onAdminForegroundMessage(callback) {
  try {
    const messaging = getMessaging(app);
    return onMessage(messaging, callback);
  } catch {
    return () => {};
  }
}
