"use client"

import * as React from "react"
import { IconMail } from "@tabler/icons-react"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { PrimaryButton } from "@/components/design-system/button"
import { REGEXP_ONLY_DIGITS } from "input-otp"

interface OtpPageProps {
  isLoading: boolean
  error?: string | null
  email: string
  onVerify: (code: string) => void
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
  const [code, setCode] = React.useState("")
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
    if (code.length === 6 && !isLoading) {
      onVerify(code)
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
              Enter the 6-digit code sent to <span className="font-semibold text-zinc-800">{email}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-semibold animate-fade-in text-center">
              {error}
            </div>
          )}

          <div className="flex justify-center w-full my-1">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
              pattern={REGEXP_ONLY_DIGITS}
              disabled={isLoading}
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot index={0} className="w-11 h-12 text-lg font-bold text-[#121212] rounded-xl border border-zinc-200 bg-zinc-50/50" />
                <InputOTPSlot index={1} className="w-11 h-12 text-lg font-bold text-[#121212] rounded-xl border border-zinc-200 bg-zinc-50/50" />
                <InputOTPSlot index={2} className="w-11 h-12 text-lg font-bold text-[#121212] rounded-xl border border-zinc-200 bg-zinc-50/50" />
                <InputOTPSlot index={3} className="w-11 h-12 text-lg font-bold text-[#121212] rounded-xl border border-zinc-200 bg-zinc-50/50" />
                <InputOTPSlot index={4} className="w-11 h-12 text-lg font-bold text-[#121212] rounded-xl border border-zinc-200 bg-zinc-50/50" />
                <InputOTPSlot index={5} className="w-11 h-12 text-lg font-bold text-[#121212] rounded-xl border border-zinc-200 bg-zinc-50/50" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <PrimaryButton
            type="submit"
            disabled={code.length !== 6 || isLoading}
            isLoading={isLoading}
          >
            Verify Code
          </PrimaryButton>
        </form>

        <div className="flex flex-col gap-3 items-center text-xs">
          <div className="text-zinc-500">
            Didn't receive the code?{" "}
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
                Resend Code
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

