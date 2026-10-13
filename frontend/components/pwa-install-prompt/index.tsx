"use client"

import { AndroidBanner } from "./android-banner"
import { IOSGuide, type PwaBrowser } from "./ios-guide"

export interface PwaInstallPromptProps {
  isOpen: boolean
  isIOS: boolean
  browser?: PwaBrowser
  onInstall: () => void
  onDismiss: () => void
  onAlreadyInstalled: () => void
}

export function PwaInstallPrompt({
  isOpen,
  isIOS,
  browser,
  onInstall,
  onDismiss,
  onAlreadyInstalled,
}: PwaInstallPromptProps) {
  if (!isOpen) return null

  if (isIOS) {
    return (
      <IOSGuide
        browser={browser}
        onDismiss={onDismiss}
        onAlreadyInstalled={onAlreadyInstalled}
      />
    )
  }

  return (
    <AndroidBanner
      onInstall={onInstall}
      onDismiss={onDismiss}
      onAlreadyInstalled={onAlreadyInstalled}
    />
  )
}

export { AndroidBanner, IOSGuide }
export type { PwaBrowser }
