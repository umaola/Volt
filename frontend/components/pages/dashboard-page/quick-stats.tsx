import * as React from "react"
import { IconFlame, IconCalendar, IconClock } from "@tabler/icons-react"
import { StandardCard } from "@/components/design-system/card"

interface QuickStatsProps {
  dailyBurnRate: number
  daysRemaining: number
}

export function QuickStats({ dailyBurnRate, daysRemaining }: QuickStatsProps) {
  return (
    <div className="flex overflow-x-auto gap-3 pb-2 w-full shrink-0 snap-x snap-mandatory scrollbar-none">
      <StandardCard className="p-4 flex flex-col gap-3 bg-white border border-emerald-50 transition-all shadow-sm rounded-2xl min-w-[140px] shrink-0 snap-start">
        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <IconFlame className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-[#121212] tracking-tight">
            {dailyBurnRate.toFixed(1)} <span className="text-xs font-semibold text-zinc-400">kWh</span>
          </span>
          <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">Daily AVG</span>
        </div>
      </StandardCard>

      <StandardCard className="p-4 flex flex-col gap-3 bg-white border border-amber-50 transition-all shadow-sm rounded-2xl min-w-[140px] shrink-0 snap-start">
        <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
          <IconCalendar className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-[#121212] tracking-tight">
            {daysRemaining} <span className="text-xs font-semibold text-zinc-400">Days</span>
          </span>
          <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">Estimated</span>
        </div>
      </StandardCard>

      <StandardCard className="p-4 flex flex-col gap-3 bg-white border border-blue-50 transition-all shadow-sm rounded-2xl min-w-[140px] shrink-0 snap-start">
        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
          <IconClock className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-[#121212] tracking-tight">Peak: 6pm</span>
          <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">Usage peak today</span>
        </div>
      </StandardCard>
    </div>
  )
}
