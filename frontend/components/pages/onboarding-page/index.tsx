import * as React from "react"
import { PrimaryButton, SecondaryButton } from "@/components/design-system/button"
import { MeterProfileStep } from "./meter-profile-step"
import { DwellingTypeStep, DWELLING_TYPES } from "./dwelling-type-step"
import { ApplianceCalibrationStep } from "./appliance-calibration-step"
import { CreditUnitsStep } from "./credit-units-step"
import { OnboardingSkeleton } from "./skeleton-loading"
import { TextField } from "@/components/design-system/input"
import { IconClock } from "@tabler/icons-react"

interface OnboardingPageProps {
  isLoading: boolean
  onComplete: (data: {
    meterNumber: string
    disco: string
    tariffBand: string
    meterType: string
    dwellingType?: string
    appliances: { name: string; wattage: number; hours: number }[]
    currentUnits: number
    powerState: "on" | "off"
  }) => void
  onVerifyMeter: (
    meterNumber: string,
    disco: string,
    meterType: string,
    tariffBand?: string
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

  const [dwellingType, setDwellingType] = React.useState("")

  const [selectedAppliances, setSelectedAppliances] = React.useState<
    { name: string; wattage: number; hours: number }[]
  >([])

  const [currentUnits, setCurrentUnits] = React.useState("")
  const [powerState, setPowerState] = React.useState<"on" | "off">("off")

  const [customAppliances, setCustomAppliances] = React.useState<
    { name: string; defaultWattage: number; defaultHours: number }[]
  >([])

  const [isCustomOpen, setIsCustomOpen] = React.useState(false)
  const [customName, setCustomName] = React.useState("")
  const [customWattage, setCustomWattage] = React.useState("")
  const [customHours, setCustomHours] = React.useState(4)

  const catalog = [
    { name: "LED Lights", defaultWattage: 18, defaultHours: 6 },
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
        onVerifyMeter(cleanMeter, disco, meterType, tariffBand)
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
  }, [meterNumber, disco, meterType, tariffBand, onVerifyMeter])

  const handleSelectDwellingType = (typeId: string) => {
    setDwellingType(typeId)
    const type = DWELLING_TYPES.find((t) => t.id === typeId)
    const roomCount = type?.rooms || 2
    const ledBulbCount = roomCount * 2
    const ledWattage = ledBulbCount * 9

    const base: { name: string; wattage: number; hours: number }[] = [
      { name: "LED Lights", wattage: ledWattage, hours: 6 },
      { name: "Fan", wattage: Math.min(roomCount, 5) * 75, hours: 8 },
      { name: "TV", wattage: typeId === "duplex" ? 200 : 100, hours: 6 },
      { name: "Refrigerator", wattage: 250, hours: 24 }
    ]

    if (typeId === "three_bed_flat" || typeId === "duplex") {
      base.push({ name: "Air Conditioner", wattage: 1500, hours: 4 })
    }

    setSelectedAppliances(base)
  }

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
    if (step < 4) {
      setStep(step + 1)
    } else {
      onComplete({
        meterNumber,
        disco,
        tariffBand,
        meterType,
        dwellingType,
        appliances: selectedAppliances,
        currentUnits: parseFloat(currentUnits) || 0,
        powerState
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
            Step {step} of 4
          </span>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
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
          <DwellingTypeStep
            selectedType={dwellingType}
            onSelectType={handleSelectDwellingType}
            isLoading={isLoading}
          />
        )}

        {step === 3 && (
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

        {step === 4 && (
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
              (step === 2 && !dwellingType) ||
              (step === 4 && !currentUnits) ||
              isLoading ||
              isVerifying
            }
            isLoading={isLoading}
          >
            {step === 4 ? "Finish Setup" : "Continue"}
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
          />

          <TextField
            placeholder="e.g. 1500"
            label="Wattage (W)"
            type="number"
            value={customWattage}
            onChange={(e) => setCustomWattage(e.target.value)}
          />

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#121212] flex items-center gap-1">
                <IconClock className="w-4 h-4 text-[#4B5563]" />
                Daily Usage
              </span>
              <span className="font-bold text-primary">{customHours} hrs/day</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="24"
              step="0.5"
              value={customHours}
              onChange={(e) => setCustomHours(parseFloat(e.target.value))}
              className="w-full accent-primary h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-1/3">
            <SecondaryButton onClick={() => setIsCustomOpen(false)}>Cancel</SecondaryButton>
          </div>
          <div className="flex-1">
            <PrimaryButton onClick={handleAddCustom} disabled={!customName.trim() || !customWattage}>
              Add Appliance
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  )
}
