import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function StandardCard({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl p-4 border border-[#F3F4F6] shadow-[0_2px_8px_rgba(0,0,0,0.08)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DashboardCard({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-5 border border-[#F3F4F6] shadow-[0_2px_8px_rgba(0,0,0,0.08)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface StatCardProps extends CardProps {
  label: string
  value: string | number
  unit?: string
  trend?: {
    value: string | number
    isPositive?: boolean
  }
}

export function StatCard({
  className,
  label,
  value,
  unit,
  trend,
  children,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-5 border border-[#F3F4F6] shadow-[0_2px_8px_rgba(0,0,0,0.08)] min-h-[120px] flex flex-col justify-between",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-[#4B5563] uppercase tracking-wider">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-[#121212] tracking-tight">{value}</span>
          {unit && <span className="text-sm font-medium text-[#4B5563] ml-0.5">{unit}</span>}
        </div>
      </div>
      {(trend || children) && (
        <div className="mt-2 flex items-center justify-between text-xs">
          {trend && (
            <span
              className={cn(
                "font-medium",
                trend.isPositive ? "text-[#16A34A]" : "text-[#EF4444]"
              )}
            >
              {trend.value}
            </span>
          )}
          {children}
        </div>
      )}
    </div>
  )
}
