import * as React from "react"
import { StandardCard } from "@/components/design-system/card"
import { IconClock, IconPower, IconAlertTriangle } from "@tabler/icons-react"

interface GridLifespanProps {
  powerState: "on" | "off"
  estimatedDurationMinutes?: number
  onTogglePower?: (state: "on" | "off") => void
}

export function GridLifespan({
  powerState,
  estimatedDurationMinutes = 360,
  onTogglePower
}: GridLifespanProps) {
  const [remainingSeconds, setRemainingSeconds] = React.useState(
    estimatedDurationMinutes * 60
  )

  React.useEffect(() => {
    setRemainingSeconds(estimatedDurationMinutes * 60)
  }, [powerState, estimatedDurationMinutes])

  React.useEffect(() => {
    if (powerState !== "on" || remainingSeconds <= 0) return

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [powerState, remainingSeconds])

  const totalSecs = estimatedDurationMinutes * 60
  const percentage = Math.max(0, Math.min(100, (remainingSeconds / totalSecs) * 100))

  const hours = Math.floor(remainingSeconds / 3600)
  const minutes = Math.floor((remainingSeconds % 3600) / 60)
  const seconds = remainingSeconds % 60

  const estHours = Math.floor(estimatedDurationMinutes / 60)
  const estMins = estimatedDurationMinutes % 60

  let theme = {
    progressBg: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    glow: "bg-emerald-500/10",
    border: "border-emerald-100 dark:border-emerald-950/50",
    cardBg: "bg-emerald-50/10 dark:bg-emerald-950/5"
  }

  if (powerState === "off") {
    theme = {
      progressBg: "bg-zinc-300 dark:bg-zinc-700",
      text: "text-zinc-500 dark:text-zinc-400",
      glow: "bg-zinc-500/5",
      border: "border-zinc-200 dark:border-zinc-800",
      cardBg: "bg-zinc-50/50 dark:bg-zinc-900/10"
    }
  } else if (percentage <= 15) {
    theme = {
      progressBg: "bg-red-500 animate-pulse",
      text: "text-red-600 dark:text-red-400",
      glow: "bg-red-500/10",
      border: "border-red-100 dark:border-red-950/50",
      cardBg: "bg-red-50/10 dark:bg-red-950/5"
    }
  } else if (percentage <= 50) {
    theme = {
      progressBg: "bg-amber-500",
      text: "text-amber-600 dark:text-amber-400",
      glow: "bg-amber-500/10",
      border: "border-amber-100 dark:border-amber-950/50",
      cardBg: "bg-amber-50/10 dark:bg-amber-950/5"
    }
  }

  return (
    <StandardCard className={`flex flex-col gap-4 border ${theme.border} ${theme.cardBg} transition-colors duration-500`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme.glow} text-current`}>
            {powerState === "on" ? (
              <IconClock className={`w-4 h-4 ${theme.text}`} />
            ) : (
              <IconPower className={`w-4 h-4 ${theme.text}`} />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              {powerState === "on" ? "Session Lifespan" : "Localized Grid State"}
            </span>
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              {powerState === "on" ? "Predictive countdown" : "Waiting for grid active signal"}
            </span>
          </div>
        </div>
        
        {powerState === "on" && onTogglePower && (
          <button
            onClick={() => onTogglePower("off")}
            className="border border-red-200 hover:bg-red-50 text-red-600 font-bold text-[10px] px-2.5 py-1 rounded-lg transition-colors active:scale-95 shrink-0"
          >
            Power Out
          </button>
        )}
        {powerState === "on" && percentage <= 15 && (
          <div className="flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide animate-pulse">
            <IconAlertTriangle className="w-3 h-3" />
            <span>Tripping Imminent</span>
          </div>
        )}
      </div>

      {powerState === "on" ? (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {hours}h {minutes}m <span className="text-sm font-semibold text-zinc-500">{seconds}s</span>
            </span>
            <span className={`text-xs font-bold ${theme.text}`}>
              {Math.round(percentage)}%
            </span>
          </div>

          <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${theme.progressBg} transition-all duration-1000 ease-linear`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
            Based on your neighborhood's history this week, you likely have {estHours} hours of stable power left in this session.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline">
            <span className="text-xl font-bold text-zinc-400">Offline</span>
          </div>

          <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-zinc-300 dark:bg-zinc-700" style={{ width: "0%" }} />
          </div>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
            Your zone historically receives {estHours} hours of stable power when grid active. Charge backup units now.
          </p>
        </div>
      )}
    </StandardCard>
  )
}
