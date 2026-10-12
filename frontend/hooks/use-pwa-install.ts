"use client"

import { useState, useEffect, useCallback } from "react"
import { Capacitor } from "@capacitor/core"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

const STORAGE_KEY = "volt_pwa_installed"
const DISMISS_KEY = "volt_pwa_dismissed_at"

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    if (Capacitor.isNativePlatform()) {
      setIsInstalled(true)
      return
    }

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true

    const hasInstalledFlag = localStorage.getItem(STORAGE_KEY) === "true"

    if (isStandalone || hasInstalledFlag) {
      setIsInstalled(true)
      localStorage.setItem(STORAGE_KEY, "true")
      return
    }

    const dismissedAt = localStorage.getItem(DISMISS_KEY)
    if (dismissedAt) {
      const parsed = parseInt(dismissedAt, 10)
      if (Date.now() - parsed < 3 * 24 * 60 * 60 * 1000) {
        return
      }
    }

    const isAppleMobile =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream

    setIsIOS(isAppleMobile)

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsOpen(true)
    }

    const handleAppInstalled = () => {
      localStorage.setItem(STORAGE_KEY, "true")
      setIsInstalled(true)
      setIsOpen(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    if (isAppleMobile && !isStandalone && !hasInstalledFlag) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 3000)
      return () => {
        clearTimeout(timer)
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
        window.removeEventListener("appinstalled", handleAppInstalled)
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    if (!deferredPrompt) return
    try {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === "accepted") {
        localStorage.setItem(STORAGE_KEY, "true")
        setIsInstalled(true)
        setIsOpen(false)
      }
      setDeferredPrompt(null)
    } catch {
      setIsOpen(false)
    }
  }, [deferredPrompt])

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
    setIsOpen(false)
  }, [])

  const markInstalled = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true")
    setIsInstalled(true)
    setIsOpen(false)
  }, [])

  const promptInstall = useCallback(() => {
    setIsOpen(true)
  }, [])

  return {
    isOpen,
    isIOS,
    isInstalled,
    canInstall: !!deferredPrompt || isIOS,
    install,
    dismiss,
    markInstalled,
    promptInstall,
  }
}
