import * as React from "react"
import { TextField } from "@/components/design-system/input"
import { IconBolt } from "@tabler/icons-react"

interface CreditUnitsStepProps {
  currentUnits: string
  setCurrentUnits: (val: string) => void
  isLoading: boolean
}

export function CreditUnitsStep({
  currentUnits,
  setCurrentUnits,
  isLoading
}: CreditUnitsStepProps) {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#121212]">Current Credit Units</h1>
        <p className="text-sm text-[#4B5563]">Enter your current credit units directly from your meter.</p>
      </div>

      <TextField
        label="Remaining Units (kWh)"
        placeholder="e.g. 150.5"
        type="number"
        step="0.1"
        value={currentUnits}
        onChange={(e) => setCurrentUnits(e.target.value)}
        disabled={isLoading}
      />

      <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center gap-3">
        <IconBolt className="w-6 h-6 text-primary shrink-0" />
        <p className="text-xs text-[#4B5563] leading-relaxed">
          If you do not know this, check the number displayed on your meter screen or input an estimate. You can calibrate this later.
        </p>
      </div>
    </div>
  )
}
