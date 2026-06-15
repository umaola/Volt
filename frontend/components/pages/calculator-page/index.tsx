import * as React from "react"
import { TextField } from "@/components/design-system/input"
import { PrimaryButton } from "@/components/design-system/button"
import { StandardCard } from "@/components/design-system/card"
import { IconBolt, IconCalendar, IconCoins, IconCheck, IconX } from "@tabler/icons-react"
import { Skeleton } from "@/components/ui/skeleton"

export interface Recharge {
  id: string
  amount: number
  units: number
  date: string
  source: string
}

interface CalculatorPageProps {
  tariffRate: number
  burnRate: number
  onSaveRecharge: (amount: number, units: number) => void
  isLoading: boolean
  isSubmitting?: boolean
  recharges: Recharge[]
  isHistoryLoading: boolean
}

export function CalculatorPage({
  tariffRate,
  burnRate,
  onSaveRecharge,
  isLoading,
  isSubmitting = false,
  recharges = [],
  isHistoryLoading
}: CalculatorPageProps) {
  const [amount, setAmount] = React.useState("")
  const [timeFilter, setTimeFilter] = React.useState<"all" | "year" | "month" | "week">("all")
  const [showSuccess, setShowSuccess] = React.useState(false)
  const prevSubmitting = React.useRef(isSubmitting)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (prevSubmitting.current && !isSubmitting) {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
    prevSubmitting.current = isSubmitting
  }, [isSubmitting])

  const filteredRecharges = React.useMemo(() => {
    if (!mounted) return []
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setHours(0, 0, 0, 0)
    startOfWeek.setDate(now.getDate() - now.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    return recharges.filter(item => {
      try {
        const itemDate = new Date(item.date)
        if (isNaN(itemDate.getTime())) return true
        if (timeFilter === "year") {
          return itemDate.getFullYear() === now.getFullYear()
        }
        if (timeFilter === "month") {
          return itemDate.getFullYear() === now.getFullYear() && itemDate.getMonth() === now.getMonth()
        }
        if (timeFilter === "week") {
          return itemDate >= startOfWeek && itemDate <= endOfWeek
        }
      } catch {
        return true
      }
      return true
    })
  }, [recharges, timeFilter, mounted])

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

  if (isLoading || !mounted) {
    return (
      <div className="flex-1 flex flex-col bg-zinc-50 overflow-y-auto">
        <div className="bg-white px-6 pt-6 pb-4 border-b border-zinc-100 sticky top-0 z-10">
          <Skeleton className="h-6 w-36 mb-1.5" />
          <Skeleton className="h-3.5 w-60" />
        </div>

        <div className="p-5 flex flex-col gap-5">
          <StandardCard className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-10 w-full" />
            </div>
            
            <div className="flex flex-col gap-1.5 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-16" />
              </div>
              <div className="flex items-center justify-between mt-1">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-16" />
              </div>
            </div>
          </StandardCard>
        </div>
      </div>
    )
  }

  const parsedAmount = parseFloat(amount) || 0
  const estimatedUnits = parsedAmount / tariffRate
  const estimatedDays = burnRate > 0 ? estimatedUnits / burnRate : 0

  const totalRechargeAmount = filteredRecharges.reduce((acc, curr) => acc + curr.amount, 0)
  const totalRechargeUnits = filteredRecharges.reduce((acc, curr) => acc + curr.units, 0)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (parsedAmount > 0) {
      onSaveRecharge(parsedAmount, estimatedUnits)
      setAmount("")
    }
  }

  return (
    <div className="flex-grow flex flex-col bg-zinc-50 relative overflow-hidden h-full">
      <div className="bg-white px-6 pt-6 pb-4 border-b border-zinc-100">
        <h1 className="text-lg font-bold text-[#121212]">Units Calculator</h1>
        <p className="text-xs text-[#4B5563]">Calculate estimated units before purchasing.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-8 flex flex-col gap-6">
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <StandardCard className="flex flex-col gap-4">
            <TextField
              label="Purchase Amount (₦)"
              placeholder="e.g. 5000"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading || isSubmitting}
            />
            
            <div className="flex flex-col gap-1.5 bg-zinc-50 p-3 rounded-lg border border-zinc-100 text-xs">
              <div className="flex items-center justify-between text-[#4B5563]">
                <span>Your Tariff Rate:</span>
                <span className="font-bold text-[#121212]">₦{tariffRate.toFixed(2)}/kWh</span>
              </div>
              <div className="flex items-center justify-between text-[#4B5563]">
                <span>Daily Burn Rate:</span>
                <span className="font-bold text-[#121212]">{burnRate.toFixed(1)} kWh/day</span>
              </div>
            </div>
          </StandardCard>

          {parsedAmount > 0 && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <StandardCard className="bg-emerald-50/20 border-emerald-100/50 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-primary flex items-center justify-center text-primary">
                    <IconBolt className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-[#4B5563]">Estimated Units</span>
                    <span className="text-xl font-bold text-primary">{estimatedUnits.toFixed(2)} kWh</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-emerald-100/40 pt-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-primary flex items-center justify-center text-primary">
                    <IconCalendar className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-[#4B5563]">Estimated Duration</span>
                    <span className="text-sm font-bold text-[#121212]">
                      Approximately {estimatedDays > 0 ? Math.round(estimatedDays) : "--"} Days
                    </span>
                  </div>
                </div>
              </StandardCard>

              <PrimaryButton type="submit" isLoading={isSubmitting}>
                Log This Recharge
              </PrimaryButton>
            </div>
          )}
        </form>

        <div className="flex flex-col gap-4 border-t border-zinc-200 pt-6">
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-[#121212] uppercase tracking-wider">Recharge History</h2>
            <p className="text-[11px] text-[#4B5563]">Track all logged electricity purchases.</p>
          </div>

          {isHistoryLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {recharges.length > 0 && (
                <StandardCard className="bg-gradient-to-br from-[#00BF63] to-emerald-600 border-0 text-white shadow-md p-5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">
                      TOTAL RECHARGE
                    </span>
                    <select
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value as any)}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer transition-all duration-200"
                    >
                      <option value="all" className="text-zinc-900 font-normal">All Time</option>
                      <option value="year" className="text-zinc-900 font-normal">This Year</option>
                      <option value="month" className="text-zinc-900 font-normal">This Month</option>
                      <option value="week" className="text-zinc-900 font-normal">This Week</option>
                    </select>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold tracking-tight">
                      ₦{totalRechargeAmount.toLocaleString()}
                    </span>
                    <span className="text-xs font-medium text-emerald-100">
                      ({totalRechargeUnits.toFixed(1)} kWh total)
                    </span>
                  </div>
                </StandardCard>
              )}

              <div className="flex flex-col gap-3">
                {filteredRecharges.length > 0 ? (
                  filteredRecharges.map(item => (
                    <div
                      key={item.id}
                      className="bg-white border border-[#F3F4F6] rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-zinc-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#00BF63]">
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
                        <span className="text-sm font-bold text-[#00BF63]">
                          +{item.units.toFixed(1)} kWh
                        </span>
                        <span className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-wider">
                          {item.source}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white border border-dashed border-zinc-200 rounded-xl py-8 text-center flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400">
                      <IconCoins className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-[#4B5563]">No recharge logs found</span>
                    <span className="text-[10px] text-[#9CA3AF]">
                      {timeFilter === "all"
                        ? "Recharge your meter to see logs here."
                        : `No recharge logs found for ${timeFilter === "week" ? "this week" : timeFilter === "month" ? "this month" : "this year"}.`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showSuccess && (
        <div className="absolute bottom-6 left-6 right-6 z-50 bg-zinc-900 border border-zinc-800 text-white rounded-xl p-3 shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <IconCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Recharge logged successfully!</span>
          </div>
          <button 
            type="button" 
            onClick={() => setShowSuccess(false)}
            className="text-zinc-400 hover:text-white p-1 rounded transition-colors"
          >
            <IconX className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
