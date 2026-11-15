import * as React from "react"
import { IconShieldLock, IconBolt, IconAlertCircle } from "@tabler/icons-react"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"

interface AdminLoginProps {
  isLoading?: boolean
  error?: string | null
  onSubmitLogin: (email: string, pass: string) => Promise<void>
}

export function AdminLoginSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-xl max-w-md w-full flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-60" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function AdminLogin({ isLoading = false, error = null, onSubmitLogin }: AdminLoginProps) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [validationError, setValidationError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setValidationError("Please enter both email and password")
      return
    }
    setValidationError("")
    await onSubmitLogin(email.trim(), password)
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-xl max-w-md w-full flex flex-col gap-6 animate-in fade-in zoom-in-95">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3">
            <IconBolt className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Volt Intelligence Admin</h2>
          <p className="text-xs text-zinc-500 mt-1">Sign in with your authorized admin account to continue</p>
        </div>

        {(error || validationError) && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700 font-medium">
            <IconAlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error || validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-700">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. info@voltdigitalservices.com"
              required
              disabled={isLoading}
              className="h-11 px-3.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="h-11 px-3.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-primary hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50 mt-2"
          >
            {isLoading ? <Spinner className="w-4 h-4 animate-spin text-white" /> : "Sign In to Admin Portal"}
          </button>
        </form>

        <div className="text-center">
          <span className="text-[11px] text-zinc-400">
            Protected area. Access is restricted to authorized Volt administrators.
          </span>
        </div>
      </div>
    </div>
  )
}
