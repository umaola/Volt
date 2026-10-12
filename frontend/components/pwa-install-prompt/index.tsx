"use client"

import { AndroidBanner } from "./android-banner"
import { IOSGuide } from "./ios-guide"

export interface PwaInstallPromptProps {
  isOpen: boolean
  isIOS: boolean
  onInstall: () => void
  onDismiss: () => void
  onAlreadyInstalled: () => void
}

export function PwaInstallPrompt({
  isOpen,
  isIOS,
  onInstall,
  onDismiss,
  onAlreadyInstalled,
}: PwaInstallPromptProps) {
  if (!isOpen) return null

  if (isIOS) {
    return (
      <IOSGuide
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
