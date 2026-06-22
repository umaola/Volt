import * as React from "react"
import { StandardCard } from "@/components/design-system/card"
import {
  IconAirConditioning,
  IconDroplet,
  IconBriefcase,
  IconBolt,
  IconDeviceTv,
  IconSnowflake,
  IconWind,
  IconFlame
} from "@tabler/icons-react"

interface Device {
  name: string
  room: string
  subtitle: string
  value: string
  active: boolean
  progress: number
  wattage: number
}

interface ActiveDevicesProps {
  devices: Device[]
  onToggleDevice: (index: number) => void
  onQuickAction: (action: "calculator" | "outage" | "appliance" | "insights" | "history" | "notification_opened" | "surge-checklist") => void
}

export function ActiveDevices({ devices, onToggleDevice, onQuickAction }: ActiveDevicesProps) {
  return (
    <div className="flex flex-col gap-3 overflow-hidden">
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-[#121212] uppercase tracking-wider">Active Devices</span>
        <button
          onClick={() => onQuickAction("appliance")}
          className="text-xs font-bold text-[#008F47] hover:underline flex items-center gap-0.5"
        >
          Manage all &rarr;
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {devices.map((device, index) => {
          let Icon = IconBolt
          let iconBg = "bg-zinc-100 text-zinc-400"
          const normalized = device.name.toLowerCase()
          
          if (normalized.includes("air conditioner") || normalized.includes("ac")) {
            Icon = IconAirConditioning
            iconBg = device.active ? "bg-blue-50 text-blue-500" : "bg-zinc-100 text-zinc-400"
          } else if (normalized.includes("water heater") || normalized.includes("geyser") || normalized.includes("heater")) {
            Icon = IconDroplet
            iconBg = device.active ? "bg-amber-50 text-amber-500" : "bg-zinc-100 text-zinc-400"
          } else if (normalized.includes("tv") || normalized.includes("television") || normalized.includes("screen")) {
            Icon = IconDeviceTv
            iconBg = device.active ? "bg-purple-50 text-purple-500" : "bg-zinc-100 text-zinc-400"
          } else if (normalized.includes("refrigerator") || normalized.includes("fridge") || normalized.includes("freezer")) {
            Icon = IconSnowflake
            iconBg = device.active ? "bg-sky-50 text-sky-500" : "bg-zinc-100 text-zinc-400"
          } else if (normalized.includes("fan") || normalized.includes("ventilator")) {
            Icon = IconWind
            iconBg = device.active ? "bg-teal-50 text-teal-500" : "bg-zinc-100 text-zinc-400"
          } else if (normalized.includes("iron") || normalized.includes("microwave") || normalized.includes("kettle") || normalized.includes("cooker")) {
            Icon = IconFlame
            iconBg = device.active ? "bg-orange-50 text-orange-500" : "bg-zinc-100 text-zinc-400"
          } else if (normalized.includes("home office") || normalized.includes("office") || normalized.includes("work")) {
            Icon = IconBriefcase
            iconBg = device.active ? "bg-purple-50 text-purple-500" : "bg-zinc-100 text-zinc-400"
          }

          return (
            <StandardCard key={device.name} className="p-4 flex flex-col gap-3 bg-white border border-zinc-100 shadow-sm rounded-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#121212]">{device.name}</span>
                    <span className="text-[10px] text-zinc-400 font-semibold">{device.subtitle}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-[#121212]">{device.value}</span>
                  </div>

                  <button
                    onClick={() => onToggleDevice(index)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 relative focus:outline-none shrink-0 ${
                      device.active ? "bg-[#00BF63]" : "bg-zinc-200"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 transform ${
                        device.active ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>            </StandardCard>
          )
        })}
      </div>
    </div>
  )
}
