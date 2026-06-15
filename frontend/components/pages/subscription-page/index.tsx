import * as React from "react"
import { TextField } from "@/components/design-system/input"
import { PrimaryButton } from "@/components/design-system/button"
import { StandardCard } from "@/components/design-system/card"
import { IconCheck, IconShieldLock } from "@tabler/icons-react"

interface SubscriptionPageProps {
  isLoading: boolean
  onActivateTrial: (plan: "monthly" | "annual", cardData: any) => void
}

export function SubscriptionPage({ isLoading, onActivateTrial }: SubscriptionPageProps) {
  const [screen, setScreen] = React.useState<1 | 2>(1)
  const [plan, setPlan] = React.useState<"monthly" | "annual">("monthly")
  const [cardNumber, setCardNumber] = React.useState("")
  const [expiry, setExpiry] = React.useState("")
  const [cvv, setCvv] = React.useState("")

  const canActivate = cardNumber.length >= 16 && expiry.length >= 4 && cvv.length >= 3

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (canActivate) {
      onActivateTrial(plan, { cardNumber, expiry, cvv })
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length > 0) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white overflow-y-auto">
      <div className="flex flex-col gap-6">
        {screen === 1 ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 text-center mt-4">
              <h1 className="text-2xl font-bold tracking-tight text-[#121212]">Start Your 30-Day Free Trial</h1>
              <p className="text-sm text-[#4B5563]">Cancel anytime. Zero upfront charges.</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setPlan("monthly")}
                className={`p-4 border rounded-xl text-left transition-all flex items-center justify-between ${
                  plan === "monthly"
                    ? "border-primary bg-emerald-50/50 text-primary ring-2 ring-primary"
                    : "border-zinc-200 hover:border-zinc-300 text-[#4B5563]"
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-[#121212]">Monthly Plan</span>
                  <span className="text-xs text-[#4B5563]">₦500 / month after trial</span>
                </div>
                {plan === "monthly" && <IconCheck className="w-5 h-5 text-primary" />}
              </button>

              <button
                type="button"
                onClick={() => setPlan("annual")}
                className={`p-4 border rounded-xl text-left transition-all flex items-center justify-between relative ${
                  plan === "annual"
                    ? "border-primary bg-emerald-50/50 text-primary ring-2 ring-primary"
                    : "border-zinc-200 hover:border-zinc-300 text-[#4B5563]"
                }`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#121212]">Annual Plan</span>
                    <span className="bg-[#FFD700] text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Save ₦200
                    </span>
                  </div>
                  <span className="text-xs text-[#4B5563]">₦5,800 / year after trial</span>
                </div>
                {plan === "annual" && <IconCheck className="w-5 h-5 text-primary" />}
              </button>
            </div>

            <div className="flex flex-col gap-3 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
              <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Trial Breakdown</span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#4B5563]">First 30 days:</span>
                <span className="font-bold text-primary">₦0.00 (Free)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#4B5563]">Billing starts on:</span>
                <span className="font-bold text-[#121212]">July 2, 2026</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-zinc-200/60 pt-2">
                <span className="text-[#4B5563]">Estimated renew amount:</span>
                <span className="font-bold text-[#121212]">
                  {plan === "monthly" ? "₦500.00" : "₦5,800.00"}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <PrimaryButton type="button" onClick={() => setScreen(2)}>
                Continue to Payment
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 text-center mt-4">
              <h1 className="text-2xl font-bold tracking-tight text-[#121212]">Enter Card Details</h1>
              <p className="text-sm text-[#4B5563]">
                Your {plan === "monthly" ? "Monthly (₦500)" : "Annual (₦5,800)"} subscription trial will begin.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Secure Payment Method</span>
              <TextField
                label="Card Number"
                placeholder="4111 2222 3333 4444"
                maxLength={19}
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                disabled={isLoading}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="Expiry Date"
                  placeholder="MM/YY"
                  maxLength={5}
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  disabled={isLoading}
                  required
                />
                <TextField
                  label="CVV"
                  placeholder="123"
                  maxLength={4}
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="flex items-center gap-1.5 justify-center text-xs text-[#4B5563] mt-2">
                <IconShieldLock className="w-4 h-4 text-emerald-600" />
                <span>Payments secured via Paystack. Card details are encrypted.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <div className="w-1/3">
                <button
                  type="button"
                  onClick={() => setScreen(1)}
                  className="w-full h-12 rounded-xl border border-zinc-200 text-zinc-600 font-semibold text-base transition-colors active:bg-zinc-50"
                >
                  Back
                </button>
              </div>
              <div className="flex-grow">
                <PrimaryButton type="submit" disabled={!canActivate || isLoading} isLoading={isLoading}>
                  Start Free Trial
                </PrimaryButton>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
