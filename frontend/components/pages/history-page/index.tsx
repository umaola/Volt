"use client"

import * as React from "react"
import {
  IconArrowLeft,
  IconBolt,
  IconClock,
  IconCoins,
  IconAlertCircle,
  IconCalendar,
  IconTrendingUp,
  IconBulb
} from "@tabler/icons-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { StandardCard } from "@/components/design-system/card"

interface Recharge {
  id: string
  amount: number
  units: number
  date: string
  source: string
}

interface PowerLog {
  id: string
  powerOn: string
  powerOff: string | null
  duration: number
  source: string
}

interface UsageLog {
  date: string
  unitsUsed: number
  cost: number
}

interface HistoryPageProps {
  isLoading: boolean
  recharges: Recharge[]
  powerLogs: PowerLog[]
  usageLogs: UsageLog[]
  onBack: () => void
}

export function HistoryPage({
  isLoading,
  recharges = [],
  powerLogs = [],
  usageLogs = [],
  onBack
}: HistoryPageProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch {
      return dateStr
    }
  }

  const formatDateOnly = (dateStr: string) => {
    try {
      const d = new Date(dateStr + "T00:00:00")
      return d.toLocaleDateString("en-NG", {
        weekday: "short",
        month: "short",
        day: "numeric"
      })
    } catch {
      return dateStr
    }
  }

  const totalRechargeAmount = recharges.reduce((acc, curr) => acc + curr.amount, 0)
  const totalRechargeUnits = recharges.reduce((acc, curr) => acc + curr.units, 0)
  
  const activePowerSupply = powerLogs.find(log => log.powerOff === null)
  const totalSupplyHours = powerLogs.reduce((acc, curr) => acc + curr.duration, 0)
  const completedOutagesCount = powerLogs.filter(log => log.powerOff !== null).length

  const totalKwhUsed = usageLogs.reduce((acc, curr) => acc + curr.unitsUsed, 0)
  const totalEstimatedCost = usageLogs.reduce((acc, curr) => acc + curr.cost, 0)
  const averageDailyCost = usageLogs.length > 0 ? totalEstimatedCost / usageLogs.length : 0

  if (isLoading || !mounted) {
    return (
      <div className="flex-1 flex flex-col bg-zinc-50 overflow-y-auto">
        <div className="bg-white px-6 pt-6 pb-4 border-b border-zinc-100 flex items-center justify-between sticky top-0 z-10">
          <div className="w-8 h-8 rounded-full bg-zinc-100 animate-pulse" />
          <div className="h-5 w-28 bg-zinc-200 rounded animate-pulse" />
          <div className="w-8" />
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="h-10 w-full bg-zinc-200 rounded-full animate-pulse" />
          
          <div className="h-28 bg-white border border-[#F3F4F6] rounded-2xl p-5 flex flex-col justify-between animate-pulse">
            <div className="h-3 w-24 bg-zinc-200 rounded" />
            <div className="h-8 w-48 bg-zinc-300 rounded" />
            <div className="h-3.5 w-32 bg-zinc-200 rounded" />
          </div>

          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white border border-[#F3F4F6] rounded-xl p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-200" />
                  <div className="flex flex-col gap-2">
                    <div className="h-3.5 w-24 bg-zinc-300 rounded" />
                    <div className="h-2.5 w-16 bg-zinc-200 rounded" />
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className="h-3.5 w-16 bg-zinc-300 rounded" />
                  <div className="h-2.5 w-12 bg-zinc-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 overflow-y-auto">
      <div className="bg-white px-6 pt-6 pb-4 border-b border-zinc-100 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-[#4B5563] hover:text-[#121212] transition-colors"
        >
          <IconArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-[#121212]">History & Logs</h1>
        <div className="w-9" />
      </div>

      <div className="p-5 flex flex-col gap-5">
        <Tabs defaultValue="recharges" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-zinc-100 p-1 rounded-xl h-11 mb-4">
            <TabsTrigger value="recharges" className="rounded-lg font-bold text-xs">
              Recharges
            </TabsTrigger>
            <TabsTrigger value="power" className="rounded-lg font-bold text-xs">
              Power
            </TabsTrigger>
            <TabsTrigger value="usage" className="rounded-lg font-bold text-xs">
              Usage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recharges" className="flex flex-col gap-4">
            <StandardCard className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 text-white shadow-md p-5 flex flex-col gap-2">
              <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">
                Total Recharge Investment
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold tracking-tight">
                  ₦{totalRechargeAmount.toLocaleString()}
                </span>
                <span className="text-xs font-medium text-emerald-100">
                  ({totalRechargeUnits.toFixed(1)} kWh total)
                </span>
              </div>
              <span className="text-[11px] text-emerald-100/90 mt-1">
                Logged transactions from manual input or verification
              </span>
            </StandardCard>

            <div className="flex flex-col gap-3">
              {recharges.length > 0 ? (
                recharges.map(item => (
                  <div
                    key={item.id}
                    className="bg-white border border-[#F3F4F6] rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-zinc-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-primary">
                        <IconCoins className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#121212]">
                          ₦{item.amount.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-[#4B5563]">
                          {formatDateTime(item.date)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-primary">
                        +{item.units.toFixed(1)} kWh
                      </span>
                      <span className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-wider">
                        {item.source}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white border border-dashed border-zinc-200 rounded-xl py-12 text-center flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400">
                    <IconCoins className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#4B5563]">No recharge logs found</span>
                  <span className="text-[10px] text-[#9CA3AF]">Recharge your meter to see logs here.</span>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="power" className="flex flex-col gap-4">
            <StandardCard className="bg-gradient-to-br from-zinc-800 to-zinc-950 border-0 text-white shadow-md p-5 flex flex-col gap-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Supply Tracker Status
              </span>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-3xl font-extrabold tracking-tight">
                    {totalSupplyHours.toFixed(1)}h
                  </span>
                  <span className="text-xs text-zinc-400">Logged active supply</span>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                    activePowerSupply ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}>
                    Power: {activePowerSupply ? "On" : "Off"}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-zinc-400/90 mt-1">
                Outages tracked: {completedOutagesCount} total outages recorded
              </span>
            </StandardCard>

            <div className="flex flex-col gap-3">
              {powerLogs.length > 0 ? (
                powerLogs.map(log => {
                  const isActive = log.powerOff === null
                  return (
                    <div
                      key={log.id}
                      className="bg-white border border-[#F3F4F6] rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-zinc-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isActive
                            ? "bg-emerald-50 border border-emerald-100 text-emerald-600"
                            : "bg-amber-50 border border-amber-100 text-amber-600"
                        }`}>
                          {isActive ? (
                            <IconBulb className="w-5 h-5 animate-pulse" />
                          ) : (
                            <IconClock className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#121212]">
                            {isActive ? "Power Supply Active" : "Power Outage Logged"}
                          </span>
                          <span className="text-[11px] text-[#4B5563]">
                            ON: {formatDateTime(log.powerOn)}
                            {!isActive && log.powerOff && ` • OFF: ${formatDateTime(log.powerOff)}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {isActive ? (
                          <span className="text-xs font-bold text-emerald-600 uppercase">
                            Active
                          </span>
                        ) : (
                          <span className="text-sm font-bold text-amber-600">
                            {log.duration.toFixed(1)}h duration
                          </span>
                        )}
                        <span className="text-[9px] text-[#9CA3AF] uppercase font-bold tracking-wider">
                          {log.source}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="bg-white border border-dashed border-zinc-200 rounded-xl py-12 text-center flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400">
                    <IconAlertCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#4B5563]">No power logs registered</span>
                  <span className="text-[10px] text-[#9CA3AF]">Use dashboard switches to track supply states.</span>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="usage" className="flex flex-col gap-4">
            <StandardCard className="bg-gradient-to-br from-amber-500 to-amber-600 border-0 text-white shadow-md p-5 flex flex-col gap-2">
              <span className="text-xs font-semibold text-amber-100 uppercase tracking-wider">
                7-Day Consumption Summary
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold tracking-tight">
                  {totalKwhUsed.toFixed(1)} kWh
                </span>
                <span className="text-xs font-medium text-amber-100">
                  (Estimated cost: ₦{totalEstimatedCost.toLocaleString()})
                </span>
              </div>
              <span className="text-[11px] text-amber-100/90 mt-1">
                Average Daily Cost: ₦{averageDailyCost.toLocaleString("en-NG", { maximumFractionDigits: 2 })}
              </span>
            </StandardCard>

            <div className="flex flex-col gap-3">
              {usageLogs.length > 0 ? (
                usageLogs.map((log, index) => (
                  <div
                    key={index}
                    className="bg-white border border-[#F3F4F6] rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-zinc-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                        <IconCalendar className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#121212]">
                          {formatDateOnly(log.date)}
                        </span>
                        <span className="text-[11px] text-[#4B5563]">
                          Daily usage estimation
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-amber-600">
                        {log.unitsUsed.toFixed(2)} kWh
                      </span>
                      <span className="text-[11px] font-bold text-zinc-500">
                        ₦{log.cost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white border border-dashed border-zinc-200 rounded-xl py-12 text-center flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400">
                    <IconTrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#4B5563]">No consumption metrics</span>
                  <span className="text-[10px] text-[#9CA3AF]">Add active appliances to track daily consumption.</span>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
