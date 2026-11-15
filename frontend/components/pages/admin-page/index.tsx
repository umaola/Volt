import * as React from "react"
import { IconBolt, IconLogout, IconRefresh, IconChartBar, IconPlug, IconUsers, IconShieldCheck } from "@tabler/icons-react"
import { KpiCards, KpiCardsSkeleton, KpiData } from "./kpi-cards"
import { RechargeTrendsChart, RechargeTrendsSkeleton, DailyTrendItem, DiscoRechargeItem } from "./recharge-trends-chart"
import { DiscoBandDistribution, DiscoBandSkeleton, DistributionItem } from "./disco-band-distribution"
import { ApplianceInsightsTable, ApplianceInsightsSkeleton, TopApplianceItem } from "./appliance-insights-table"
import { UserLookupTable, UserLookupSkeleton, AdminUserItem } from "./user-lookup-table"
import { UserDetailModal, AdminUserDetail } from "./user-detail-modal"
import { AdminLogin } from "./admin-login"

export {
  KpiCards,
  KpiCardsSkeleton,
  RechargeTrendsChart,
  RechargeTrendsSkeleton,
  DiscoBandDistribution,
  DiscoBandSkeleton,
  ApplianceInsightsTable,
  ApplianceInsightsSkeleton,
  UserLookupTable,
  UserLookupSkeleton,
  UserDetailModal,
  AdminLogin
}

export type { AdminUserItem, AdminUserDetail }

export interface AdminSummaryData {
  totalUsers: number
  verifiedUsers: number
  newUsersLast7Days: number
  activeSubscriptions: number
  totalMetersTracked: number
  totalRechargeNaira: number
  totalRechargeUnits: number
  avgRechargeNaira: number
  rechargeCount: number
  avgSupplyHours: number
  discoDistribution: DistributionItem[]
  bandDistribution: DistributionItem[]
  topCities: DistributionItem[]
  discoRechargeNaira: DiscoRechargeItem[]
  dailyRechargeTrend: DailyTrendItem[]
  topAppliances: TopApplianceItem[]
}

interface AdminPageProps {
  isLoading: boolean
  isAuthenticated: boolean
  isCheckingAuth: boolean
  authError?: string | null
  currentAdminEmail?: string | null
  summaryData: AdminSummaryData | null
  usersList: AdminUserItem[]
  isUsersLoading?: boolean
  selectedUserDetail: AdminUserDetail | null
  isUserDetailLoading?: boolean
  searchQuery: string
  selectedDisco: string
  selectedBand: string
  onSearchChange: (search: string) => void
  onDiscoChange: (disco: string) => void
  onBandChange: (band: string) => void
  onInspectUser: (uid: string) => void
  onCloseUserModal: () => void
  onRefreshSummary: () => void
  onRefreshUsers: () => void
  onSubmitLogin: (email: string, pass: string) => Promise<void>
  onLogout: () => void
}

export function AdminPageSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <div className="h-16 bg-white border-b border-zinc-100 px-6 flex items-center justify-between" />
      <div className="p-6 max-w-7xl w-full mx-auto flex flex-col gap-6">
        <KpiCardsSkeleton />
        <RechargeTrendsSkeleton />
        <DiscoBandSkeleton />
      </div>
    </div>
  )
}

export function AdminPage({
  isLoading,
  isAuthenticated,
  isCheckingAuth,
  authError,
  currentAdminEmail,
  summaryData,
  usersList,
  isUsersLoading = false,
  selectedUserDetail,
  isUserDetailLoading = false,
  searchQuery,
  selectedDisco,
  selectedBand,
  onSearchChange,
  onDiscoChange,
  onBandChange,
  onInspectUser,
  onCloseUserModal,
  onRefreshSummary,
  onRefreshUsers,
  onSubmitLogin,
  onLogout
}: AdminPageProps) {
  const [activeTab, setActiveTab] = React.useState<"overview" | "appliances" | "users">("overview")

  if (isCheckingAuth) {
    return <AdminPageSkeleton />
  }

  if (!isAuthenticated) {
    return <AdminLogin isLoading={isLoading} error={authError} onSubmitLogin={onSubmitLogin} />
  }

  const kpiData: KpiData | null = summaryData
    ? {
        totalUsers: summaryData.totalUsers,
        newUsersLast7Days: summaryData.newUsersLast7Days,
        activeSubscriptions: summaryData.activeSubscriptions,
        totalMetersTracked: summaryData.totalMetersTracked,
        totalRechargeNaira: summaryData.totalRechargeNaira,
        totalRechargeUnits: summaryData.totalRechargeUnits,
        avgRechargeNaira: summaryData.avgRechargeNaira,
        avgSupplyHours: summaryData.avgSupplyHours
      }
    : null

  return (
    <div id="admin-root" className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col w-full">
      <header className="bg-white border-b border-zinc-100 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <IconBolt className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-zinc-900 leading-tight">Volt Intelligence</h1>
              <span className="text-[10px] text-zinc-400 font-medium">Founder & Analytics Portal</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "overview" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <IconChartBar className="w-3.5 h-3.5" />
              <span>Overview & Trends</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("appliances")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "appliances" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <IconPlug className="w-3.5 h-3.5" />
              <span>Appliance Habits</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "users" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <IconUsers className="w-3.5 h-3.5" />
              <span>Users & Meters</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-600 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-lg">
              <IconShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-mono text-[11px] truncate max-w-[140px]">{currentAdminEmail}</span>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <IconLogout className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        <div className="flex md:hidden border-t border-zinc-100 px-4 py-2 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 ${
              activeTab === "overview" ? "bg-emerald-50 text-primary border border-emerald-200" : "text-zinc-500"
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("appliances")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 ${
              activeTab === "appliances" ? "bg-emerald-50 text-primary border border-emerald-200" : "text-zinc-500"
            }`}
          >
            Appliances
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 ${
              activeTab === "users" ? "bg-emerald-50 text-primary border border-emerald-200" : "text-zinc-500"
            }`}
          >
            Users & Meters
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {activeTab === "overview" && (
          <div className="flex flex-col gap-6">
            <KpiCards data={kpiData} isLoading={isLoading} />
            <RechargeTrendsChart
              trendData={summaryData?.dailyRechargeTrend || []}
              discoData={summaryData?.discoRechargeNaira || []}
              isLoading={isLoading}
            />
            <DiscoBandDistribution
              discoDistribution={summaryData?.discoDistribution || []}
              bandDistribution={summaryData?.bandDistribution || []}
              topCities={summaryData?.topCities || []}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeTab === "appliances" && (
          <div className="flex flex-col gap-6">
            <ApplianceInsightsTable
              appliances={summaryData?.topAppliances || []}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeTab === "users" && (
          <div className="flex flex-col gap-6">
            <UserLookupTable
              users={usersList}
              isLoading={isUsersLoading}
              searchQuery={searchQuery}
              selectedDisco={selectedDisco}
              selectedBand={selectedBand}
              onSearchChange={onSearchChange}
              onDiscoChange={onDiscoChange}
              onBandChange={onBandChange}
              onInspectUser={onInspectUser}
              onRefresh={onRefreshUsers}
            />
          </div>
        )}
      </main>

      {selectedUserDetail && (
        <UserDetailModal
          user={selectedUserDetail}
          isLoading={isUserDetailLoading}
          onClose={onCloseUserModal}
        />
      )}
    </div>
  )
}
