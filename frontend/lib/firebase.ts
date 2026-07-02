import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)

if (process.env.NODE_ENV === "development") {
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
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
  if (!vapidKey) {
    return null
  }
  try {
    const messaging = getMessaging(app)
    const token = await getToken(messaging, {
      vapidKey,
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
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : ""
      const headers = {
        "Content-Type": "application/json",
        ...options?.headers,
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      }
      return originalFetch(url, { ...options, headers })
    }
    return originalFetch(url, options)
  }
}

