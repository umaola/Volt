import * as React from "react"
import { IconSearch, IconFilter, IconBuildingSkyscraper, IconEye, IconRefresh, IconCheck, IconX } from "@tabler/icons-react"
import { Skeleton } from "@/components/ui/skeleton"

export interface AdminUserItem {
  uid: string
  email: string
  phone: string
  name: string
  emailVerified: boolean
  disco: string
  tariffBand: string
  meterNumber: string
  currentUnits: number
  createdAt: string
  subscriptionStatus: string
}

interface UserLookupTableProps {
  users: AdminUserItem[]
  isLoading?: boolean
  searchQuery: string
  selectedDisco: string
  selectedBand: string
  onSearchChange: (search: string) => void
  onDiscoChange: (disco: string) => void
  onBandChange: (band: string) => void
  onInspectUser: (uid: string) => void
  onRefresh: () => void
}

export function UserLookupSkeleton() {
  return (
    <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 w-full sm:w-72 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <div className="flex flex-col gap-2.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export function UserLookupTable({
  users,
  isLoading = false,
  searchQuery,
  selectedDisco,
  selectedBand,
  onSearchChange,
  onDiscoChange,
  onBandChange,
  onInspectUser,
  onRefresh
}: UserLookupTableProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
        <div>
          <h4 className="text-base font-bold text-zinc-900">User & Meter Intelligence Directory</h4>
          <p className="text-xs text-zinc-500 mt-0.5">
            Search customers by Meter Number, Email, or Phone for diagnostics & support
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="self-start md:self-auto flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 px-3 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <IconRefresh className="w-3.5 h-3.5" />
          <span>Refresh List</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <IconSearch className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search meter number, email, phone, or name..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <select
          value={selectedDisco}
          onChange={(e) => onDiscoChange(e.target.value)}
          className="h-10 px-3 rounded-xl border border-zinc-200 text-xs text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">All DISCOs</option>
          <option value="IKEDC">IKEDC</option>
          <option value="EKEDC">EKEDC</option>
          <option value="AEDC">AEDC</option>
          <option value="IBEDC">IBEDC</option>
          <option value="EEDC">EEDC</option>
          <option value="PHED">PHED</option>
          <option value="KEDCO">KEDCO</option>
          <option value="BEDC">BEDC</option>
          <option value="JED">JED</option>
          <option value="KAEDCO">KAEDCO</option>
          <option value="YEDC">YEDC</option>
          <option value="ABA">ABA</option>
        </select>

        <select
          value={selectedBand}
          onChange={(e) => onBandChange(e.target.value)}
          className="h-10 px-3 rounded-xl border border-zinc-200 text-xs text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">All Tariff Bands</option>
          <option value="BAND A">Band A</option>
          <option value="BAND B">Band B</option>
          <option value="BAND C">Band C</option>
          <option value="BAND D">Band D</option>
          <option value="BAND E">Band E</option>
        </select>
      </div>

      {isLoading ? (
        <UserLookupSkeleton />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Phone</th>
                <th className="py-2.5 px-3">Meter Number</th>
                <th className="py-2.5 px-3">DISCO / Band</th>
                <th className="py-2.5 px-3 text-right">Units Balance</th>
                <th className="py-2.5 px-3">Subscription</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 text-xs font-medium text-zinc-700">
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.uid} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-900">{u.name || "Anonymous"}</span>
                        <span className="text-[11px] text-zinc-500 font-normal">{u.email || "No email"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-zinc-600 font-mono text-[11px]">{u.phone || "—"}</td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-xs font-bold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded-md">
                        {u.meterNumber || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-zinc-900">{u.disco}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded">
                          {u.tariffBand}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="font-bold text-emerald-700 font-mono">
                        {typeof u.currentUnits === "number" ? u.currentUnits.toFixed(1) : "0.0"} kWh
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          u.subscriptionStatus === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : u.subscriptionStatus === "trial"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {u.subscriptionStatus || "free"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onInspectUser(u.uid)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <IconEye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-400">
                    No customers found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
