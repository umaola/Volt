import * as React from "react"
import { StandardCard } from "@/components/design-system/card"
import { IconClock, IconPower } from "@tabler/icons-react"

interface GridLifespanProps {
  powerState: "on" | "off"
  estimatedDurationMinutes?: number
  onTogglePower?: (state: "on" | "off") => void
  hasCommunityData?: boolean
  currentSessionStart?: string
}

export function GridLifespan({
  powerState,
  onTogglePower,
  currentSessionStart
}: GridLifespanProps) {
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0)

  React.useEffect(() => {
    if (powerState !== "on") {
      setElapsedSeconds(0)
      return
    }

    const getInitialSeconds = () => {
      if (currentSessionStart) {
        const start = new Date(currentSessionStart).getTime()
        const diff = Math.floor((Date.now() - start) / 1000)
        return Math.max(0, diff)
      }
      return 0
    }

    setElapsedSeconds(getInitialSeconds())

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        if (currentSessionStart) {
          const start = new Date(currentSessionStart).getTime()
          const diff = Math.floor((Date.now() - start) / 1000)
          return Math.max(0, diff)
        }
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [powerState, currentSessionStart])

  const hours = Math.floor(elapsedSeconds / 3600)
  const minutes = Math.floor((elapsedSeconds % 3600) / 60)
  const seconds = elapsedSeconds % 60

  const pad = (num: number) => String(num).padStart(2, "0")
  const formattedHours = pad(hours)
  const formattedMinutes = pad(minutes)
  const formattedSeconds = pad(seconds)

  let theme = {
    progressBg: "bg-[#00BF63]",
    text: "text-[#00BF63] dark:text-[#00BF63]",
    glow: "bg-[#00BF63]/10",
    border: "border-[#00BF63]",
    cardBg: "bg-white dark:bg-zinc-900"
  }

  if (powerState === "off") {
    theme = {
      progressBg: "bg-zinc-300 dark:bg-zinc-700",
      text: "text-zinc-500 dark:text-zinc-400",
      glow: "bg-zinc-500/5",
      border: "border-zinc-200 dark:border-zinc-800",
      cardBg: "bg-zinc-50/50 dark:bg-zinc-900/10"
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
            <span className={`text-[10px] font-bold uppercase tracking-wider ${powerState === "on" ? "text-[#00BF63]" : "text-zinc-400"}`}>
              Session Lifespan
            </span>
            <span className={`text-xs font-semibold ${powerState === "on" ? "text-[#00BF63]" : "text-zinc-800 dark:text-zinc-200"}`}>
              {powerState === "on" ? "Current active session" : "Awaiting community logs"}
            </span>
          </div>
        </div>
        
        {powerState === "on" && onTogglePower && (
          <button
            onClick={() => onTogglePower("off")}
            className="bg-[#EF4444] hover:bg-red-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors active:scale-95 shrink-0 shadow-sm"
          >
            Power Out
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-baseline">
          <span className={`text-2xl font-extrabold tracking-tight ${powerState === "on" ? "text-[#00BF63]" : "text-zinc-900 dark:text-white"}`}>
            {formattedHours}h {formattedMinutes}m <span className={`text-sm font-semibold ${powerState === "on" ? "text-[#00BF63]" : "text-zinc-500"}`}>{formattedSeconds}s</span>
          </span>
        </div>
        <p className={`text-[11px] leading-normal ${powerState === "on" ? "text-[#00BF63]" : "text-zinc-500 dark:text-zinc-400"}`}>
          This session has been active for {hours} {hours === 1 ? "hour" : "hours"}.
        </p>
      </div>
    </StandardCard>
  )
}

