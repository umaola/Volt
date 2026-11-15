import * as React from "react"
import { IconFlame, IconBolt, IconDeviceTv, IconPlug } from "@tabler/icons-react"
import { Skeleton } from "@/components/ui/skeleton"

export interface TopApplianceItem {
  name: string
  count: number
  avgWattage: number
  avgHours: number
  totalDailyKwh: number
}

interface ApplianceInsightsTableProps {
  appliances: TopApplianceItem[]
  isLoading?: boolean
}

export function ApplianceInsightsSkeleton() {
  return (
    <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export function ApplianceInsightsTable({ appliances, isLoading = false }: ApplianceInsightsTableProps) {
  if (isLoading) {
    return <ApplianceInsightsSkeleton />
  }

  const maxKwh = appliances.length > 0 ? Math.max(...appliances.map((a) => a.totalDailyKwh), 1) : 1

  return (
    <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <IconFlame className="w-5 h-5 text-amber-500" />
            <h4 className="text-base font-bold text-zinc-900">Appliance Energy Intelligence</h4>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Ranked by total daily energy consumption (kWh) across all user households
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-lg">
            {appliances.length} Appliance Types Logged
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">Appliance Name</th>
              <th className="py-2.5 px-3 text-right">Households</th>
              <th className="py-2.5 px-3 text-right">Avg Wattage</th>
              <th className="py-2.5 px-3 text-right">Avg Daily Run</th>
              <th className="py-2.5 px-3 text-right">Total Daily Drain</th>
              <th className="py-2.5 px-3 w-32">Consumption Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 text-xs font-medium text-zinc-700">
            {appliances.length > 0 ? (
              appliances.map((app, index) => {
                const percentage = Math.round((app.totalDailyKwh / maxKwh) * 100)
                return (
                  <tr key={app.name} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3 px-3 text-zinc-400 font-mono text-[11px]">{index + 1}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                          <IconPlug className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-zinc-900">{app.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-zinc-900">{app.count}</td>
                    <td className="py-3 px-3 text-right text-zinc-600">{app.avgWattage} W</td>
                    <td className="py-3 px-3 text-right text-zinc-600">{app.avgHours} hrs/day</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-700">{app.totalDailyKwh} kWh</td>
                    <td className="py-3 px-3">
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-400">
                  No appliance data logged yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
