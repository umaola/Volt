import * as React from "react"
import { StandardCard } from "@/components/design-system/card"
import { IconCoins, IconClock, IconCalendar, IconBulb } from "@tabler/icons-react"

export interface Recharge {
  id: string
  amount: number
  units: number
  date: string
  source: string
}

export interface PowerLog {
  id: string
  powerOn: string
  powerOff: string | null
  duration: number
  source: string
}

export interface UsageLog {
  date: string
  unitsUsed: number
  cost: number
}

interface HistoryCardProps {
  onQuickAction: (action: "calculator" | "outage" | "appliance" | "insights" | "history" | "notification_opened" | "surge-checklist") => void
  recharges: Recharge[]
  powerLogs: PowerLog[]
  usageLogs: UsageLog[]
}

export function RechargeCard({
  onQuickAction,
  recharges = [],
  powerLogs = [],
  usageLogs = []
}: HistoryCardProps) {
  const [activeTab, setActiveTab] = React.useState<"recharges" | "power" | "usage">("recharges")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const formatDateTime = (dateStr: string) => {
    if (!mounted) return ""
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
    if (!mounted) return ""
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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-[#121212] uppercase tracking-wider">History</span>
        <button
          onClick={() => onQuickAction("history")}
          className="text-xs font-bold text-[#008F47] hover:underline flex items-center gap-0.5"
        >
          View history &rarr;
        </button>
      </div>

      <StandardCard className="bg-white p-4 border border-zinc-100 rounded-2xl shadow-sm flex flex-col gap-4">
        <div className="grid grid-cols-3 bg-zinc-100/80 p-0.5 rounded-lg text-center h-8">
          <button
            onClick={() => setActiveTab("recharges")}
            className={`text-[10px] font-bold rounded-md transition-all ${
              activeTab === "recharges" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Recharges
          </button>
          <button
            onClick={() => setActiveTab("power")}
            className={`text-[10px] font-bold rounded-md transition-all ${
              activeTab === "power" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Power
          </button>
          <button
            onClick={() => setActiveTab("usage")}
            className={`text-[10px] font-bold rounded-md transition-all ${
              activeTab === "usage" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Usage
          </button>
        </div>

        <div className="flex flex-col gap-3.5 min-h-[90px] justify-center">
          {activeTab === "recharges" && (
            recharges.length > 0 ? (
              recharges.slice(0, 2).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-zinc-100/50 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                      <IconCoins className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-900">₦{item.amount.toLocaleString("en-NG")}</span>
                      <span className="text-[9px] text-zinc-400 mt-0.5">{formatDateTime(item.date)}</span>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-600">+{item.units.toFixed(1)} kWh</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-zinc-400 text-center py-4">No recent recharges</span>
            )
          )}

          {activeTab === "power" && (
            powerLogs.length > 0 ? (
              powerLogs.slice(0, 2).map((log) => {
                const isActive = log.powerOff === null
                return (
                  <div key={log.id} className="flex items-center justify-between text-xs py-1 border-b border-zinc-100/50 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isActive ? "bg-emerald-50 text-emerald-600" : "bg-zinc-50 text-zinc-400"
                      }`}>
                        {isActive ? (
                          <IconBulb className="w-4 h-4 animate-pulse" />
                        ) : (
                          <IconClock className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-900">
                          {isActive ? "Power Active" : "Power Outage"}
                        </span>
                        <span className="text-[9px] text-zinc-400 mt-0.5">{formatDateTime(log.powerOn)}</span>
                      </div>
                    </div>
                    <span className={`font-bold ${isActive ? "text-emerald-600 animate-pulse" : "text-amber-600"}`}>
                      {isActive ? "Active" : `${log.duration.toFixed(1)}h`}
                    </span>
                  </div>
                )
              })
            ) : (
              <span className="text-xs text-zinc-400 text-center py-4">No recent power logs</span>
            )
          )}

          {activeTab === "usage" && (
            usageLogs.length > 0 ? (
              usageLogs.slice(0, 2).map((log, index) => (
                <div key={index} className="flex items-center justify-between text-xs py-1 border-b border-zinc-100/50 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <IconCalendar className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-900">{formatDateOnly(log.date)}</span>
                      <span className="text-[9px] text-zinc-400 mt-0.5">Daily usage estimation</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-amber-600">{log.unitsUsed.toFixed(1)} kWh</span>
                    <span className="text-[9px] text-zinc-500 mt-0.5">₦{log.cost.toLocaleString("en-NG")}</span>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-xs text-zinc-400 text-center py-4">No recent consumption logs</span>
            )
          )}
        </div>
      </StandardCard>
    </div>
  )
}
