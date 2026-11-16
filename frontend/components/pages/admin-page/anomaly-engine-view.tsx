import * as React from "react"
import {
  IconAlertTriangle,
  IconAlertOctagon,
  IconGhost,
  IconFlame,
  IconTrendingUp,
  IconClockPause,
  IconSearch,
  IconBrandWhatsapp,
  IconCheck,
  IconCopy,
  IconPlugConnectedX
} from "@tabler/icons-react"
import { Skeleton } from "@/components/ui/skeleton"

export interface EnergyAnomaly {
  id: string
  meterNumber: string
  userName: string
  disco: string
  tariffBand: string
  severity: "critical" | "warning" | "info"
  category: "phantom_drain" | "burn_spike" | "supply_deficit" | "meter_dormancy" | "earth_leakage"
  title: string
  description: string
  expectedValue: string
  observedValue: string
  deviationPercent: number
  detectedAt: string
  status: "active" | "investigating" | "resolved"
  recommendedAction: string
}

export interface AnomalyEngineData {
  totalActive: number
  criticalCount: number
  warningCount: number
  infoCount: number
  anomalies: EnergyAnomaly[]
}

interface AnomalyEngineViewProps {
  data: AnomalyEngineData | null
  isLoading?: boolean
  onInspectMeter?: (meterNumber: string) => void
  onCopyAdvisory?: (anomaly: EnergyAnomaly) => void
}

export function AnomalyEngineSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="w-8 h-8 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-xs flex flex-col gap-4">
        <Skeleton className="h-5 w-48" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function AnomalyEngineView({
  data,
  isLoading = false,
  onInspectMeter,
  onCopyAdvisory
}: AnomalyEngineViewProps) {
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all")
  const [severityFilter, setSeverityFilter] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  if (isLoading || !data) {
    return <AnomalyEngineSkeleton />
  }

  const handleCopy = (anomaly: EnergyAnomaly) => {
    const text = `Hello ${anomaly.userName}, this is Volt Energy Intelligence. We detected an energy anomaly on your meter (${anomaly.meterNumber}): ${anomaly.title}. ${anomaly.description}. Expected: ${anomaly.expectedValue}, but observed: ${anomaly.observedValue}. Advisory: ${anomaly.recommendedAction}`
    navigator.clipboard.writeText(text)
    setCopiedId(anomaly.id)
    setTimeout(() => setCopiedId(null), 2500)
    if (onCopyAdvisory) onCopyAdvisory(anomaly)
  }

  const filteredAnomalies = (data.anomalies || []).filter((item) => {
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    const matchesSeverity = severityFilter === "all" || item.severity === severityFilter
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !query ||
      item.meterNumber.toLowerCase().includes(query) ||
      item.userName.toLowerCase().includes(query) ||
      item.title.toLowerCase().includes(query) ||
      item.disco.toLowerCase().includes(query)
    return matchesCategory && matchesSeverity && matchesSearch
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Anomalies</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <IconAlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-900 tracking-tight">
              {data.totalActive}
            </span>
            <span className="text-xs font-semibold text-rose-600">flagged meters</span>
          </div>
          <span className="text-[11px] text-zinc-500 font-medium">
            Meters deviating &gt;35% from calibrated baseline
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Critical Severity</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <IconFlame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-900 tracking-tight">
              {data.criticalCount}
            </span>
            <span className="text-xs font-semibold text-red-600">immediate action</span>
          </div>
          <span className="text-[11px] text-zinc-500 font-medium">
            Suspected earth leakage, meter tapping, or surge drain
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Phantom Loads</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <IconGhost className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-900 tracking-tight">
              {data.anomalies.filter((a) => a.category === "phantom_drain").length}
            </span>
            <span className="text-xs font-semibold text-indigo-600">vampire drain</span>
          </div>
          <span className="text-[11px] text-zinc-500 font-medium">
            Nocturnal burn detected when appliances are declared idle
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Disco Deficits</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <IconPlugConnectedX className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-900 tracking-tight">
              {data.anomalies.filter((a) => a.category === "supply_deficit").length}
            </span>
            <span className="text-xs font-semibold text-amber-600">tariff SLA breaches</span>
          </div>
          <span className="text-[11px] text-zinc-500 font-medium">
            Users receiving supply hours below their designated band
          </span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-xs flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
              Energy Anomaly & Diagnostic Feed
            </h3>
            <p className="text-xs text-zinc-500">
              Real-time anomaly detection stream identifying vampire drain, appliance faults, and under-delivery
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <IconSearch className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search meter, anomaly..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-primary w-44 transition-all"
              />
            </div>

            <div className="flex bg-zinc-100 p-0.5 rounded-xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  categoryFilter === "all" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter("phantom_drain")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  categoryFilter === "phantom_drain" ? "bg-white text-indigo-700 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                Phantom Drain
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter("burn_spike")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  categoryFilter === "burn_spike" ? "bg-white text-rose-700 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                Burn Spikes
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter("supply_deficit")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  categoryFilter === "supply_deficit" ? "bg-white text-amber-700 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                Disco Deficit
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          {filteredAnomalies.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-2 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <IconCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-zinc-700">No anomalies detected</span>
              <span className="text-[11px] text-zinc-400 max-w-xs">
                All tracked meters are currently operating within nominal consumption tolerances.
              </span>
            </div>
          ) : (
            filteredAnomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className="p-4 rounded-2xl border border-zinc-100 bg-white hover:border-zinc-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                      anomaly.severity === "critical"
                        ? "bg-rose-50 text-rose-600 border border-rose-100"
                        : anomaly.severity === "warning"
                        ? "bg-amber-50 text-amber-600 border border-amber-100"
                        : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                    }`}
                  >
                    {anomaly.category === "phantom_drain" && <IconGhost className="w-5 h-5" />}
                    {anomaly.category === "burn_spike" && <IconFlame className="w-5 h-5" />}
                    {anomaly.category === "supply_deficit" && <IconPlugConnectedX className="w-5 h-5" />}
                    {anomaly.category === "meter_dormancy" && <IconClockPause className="w-5 h-5" />}
                    {anomaly.category === "earth_leakage" && <IconAlertOctagon className="w-5 h-5" />}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900">{anomaly.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          anomaly.severity === "critical"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : anomaly.severity === "warning"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {anomaly.severity}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-medium">
                        Meter: {anomaly.meterNumber} ({anomaly.userName} • {anomaly.disco} {anomaly.tariffBand})
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 leading-relaxed max-w-3xl">
                      {anomaly.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-500 mt-1">
                      <div className="flex items-center gap-1">
                        <span className="text-zinc-400">Baseline:</span>
                        <span className="font-bold text-zinc-700">{anomaly.expectedValue}</span>
                      </div>
                      <div className="h-3 w-px bg-zinc-200" />
                      <div className="flex items-center gap-1">
                        <span className="text-zinc-400">Observed:</span>
                        <span className="font-bold text-rose-600">{anomaly.observedValue}</span>
                      </div>
                      <div className="h-3 w-px bg-zinc-200" />
                      <div className="flex items-center gap-1">
                        <span className="text-zinc-400">Deviation:</span>
                        <span className="font-bold text-rose-600">+{anomaly.deviationPercent}%</span>
                      </div>
                      <div className="h-3 w-px bg-zinc-200" />
                      <span className="text-[10px] text-zinc-400">{anomaly.detectedAt}</span>
                    </div>

                    <div className="mt-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center gap-2 text-[11px] text-zinc-600">
                      <span className="font-bold text-zinc-800 shrink-0">Action:</span>
                      <span>{anomaly.recommendedAction}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(anomaly)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedId === anomaly.id ? (
                      <>
                        <IconCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Advisory Copied!</span>
                      </>
                    ) : (
                      <>
                        <IconBrandWhatsapp className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copy Advisory</span>
                      </>
                    )}
                  </button>

                  {onInspectMeter && (
                    <button
                      type="button"
                      onClick={() => onInspectMeter(anomaly.meterNumber)}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Inspect Meter
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
