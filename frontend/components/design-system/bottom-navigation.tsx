import * as React from "react"
import { cn } from "@/lib/utils"
import {
  IconHome,
  IconCalculator,
  IconDatabase,
  IconChartDots,
  IconUser,
} from "@tabler/icons-react"

export type TabType = "dashboard" | "calculator" | "devices" | "insights" | "profile"

interface BottomNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: "dashboard" as TabType, label: "Home", icon: IconHome },
    { id: "calculator" as TabType, label: "Calculator", icon: IconCalculator },
    { id: "devices" as TabType, label: "Devices", icon: IconDatabase },
    { id: "insights" as TabType, label: "Insights", icon: IconChartDots },
    { id: "profile" as TabType, label: "Profile", icon: IconUser },
  ]

  return (
    <nav className="w-full h-[72px] bg-white border-t border-[#F3F4F6] flex items-center justify-around px-2 relative z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors relative"
          >
            {isActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-[#00BF63] rounded-b-full z-10" />
            )}
            <Icon
              className={cn(
                "w-6 h-6 transition-colors",
                isActive ? "text-[#00BF63]" : "text-[#9CA3AF]"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium leading-none transition-colors",
                isActive ? "text-[#00BF63]" : "text-[#6B7280]"
              )}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
