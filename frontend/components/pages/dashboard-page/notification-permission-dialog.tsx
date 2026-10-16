"use client"

import * as React from "react"
import { IconBell } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"

export interface NotificationPermissionDialogProps {
  isOpen: boolean
  isRequesting: boolean
  onEnable: () => void
  onDismiss: () => void
}

export function NotificationPermissionDialog({
  isOpen,
  isRequesting,
  onEnable,
  onDismiss
}: NotificationPermissionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onDismiss() }}>
      <DialogContent showCloseButton={false} className="max-w-xs sm:max-w-sm rounded-3xl p-5 gap-5 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <IconBell className="size-6" />
        </div>

        <DialogHeader className="gap-1.5 items-center">
          <DialogTitle className="font-heading text-lg font-semibold text-center">
            Enable Alerts
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground leading-relaxed px-2">
            Get instant updates on power outages, supply restorations, and low meter units.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col sm:justify-center w-full">
          <Button
            type="button"
            className="w-full h-11 rounded-2xl font-medium"
            onClick={onEnable}
            disabled={isRequesting}
          >
            {isRequesting ? <Spinner className="size-4" /> : "Enable"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full h-9 rounded-2xl text-xs text-muted-foreground hover:text-foreground"
            onClick={onDismiss}
            disabled={isRequesting}
          >
            Not Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function NotificationPermissionDialogSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-xs sm:max-w-sm rounded-3xl bg-popover p-5 flex flex-col items-center gap-4">
        <Skeleton className="size-12 rounded-2xl" />
        <Skeleton className="h-5 w-32 rounded-lg" />
        <Skeleton className="h-4 w-48 rounded-lg" />
        <Skeleton className="h-11 w-full rounded-2xl mt-2" />
        <Skeleton className="h-9 w-full rounded-2xl" />
      </div>
    </div>
  )
}
