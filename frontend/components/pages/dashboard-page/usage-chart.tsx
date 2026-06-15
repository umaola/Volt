import * as React from "react"
import { StandardCard } from "@/components/design-system/card"

export function UsageChart() {
  const [selectedIdx, setSelectedIdx] = React.useState<number | null>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const weeks = [
    { label: "W2", thisMonth: 65, lastMonth: 55 },
    { label: "W3", thisMonth: 75, lastMonth: 85 },
    { label: "W4", thisMonth: 80, lastMonth: 70 },
    { label: "W5", thisMonth: 50, lastMonth: 45 },
    { label: "W6", thisMonth: 70, lastMonth: 60 },
    { label: "W7", thisMonth: 85, lastMonth: 90 }
  ]

  const activeWeek = selectedIdx !== null ? weeks[selectedIdx] : null
  const displayKwh = activeWeek ? activeWeek.thisMonth : 342
  const displayLabel = activeWeek ? `Week ${activeWeek.label} consumption` : "June 2026 consumption"
  const estCost = (activeWeek && mounted) ? `₦${(activeWeek.thisMonth * 209.5).toLocaleString("en-NG", { maximumFractionDigits: 0 })}` : ""

  return (
    <StandardCard 
      className="p-5 bg-white border border-zinc-100 shadow-xs rounded-2xl flex flex-col gap-4 relative"
      onMouseLeave={() => setSelectedIdx(null)}
    >
      <div className="flex justify-between items-start border-b border-zinc-50 pb-3 h-14">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#121212] tracking-tight transition-all duration-300">
              {displayKwh} kWh
            </span>
            {estCost && (
              <span className="text-xs font-semibold text-emerald-600 animate-fade-in">
                Est. Cost: {estCost}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold text-zinc-400 transition-all duration-300">
            {displayLabel}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] pt-1">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#00BF63]"></div>
            <span className="text-zinc-500 font-semibold">This month</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#D1FAE5]"></div>
            <span className="text-zinc-500 font-semibold">Last month</span>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between h-32 pt-2 px-1 relative">
        {weeks.map((week, idx) => {
          const isSelected = selectedIdx === idx
          const isAnySelected = selectedIdx !== null
          const opacityClass = isAnySelected ? (isSelected ? "opacity-100 scale-105" : "opacity-40 scale-95") : "opacity-100"

          return (
            <div 
              key={week.label} 
              className={`flex flex-col items-center gap-2 w-12 cursor-pointer transition-all duration-300 ${opacityClass}`}
              onMouseEnter={() => setSelectedIdx(idx)}
              onClick={() => setSelectedIdx(idx)}
            >
              <div className="flex items-end gap-1 h-24 w-full justify-center relative">
                {isSelected && (
                  <div className="absolute -top-7 bg-zinc-900 text-white text-[8px] font-bold py-1 px-1.5 rounded shadow-lg z-10 whitespace-nowrap animate-in fade-in duration-200">
                    {week.thisMonth} kWh
                  </div>
                )}
                <div
                  className="w-2.5 bg-[#D1FAE5] rounded-t-xs transition-all duration-300"
                  style={{ height: `${week.lastMonth}%` }}
                />
                <div
                  className="w-2.5 bg-[#00BF63] rounded-t-xs transition-all duration-300"
                  style={{ height: `${week.thisMonth}%` }}
                />
              </div>
              <span className="text-[9px] font-bold text-zinc-400">{week.label}</span>
            </div>
          )
        })}
      </div>
    </StandardCard>
  )
}
