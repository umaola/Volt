"use client"

import * as React from "react"
import { PrimaryButton } from "@/components/design-system/button"
import { IconMail } from "@tabler/icons-react"

interface OtpPageProps {
  isLoading: boolean
  error?: string | null
  email: string
  onVerify: () => void
  onResend: () => void
  onBack: () => void
}

export function OtpPage({
  isLoading,
  error,
  email,
  onVerify,
  onResend,
  onBack
}: OtpPageProps) {
  const [countdown, setCountdown] = React.useState(30)

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleResend = () => {
    if (countdown === 0) {
      setCountdown(30)
      onResend()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoading) {
      onVerify()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm flex flex-col gap-6 border border-zinc-100 select-none animate-in fade-in-0 zoom-in-95 duration-200">
        
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-primary border border-emerald-100">
            <IconMail className="w-8 h-8" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Verify your email</h2>
            <p className="text-sm text-zinc-500 font-medium px-2 leading-relaxed">
              Click the link sent to <span className="font-semibold text-zinc-800">{email}</span> to verify your account.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-semibold animate-fade-in text-center">
              {error}
            </div>
          )}

          <PrimaryButton
            type="submit"
            disabled={isLoading}
            isLoading={isLoading}
          >
            Verify
          </PrimaryButton>
        </form>

        <div className="flex flex-col gap-3 items-center text-xs">
          <div className="text-zinc-500">
            Didn't receive the email?{" "}
            {countdown > 0 ? (
              <span className="font-semibold text-zinc-400">
                Resend in {countdown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="font-bold text-[#EAB308] hover:underline transition-all cursor-pointer"
                disabled={isLoading}
              >
                Resend Email
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onBack}
            className="text-zinc-400 hover:text-zinc-600 font-medium mt-1 hover:underline transition-colors"
            disabled={isLoading}
          >
            Back to Sign Up
          </button>
        </div>

      </div>
    </div>
  )
}
