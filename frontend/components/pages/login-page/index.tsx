"use client"

import * as React from "react"
import {
  IconMail,
  IconEye,
  IconEyeOff,
  IconArrowLeft
} from "@tabler/icons-react"
import { PrimaryButton } from "@/components/design-system/button"

interface LoginPageProps {
  isLoading: boolean
  error?: string | null
  onLogin: (data: { email: string; password: string }) => void
  onNavigateToSignup: () => void
  onBack: () => void
  onForgotPassword: (email: string) => void
}

export function LoginPage({
  isLoading,
  error,
  onLogin,
  onNavigateToSignup,
  onBack,
  onForgotPassword
}: LoginPageProps) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")


  const isEmailValid = email.trim().length > 0 && email.includes("@")
  const isFormValid = isEmailValid && password.length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid) {
      onLogin({ email, password })
    }
  }

  return (
    <div className="flex-grow flex flex-col justify-between p-6 bg-white overflow-y-auto w-full max-w-md mx-auto select-none relative">
      <div className="flex flex-col gap-6">
        <button
          type="button"
          onClick={onBack}
          className="self-start text-[#4B5563] hover:text-[#121212] transition-colors -ml-1 mt-2"
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
            <h1 className="text-[28px] font-bold text-[#052e16] tracking-tight">Login</h1>
            <p className="text-sm text-[#4B5563] font-medium">Enter required details</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 mt-2">
            {error && (
              <div className="w-full p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 animate-fade-in font-semibold">
                {error}
              </div>
            )}
            <div className="relative flex items-center w-full">
              <span className="absolute left-4 text-[#9CA3AF]">
                <IconMail className="w-5 h-5 stroke-[1.5]" />
              </span>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-zinc-200 text-sm text-[#121212] placeholder-zinc-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF]"
              />
            </div>

            <div className="relative flex items-center w-full">
              <span className="absolute left-4 text-[#9CA3AF]">
                <IconEye className="w-5 h-5 stroke-[1.5]" />
              </span>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-zinc-200 text-sm text-[#121212] placeholder-zinc-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF]"
              />
            </div>

            <div className="flex justify-end w-full -mt-2">
              <button
                type="button"
                onClick={() => onForgotPassword(email)}
                className="text-xs font-semibold text-[#EAB308] hover:underline transition-all cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            <div className="mt-6">
              <PrimaryButton type="submit" disabled={!isFormValid || isLoading} isLoading={isLoading}>
                Login
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>

      <div className="text-center text-sm text-[#4B5563] mt-8 mb-4">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onNavigateToSignup}
          className="font-bold text-[#EAB308] hover:underline transition-all"
        >
          Signup
        </button>
      </div>
    </div>
  )
}
