import * as React from "react"
import { HeroHeader, ExpandedHeader } from "./hero-header"
import { QuickStats } from "./quick-stats"
import { UsageChart } from "./usage-chart"
import { ActiveDevices } from "./active-devices"
import { RechargeCard } from "./recharge-card"
import { SavingsTip } from "./savings-tip"
import { GridLifespan } from "./grid-lifespan"

interface DashboardActivity {
  type: "recharge" | "outage" | "supply"
  title: string
  desc: string
  time: string
}

interface DashboardPageProps {
  isLoading: boolean
  userName: string
  remainingUnits: number
  daysRemaining: number
  dailyBurnRate: number
  powerSupplyHours: number
  powerState: "on" | "off"
  recentActivity: DashboardActivity[]
  expectedSupplyHours: number
  tariffBand: string
  onTogglePower: (state: "on" | "off") => void
  onQuickAction: (action: "calculator" | "outage" | "appliance" | "insights" | "history" | "notification_opened" | "surge-checklist") => void
  onProfileClick: () => void
  appliances: Array<{ name: string; wattage?: number; custom_wattage?: number; hours?: number; hours_per_day?: number }>
  deviceActiveStates: Record<string, boolean>
  onToggleDevice: (name: string) => void
  recharges?: any[]
  powerLogs?: any[]
  usageLogs?: any[]
  weeklyUsage?: any[]
  monthlyUsage?: any[]
  estimatedSessionMinutes?: number
  currentSessionStart?: string
  onCalibrateManual?: () => void
}

export function DashboardPage({
  isLoading,
  userName,
  remainingUnits,
  daysRemaining,
  dailyBurnRate,
  powerSupplyHours,
  powerState,
  recentActivity = [],
  expectedSupplyHours,
  tariffBand,
  onTogglePower,
  onQuickAction,
  onProfileClick,
  appliances = [],
  deviceActiveStates = {},
  onToggleDevice,
  recharges = [],
  powerLogs = [],
  usageLogs = [],
  weeklyUsage = [],
  monthlyUsage = [],
  estimatedSessionMinutes = 360,
  currentSessionStart,
  onCalibrateManual
}: DashboardPageProps) {
  const [mockDevices, setMockDevices] = React.useState([
    {
      name: "Air Conditioner",
      room: "Living Room",
      subtitle: "Living Room • Running 5h today",
      value: "5.4 kWh",
      active: true,
      progress: 70,
      wattage: 1500
    },
    {
      name: "Water Heater",
      room: "Bathroom",
      subtitle: "Bathroom • Scheduled 5am-7am",
      value: "2.1 kWh",
      active: true,
      progress: 30,
      wattage: 3000
    },
    {
      name: "Home Office",
      room: "Study Room",
      subtitle: "Living Room • Running 6h today",
      value: "0.8 kWh",
      active: false,
      progress: 15,
      wattage: 350
    }
  ])

  const handleToggleMockDevice = (index: number) => {
    setMockDevices(
      mockDevices.map((d, i) =>
        i === index
          ? {
              ...d,
              active: !d.active
            }
          : d
      )
    )
  }

  const mappedDevices = (appliances.length > 0
    ? appliances.map((app) => {
        const active = deviceActiveStates[app.name] !== false
        const wattage = app.wattage ?? app.custom_wattage ?? 0
        const hours = app.hours ?? app.hours_per_day ?? 0
        const dailyKwh = (wattage * hours) / 1000
        return {
          name: app.name,
          room: "Appliance",
          subtitle: `${hours}h daily limit`,
          value: `${dailyKwh.toFixed(1)} kWh`,
          active,
          progress: active ? 100 : 0,
          wattage
        }
      })
    : mockDevices).slice(0, 3)

  const handleToggle = (index: number) => {
    if (appliances.length > 0) {
      onToggleDevice(appliances[index].name)
    } else {
      handleToggleMockDevice(index)
    }
  }

  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsCollapsed(e.currentTarget.scrollTop > 20)
  }


  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col bg-zinc-50 overflow-y-auto animate-pulse">
        <div className="bg-[#00BF63] h-48 rounded-b-[2.5rem] p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div className="h-4 w-32 bg-emerald-400/50 rounded"></div>
            <div className="w-8 h-8 rounded-full bg-emerald-400/50"></div>
          </div>
          <div className="h-8 w-48 bg-emerald-400/50 rounded mb-2"></div>
        </div>
        <div className="p-5 flex flex-col gap-5 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 bg-white border border-[#F3F4F6] rounded-2xl"></div>
            <div className="h-24 bg-white border border-[#F3F4F6] rounded-2xl"></div>
          </div>
          <div className="h-24 w-1/2 bg-white border border-[#F3F4F6] rounded-2xl"></div>
          <div className="h-44 bg-white border border-[#F3F4F6] rounded-2xl"></div>
          <div className="h-64 bg-white border border-[#F3F4F6] rounded-2xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-grow flex flex-col bg-[#F9FAFB] relative overflow-hidden h-full w-full">
      <HeroHeader
        userName={userName}
        onProfileClick={onProfileClick}
        isCollapsed={isCollapsed}
        remainingUnits={remainingUnits}
      />

      <div
        className="flex-grow overflow-y-auto pb-6 scroll-smooth w-full h-full"
        onScroll={handleScroll}
      >
        <ExpandedHeader
          userName={userName}
          remainingUnits={remainingUnits}
          tariffBand={tariffBand}
          expectedSupplyHours={expectedSupplyHours}
          onProfileClick={onProfileClick}
          onCalibrateManual={onCalibrateManual}
        />

      {powerState === "on" && (
        <div className="mx-5 mt-4 bg-emerald-950 border border-emerald-800 text-white rounded-2xl p-4 shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300 relative overflow-hidden z-20">
          <div className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-emerald-500/10 pointer-events-none" />
          <div className="flex items-center gap-3 z-10">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <span className="animate-pulse text-sm">⚡</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white leading-none">Power is back!</span>
              <span className="text-[10px] text-zinc-300 mt-1 leading-normal">
                Maximize this window. Complete your Surge Checklist.
              </span>
            </div>
          </div>
          <button
            onClick={() => onQuickAction("surge-checklist")}
            className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition-all shadow-md shrink-0 z-10"
          >
            Start
          </button>
        </div>
      )}

      {powerState === "off" && (
        <div className="mx-5 mt-4 bg-zinc-900 border border-zinc-800 text-white rounded-2xl p-4 shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300 relative overflow-hidden z-20">
          <div className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-zinc-800/20 pointer-events-none" />
          <div className="flex items-center gap-3 z-10">
            <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 shrink-0">
              <span className="text-sm">🔌</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white leading-none">There is no light</span>
              <span className="text-[10px] text-zinc-400 mt-1 leading-normal">
                Log when power returns.
              </span>
            </div>
          </div>
          <button
            onClick={() => onTogglePower("on")}
            className="bg-[#00BF63] hover:bg-emerald-600 active:scale-95 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition-all shadow-md shrink-0 z-10"
          >
            Power On
          </button>
        </div>
      )}

      <div className="px-5 pb-5 flex flex-col gap-6 mt-4 z-20">

        {powerState === "on" && (
          <GridLifespan
            powerState={powerState}
            estimatedDurationMinutes={estimatedSessionMinutes}
            onTogglePower={onTogglePower}
            hasCommunityData={powerLogs && powerLogs.length > 0}
            currentSessionStart={currentSessionStart}
          />
        )}

        <QuickStats dailyBurnRate={dailyBurnRate} daysRemaining={daysRemaining} />
        
        <UsageChart usageLogs={usageLogs} weeklyUsage={weeklyUsage} monthlyUsage={monthlyUsage} />

        <ActiveDevices
          devices={mappedDevices}
          onToggleDevice={handleToggle}
          onQuickAction={onQuickAction}
        />

        <RechargeCard
          onQuickAction={onQuickAction}
          recharges={recharges}
          powerLogs={powerLogs}
          usageLogs={usageLogs}
        />

        <SavingsTip />
      </div>
      </div>
    </div>
  )
}
