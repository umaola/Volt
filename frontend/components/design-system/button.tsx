import * as React from "react"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
}

export function PrimaryButton({
  className,
  disabled,
  isLoading,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "w-full h-12 rounded-xl bg-primary text-white font-semibold text-base flex items-center justify-center gap-2 transition-colors active:bg-[#00a656] disabled:bg-[#D1D5DB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner className="w-5 h-5 animate-spin" /> : children}
    </button>
  )
}

export function SecondaryButton({
  className,
  disabled,
  isLoading,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "w-full h-12 rounded-xl border border-primary bg-transparent text-primary font-semibold text-base flex items-center justify-center gap-2 transition-colors active:bg-emerald-50 disabled:border-[#D1D5DB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner className="w-5 h-5 animate-spin text-primary" /> : children}
    </button>
  )
}

export function GhostButton({
  className,
  disabled,
  isLoading,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "w-full h-12 rounded-xl bg-transparent text-primary font-semibold text-base flex items-center justify-center gap-2 transition-colors active:bg-zinc-50 disabled:text-[#9CA3AF] disabled:cursor-not-allowed",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner className="w-5 h-5 animate-spin text-primary" /> : children}
    </button>
  )
}
