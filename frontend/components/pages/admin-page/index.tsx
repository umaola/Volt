import * as React from "react"
import {
  IconBolt,
  IconLogout,
  IconRefresh,
  IconChartBar,
  IconPlug,
  IconUsers,
  IconShieldCheck,
  IconTarget,
  IconAlertOctagon
} from "@tabler/icons-react"
import { KpiCards, KpiCardsSkeleton, KpiData } from "./kpi-cards"
import { RechargeTrendsChart, RechargeTrendsSkeleton, DailyTrendItem, DiscoRechargeItem } from "./recharge-trends-chart"
import { DiscoBandDistribution, DiscoBandSkeleton, DistributionItem } from "./disco-band-distribution"
import { ApplianceInsightsTable, ApplianceInsightsSkeleton, TopApplianceItem } from "./appliance-insights-table"
import { UserLookupTable, UserLookupSkeleton, AdminUserItem } from "./user-lookup-table"
import { UserDetailModal, AdminUserDetail } from "./user-detail-modal"
import { AdminLogin } from "./admin-login"
import {
  DepletionAccuracyView,
  DepletionAccuracySkeleton,
  DepletionAccuracyData,
  DepletionCycle,
  DiscoAccuracyStat
} from "./depletion-accuracy-view"
import {
  AnomalyEngineView,
  AnomalyEngineSkeleton,
  AnomalyEngineData,
  EnergyAnomaly
} from "./anomaly-engine-view"

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
  AdminLogin,
  DepletionAccuracyView,
  DepletionAccuracySkeleton,
  AnomalyEngineView,
  AnomalyEngineSkeleton
}

export type {
  AdminUserItem,
  AdminUserDetail,
  DepletionAccuracyData,
  DepletionCycle,
  DiscoAccuracyStat,
  AnomalyEngineData,
  EnergyAnomaly
}

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
  depletionAccuracyData?: DepletionAccuracyData | null
  isDepletionLoading?: boolean
  anomaliesData?: AnomalyEngineData | null
  isAnomaliesLoading?: boolean
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
  onInspectMeter?: (meterNumber: string) => void
  onCloseUserModal: () => void
  onRefreshSummary: () => void
  onRefreshUsers: () => void
  onSubmitLogin: (email: string, pass: string, isRegistering?: boolean, name?: string) => Promise<void>
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
  depletionAccuracyData = null,
  isDepletionLoading = false,
  anomaliesData = null,
  isAnomaliesLoading = false,
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
  onInspectMeter,
  onCloseUserModal,
  onRefreshSummary,
  onRefreshUsers,
  onSubmitLogin,
  onLogout
}: AdminPageProps) {
  const [activeTab, setActiveTab] = React.useState<"overview" | "depletion" | "anomalies" | "appliances" | "users">("overview")

  if (isCheckingAuth) {
    return <AdminPageSkeleton />
  }

  if (!isAuthenticated) {
    return (
      <AdminLogin
        isLoading={isLoading}
        error={authError}
        currentUserEmail={currentAdminEmail}
        onSubmitLogin={onSubmitLogin}
        onRetry={onRefreshSummary}
        onLogout={onLogout}
      />
    )
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

  const handleMeterInspection = (meterNum: string) => {
    if (onInspectMeter) {
      onInspectMeter(meterNum)
    } else {
      const match = usersList.find((u) => u.meterNumber === meterNum)
      if (match) {
        onInspectUser(match.uid)
      } else {
        onSearchChange(meterNum)
        setActiveTab("users")
      }
    }
  }

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

          <div className="hidden lg:flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "overview" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <IconChartBar className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("depletion")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "depletion" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <IconTarget className="w-3.5 h-3.5" />
              <span>Depletion Accuracy</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("anomalies")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "anomalies" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <IconAlertOctagon className="w-3.5 h-3.5" />
              <span>Anomaly Engine</span>
              {anomaliesData && anomaliesData.totalActive > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">
                  {anomaliesData.totalActive}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("appliances")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "appliances" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <IconPlug className="w-3.5 h-3.5" />
              <span>Appliances</span>
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

        <div className="flex lg:hidden border-t border-zinc-100 px-4 py-2 gap-2 overflow-x-auto">
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
            onClick={() => setActiveTab("depletion")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 ${
              activeTab === "depletion" ? "bg-emerald-50 text-primary border border-emerald-200" : "text-zinc-500"
            }`}
          >
            Depletion
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("anomalies")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 ${
              activeTab === "anomalies" ? "bg-emerald-50 text-primary border border-emerald-200" : "text-zinc-500"
            }`}
          >
            Anomalies
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

        {activeTab === "depletion" && (
          <DepletionAccuracyView
            data={depletionAccuracyData}
            isLoading={isDepletionLoading || isLoading}
            onInspectMeter={handleMeterInspection}
          />
        )}

        {activeTab === "anomalies" && (
          <AnomalyEngineView
            data={anomaliesData}
            isLoading={isAnomaliesLoading || isLoading}
            onInspectMeter={handleMeterInspection}
          />
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
