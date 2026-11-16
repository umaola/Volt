import * as React from "react"
import {
  IconTarget,
  IconCalendarTime,
  IconTrendingUp,
  IconCheck,
  IconAlertTriangle,
  IconFilter,
  IconSearch,
  IconClock
} from "@tabler/icons-react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

export interface DepletionCycle {
  id: string
  meterNumber: string
  userName: string
  disco: string
  tariffBand: string
  rechargeDate: string
  units: number
  predictedDays: number
  predictedDepletionDate: string
  actualDepletionDate: string
  actualDays: number
  deltaDays: number
  accuracyStatus: "accurate" | "slight_drift" | "high_drift"
  reason?: string
}

export interface DiscoAccuracyStat {
  disco: string
  cyclesCount: number
  maeDays: number
  accuracyPercent: number
  avgSupplyHours: number
}

export interface DepletionAccuracyData {
  maeDays: number
  accuracyPercent: number
  avgCycleDays: number
  totalCyclesEvaluated: number
  underburnPercent: number
  overburnPercent: number
  accuracyTrend: { date: string; mae: number; accuracy: number }[]
  discoBreakdown: DiscoAccuracyStat[]
  recentCycles: DepletionCycle[]
}

interface DepletionAccuracyViewProps {
  data: DepletionAccuracyData | null
  isLoading?: boolean
  onInspectMeter?: (meterNumber: string) => void
}

export function DepletionAccuracySkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="w-8 h-8 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3.5 w-36" />
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-xs flex flex-col gap-4">
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-xs flex flex-col gap-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function DepletionAccuracyView({
  data,
  isLoading = false,
  onInspectMeter
}: DepletionAccuracyViewProps) {
  const [filterStatus, setFilterStatus] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState<string>("")

  if (isLoading || !data) {
    return <DepletionAccuracySkeleton />
  }

  const filteredCycles = (data.recentCycles || []).filter((cycle) => {
    const matchesFilter = filterStatus === "all" || cycle.accuracyStatus === filterStatus
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !query ||
      cycle.meterNumber.toLowerCase().includes(query) ||
      cycle.userName.toLowerCase().includes(query) ||
      cycle.disco.toLowerCase().includes(query)
    return matchesFilter && matchesSearch
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Mean Absolute Error</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IconTarget className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-900 tracking-tight">
              {data.maeDays.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-zinc-400">days delta</span>
          </div>
          <span className="text-[11px] text-zinc-500 font-medium">
            Average prediction variance across {data.totalCyclesEvaluated} completed cycles
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Accuracy Rate</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <IconCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-900 tracking-tight">
              {data.accuracyPercent.toFixed(1)}%
            </span>
            <span className="text-xs font-semibold text-emerald-600">within ±2 days</span>
          </div>
          <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, data.accuracyPercent))}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Depletion Cycle</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <IconCalendarTime className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-900 tracking-tight">
              {data.avgCycleDays.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-zinc-400">days / recharge</span>
          </div>
          <span className="text-[11px] text-zinc-500 font-medium">
            Mean lifespan of electricity units before re-metering
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Drift Direction</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <IconTrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold mt-1">
            <div className="flex flex-col">
              <span className="text-emerald-600 font-black text-base">{data.underburnPercent}%</span>
              <span className="text-[10px] text-zinc-400 font-normal">Lasted Longer</span>
            </div>
            <div className="h-6 w-px bg-zinc-200" />
            <div className="flex flex-col">
              <span className="text-rose-600 font-black text-base">{data.overburnPercent}%</span>
              <span className="text-[10px] text-zinc-400 font-normal">Burned Faster</span>
            </div>
          </div>
          <span className="text-[11px] text-zinc-500 font-medium">
            Reflects Disco supply deficit vs unexpected appliance spikes
          </span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
              Prediction Accuracy & Error Trend (14-Day Trajectory)
            </h3>
            <p className="text-xs text-zinc-500">
              Tracking average error days (MAE) and accuracy rates over completed customer cycles
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Accuracy %</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span>MAE (Days Delta)</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.accuracyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="maeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} domain={[0, 5]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e4e4e7",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                  fontSize: "12px"
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="accuracy"
                name="Accuracy Rate (%)"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#accuracyGrad)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="mae"
                name="Error Margin (Days)"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#maeGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-xs flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
            Depletion Predictability by Disco
          </h3>
          <p className="text-xs text-zinc-500">
            Comparing how supply stability in each distribution zone impacts prediction reliability
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Distribution Company</th>
                <th className="pb-3 px-3">Evaluated Cycles</th>
                <th className="pb-3 px-3">Mean Error (MAE)</th>
                <th className="pb-3 px-3">Within ±2 Days</th>
                <th className="pb-3 px-3">Avg Supply Hours</th>
                <th className="pb-3 px-3">Predictability Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 font-medium">
              {(data.discoBreakdown || []).map((stat) => (
                <tr key={stat.disco} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-zinc-900">{stat.disco}</td>
                  <td className="py-3 px-3 text-zinc-600">{stat.cyclesCount} cycles</td>
                  <td className="py-3 px-3 text-zinc-800 font-bold">{stat.maeDays.toFixed(1)} days</td>
                  <td className="py-3 px-3 text-emerald-600 font-bold">{stat.accuracyPercent.toFixed(1)}%</td>
                  <td className="py-3 px-3 text-zinc-600">{stat.avgSupplyHours.toFixed(1)} hrs/day</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        stat.accuracyPercent >= 85
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : stat.accuracyPercent >= 70
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {stat.accuracyPercent >= 85 ? "High Precision" : stat.accuracyPercent >= 70 ? "Moderate Drift" : "High Supply Jitter"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
              Recent Depletion Cycles Verification Log
            </h3>
            <p className="text-xs text-zinc-500">
              Audit log of completed meter depletion cycles comparing predicted vs actual dates
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <IconSearch className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search meter, name, disco..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-primary w-48 transition-all"
              />
            </div>

            <div className="flex bg-zinc-100 p-0.5 rounded-xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setFilterStatus("all")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  filterStatus === "all" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("accurate")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  filterStatus === "accurate" ? "bg-white text-emerald-700 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                Accurate
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("slight_drift")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  filterStatus === "slight_drift" ? "bg-white text-amber-700 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                Slight Drift
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("high_drift")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  filterStatus === "high_drift" ? "bg-white text-rose-700 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                High Drift
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Meter & User</th>
                <th className="pb-3 px-3">Disco / Band</th>
                <th className="pb-3 px-3">Units Added</th>
                <th className="pb-3 px-3">Predicted Depletion</th>
                <th className="pb-3 px-3">Actual Depletion</th>
                <th className="pb-3 px-3">Variance (Δ Days)</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 font-medium">
              {filteredCycles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-400 text-xs">
                    No depletion cycles found matching filter criteria
                  </td>
                </tr>
              ) : (
                filteredCycles.map((cycle) => (
                  <tr key={cycle.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-900">{cycle.meterNumber}</span>
                        <span className="text-[10px] text-zinc-400">{cycle.userName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-800">{cycle.disco}</span>
                        <span className="text-[10px] text-zinc-400">{cycle.tariffBand}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-zinc-800 font-bold">{cycle.units} kWh</td>
                    <td className="py-3 px-3 text-zinc-600">
                      <div className="flex flex-col">
                        <span>{cycle.predictedDepletionDate}</span>
                        <span className="text-[10px] text-zinc-400">({cycle.predictedDays}d predicted)</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-zinc-900 font-semibold">
                      <div className="flex flex-col">
                        <span>{cycle.actualDepletionDate}</span>
                        <span className="text-[10px] text-zinc-400">({cycle.actualDays}d actual)</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-bold ${
                          Math.abs(cycle.deltaDays) <= 1.5
                            ? "text-emerald-600"
                            : cycle.deltaDays > 0
                            ? "text-amber-600"
                            : "text-rose-600"
                        }`}
                      >
                        {cycle.deltaDays > 0 ? `+${cycle.deltaDays.toFixed(1)}d` : `${cycle.deltaDays.toFixed(1)}d`}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cycle.accuracyStatus === "accurate"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : cycle.accuracyStatus === "slight_drift"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {cycle.accuracyStatus === "accurate" ? "Accurate" : cycle.accuracyStatus === "slight_drift" ? "Slight Drift" : "High Drift"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {onInspectMeter && (
                        <button
                          type="button"
                          onClick={() => onInspectMeter(cycle.meterNumber)}
                          className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-[11px] font-bold text-zinc-700 transition-colors cursor-pointer"
                        >
                          Inspect
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
