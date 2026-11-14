import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC7Qyb6hVrX4t8iMadEl4WIC94hPQiuvwI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "volt-94f9f.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "volt-94f9f",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "volt-94f9f.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "370469332401",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:370469332401:web:6ed1e408b07cf9cdcb8990",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)

if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
  try {
    if (!(auth as unknown as { _emulatorConfig?: unknown })._emulatorConfig) {
      const host = typeof window !== "undefined" ? window.location.hostname : "127.0.0.1"
      connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true })
    }
  } catch {
  }
}

export const getFcmToken = async () => {
  if (typeof window === "undefined") {
    return null
  }
  const supported = await isSupported()
  if (!supported) {
    return null
  }
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "BEWnezsCJKyItO0cqpq-V-NN6Z50ssGz0pc39GklElmj878rU5ypcI3H5blkhFKGLxIVA8BRqHKy-XyF7VwTs7c"
  if (!vapidKey) {
    return null
  }
  try {
    let serviceWorkerRegistration: ServiceWorkerRegistration | undefined
    if ("serviceWorker" in navigator) {
      serviceWorkerRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js")
    }
    const messaging = getMessaging(app)
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration
    })
    return token
  } catch (error) {
    console.error("Error retrieving FCM token:", error)
    return null
  }
}

export const onMessageListener = async (callback: (payload: any) => void) => {
  if (typeof window === "undefined") {
    return () => {}
  }
  const supported = await isSupported()
  if (!supported) {
    return () => {}
  }
  try {
    const messaging = getMessaging(app)
    return onMessage(messaging, (payload) => {
      callback(payload)
    })
  } catch (error) {
    console.error("Error setting up message listener:", error)
    return () => {}
  }
}

export { app, auth }

if (typeof window !== "undefined") {
  const originalFetch = window.fetch
  window.fetch = async (url: RequestInfo | URL, options?: RequestInit) => {
    const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL
    if (backendUrl && typeof url === "string" && url.startsWith(backendUrl)) {
      let token = ""
      try {
        if (!auth.currentUser && typeof auth.authStateReady === "function") {
          await auth.authStateReady()
        }
        if (auth.currentUser) {
          token = await auth.currentUser.getIdToken()
        }
      } catch {
      }
      const existingHeaders = options?.headers instanceof Headers
        ? Object.fromEntries(options.headers.entries())
        : (options?.headers as Record<string, string>) || {}
      const hasAuth = !!(existingHeaders["Authorization"] || existingHeaders["authorization"])
      const headers = {
        "Content-Type": "application/json",
        ...existingHeaders,
        ...(token && !hasAuth ? { "Authorization": `Bearer ${token}` } : {})
      }
      return originalFetch(url, { ...options, headers })
    }
    return originalFetch(url, options)
  }
}

