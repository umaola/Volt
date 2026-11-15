import * as React from "react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

export interface DailyTrendItem {
  date: string
  naira: number
  units: number
  count: number
}

export interface DiscoRechargeItem {
  name: string
  amount: number
}

interface RechargeTrendsChartProps {
  trendData: DailyTrendItem[]
  discoData: DiscoRechargeItem[]
  isLoading?: boolean
}

export function RechargeTrendsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
      <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function RechargeTrendsChart({ trendData, discoData, isLoading = false }: RechargeTrendsChartProps) {
  if (isLoading) {
    return <RechargeTrendsSkeleton />
  }

  const formattedTrend = trendData.map((d) => ({
    ...d,
    shortDate: d.date ? d.date.slice(5) : ""
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-zinc-900">Recharge Volume Timeline</h4>
            <p className="text-xs text-zinc-500">Daily token spend (₦) across all users</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
            Last 14 Days
          </span>
        </div>

        <div className="w-full h-64">
          {formattedTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rechargeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00c868" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00c868" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="shortDate" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(val: unknown) => [typeof val === "number" ? `₦${val.toLocaleString()}` : String(val), "Spend"]}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                  contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="naira" stroke="#00c868" strokeWidth={2.5} fillOpacity={1} fill="url(#rechargeGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-zinc-400">
              No daily recharge data available yet
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-zinc-900">Recharges by DISCO</h4>
            <p className="text-xs text-zinc-500">Distribution of token expenditure</p>
          </div>
        </div>

        <div className="w-full h-64">
          {discoData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={discoData.slice(0, 6)} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis type="number" stroke="#9CA3AF" fontSize={10} tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" stroke="#4B5563" fontSize={11} tickLine={false} width={50} />
                <Tooltip
                  formatter={(val: unknown) => [typeof val === "number" ? `₦${val.toLocaleString()}` : String(val), "Volume"]}
                  contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", fontSize: "12px" }}
                />
                <Bar dataKey="amount" fill="#00c868" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-zinc-400">
              No DISCO recharge data available yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
