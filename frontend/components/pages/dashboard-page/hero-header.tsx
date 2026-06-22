import * as React from "react"

interface HeroHeaderProps {
  userName: string
  remainingUnits: number
  onProfileClick: () => void
  isCollapsed: boolean
}

export function HeroHeader({
  userName,
  remainingUnits,
  onProfileClick,
  isCollapsed
}: HeroHeaderProps) {
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AO"

  return (
    <div
      className={`absolute top-0 left-0 w-full h-16 z-30 transition-all duration-300 ease-in-out select-none ${
        isCollapsed
          ? "bg-[#00BF63] shadow-md opacity-100 translate-y-0"
          : "bg-transparent opacity-0 -translate-y-2 pointer-events-none"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/30 to-transparent pointer-events-none" />

      <div className="w-full h-full px-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-base font-black tracking-tight uppercase text-white">Volt</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 border border-white/20 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 text-white">
            <span>{remainingUnits.toFixed(0)}</span>
            <span className="text-[10px] text-white/80 font-medium">kWh</span>
          </div>
          <button
            onClick={onProfileClick}
            className="w-8 h-8 rounded-full bg-white/20 border border-white/30 text-white font-bold flex items-center justify-center text-xs shadow-sm transition-all hover:bg-white/30 active:scale-95"
          >
            {initials}
          </button>
        </div>
      </div>
    </div>
  )
}

interface ExpandedHeaderProps {
  userName: string
  remainingUnits: number
  tariffBand: string
  expectedSupplyHours: number
  onProfileClick: () => void
}

export function ExpandedHeader({
  userName,
  remainingUnits,
  tariffBand,
  expectedSupplyHours,
  onProfileClick
}: ExpandedHeaderProps) {
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AO"

  return (
    <div className="bg-[#00BF63] text-white pt-12 pb-12 px-6 rounded-b-[2.5rem] shadow-lg flex flex-col gap-6 relative overflow-hidden w-full select-none">
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/30 to-transparent pointer-events-none" />

      <div className="flex justify-between items-center z-10">
        <div className="flex flex-col">
          <span className="text-white/80 text-sm">Good morning,</span>
          <span className="text-xl font-bold flex items-center gap-1">
            {userName} <span className="animate-bounce">👋</span>
          </span>
        </div>
        <button
          onClick={onProfileClick}
          className="w-10 h-10 rounded-full bg-white/20 border border-white/30 text-white font-bold flex items-center justify-center text-sm shadow-sm transition-all hover:bg-white/30 active:scale-95"
        >
          {initials}
        </button>
      </div>

      <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-[1.5rem] p-5 flex justify-between items-center w-full shadow-sm z-10">
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black tracking-tight">{remainingUnits.toFixed(0)}</span>
            <span className="text-lg font-bold text-white/90">kWh</span>
          </div>
          <span className="text-white/70 text-xs font-semibold tracking-wider mt-1">Units Remaining</span>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <div className="bg-white/20 border border-white/20 rounded-2xl px-4 py-1.5 flex flex-col items-center justify-center min-w-[100px]">
            <span className="text-white font-bold text-xs leading-none">{tariffBand}</span>
            <span className="text-white/80 text-[8px] font-medium tracking-wide mt-0.5 uppercase">Tariff Band</span>
          </div>

          <div className="bg-white/20 border border-white/20 rounded-2xl px-4 py-1.5 flex items-center justify-center min-w-[100px]">
            <span className="text-white font-bold text-xs leading-none">{expectedSupplyHours}+ hrs/day</span>
          </div>
        </div>
      </div>
    </div>
  )
}
