import { Capacitor } from "@capacitor/core"
import { PushNotifications } from "@capacitor/push-notifications"
import { getFcmToken } from "@/lib/firebase"
import { toast } from "sonner"

export function isStandaloneMode(): boolean {
  if (typeof window === "undefined") return false
  const isMatchMedia = window.matchMedia?.("(display-mode: standalone)")?.matches ?? false
  const isIosStandalone = (window.navigator as unknown as { standalone?: boolean })?.standalone ?? false
  return Boolean(isMatchMedia || isIosStandalone)
}

export async function requestPushPermission(uid: string): Promise<boolean> {
  if (typeof window === "undefined" || !uid) return false

  const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL

  if (Capacitor.isNativePlatform()) {
    try {
      let permStatus = await PushNotifications.checkPermissions()
      if (permStatus.receive === "prompt") {
        permStatus = await PushNotifications.requestPermissions()
      }
      if (permStatus.receive === "granted") {
        await PushNotifications.register()
        return true
      }
    } catch (e) {
      console.error(e)
    }
    return false
  }

  if (!("Notification" in window)) return false

  try {
    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      const token = await getFcmToken()
      if (token) {
        await fetch(`${backendUrl}/registerDeviceToken`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid,
            deviceToken: token,
            platform: "web"
          })
        })
        return true
      }
    }
  } catch (e) {
    console.error("Web FCM registration error:", e)
  }

  return false
}

export async function setupPushNotifications(uid: string) {
  if (typeof window === "undefined" || !uid) return

  const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL

  if (Capacitor.isNativePlatform()) {
    try {
      let permStatus = await PushNotifications.checkPermissions()
      if (permStatus.receive === "prompt") {
        permStatus = await PushNotifications.requestPermissions()
      }

      if (permStatus.receive === "granted") {
        await PushNotifications.removeAllListeners()

        await PushNotifications.addListener("registration", async (token) => {
          if (!token?.value) return
          await fetch(`${backendUrl}/registerDeviceToken`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uid,
              deviceToken: token.value,
              platform: Capacitor.getPlatform()
            })
          }).catch((err) => {
            console.error("Native push token registration error:", err)
          })
        })

        await PushNotifications.addListener("registrationError", (err) => {
          console.error("Native push registration error:", err)
        })

        await PushNotifications.addListener("pushNotificationReceived", (notification) => {
          if (notification?.title) {
            toast(notification.title, {
              description: notification.body || "",
              duration: 5000
            })
          }
        })

        await PushNotifications.register()
      }
    } catch (e) {
      console.error("Error setting up native push notifications:", e)
    }
    return
  }

  try {
    if ("Notification" in window && Notification.permission === "granted") {
      const token = await getFcmToken()
      if (token) {
        await fetch(`${backendUrl}/registerDeviceToken`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid,
            deviceToken: token,
            platform: "web"
          })
        }).catch((err) => {
          console.error("Web token sync error:", err)
        })
      }
    }
  } catch (e) {
    console.error("Web FCM token error:", e)
  }
}
