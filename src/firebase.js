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

const VAPID_KEY = "BFT1t7hXhEcSsHdotLlG5xoIFNrdS11vU_jsHiD1UUMsskVINBW2het8ogOKioGTPK8X_-u1ivEQM0n0Dh6Zvqk";

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
      const regs = await navigator.serviceWorker.getRegistrations()
      swReg = regs.find(r => (r.active?.scriptURL || r.installing?.scriptURL || '').includes('firebase-messaging-sw'))
        || await navigator.serviceWorker.register('/firebase-messaging-sw.js')
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
