"use client"

import Image from "next/image"
import { IconShare, IconSquarePlus, IconX, IconCheck } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export interface IOSGuideProps {
  onDismiss: () => void
  onAlreadyInstalled: () => void
}

export function IOSGuide({ onDismiss, onAlreadyInstalled }: IOSGuideProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[408px] bg-card border border-border shadow-2xl rounded-3xl p-5 text-card-foreground animate-in slide-in-from-bottom-8 duration-300 relative">
        <button
          onClick={onDismiss}
          aria-label="Close guide"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
        >
          <IconX className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 shadow-md border border-border/60">
            <Image
              src="/icon-192.png"
              alt="Volt App Icon"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground tracking-tight">
              Add Volt to Home Screen
            </h3>
            <p className="text-xs text-muted-foreground">
              Fast 1-tap meter access without opening Safari
            </p>
          </div>
        </div>

        <div className="space-y-3 my-4 bg-muted/40 rounded-2xl p-3.5 border border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 text-primary">
              <IconShare className="w-4 h-4" />
            </div>
            <div>
              <span className="font-medium text-foreground">Step 1: </span>
              Tap the <span className="font-semibold text-foreground">Share</span> button in Safari's bottom bar.
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 text-primary">
              <IconSquarePlus className="w-4 h-4" />
            </div>
            <div>
              <span className="font-medium text-foreground">Step 2: </span>
              Scroll and tap <span className="font-semibold text-foreground">Add to Home Screen</span>.
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            size="sm"
            onClick={onAlreadyInstalled}
            className="w-full h-10 font-medium text-xs rounded-xl shadow-sm"
          >
            <IconCheck className="w-4 h-4 mr-1.5" />
            I've Added It to Home Screen
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="w-full h-9 text-xs text-muted-foreground hover:text-foreground rounded-xl"
          >
            Maybe Later
          </Button>
        </div>
      </div>
    </div>
  )
}
