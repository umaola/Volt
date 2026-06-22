import * as React from "react"
import { TextField, DropdownField } from "@/components/design-system/input"
import { PrimaryButton, GhostButton } from "@/components/design-system/button"
import { StandardCard } from "@/components/design-system/card"
import {
  IconAirConditioning,
  IconDroplet,
  IconDeviceTv,
  IconSnowflake,
  IconWind,
  IconBolt,
  IconPlus,
  IconTrash,
  IconEdit,
  IconCheck,
  IconX,
  IconFlame
} from "@tabler/icons-react"
import { Skeleton } from "@/components/ui/skeleton"

const PRESETS = [
  { name: "Fan", wattage: 75, hours: 8 },
  { name: "TV", wattage: 100, hours: 6 },
  { name: "Refrigerator", wattage: 250, hours: 24 },
  { name: "Air Conditioner", wattage: 1500, hours: 4 },
  { name: "Electric Iron", wattage: 1000, hours: 1 }
]

interface Appliance {
  name: string
  wattage: number
  hours: number
}

interface DevicesPageProps {
  isLoading: boolean
  appliances: Appliance[]
  deviceActiveStates: Record<string, boolean>
  onToggleDevice: (name: string) => void
  onAddAppliance: (appliance: { name: string; wattage: number; hours: number }) => void
  onEditAppliance: (appliance: { name: string; wattage: number; hours: number }) => void
  onDeleteAppliance: (name: string) => void
  isSubmitting?: boolean
}

export function DevicesPage({
  isLoading,
  appliances = [],
  deviceActiveStates = {},
  onToggleDevice,
  onAddAppliance,
  onEditAppliance,
  onDeleteAppliance,
  isSubmitting = false
}: DevicesPageProps) {
  const [isAdding, setIsAdding] = React.useState(false)
  const [newName, setNewName] = React.useState("")
  const [customName, setCustomName] = React.useState("")
  const [newWattage, setNewWattage] = React.useState("")
  const [newHours, setNewHours] = React.useState("")

  const [showSuccess, setShowSuccess] = React.useState(false)
  const prevSubmitting = React.useRef(isSubmitting)

  React.useEffect(() => {
    if (prevSubmitting.current && !isSubmitting) {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
    prevSubmitting.current = isSubmitting
  }, [isSubmitting])

  const [editingName, setEditingName] = React.useState<string | null>(null)
  const [editWattage, setEditWattage] = React.useState("")
  const [editHours, setEditHours] = React.useState("")

  const handleSaveEdit = () => {
    if (editingName && editWattage && editHours) {
      onEditAppliance({
        name: editingName,
        wattage: Number(editWattage),
        hours: Number(editHours)
      })
      setEditingName(null)
    }
  }

  const startEdit = (app: Appliance) => {
    setEditingName(app.name)
    setEditWattage(app.wattage.toString())
    setEditHours(app.hours.toString())
  }

  const handleAdd = () => {
    const finalName = newName === "Custom" ? customName.trim() : newName
    if (finalName && newWattage && newHours) {
      onAddAppliance({
        name: finalName,
        wattage: Number(newWattage),
        hours: Number(newHours)
      })
      setIsAdding(false)
      setNewName("")
      setCustomName("")
      setNewWattage("")
      setNewHours("")
    }
  }

  const getDeviceIcon = (name: string, active: boolean) => {
    const lowercaseName = name.toLowerCase()
    let Icon = IconBolt
    let colorClass = active ? "bg-emerald-50 text-[#00BF63] border-emerald-100" : "bg-zinc-100 text-zinc-400 border-zinc-200"

    if (lowercaseName.includes("air conditioner") || lowercaseName.includes("ac")) {
      Icon = IconAirConditioning
      if (active) colorClass = "bg-blue-50 text-blue-500 border-blue-100"
    } else if (lowercaseName.includes("water heater") || lowercaseName.includes("geyser") || lowercaseName.includes("heater")) {
      Icon = IconDroplet
      if (active) colorClass = "bg-amber-50 text-amber-500 border-amber-100"
    } else if (lowercaseName.includes("tv") || lowercaseName.includes("television") || lowercaseName.includes("screen")) {
      Icon = IconDeviceTv
      if (active) colorClass = "bg-purple-50 text-purple-500 border-purple-100"
    } else if (lowercaseName.includes("refrigerator") || lowercaseName.includes("fridge") || lowercaseName.includes("freezer")) {
      Icon = IconSnowflake
      if (active) colorClass = "bg-sky-50 text-sky-500 border-sky-100"
    } else if (lowercaseName.includes("fan") || lowercaseName.includes("ventilator")) {
      Icon = IconWind
      if (active) colorClass = "bg-teal-50 text-teal-500 border-teal-100"
    }

    return (
      <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-colors ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
    )
  }

  const activeCount = appliances.filter(app => deviceActiveStates[app.name] !== false).length
  const totalLoadKw = appliances.reduce((sum, app) => {
    const isActive = deviceActiveStates[app.name] !== false
    return sum + (isActive ? app.wattage : 0)
  }, 0) / 1000

  const estDailyConsumption = appliances.reduce((sum, app) => {
    const isActive = deviceActiveStates[app.name] !== false
    return sum + (isActive ? (app.wattage * app.hours) : 0)
  }, 0) / 1000

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col bg-zinc-50 overflow-y-auto">
        <div className="bg-white px-6 pt-6 pb-4 border-b border-zinc-100 sticky top-0 z-10">
          <Skeleton className="h-6 w-40 mb-1.5" />
          <Skeleton className="h-3.5 w-64" />
        </div>

        <div className="p-5 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-grow flex flex-col bg-zinc-50 relative overflow-hidden h-full">
      <div className="bg-white px-6 pt-6 pb-4 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-[#121212]">Devices Control</h1>
          <p className="text-xs text-[#4B5563]">Manage and toggle your active appliances.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#00BF63] text-white p-2 rounded-full shadow-md hover:bg-emerald-600 transition-colors"
          disabled={isSubmitting}
        >
          <IconPlus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-8 flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          <StandardCard className="p-4 flex flex-col justify-between h-24">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Active Devices</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-[#121212]">{activeCount}</span>
              <span className="text-xs text-zinc-500">/ {appliances.length} ON</span>
            </div>
          </StandardCard>

          <StandardCard className="p-4 flex flex-col justify-between h-24">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Current Load</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-[#121212]">{totalLoadKw.toFixed(2)}</span>
              <span className="text-xs text-zinc-500">kW</span>
            </div>
          </StandardCard>
        </div>

        <StandardCard className="p-4 bg-emerald-50/20 border-emerald-100/50 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Est. Daily Consumption</span>
            <span className="text-lg font-extrabold text-[#00BF63] mt-0.5">{estDailyConsumption.toFixed(2)} kWh</span>
          </div>
          <IconFlame className="w-8 h-8 text-[#00BF63]/70 animate-pulse" />
        </StandardCard>

        {isAdding && (
          <StandardCard className="flex flex-col gap-4 border-2 border-dashed border-[#00BF63]/30 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <span className="text-xs font-bold text-[#121212] uppercase tracking-wider">Add New Device</span>
              <button onClick={() => setIsAdding(false)} className="text-zinc-400 hover:text-red-500">
                <IconX className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              <DropdownField
                label="Device Type"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value)
                  const preset = PRESETS.find((p) => p.name === e.target.value)
                  if (preset) {
                    setNewWattage(preset.wattage.toString())
                    setNewHours(preset.hours.toString())
                  }
                }}
                options={[
                  { value: "", label: "Select Preset..." },
                  { value: "Custom", label: "Custom (Type name below)" },
                  { value: "Air Conditioner", label: "Air Conditioner" },
                  { value: "Electric Iron", label: "Electric Iron" },
                  { value: "Fan", label: "Fan" },
                  { value: "Refrigerator", label: "Refrigerator" },
                  { value: "TV", label: "TV" }
                ]}
                disabled={isSubmitting}
              />

              {newName === "Custom" && (
                <TextField
                  label="Custom Name"
                  placeholder="e.g. Microwave"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  disabled={isSubmitting}
                />
              )}

              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Wattage (W)"
                  type="number"
                  placeholder="e.g. 75"
                  value={newWattage}
                  onChange={(e) => setNewWattage(e.target.value)}
                  disabled={isSubmitting}
                />
                <TextField
                  label="Hours/Day"
                  type="number"
                  placeholder="e.g. 8"
                  value={newHours}
                  onChange={(e) => setNewHours(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-1">
              <GhostButton onClick={() => setIsAdding(false)} disabled={isSubmitting}>
                Cancel
              </GhostButton>
              <PrimaryButton onClick={handleAdd} isLoading={isSubmitting} className="h-10 text-sm">
                Add Device
              </PrimaryButton>
            </div>
          </StandardCard>
        )}

        <div className="flex flex-col gap-3 animate-fade-in">
          {appliances.length === 0 ? (
            <div className="bg-white border border-dashed border-zinc-200 rounded-2xl py-12 text-center flex flex-col items-center justify-center gap-2 animate-in fade-in duration-300">
              <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400">
                <IconBolt className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#4B5563]">No devices connected</span>
              <span className="text-[10px] text-[#9CA3AF]">Click the + button to add your first device.</span>
            </div>
          ) : (
            appliances.map((app) => {
              const isEditing = editingName === app.name
              const isActive = deviceActiveStates[app.name] !== false

              return (
                <StandardCard key={app.name} className="p-4 flex flex-col gap-3 bg-white border border-zinc-100 shadow-sm rounded-2xl">
                  {isEditing ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center border-b border-zinc-100 pb-1.5 mb-1">
                        <span className="text-xs font-bold text-[#121212]">{app.name}</span>
                        <div className="flex items-center gap-2">
                          <button onClick={handleSaveEdit} className="text-[#00BF63] hover:text-emerald-700" disabled={isSubmitting}>
                            <IconCheck className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingName(null)} className="text-red-500 hover:text-red-700" disabled={isSubmitting}>
                            <IconX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <TextField
                          label="Wattage (W)"
                          type="number"
                          value={editWattage}
                          onChange={(e) => setEditWattage(e.target.value)}
                          disabled={isSubmitting}
                        />
                        <TextField
                          label="Hours/Day"
                          type="number"
                          value={editHours}
                          onChange={(e) => setEditHours(e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {getDeviceIcon(app.name, isActive)}
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#121212]">{app.name}</span>
                            <span className="text-[10px] text-zinc-400 font-semibold">
                              {app.wattage}W × {app.hours} hrs/day
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-bold text-[#121212]">
                              {((app.wattage * app.hours) / 1000).toFixed(2)} kWh
                            </span>
                          </div>

                          <button
                            onClick={() => onToggleDevice(app.name)}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 relative focus:outline-none shrink-0 ${
                              isActive ? "bg-[#00BF63]" : "bg-zinc-200"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 transform ${
                                isActive ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-zinc-100 pt-2.5 mt-0.5">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Device Management</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => startEdit(app)}
                            className="text-zinc-400 hover:text-[#00BF63] flex items-center gap-1 text-[10px] font-bold"
                            disabled={isSubmitting}
                          >
                            <IconEdit className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => onDeleteAppliance(app.name)}
                            className="text-zinc-400 hover:text-red-500 flex items-center gap-1 text-[10px] font-bold"
                            disabled={isSubmitting}
                          >
                            <IconTrash className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </StandardCard>
              )
            })
          )}
        </div>
      </div>

      {showSuccess && (
        <div className="absolute bottom-6 left-6 right-6 z-50 bg-zinc-900 border border-zinc-800 text-white rounded-xl p-3 shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <IconCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Device added successfully!</span>
          </div>
          <button 
            type="button" 
            onClick={() => setShowSuccess(false)}
            className="text-zinc-400 hover:text-white p-1 rounded transition-colors"
          >
            <IconX className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
