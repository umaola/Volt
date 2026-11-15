import * as React from "react"
import { IconX, IconPlug, IconBolt, IconCalendar, IconCheck, IconBuildingSkyscraper } from "@tabler/icons-react"
import { Spinner } from "@/components/ui/spinner"

export interface AdminUserDetail {
  uid: string
  email?: string
  phone?: string
  full_name?: string
  name?: string
  current_units?: number
  email_verified?: boolean
  profile?: {
    meter_number?: string
    disco?: string
    tariff_band?: string
    meter_type?: string
    state?: string
    city?: string
    household_size?: number
  }
  subscription?: {
    status?: string
    planType?: string
    endDate?: string
  }
  appliances?: Array<{
    id?: string
    name?: string
    custom_wattage?: number
    wattage?: number
    hours_per_day?: number
    quantity?: number
  }>
  recharges?: Array<{
    id?: string
    amount_paid?: number
    amount?: number
    units_received?: number
    units?: number
    tariff_rate?: number
    purchase_date?: string
    created_at?: string
  }>
  calibrations?: Array<{
    id?: string
    previous_units?: number
    new_units?: number
    difference?: number
    source?: string
    created_at?: string
  }>
}

interface UserDetailModalProps {
  user: AdminUserDetail | null
  isLoading?: boolean
  onClose: () => void
}

export function UserDetailModal({ user, isLoading = false, onClose }: UserDetailModalProps) {
  const [activeTab, setActiveTab] = React.useState<"appliances" | "recharges" | "calibrations">("appliances")

  if (!user && !isLoading) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] shadow-2xl flex flex-col border border-zinc-100 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-5 border-b border-zinc-100">
          <div>
            <h3 className="text-base font-bold text-zinc-900">
              {isLoading ? "Loading customer..." : user?.full_name || user?.name || "Customer Profile"}
            </h3>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">{user?.email || user?.phone || user?.uid}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {isLoading || !user ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Spinner className="w-6 h-6 text-primary animate-spin" />
            <span className="text-xs text-zinc-500">Fetching customer data...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 flex flex-col">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Meter</span>
                <span className="font-mono text-xs font-bold text-zinc-900 mt-1">
                  {user.profile?.meter_number || "—"}
                </span>
              </div>
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 flex flex-col">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">DISCO & Band</span>
                <span className="text-xs font-bold text-zinc-900 mt-1">
                  {user.profile?.disco || "Unknown"} ({user.profile?.tariff_band || "—"})
                </span>
              </div>
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 flex flex-col">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Current Balance</span>
                <span className="font-mono text-xs font-bold text-emerald-700 mt-1">
                  {typeof user.current_units === "number" ? user.current_units.toFixed(1) : "0.0"} kWh
                </span>
              </div>
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 flex flex-col">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Subscription</span>
                <span className="text-xs font-bold text-blue-700 capitalize mt-1">
                  {user.subscription?.status || "Free Trial"}
                </span>
              </div>
            </div>

            <div className="flex border-b border-zinc-100 gap-4">
              <button
                type="button"
                onClick={() => setActiveTab("appliances")}
                className={`pb-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 -mb-px ${
                  activeTab === "appliances" ? "border-primary text-primary" : "border-transparent text-zinc-400 hover:text-zinc-600"
                }`}
              >
                Appliances ({user.appliances?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("recharges")}
                className={`pb-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 -mb-px ${
                  activeTab === "recharges" ? "border-primary text-primary" : "border-transparent text-zinc-400 hover:text-zinc-600"
                }`}
              >
                Recent Recharges ({user.recharges?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("calibrations")}
                className={`pb-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 -mb-px ${
                  activeTab === "calibrations" ? "border-primary text-primary" : "border-transparent text-zinc-400 hover:text-zinc-600"
                }`}
              >
                Calibrations ({user.calibrations?.length || 0})
              </button>
            </div>

            {activeTab === "appliances" && (
              <div className="flex flex-col gap-2">
                {user.appliances && user.appliances.length > 0 ? (
                  user.appliances.map((app, i) => {
                    const wattage = app.custom_wattage || app.wattage || 0
                    const hours = app.hours_per_day || 0
                    const qty = app.quantity || 1
                    const daily = Math.round(((wattage * hours * qty) / 1000) * 10) / 10
                    return (
                      <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl text-xs">
                        <div className="flex items-center gap-2">
                          <IconPlug className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-zinc-800">{app.name}</span>
                          <span className="text-[10px] text-zinc-400">×{qty}</span>
                        </div>
                        <div className="flex items-center gap-4 text-zinc-600">
                          <span>{wattage} W</span>
                          <span>{hours} hrs/day</span>
                          <span className="font-bold text-emerald-700">{daily} kWh/day</span>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-xs text-zinc-400 text-center py-6">No appliances added yet</p>
                )}
              </div>
            )}

            {activeTab === "recharges" && (
              <div className="flex flex-col gap-2">
                {user.recharges && user.recharges.length > 0 ? (
                  user.recharges.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl text-xs">
                      <div>
                        <span className="font-bold text-zinc-900">₦{(r.amount_paid || r.amount || 0).toLocaleString()}</span>
                        <span className="text-[11px] text-zinc-400 ml-2 font-mono">
                          {(r.purchase_date || r.created_at || "").slice(0, 10)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-emerald-700">{(r.units_received || r.units || 0).toFixed(1)} kWh</span>
                        {r.tariff_rate && <span className="text-zinc-400 text-[10px]">(@ ₦{r.tariff_rate}/kWh)</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-400 text-center py-6">No recharges recorded yet</p>
                )}
              </div>
            )}

            {activeTab === "calibrations" && (
              <div className="flex flex-col gap-2">
                {user.calibrations && user.calibrations.length > 0 ? (
                  user.calibrations.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl text-xs">
                      <div>
                        <span className="font-bold text-zinc-800 capitalize">{c.source || "Manual Entry"}</span>
                        <span className="text-[11px] text-zinc-400 ml-2 font-mono">
                          {(c.created_at || "").slice(0, 10)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-zinc-500">{(c.previous_units || 0).toFixed(1)} &rarr;</span>
                        <span className="font-bold text-emerald-700">{(c.new_units || 0).toFixed(1)} kWh</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-400 text-center py-6">No calibrations recorded yet</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
