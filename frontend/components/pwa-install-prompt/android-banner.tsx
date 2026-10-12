"use client"

import Image from "next/image"
import { IconPlus, IconX, IconCheck } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export interface AndroidBannerProps {
  onInstall: () => void
  onDismiss: () => void
  onAlreadyInstalled: () => void
}

export function AndroidBanner({
  onInstall,
  onDismiss,
  onAlreadyInstalled,
}: AndroidBannerProps) {
  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-[408px] mx-auto z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card/95 backdrop-blur-md border border-border/80 shadow-2xl rounded-2xl p-4 text-card-foreground">
        <div className="flex items-start gap-3">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md border border-border/50">
            <Image
              src="/icon-192.png"
              alt="Volt App Icon"
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <h4 className="text-sm font-semibold text-foreground tracking-tight leading-tight">
              Add Volt to Home Screen
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Pin Volt like an app widget for instant 1-tap meter checking and power tracking.
            </p>
          </div>

          <button
            onClick={onDismiss}
            aria-label="Dismiss banner"
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/40">
          <Button
            size="sm"
            onClick={onInstall}
            className="flex-1 h-9 font-medium text-xs rounded-xl shadow-sm"
          >
            <IconPlus className="w-3.5 h-3.5 mr-1" />
            Add to Home Screen
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onAlreadyInstalled}
            className="text-xs h-9 text-muted-foreground hover:text-foreground rounded-xl"
          >
            <IconCheck className="w-3.5 h-3.5 mr-1" />
            Already Added
          </Button>
        </div>
      </div>
    </div>
  )
}
