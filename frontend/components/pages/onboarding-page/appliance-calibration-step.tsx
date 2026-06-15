import * as React from "react"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { StandardCard } from "@/components/design-system/card"
import { TextField } from "@/components/design-system/input"
import {
  IconWind,
  IconDeviceTv,
  IconSnowflake,
  IconFlame,
  IconPlug,
  IconPlus,
  IconClock,
  IconBolt
} from "@tabler/icons-react"

interface Appliance {
  name: string
  wattage: number
  hours: number
}

interface CatalogItem {
  name: string
  defaultWattage: number
  defaultHours: number
}

interface ApplianceCalibrationStepProps {
  selectedAppliances: Appliance[]
  onApplianceToggle: (item: CatalogItem) => void
  onApplianceUpdate: (name: string, field: "wattage" | "hours", value: number) => void
  onOpenCustomDrawer: () => void
  catalog: CatalogItem[]
  customAppliances: CatalogItem[]
  isLoading: boolean
}

export function ApplianceCalibrationStep({
  selectedAppliances,
  onApplianceToggle,
  onApplianceUpdate,
  onOpenCustomDrawer,
  catalog,
  customAppliances,
  isLoading
}: ApplianceCalibrationStepProps) {
  const getApplianceIcon = (name: string) => {
    const normalized = name.toLowerCase()
    if (normalized.includes("fan")) return <IconWind className="w-5 h-5 text-emerald-600" />
    if (normalized.includes("tv") || normalized.includes("television")) return <IconDeviceTv className="w-5 h-5 text-indigo-600" />
    if (normalized.includes("refrigerator") || normalized.includes("fridge")) return <IconSnowflake className="w-5 h-5 text-sky-600" />
    if (normalized.includes("air conditioner") || normalized.includes("ac")) return <IconSnowflake className="w-5 h-5 text-cyan-600" />
    if (normalized.includes("iron")) return <IconFlame className="w-5 h-5 text-amber-600" />
    if (normalized.includes("microwave")) return <IconFlame className="w-5 h-5 text-orange-600" />
    return <IconPlug className="w-5 h-5 text-[#888888]" />
  }

  const allItems = React.useMemo(() => {
    return [...catalog, ...customAppliances]
  }, [catalog, customAppliances])

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#121212]">Calibrate Appliances</h1>
        <p className="text-sm text-[#4B5563]">Volt uses these to calculate consumption forecasts.</p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">
          Tap to Select Appliances
        </span>
        <div className="grid grid-cols-2 gap-3">
          {allItems.map((item) => {
            const selected = selectedAppliances.find((a) => a.name === item.name)
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => onApplianceToggle(item)}
                disabled={isLoading}
                className={`flex flex-col items-center justify-between p-4 rounded-xl border text-center transition-all duration-300 gap-3 focus:outline-hidden ${
                  selected
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`flex items-center justify-center p-2 rounded-lg ${
                      selected ? "bg-primary/10" : "bg-zinc-100"
                    }`}
                  >
                    {getApplianceIcon(item.name)}
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      selected
                        ? "border-primary bg-primary"
                        : "border-zinc-300 bg-transparent"
                    }`}
                  >
                    {selected && (
                      <span className="block w-1.5 h-1.5 rounded-full bg-white animate-scale-in" />
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-start w-full">
                  <span className="font-bold text-xs text-[#121212] leading-tight truncate w-full text-left">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-[#4B5563] mt-0.5">
                    {item.defaultWattage}W
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {selectedAppliances.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">
            Calibrate Selected
          </span>
          <div className="flex flex-col gap-3">
            {selectedAppliances.map((app) => {
              const appDailyKwh = (app.wattage * app.hours) / 1000
              return (
                <StandardCard key={app.name} className="flex flex-col gap-4 p-4 border border-zinc-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-100 shrink-0">
                        {getApplianceIcon(app.name)}
                      </div>
                      <span className="font-bold text-sm text-[#121212]">{app.name}</span>
                    </div>
                    <Badge variant="secondary" className="font-semibold text-[10px]">
                      {appDailyKwh.toFixed(2)} kWh/day
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-3">
                    <TextField
                      placeholder="e.g. 100"
                      label="Wattage (W)"
                      type="number"
                      value={app.wattage || ""}
                      onChange={(e) => onApplianceUpdate(app.name, "wattage", parseInt(e.target.value, 10) || 0)}
                      disabled={isLoading}
                    />

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#4B5563] flex items-center gap-1">
                          <IconClock className="w-3.5 h-3.5" /> Daily Usage
                        </span>
                        <span className="font-semibold text-[#121212]">{app.hours} hrs</span>
                      </div>
                      <Slider
                        value={[app.hours]}
                        min={0.5}
                        max={24}
                        step={0.5}
                        onValueChange={(vals) => onApplianceUpdate(app.name, "hours", vals[0])}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </StandardCard>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onOpenCustomDrawer}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-dashed border-zinc-300 hover:border-primary hover:text-primary transition-all text-xs font-semibold text-[#4B5563]"
        >
          <IconPlus className="w-4 h-4" /> Add Custom Appliance
        </button>
      </div>
    </div>
  )
}
