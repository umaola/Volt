"use client"

import * as React from "react"
import {
  IconUser,
  IconMail,
  IconEye,
  IconEyeOff,
  IconCheck,
  IconX,
  IconArrowLeft
} from "@tabler/icons-react"
import { PrimaryButton } from "@/components/design-system/button"

interface SignupPageProps {
  isLoading: boolean
  error?: string | null
  onSignup: (data: { name: string; email: string; password: string }) => void
  onNavigateToLogin: () => void
  onBack: () => void
  onValidatePassword?: (password: string) => Promise<{
    hasMinLength: boolean
    hasCapital: boolean
    hasNumber: boolean
    hasSpecial: boolean
  }>
  onNavigateToTerms?: () => void
  onNavigateToPrivacy?: () => void
}

export function SignupPage({
  isLoading,
  error,
  onSignup,
  onNavigateToLogin,
  onValidatePassword,
  onBack,
  onNavigateToTerms,
  onNavigateToPrivacy
}: SignupPageProps) {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [agreed, setAgreed] = React.useState(false)

  const [isPasswordFocused, setIsPasswordFocused] = React.useState(false)

  const [touched, setTouched] = React.useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    agreed: false
  })

  const [criteria, setCriteria] = React.useState({
    hasMinLength: false,
    hasCapital: false,
    hasNumber: false,
    hasSpecial: false
  })

  React.useEffect(() => {
    if (!password) {
      setCriteria({
        hasMinLength: false,
        hasCapital: false,
        hasNumber: false,
        hasSpecial: false
      })
      return
    }

    if (onValidatePassword) {
      const delayDebounce = setTimeout(() => {
        onValidatePassword(password)
          .then((resCriteria) => {
            if (resCriteria) {
              setCriteria(resCriteria)
            }
          })
          .catch((err) => {
            console.error(err)
          })
      }, 250)

      return () => clearTimeout(delayDebounce)
    } else {
      const hasMinLength = password.length >= 8
      const hasCapital = /[A-Z]/.test(password)
      const hasNumber = /\d/.test(password)
      const hasSpecial = /[^A-Za-z0-9]/.test(password)
      setCriteria({
        hasMinLength,
        hasCapital,
        hasNumber,
        hasSpecial
      })
    }
  }, [password, onValidatePassword])

  const nameError = React.useMemo(() => {
    if (!touched.name) return ""
    if (name.trim().length === 0) {
      return "Full name is required"
    }
    if (name.trim().length < 2) {
      return "Full name must be at least 2 characters"
    }
    return ""
  }, [name, touched.name])

  const emailError = React.useMemo(() => {
    if (!touched.email) return ""
    if (email.trim().length === 0) {
      return "Email address is required"
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address"
    }
    return ""
  }, [email, touched.email])

  const passwordError = React.useMemo(() => {
    if (!touched.password) return ""
    if (password.length === 0) {
      return "Password is required"
    }
    const isPasswordValid = criteria.hasMinLength && criteria.hasCapital && criteria.hasNumber && criteria.hasSpecial
    if (!isPasswordValid) {
      return "Password must meet all criteria below"
    }
    return ""
  }, [password, criteria, touched.password])

  const confirmPasswordError = React.useMemo(() => {
    if (!touched.confirmPassword) return ""
    if (confirmPassword.length === 0) {
      return "Please confirm your password"
    }
    if (confirmPassword !== password) {
      return "Passwords do not match"
    }
    return ""
  }, [confirmPassword, password, touched.confirmPassword])

  const agreedError = React.useMemo(() => {
    if (!touched.agreed) return ""
    if (!agreed) {
      return "You must agree to the Terms of Use and Privacy Policy"
    }
    return ""
  }, [agreed, touched.agreed])

  const isEmailValid = email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isPasswordValid =
    criteria.hasMinLength &&
    criteria.hasCapital &&
    criteria.hasNumber &&
    criteria.hasSpecial
  const isConfirmPasswordValid = confirmPassword === password && confirmPassword.length > 0

  const isFormValid =
    name.trim().length >= 2 &&
    isEmailValid &&
    isPasswordValid &&
    isConfirmPasswordValid &&
    agreed

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      agreed: true
    })
    if (isFormValid) {
      onSignup({ name, email, password })
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
          <h1 className="text-[28px] font-bold text-[#052e16] tracking-tight">Sign up</h1>
          <p className="text-sm text-[#4B5563] font-medium">Enter required details</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 mt-2">
          {error && (
            <div className="w-full p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col gap-1 text-sm text-red-800 animate-fade-in">
              <span className="font-semibold">{error}</span>
              {error.toLowerCase().includes("already") && (
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-xs font-bold text-red-600 hover:underline self-start mt-1 cursor-pointer"
                >
                  Go to Login &rarr;
                </button>
              )}
            </div>
          )}

          <div className="flex flex-col w-full">
            <div className="relative flex items-center w-full">
              <span className="absolute left-4 text-[#9CA3AF]">
                <IconUser className="w-5 h-5 stroke-[1.5]" />
              </span>
              <input
                type="text"
                placeholder="Fullname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                disabled={isLoading}
                required
                className={`w-full h-12 pl-12 pr-4 rounded-xl border text-sm text-[#121212] placeholder-zinc-300 focus:outline-none transition-colors disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF] ${
                  nameError
                    ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary"
                }`}
              />
            </div>
            {nameError && (
              <span className="text-xs text-red-500 mt-1 pl-1 font-medium">{nameError}</span>
            )}
          </div>

          <div className="flex flex-col w-full">
            <div className="relative flex items-center w-full">
              <span className="absolute left-4 text-[#9CA3AF]">
                <IconMail className="w-5 h-5 stroke-[1.5]" />
              </span>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                disabled={isLoading}
                required
                className={`w-full h-12 pl-12 pr-4 rounded-xl border text-sm text-[#121212] placeholder-zinc-300 focus:outline-none transition-colors disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF] ${
                  emailError
                    ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary"
                }`}
              />
            </div>
            {emailError && (
              <span className="text-xs text-red-500 mt-1 pl-1 font-medium">{emailError}</span>
            )}
          </div>

          <div className="flex flex-col w-full">
            <div className="relative flex items-center w-full">
              <span className="absolute left-4 text-[#9CA3AF]">
                <IconEye className="w-5 h-5 stroke-[1.5]" />
              </span>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => {
                  setIsPasswordFocused(false)
                  setTouched((prev) => ({ ...prev, password: true }))
                }}
                disabled={isLoading}
                required
                className={`w-full h-12 pl-12 pr-4 rounded-xl border text-sm text-[#121212] placeholder-zinc-300 focus:outline-none transition-colors disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF] ${
                  passwordError
                    ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary"
                }`}
              />
            </div>
            {passwordError && (
              <span className="text-xs text-red-500 mt-1 pl-1 font-medium">{passwordError}</span>
            )}
          </div>

          {isPasswordFocused && (
            <div className="flex flex-col gap-2 px-1">
              <div className="flex items-center gap-2 text-xs">
                {criteria.hasMinLength ? (
                  <IconCheck className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                ) : (
                  <IconX className="w-4 h-4 text-[#4B5563] stroke-[2.5]" />
                )}
                <span className={criteria.hasMinLength ? "text-emerald-600 font-semibold" : "text-[#4B5563] font-medium"}>
                  Password must be up to 8 characters
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {criteria.hasCapital ? (
                  <IconCheck className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                ) : (
                  <IconX className="w-4 h-4 text-[#4B5563] stroke-[2.5]" />
                )}
                <span className={criteria.hasCapital ? "text-emerald-600 font-semibold" : "text-[#4B5563] font-medium"}>
                  Contain at least one capital letter
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {criteria.hasNumber ? (
                  <IconCheck className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                ) : (
                  <IconX className="w-4 h-4 text-[#4B5563] stroke-[2.5]" />
                )}
                <span className={criteria.hasNumber ? "text-emerald-600 font-semibold" : "text-[#4B5563] font-medium"}>
                  Contain at least one number
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {criteria.hasSpecial ? (
                  <IconCheck className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                ) : (
                  <IconX className="w-4 h-4 text-[#4B5563] stroke-[2.5]" />
                )}
                <span className={criteria.hasSpecial ? "text-emerald-600 font-semibold" : "text-[#4B5563] font-medium"}>
                  Contain at least one special character
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col w-full">
            <div className="relative flex items-center w-full">
              <span className="absolute left-4 text-[#9CA3AF]">
                <IconEyeOff className="w-5 h-5 stroke-[1.5]" />
              </span>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
                disabled={isLoading}
                required
                className={`w-full h-12 pl-12 pr-4 rounded-xl border text-sm text-[#121212] placeholder-zinc-300 focus:outline-none transition-colors disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF] ${
                  confirmPasswordError
                    ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary"
                }`}
              />
            </div>
            {confirmPasswordError && (
              <span className="text-xs text-red-500 mt-1 pl-1 font-medium">{confirmPasswordError}</span>
            )}
          </div>

          <div className="flex flex-col w-full gap-1">
            <label className="flex items-start gap-3 text-xs text-[#4B5563] cursor-pointer mt-2 leading-relaxed px-1">
              <div className="relative flex items-center justify-center w-4 h-4 mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked)
                    setTouched((prev) => ({ ...prev, agreed: true }))
                  }}
                  disabled={isLoading}
                  className={`appearance-none w-4 h-4 rounded border-2 bg-transparent focus:outline-none cursor-pointer transition-all ${
                    agreedError
                      ? "border-red-500 checked:border-red-500"
                      : "border-primary checked:border-primary"
                  }`}
                />
                {agreed && (
                  <IconCheck className={`absolute w-3 h-3 pointer-events-none stroke-[3] ${
                    agreedError ? "text-red-500" : "text-primary"
                  }`} />
                )}
              </div>
              <span>
                By clicking signup, you agree that you have read and agreed to Volt's{" "}
                <a
                  href="/?page=terms"
                  onClick={(e) => {
                    e.preventDefault()
                    onNavigateToTerms?.()
                  }}
                  className="underline font-semibold hover:text-[#121212] transition-colors"
                >
                  Terms of Use
                </a>{" "}
                and{" "}
                <a
                  href="/?page=privacy"
                  onClick={(e) => {
                    e.preventDefault()
                    onNavigateToPrivacy?.()
                  }}
                  className="underline font-semibold hover:text-[#121212] transition-colors"
                >
                  Privacy Policy
                </a>
                .
              </span>
            </label>
            {agreedError && (
              <span className="text-xs text-red-500 pl-1 font-medium">{agreedError}</span>
            )}
          </div>

          <div className="mt-4">
            <PrimaryButton type="submit" disabled={isLoading} isLoading={isLoading}>
              Signup
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>

      <div className="text-center text-sm text-[#4B5563] mt-8 mb-4">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onNavigateToLogin}
          className="font-bold text-[#EAB308] hover:underline transition-all"
        >
          Login
        </button>
      </div>
    </div>
  )
}
