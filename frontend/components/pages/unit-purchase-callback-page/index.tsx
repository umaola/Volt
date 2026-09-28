"use client"

import * as React from "react"
import { IconCheck, IconCopy, IconAlertTriangle, IconBolt } from "@tabler/icons-react"
import { PrimaryButton, SecondaryButton } from "@/components/design-system/button"
import { StandardCard } from "@/components/design-system/card"
import { toast } from "sonner"

export interface PurchaseResultData {
  token: string
  units: number
  amount: number
  meterNumber: string
  disco: string
  customerName: string
}

export interface UnitPurchaseCallbackPageProps {
  isLoading: boolean
  error: string | null
  result: PurchaseResultData | null
  onDone: () => void
  onRetry?: () => void
}

export function UnitPurchaseCallbackPage({
  isLoading,
  error,
  result,
  onDone,
  onRetry
}: UnitPurchaseCallbackPageProps) {
  const handleCopy = () => {
    if (!result?.token) return
    const raw = result.token.replace(/\s+/g, "").replace(/-/g, "")
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 - ")
    navigator.clipboard.writeText(formatted)
    toast.success("Token copied to clipboard!")
  }

  if (isLoading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 bg-white gap-4 min-h-[100dvh]">
        <div className="w-12 h-12 rounded-full border-4 border-zinc-200 border-t-primary animate-spin" />
        <div className="flex flex-col gap-1 text-center max-w-xs">
          <h2 className="text-lg font-bold text-[#121212]">Vending Electricity Units</h2>
          <p className="text-xs text-[#4B5563]">
            Verifying payment and contacting your DISCO to generate your 20-digit token...
          </p>
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 bg-white gap-5 min-h-[100dvh]">
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
          <IconAlertTriangle className="w-8 h-8" />
        </div>
        <div className="flex flex-col gap-1.5 text-center max-w-sm">
          <h2 className="text-lg font-bold text-[#121212]">Vending Pending or Failed</h2>
          <p className="text-xs text-red-600 font-medium bg-red-50 p-3 rounded-xl border border-red-100">
            {error || "We could not confirm unit vending at this moment."}
          </p>
          <p className="text-[11px] text-[#4B5563] mt-1">
            If money was deducted from your account, your units will settle automatically or you can retry below.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
          {onRetry && (
            <PrimaryButton onClick={onRetry} className="h-11 text-sm font-bold">
              Retry Vending
            </PrimaryButton>
          )}
          <SecondaryButton onClick={onDone} className="h-11 text-sm font-bold">
            Back to Dashboard
          </SecondaryButton>
        </div>
      </div>
    )
  }

  const raw = result.token.replace(/\s+/g, "").replace(/-/g, "")
  const formattedToken = raw.replace(/(\d{4})(?=\d)/g, "$1 - ")

  return (
    <div className="flex-grow flex flex-col bg-zinc-50 p-4 md:p-6 overflow-y-auto min-h-[100dvh]">
      <div className="max-w-md w-full mx-auto flex flex-col gap-4 my-auto py-6">
        <div className="flex flex-col items-center justify-center text-center p-5 bg-white rounded-3xl border border-emerald-100 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-white mb-3 shadow-md">
            <IconCheck className="w-8 h-8 stroke-[3]" />
          </div>
          <h2 className="text-xl font-black text-[#121212] tracking-tight">Purchase Successful!</h2>
          <p className="text-xs text-[#4B5563] mt-1">
            Your DISCO electricity token has been generated.
          </p>
        </div>

        <StandardCard className="flex flex-col items-center justify-center gap-2 p-6 bg-zinc-900 border-zinc-800 text-white rounded-3xl shadow-lg">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <IconBolt className="w-4 h-4 fill-emerald-400" />
            <span className="text-[11px] font-bold uppercase tracking-widest">20-Digit Electricity Token</span>
          </div>
          <span className="text-2xl font-black font-mono tracking-widest text-emerald-400 select-all my-2 text-center">
            {formattedToken}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm mt-1"
          >
            <IconCopy className="w-4 h-4" />
            <span>Copy Token</span>
          </button>
        </StandardCard>

        <StandardCard className="flex flex-col gap-3 p-5 text-xs bg-white rounded-3xl border border-zinc-200/80 shadow-xs">
          <div className="flex justify-between border-b border-zinc-100 pb-2.5">
            <span className="text-[#4B5563]">Customer Name</span>
            <span className="font-bold text-[#121212]">{result.customerName}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-100 pb-2.5">
            <span className="text-[#4B5563]">Meter Number</span>
            <span className="font-bold text-[#121212] font-mono">{result.meterNumber}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-100 pb-2.5">
            <span className="text-[#4B5563]">DISCO</span>
            <span className="font-bold text-[#121212]">{result.disco}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-100 pb-2.5">
            <span className="text-[#4B5563]">Units Vended</span>
            <span className="font-extrabold text-emerald-600 font-mono">{result.units} kWh</span>
          </div>
          <div className="flex justify-between pt-0.5">
            <span className="text-[#4B5563]">Amount Paid</span>
            <span className="font-bold text-[#121212]">₦{Number(result.amount).toLocaleString()}</span>
          </div>
        </StandardCard>

        <PrimaryButton onClick={onDone} className="w-full h-12 text-sm font-bold shadow-sm">
          Done & Return to Dashboard
        </PrimaryButton>
      </div>
    </div>
  )
}
