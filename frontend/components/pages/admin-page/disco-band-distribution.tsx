import * as React from "react"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

export interface DistributionItem {
  name: string
  count: number
}

interface DiscoBandProps {
  discoDistribution: DistributionItem[]
  bandDistribution: DistributionItem[]
  topCities: DistributionItem[]
  isLoading?: boolean
}

const BAND_COLORS = ["#00c868", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899", "#6B7280"]

export function DiscoBandSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-52 w-full rounded-xl" />
        </div>
      ))}
    </div>
  )
}

export function DiscoBandDistribution({
  discoDistribution,
  bandDistribution,
  topCities,
  isLoading = false
}: DiscoBandProps) {
  if (isLoading) {
    return <DiscoBandSkeleton />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-bold text-zinc-900">Tariff Band Breakdown</h4>
          <p className="text-xs text-zinc-500">Distribution of users by Service Band</p>
        </div>

        <div className="w-full h-52 flex items-center justify-center my-2">
          {bandDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bandDistribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {bandDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BAND_COLORS[index % BAND_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: unknown) => [typeof val === "number" ? val.toLocaleString() : String(val), "Users"]}
                  contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <span className="text-xs text-zinc-400">No band data available</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100">
          {bandDistribution.map((b, i) => (
            <div key={b.name} className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BAND_COLORS[i % BAND_COLORS.length] }} />
              <span className="text-zinc-600 font-medium">{b.name}:</span>
              <span className="font-bold text-zinc-900">{b.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-bold text-zinc-900">User Share by DISCO</h4>
          <p className="text-xs text-zinc-500">Top distribution companies in network</p>
        </div>

        <div className="w-full h-52 my-2">
          {discoDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={discoDistribution.slice(0, 6)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                <Tooltip
                  formatter={(val: unknown) => [typeof val === "number" ? val.toLocaleString() : String(val), "Users"]}
                  contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", fontSize: "12px" }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-zinc-400">
              No DISCO distribution data
            </div>
          )}
        </div>

        <div className="text-xs text-zinc-500 border-t border-zinc-100 pt-2 flex justify-between">
          <span>Total DISCOs Active:</span>
          <span className="font-bold text-zinc-900">{discoDistribution.length}</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-bold text-zinc-900">Top Locations / Cities</h4>
          <p className="text-xs text-zinc-500">Most active user clusters</p>
        </div>

        <div className="flex flex-col gap-2.5 my-3">
          {topCities.length > 0 ? (
            topCities.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-zinc-100 text-zinc-600 flex items-center justify-center font-bold text-[10px]">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-zinc-800">{c.name}</span>
                </div>
                <span className="font-bold text-zinc-600">{c.count} users</span>
              </div>
            ))
          ) : (
            <div className="h-32 flex items-center justify-center text-xs text-zinc-400">
              No location data logged yet
            </div>
          )}
        </div>

        <div className="text-xs text-zinc-400 border-t border-zinc-100 pt-2">
          Aggregated from onboarding & meter profiles
        </div>
      </div>
    </div>
  )
}
