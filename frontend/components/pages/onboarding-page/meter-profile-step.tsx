import * as React from "react"
import { TextField, DropdownField } from "@/components/design-system/input"
import { IconCheck } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface MeterProfileStepProps {
  disco: string
  setDisco: (val: string) => void
  meterType: string
  setMeterType: (val: string) => void
  tariffBand: string
  setTariffBand: (val: string) => void
  meterNumber: string
  setMeterNumber: (val: string) => void
  verifiedName: string
  isVerifying: boolean
  verificationError: string | null
  isLoading: boolean
}

export function MeterProfileStep({
  disco,
  setDisco,
  meterType,
  setMeterType,
  tariffBand,
  setTariffBand,
  meterNumber,
  setMeterNumber,
  verifiedName,
  isVerifying,
  verificationError,
  isLoading
}: MeterProfileStepProps) {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#121212]">Electricity Profile</h1>
        <p className="text-sm text-[#4B5563]">Setup your meter profile. Details are verified automatically.</p>
      </div>

      <DropdownField
        label="Distribution Company (Disco)"
        value={disco}
        onChange={(e) => setDisco(e.target.value)}
        options={[
          { value: "", label: "Select Disco..." },
          { value: "IKEDC", label: "IKEDC - Ikeja Electricity" },
          { value: "EKEDC", label: "EKEDC - Eko Electricity" },
          { value: "KEDCO", label: "KEDCO - Kano Electricity" },
          { value: "PHED", label: "PHED - Port Harcourt Electricity" },
          { value: "JED", label: "JED - Jos Electricity" },
          { value: "IBEDC", label: "IBEDC - Ibadan Electricity" },
          { value: "KAEDCO", label: "KAEDCO - Kaduna Electricity" },
          { value: "AEDC", label: "AEDC - Abuja Electricity" },
          { value: "EEDC", label: "EEDC - Enugu Electricity" },
          { value: "BEDC", label: "BEDC - Benin Electricity" },
          { value: "ABA", label: "ABA - Aba Electricity" },
          { value: "YEDC", label: "YEDC - Yola Electricity" }
        ]}
        disabled={isLoading}
      />

      <DropdownField
        label="Meter Type"
        value={meterType}
        onChange={(e) => setMeterType(e.target.value)}
        options={[
          { value: "", label: "Select Meter Type..." },
          { value: "Prepaid", label: "Prepaid" },
          { value: "Postpaid", label: "Postpaid" }
        ]}
        disabled={isLoading}
      />

      <DropdownField
        label="Tariff Band"
        value={tariffBand}
        onChange={(e) => setTariffBand(e.target.value)}
        options={[
          { value: "", label: "Select Tariff Band..." },
          { value: "Band A", label: "Band A (20+ hrs supply)" },
          { value: "Band B", label: "Band B (16+ hrs supply)" },
          { value: "Band C", label: "Band C (12+ hrs supply)" },
          { value: "Band D", label: "Band D (8+ hrs supply)" },
          { value: "Band E", label: "Band E (4+ hrs supply)" }
        ]}
        disabled={isLoading}
      />

      <div className="text-xs text-[#4B5563] -mt-2 px-1 flex items-center gap-1 select-none">
        <span>Don&apos;t know your tariff band?</span>
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="font-semibold text-primary underline hover:text-[#121212] transition-colors cursor-pointer"
            >
              Click here
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-[#052e16]">About Tariff Bands</DialogTitle>
              <DialogDescription className="text-xs text-[#4B5563] mt-1">
                Electricity pricing in Nigeria is organized in service bands based on daily power availability:
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-4 text-xs text-[#4B5563]">
              <div className="border border-zinc-100 rounded-lg overflow-hidden">
                <div className="bg-zinc-50 grid grid-cols-3 px-3 py-2 font-bold text-[#121212] border-b border-zinc-100">
                  <span>Band</span>
                  <span>Avg Supply</span>
                  <span className="text-right">Avg Rate</span>
                </div>
                <div className="divide-y divide-zinc-50 font-medium">
                  <div className="grid grid-cols-3 px-3 py-2">
                    <span className="font-bold text-[#121212]">Band A</span>
                    <span>20+ hrs/day</span>
                    <span className="text-right font-bold text-primary">₦209.50</span>
                  </div>
                  <div className="grid grid-cols-3 px-3 py-2">
                    <span className="font-bold text-[#121212]">Band B</span>
                    <span>16+ hrs/day</span>
                    <span className="text-right font-bold text-primary">₦61&ndash;64</span>
                  </div>
                  <div className="grid grid-cols-3 px-3 py-2">
                    <span className="font-bold text-[#121212]">Band C</span>
                    <span>12+ hrs/day</span>
                    <span className="text-right font-bold text-primary">₦48&ndash;52</span>
                  </div>
                  <div className="grid grid-cols-3 px-3 py-2">
                    <span className="font-bold text-[#121212]">Band D</span>
                    <span>8+ hrs/day</span>
                    <span className="text-right font-bold text-primary">₦32&ndash;43</span>
                  </div>
                  <div className="grid grid-cols-3 px-3 py-2">
                    <span className="font-bold text-[#121212]">Band E</span>
                    <span>4+ hrs/day</span>
                    <span className="text-right font-bold text-primary">₦32&ndash;43</span>
                  </div>
                </div>
              </div>
              <p className="leading-relaxed bg-zinc-50 p-2.5 rounded-lg border border-zinc-100/50">
                Your band is determined by the electricity feeder line servicing your area. You can find your band on your utility vendor invoice, prepaid token receipt, or by contacting your distribution company (Disco).
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <TextField
        label="Meter Number"
        placeholder="e.g. 0127217047315"
        value={meterNumber}
        onChange={(e) => setMeterNumber(e.target.value.replace(/\D/g, ""))}
        disabled={isLoading || !disco || !meterType}
        success={!!verifiedName}
      />

      {isVerifying && (
        <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100 flex items-center justify-center gap-2 text-xs text-[#4B5563]">
          <span className="animate-spin h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full" />
          <span>Verifying meter number...</span>
        </div>
      )}

      {verifiedName && (
        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center gap-2 animate-fade-in">
          <IconCheck className="w-5 h-5 text-primary shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs text-[#4B5563]">Verified Customer Name</span>
            <span className="text-sm font-semibold text-[#121212]">{verifiedName}</span>
          </div>
        </div>
      )}

      {verificationError && (
        <div className="p-3 bg-red-50 rounded-lg border border-red-100 text-xs text-red-600 font-medium animate-fade-in">
          Verification failed: {verificationError}
        </div>
      )}
    </div>
  )
}
