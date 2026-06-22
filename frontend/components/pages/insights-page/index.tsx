"use client"

import * as React from "react"
import {
  IconTrendingUp,
  IconTrendingDown,
  IconBulb,
  IconLeaf,
  IconFlame,
  IconActivity,
  IconCoins,
  IconArrowLeft,
  IconClock,
  IconCalendar
} from "@tabler/icons-react"
import { StandardCard } from "@/components/design-system/card"
import { Skeleton } from "@/components/ui/skeleton"

interface UsageItem {
  label: string
  kwh: number
  cost: number
}

interface InsightItem {
  text: string
  type: "positive" | "negative" | "neutral"
  icon: "trending-up" | "trending-down" | "bulb" | "leaf"
  impact: string
}

interface ApplianceBreakdownItem {
  name: string
  percentage: number
  kwh: number
  cost: number
}

interface InsightsPageProps {
  isLoading: boolean
  dailyUsage: UsageItem[]
  weeklyUsage: UsageItem[]
  monthlyUsage: UsageItem[]
  insights: InsightItem[]
  applianceBreakdown: ApplianceBreakdownItem[]
}

export function InsightsPage({
  isLoading,
  dailyUsage = [],
  weeklyUsage = [],
  monthlyUsage = [],
  insights = [],
  applianceBreakdown = []
}: InsightsPageProps) {
  const [viewType, setViewType] = React.useState<"daily" | "weekly" | "monthly">("daily")
  const [selectedIdx, setSelectedIdx] = React.useState<number | null>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const getActiveUsageData = () => {
    if (viewType === "weekly") return weeklyUsage
    if (viewType === "monthly") return monthlyUsage
    return dailyUsage
  }

  const activeData = getActiveUsageData()
  const maxKwh = Math.max(...activeData.map(item => item.kwh), 1)

  const getInsightIcon = (iconName: string) => {
    switch (iconName) {
      case "trending-up":
        return <IconTrendingUp className="w-5 h-5" />
      case "trending-down":
        return <IconTrendingDown className="w-5 h-5" />
      case "leaf":
        return <IconLeaf className="w-5 h-5" />
      case "bulb":
      default:
        return <IconBulb className="w-5 h-5" />
    }
  }

  const getApplianceIcon = (appName: string) => {
    const lower = appName.toLowerCase()
    if (lower.includes("air conditioner") || lower.includes("ac") || lower.includes("iron") || lower.includes("heater")) {
      return <IconFlame className="w-5 h-5" />
    }
    if (lower.includes("fan") || lower.includes("cooler") || lower.includes("bulb") || lower.includes("light")) {
      return <IconLeaf className="w-5 h-5" />
    }
    return <IconActivity className="w-5 h-5" />
  }

  if (isLoading || !mounted) {
    return (
      <div className="flex-1 flex flex-col bg-zinc-50 overflow-y-auto">
        <div className="bg-white px-6 pt-6 pb-4 border-b border-zinc-100 sticky top-0 z-10">
          <div className="h-6 w-36 bg-zinc-200 rounded animate-pulse mb-1.5" />
          <div className="h-3 w-56 bg-zinc-100 rounded animate-pulse" />
        </div>

        <div className="p-5 flex flex-col gap-5">
          <div className="h-11 w-full bg-zinc-200 rounded-xl animate-pulse" />

          <div className="bg-white rounded-2xl p-5 border border-[#F3F4F6] flex flex-col gap-4 animate-pulse">
            <div className="h-3 w-28 bg-zinc-200 rounded" />
            <div className="h-36 flex items-end justify-between gap-3 pt-6 border-b border-zinc-100">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-zinc-200 rounded-t-lg" style={{ height: `${20 + ((i * 17) % 65)}px` }} />
                  <div className="h-2.5 w-6 bg-zinc-100 rounded" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="h-3.5 w-24 bg-zinc-200 rounded animate-pulse" />
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-[#F3F4F6] rounded-2xl p-4 flex gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-zinc-200 shrink-0" />
                <div className="flex-grow flex flex-col gap-2">
                  <div className="h-3 w-full bg-zinc-200 rounded" />
                  <div className="h-2.5 w-32 bg-zinc-100 rounded" />
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
      <div className="bg-white px-6 pt-6 pb-4 border-b border-zinc-100 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-[#121212]">Energy Insights</h1>
        <p className="text-xs text-[#4B5563]">Understand where your electricity units go.</p>
      </div>

      <div className="p-5 flex flex-col gap-5">
        <div className="grid grid-cols-3 bg-zinc-100 p-1 rounded-xl h-11">
          <button
            type="button"
            onClick={() => setViewType("daily")}
            className={`rounded-lg font-bold text-xs transition-all ${
              viewType === "daily" ? "bg-primary text-white shadow-sm" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() => setViewType("weekly")}
            className={`rounded-lg font-bold text-xs transition-all ${
              viewType === "weekly" ? "bg-primary text-white shadow-sm" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setViewType("monthly")}
            className={`rounded-lg font-bold text-xs transition-all ${
              viewType === "monthly" ? "bg-primary text-white shadow-sm" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Monthly
          </button>
        </div>

        <div 
          className="bg-white rounded-2xl p-5 border border-[#F3F4F6] shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex flex-col gap-4 relative"
          onMouseLeave={() => setSelectedIdx(null)}
        >
          <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">
            {viewType === "daily" ? "Daily Consumption Trend" : viewType === "weekly" ? "Weekly Consumption Trend" : "Monthly Consumption Trend"}
          </span>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 border-b border-zinc-100 px-1 relative">
            {activeData.map((item, idx) => {
              const barHeightPct = Math.max(8, (item.kwh / maxKwh) * 100)
              const isSelected = selectedIdx === idx
              const isAnySelected = selectedIdx !== null
              const opacityClass = isAnySelected ? (isSelected ? "opacity-100 scale-102" : "opacity-40 scale-98") : "opacity-100"

              return (
                <div 
                  key={idx} 
                  className={`flex-grow flex-1 flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-300 ${opacityClass}`}
                  onMouseEnter={() => setSelectedIdx(idx)}
                  onClick={() => setSelectedIdx(idx)}
                >
                  <div className="w-full flex flex-col items-center relative">
                    {isSelected && (
                      <div className="absolute -top-7 bg-zinc-900 text-white text-[8px] font-bold py-1 px-1.5 rounded shadow-lg z-10 whitespace-nowrap animate-in fade-in duration-200">
                        {item.kwh.toFixed(1)} kWh
                      </div>
                    )}
                    <span className="text-[9px] font-bold text-zinc-500 scale-90 md:scale-100 mb-0.5">
                      {item.kwh.toFixed(0)}
                    </span>
                  </div>
                  <div
                    className="w-full bg-primary/10 rounded-t-lg flex items-end justify-center overflow-hidden transition-all duration-300"
                    style={{ height: `${barHeightPct}%` }}
                  >
                    <div className="w-full bg-primary rounded-t-lg transition-transform duration-500 origin-bottom" style={{ height: "100%" }} />
                  </div>
                  <span className="text-[10px] font-bold text-[#4B5563] truncate max-w-full">
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="flex justify-between items-center text-xs text-[#4B5563] px-1 pt-1 h-6">
            <span className="flex items-center gap-1 transition-all duration-300">
              <IconCoins className="w-3.5 h-3.5 text-zinc-400" />
              {selectedIdx !== null ? `Est. Cost (${activeData[selectedIdx].label})` : "Est. Cost"}
            </span>
            <span className="font-bold text-[#121212] transition-all duration-300">
              {selectedIdx !== null ? (
                `₦${activeData[selectedIdx].cost.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${activeData[selectedIdx].kwh.toFixed(1)} kWh)`
              ) : (
                `₦${activeData.reduce((acc, curr) => acc + curr.cost, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} total`
              )}
            </span>
          </div>
        </div>

        {applianceBreakdown.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-[#F3F4F6] shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex flex-col gap-4">
            <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">
              Appliance Consumption Breakdown
            </span>

            <div className="flex flex-col gap-4">
              {applianceBreakdown.map((app) => (
                <div key={app.name} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="text-zinc-500">
                        {getApplianceIcon(app.name)}
                      </div>
                      <span className="text-[#121212]">{app.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[#4B5563]">{app.kwh.toFixed(1)} kWh/d</span>
                      <span className="text-[#121212] font-bold">({app.percentage}%)</span>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${app.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {insights.length > 0 && (
          <div className="flex flex-col gap-3 animate-fade-in">
            <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Dynamic Insights</span>
            <div className="flex flex-col gap-3">
              {insights.map((ins, idx) => {
                const isPositive = ins.type === "positive"
                const isNegative = ins.type === "negative"
                return (
                  <div
                    key={idx}
                    className={`flex gap-3 border rounded-2xl p-4 shadow-sm hover:shadow transition-shadow ${
                      isPositive
                        ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                        : isNegative
                        ? "bg-red-50 border-red-100 text-red-800"
                        : "bg-white border-zinc-100 text-zinc-800"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isPositive
                        ? "bg-white text-emerald-600 border border-emerald-200"
                        : isNegative
                        ? "bg-white text-red-600 border border-red-200"
                        : "bg-zinc-50 text-zinc-600 border border-zinc-200"
                    }`}>
                      {getInsightIcon(ins.icon)}
                    </div>
                    <div className="flex-grow flex flex-col justify-center gap-1">
                      <p className="text-xs leading-relaxed font-semibold">
                        {ins.text}
                      </p>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                        Impact: {ins.impact}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
