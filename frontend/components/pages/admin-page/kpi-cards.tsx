import * as React from "react"
import { IconUsers, IconBolt, IconCurrencyNaira, IconClock, IconBuildingSkyscraper } from "@tabler/icons-react"
import { Skeleton } from "@/components/ui/skeleton"

export interface KpiData {
  totalUsers: number
  newUsersLast7Days: number
  activeSubscriptions: number
  totalMetersTracked: number
  totalRechargeNaira: number
  totalRechargeUnits: number
  avgRechargeNaira: number
  avgSupplyHours: number
}

interface KpiCardsProps {
  data: KpiData | null
  isLoading?: boolean
}

export function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="w-9 h-9 rounded-xl" />
          </div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3.5 w-40" />
        </div>
      ))}
    </div>
  )
}

export function KpiCards({ data, isLoading = false }: KpiCardsProps) {
  if (isLoading || !data) {
    return <KpiCardsSkeleton />
  }

  const cards = [
    {
      title: "Total Users",
      value: data.totalUsers.toLocaleString(),
      subtext: `+${data.newUsersLast7Days} in the last 7 days`,
      icon: <IconUsers className="w-5 h-5 text-emerald-600" />,
      bgColor: "bg-emerald-50"
    },
    {
      title: "Active Subscriptions",
      value: data.activeSubscriptions.toLocaleString(),
      subtext: `${data.totalMetersTracked.toLocaleString()} active meter profiles`,
      icon: <IconBuildingSkyscraper className="w-5 h-5 text-blue-600" />,
      bgColor: "bg-blue-50"
    },
    {
      title: "Total Recharges Logged",
      value: `₦${data.totalRechargeNaira.toLocaleString()}`,
      subtext: `Avg ₦${data.avgRechargeNaira.toLocaleString()} per recharge`,
      icon: <IconCurrencyNaira className="w-5 h-5 text-amber-600" />,
      bgColor: "bg-amber-50"
    },
    {
      title: "Avg Grid Supply / Day",
      value: `${data.avgSupplyHours} hrs`,
      subtext: `${data.totalRechargeUnits.toLocaleString()} kWh total tracked`,
      icon: <IconBolt className="w-5 h-5 text-primary" />,
      bgColor: "bg-emerald-50"
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.title}
          className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{c.title}</span>
            <div className={`w-9 h-9 rounded-xl ${c.bgColor} flex items-center justify-center shrink-0`}>
              {c.icon}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">{c.value}</h3>
            <p className="text-xs text-zinc-500 mt-1 font-medium">{c.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
