"use client"

import * as React from "react"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { PrimaryButton } from "@/components/design-system/button"
import { IconArrowLeft } from "@tabler/icons-react"
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
    <div className="flex-grow flex flex-col justify-between p-6 bg-white overflow-y-auto w-full max-w-md mx-auto select-none relative">
      <div className="flex flex-col gap-6">
        <button
          type="button"
          onClick={onBack}
          className="self-start text-[#4B5563] hover:text-[#121212] transition-colors -ml-1 mt-2"
          disabled={isLoading}
        >
          <IconArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center gap-6 mt-2">
          <div className="w-[120px] h-[50px] relative flex items-center justify-center">
            <img
              src="/logo-bold.png"
              alt="Volt Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex flex-col items-center gap-1.5 text-center mt-2">
            <h1 className="text-[28px] font-bold text-[#052e16] tracking-tight">Verify email</h1>
            <p className="text-sm text-[#4B5563] font-medium leading-relaxed px-4">
              Enter the 6-digit verification code sent to <span className="font-semibold text-zinc-800">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-6 mt-4">
            <div className="w-full p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-center text-xs text-primary font-medium leading-relaxed">
              For testing, use code: <span className="font-bold underline text-sm tracking-wider">123456</span>
            </div>

            {error && (
              <div className="w-full p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 font-semibold animate-fade-in text-center">
                {error}
              </div>
            )}

            <div className="flex justify-center w-full my-2">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
                pattern={REGEXP_ONLY_DIGITS}
                disabled={isLoading}
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="w-12 h-12 text-lg font-bold text-[#121212] rounded-xl border border-zinc-200 bg-zinc-50/50" />
                  <InputOTPSlot index={1} className="w-12 h-12 text-lg font-bold text-[#121212] rounded-xl border border-zinc-200 bg-zinc-50/50" />
                  <InputOTPSlot index={2} className="w-12 h-12 text-lg font-bold text-[#121212] rounded-xl border border-zinc-200 bg-zinc-50/50" />
                  <InputOTPSlot index={3} className="w-12 h-12 text-lg font-bold text-[#121212] rounded-xl border border-zinc-200 bg-zinc-50/50" />
                  <InputOTPSlot index={4} className="w-12 h-12 text-lg font-bold text-[#121212] rounded-xl border border-zinc-200 bg-zinc-50/50" />
                  <InputOTPSlot index={5} className="w-12 h-12 text-lg font-bold text-[#121212] rounded-xl border border-zinc-200 bg-zinc-50/50" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="w-full mt-4">
              <PrimaryButton
                type="submit"
                disabled={code.length !== 6 || isLoading}
                isLoading={isLoading}
              >
                Verify Code
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>

      <div className="text-center text-sm text-[#4B5563] mt-8 mb-4">
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
    </div>
  )
}
