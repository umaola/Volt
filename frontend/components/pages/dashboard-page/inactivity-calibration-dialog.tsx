"use client"

import * as React from "react"
import { IconGauge, IconAlertCircle } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"

export interface InactivityCalibrationDialogProps {
  isOpen: boolean
  daysInactive: number
  currentEstimatedUnits?: number
  isSubmitting?: boolean
  onSync: (manualUnits: number) => void
  onDismiss: () => void
}

export function InactivityCalibrationDialog({
  isOpen,
  daysInactive,
  currentEstimatedUnits,
  isSubmitting = false,
  onSync,
  onDismiss
}: InactivityCalibrationDialogProps) {
  const [unitsInput, setUnitsInput] = React.useState("")
  const [validationError, setValidationError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (isOpen) {
      setUnitsInput("")
      setValidationError(null)
    }
  }, [isOpen])

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const parsed = parseFloat(unitsInput)
    if (isNaN(parsed) || parsed < 0) {
      setValidationError("Please enter a valid meter balance in kWh")
      return
    }
    setValidationError(null)
    onSync(parsed)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onDismiss() }}>
      <DialogContent showCloseButton={false} className="max-w-xs sm:max-w-sm rounded-3xl p-5 gap-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <IconGauge className="size-6" />
        </div>

        <DialogHeader className="gap-1.5 items-center">
          <DialogTitle className="font-heading text-lg font-bold text-center">
            Sync Meter Balance
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground leading-relaxed px-1">
            You haven&apos;t logged your usage in {daysInactive > 1 ? `${daysInactive} days` : "two days"}. Please check your physical prepaid meter display and enter your current reading to keep Volt accurate.
          </DialogDescription>
        </DialogHeader>

        {currentEstimatedUnits !== undefined && (
          <div className="bg-muted/50 border border-border rounded-2xl p-2.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Volt&apos;s estimate:</span>
            <span className="font-bold text-foreground">{currentEstimatedUnits.toFixed(1)} kWh</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground px-1">
              Current Meter Reading (kWh)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 15.20"
              value={unitsInput}
              onChange={(e) => {
                setUnitsInput(e.target.value)
                if (validationError) setValidationError(null)
              }}
              disabled={isSubmitting}
              className="h-11 rounded-2xl text-center font-bold text-base bg-background border-input"
            />
            {validationError && (
              <span className="text-[11px] font-medium text-destructive px-1 flex items-center gap-1">
                <IconAlertCircle className="size-3 shrink-0" />
                {validationError}
              </span>
            )}
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-col sm:justify-center w-full mt-2">
            <Button
              type="submit"
              className="w-full h-11 rounded-2xl font-bold"
              disabled={isSubmitting || !unitsInput.trim()}
            >
              {isSubmitting ? <Spinner className="size-4" /> : "Sync Meter"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full h-9 rounded-2xl text-xs text-muted-foreground hover:text-foreground"
              onClick={onDismiss}
              disabled={isSubmitting}
            >
              Remind Me Later
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function InactivityCalibrationDialogSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xs sm:max-w-sm rounded-3xl bg-popover p-5 flex flex-col items-center gap-4">
        <Skeleton className="size-12 rounded-2xl" />
        <Skeleton className="h-5 w-36 rounded-lg" />
        <Skeleton className="h-4 w-48 rounded-lg" />
        <Skeleton className="h-11 w-full rounded-2xl mt-2" />
        <Skeleton className="h-11 w-full rounded-2xl" />
        <Skeleton className="h-9 w-full rounded-2xl" />
      </div>
    </div>
  )
}

