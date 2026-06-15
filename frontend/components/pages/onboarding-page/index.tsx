import * as React from "react"
import { PrimaryButton, SecondaryButton } from "@/components/design-system/button"
import { MeterProfileStep } from "./meter-profile-step"
import { ApplianceCalibrationStep } from "./appliance-calibration-step"
import { CreditUnitsStep } from "./credit-units-step"
import { OnboardingSkeleton } from "./skeleton-loading"
import { Slider } from "@/components/ui/slider"
import { TextField } from "@/components/design-system/input"
import { IconClock } from "@tabler/icons-react"

interface OnboardingPageProps {
  isLoading: boolean
  onComplete: (data: {
    meterNumber: string
    disco: string
    tariffBand: string
    meterType: string
    appliances: { name: string; wattage: number; hours: number }[]
    currentUnits: number
  }) => void
  onVerifyMeter: (
    meterNumber: string,
    disco: string,
    meterType: string
  ) => Promise<{ success: boolean; customerName?: string; error?: string }>
}

export function OnboardingPage({
  isLoading,
  onComplete,
  onVerifyMeter
}: OnboardingPageProps) {
  const [step, setStep] = React.useState(1)

  const [meterNumber, setMeterNumber] = React.useState("")
  const [verifiedName, setVerifiedName] = React.useState("")
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [verificationError, setVerificationError] = React.useState<string | null>(null)

  const [disco, setDisco] = React.useState("")
  const [tariffBand, setTariffBand] = React.useState("")
  const [meterType, setMeterType] = React.useState("")

  const [selectedAppliances, setSelectedAppliances] = React.useState<
    { name: string; wattage: number; hours: number }[]
  >([])

  const [currentUnits, setCurrentUnits] = React.useState("")

  const [customAppliances, setCustomAppliances] = React.useState<
    { name: string; defaultWattage: number; defaultHours: number }[]
  >([])

  const [isCustomOpen, setIsCustomOpen] = React.useState(false)
  const [customName, setCustomName] = React.useState("")
  const [customWattage, setCustomWattage] = React.useState("")
  const [customHours, setCustomHours] = React.useState(4)

  const catalog = [
    { name: "Fan", defaultWattage: 75, defaultHours: 8 },
    { name: "TV", defaultWattage: 100, defaultHours: 6 },
    { name: "Refrigerator", defaultWattage: 250, defaultHours: 24 },
    { name: "Air Conditioner", defaultWattage: 1500, defaultHours: 4 },
    { name: "Electric Iron", defaultWattage: 1000, defaultHours: 1 },
    { name: "Microwave", defaultWattage: 800, defaultHours: 0.5 }
  ]

  React.useEffect(() => {
    const cleanMeter = meterNumber.trim()
    if (cleanMeter.length >= 10 && disco && meterType) {
      setIsVerifying(true)
      setVerificationError(null)
      setVerifiedName("")

      const delayDebounce = setTimeout(() => {
        onVerifyMeter(cleanMeter, disco, meterType)
          .then((res) => {
            if (res.success && res.customerName) {
              setVerifiedName(res.customerName)
            } else {
              setVerificationError(res.error || "Verification failed")
            }
          })
          .catch(() => {
            setVerificationError("Verification failed")
          })
          .finally(() => {
            setIsVerifying(false)
          })
      }, 500)

      return () => clearTimeout(delayDebounce)
    } else {
      setVerifiedName("")
      setVerificationError(null)
    }
  }, [meterNumber, disco, meterType, onVerifyMeter])

  const handleApplianceToggle = (item: { name: string; defaultWattage: number; defaultHours: number }) => {
    const exists = selectedAppliances.find((a) => a.name === item.name)
    if (exists) {
      setSelectedAppliances(selectedAppliances.filter((a) => a.name !== item.name))
    } else {
      setSelectedAppliances([
        ...selectedAppliances,
        { name: item.name, wattage: item.defaultWattage, hours: item.defaultHours }
      ])
    }
  }

  const handleApplianceUpdate = (name: string, field: "wattage" | "hours", value: number) => {
    setSelectedAppliances(
      selectedAppliances.map((app) => (app.name === name ? { ...app, [field]: value } : app))
    )
  }

  const handleAddCustomAppliance = (name: string, wattage: number, hours: number) => {
    const exists = selectedAppliances.find((a) => a.name.toLowerCase() === name.toLowerCase())
    if (!exists) {
      const newApp = { name, defaultWattage: wattage, defaultHours: hours }
      setCustomAppliances((prev) => [...prev, newApp])
      setSelectedAppliances((prev) => [
        ...prev,
        { name, wattage, hours }
      ])
    }
  }

  const handleAddCustom = () => {
    const name = customName.trim()
    const wattage = parseInt(customWattage, 10) || 0
    if (name && wattage > 0) {
      handleAddCustomAppliance(name, wattage, customHours)
      setCustomName("")
      setCustomWattage("")
      setCustomHours(4)
      setIsCustomOpen(false)
    }
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      onComplete({
        meterNumber,
        disco,
        tariffBand,
        meterType,
        appliances: selectedAppliances,
        currentUnits: parseFloat(currentUnits) || 0
      })
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  if (isLoading) {
    return <OnboardingSkeleton />
  }

  return (
    <div className="flex-1 flex flex-col justify-between bg-white relative overflow-hidden h-full">
      <div className="flex-1 overflow-y-auto p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Step {step} of 3
          </span>
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-4 bg-primary" : i < step ? "w-1.5 bg-primary/40" : "w-1.5 bg-zinc-200"
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <MeterProfileStep
            disco={disco}
            setDisco={setDisco}
            meterType={meterType}
            setMeterType={setMeterType}
            tariffBand={tariffBand}
            setTariffBand={setTariffBand}
            meterNumber={meterNumber}
            setMeterNumber={setMeterNumber}
            verifiedName={verifiedName}
            isVerifying={isVerifying}
            verificationError={verificationError}
            isLoading={isLoading}
          />
        )}

        {step === 2 && (
          <ApplianceCalibrationStep
            selectedAppliances={selectedAppliances}
            onApplianceToggle={handleApplianceToggle}
            onApplianceUpdate={handleApplianceUpdate}
            onOpenCustomDrawer={() => setIsCustomOpen(true)}
            catalog={catalog}
            customAppliances={customAppliances}
            isLoading={isLoading}
          />
        )}

        {step === 3 && (
          <CreditUnitsStep
            currentUnits={currentUnits}
            setCurrentUnits={setCurrentUnits}
            isLoading={isLoading}
          />
        )}
      </div>

      <div className="p-6 bg-white border-t border-zinc-100 flex items-center gap-3">
        {step > 1 && (
          <div className="w-1/3">
            <SecondaryButton onClick={handleBack} disabled={isLoading}>
              Back
            </SecondaryButton>
          </div>
        )}
        <div className="flex-1">
          <PrimaryButton
            onClick={handleNext}
            disabled={
              (step === 1 && (!verifiedName || !disco || !tariffBand || !meterType)) ||
              (step === 3 && !currentUnits) ||
              isLoading ||
              isVerifying
            }
            isLoading={isLoading}
          >
            {step === 3 ? "Finish Setup" : "Continue"}
          </PrimaryButton>
        </div>
      </div>

      {isCustomOpen && (
        <div
          onClick={() => setIsCustomOpen(false)}
          className="absolute inset-0 bg-black/40 z-50 transition-opacity duration-300 animate-fade-in"
        />
      )}
      <div
        className={`absolute inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl p-6 border-t border-zinc-100 transition-all duration-300 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] ${
          isCustomOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto w-12 h-1.5 rounded-full bg-zinc-200 mb-4 cursor-pointer" onClick={() => setIsCustomOpen(false)} />
        <h3 className="text-base font-bold text-[#121212] mb-1">New Custom Appliance</h3>
        <p className="text-xs text-[#4B5563] mb-4">Enter details for your custom appliance.</p>

        <div className="flex flex-col gap-4 mb-6">
          <TextField
            placeholder="e.g. Washing Machine"
            label="Appliance Name"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            disabled={isLoading}
          />
          <TextField
            placeholder="e.g. 500"
            label="Wattage (W)"
            type="number"
            value={customWattage}
            onChange={(e) => setCustomWattage(e.target.value)}
            disabled={isLoading}
          />
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#4B5563] flex items-center gap-1">
                <IconClock className="w-3.5 h-3.5" /> Daily Usage Hours
              </span>
              <span className="font-semibold text-[#121212]">{customHours} hrs</span>
            </div>
            <Slider
              value={[customHours]}
              min={0.5}
              max={24}
              step={0.5}
              onValueChange={(vals) => setCustomHours(vals[0])}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleAddCustom}
            disabled={!customName.trim() || !customWattage || isLoading}
            className="w-full h-12 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Appliance
          </button>
          <button
            type="button"
            onClick={() => setIsCustomOpen(false)}
            className="w-full h-12 rounded-xl border border-zinc-200 bg-transparent text-[#4B5563] text-sm font-semibold flex items-center justify-center transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
