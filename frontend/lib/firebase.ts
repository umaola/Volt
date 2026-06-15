import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"

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

export { app, auth }
