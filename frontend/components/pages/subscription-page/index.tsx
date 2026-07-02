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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onActivateTrial(plan, null)
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
                  <span className="text-xs text-[#4B5563]">₦1,500 / month after trial</span>
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
                      Save ₦2,000
                    </span>
                  </div>
                  <span className="text-xs text-[#4B5563]">₦16,000 / year after trial</span>
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
                  {plan === "monthly" ? "₦1,500.00" : "₦16,000.00"}
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
              <h1 className="text-2xl font-bold tracking-tight text-[#121212]">Verify Your Card</h1>
              <p className="text-sm text-[#4B5563]">
                Secure authorization via Paystack
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <StandardCard className="bg-emerald-50/20 border-emerald-100/50 p-5 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Selected Plan</span>
                  <span className="font-bold text-[#121212]">
                    {plan === "monthly" ? "Monthly Plan (₦1,500 / month after trial)" : "Annual Plan (₦16,000 / year after trial)"}
                  </span>
                </div>
                <div className="border-t border-zinc-100 my-1"></div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Authorization Hold</span>
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    A temporary verification charge of ₦100 will be authorized to link your card securely. No subscription charges will occur today.
                  </p>
                </div>
                <div className="border-t border-zinc-100 my-1"></div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Cancellation Policy</span>
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    You can cancel at any time from your settings before the end of your 30-day trial to avoid any charges.
                  </p>
                </div>
              </StandardCard>

              <div className="flex items-center gap-1.5 justify-center text-xs text-[#4B5563] mt-2">
                <IconShieldLock className="w-4 h-4 text-emerald-600 font-semibold" />
                <span>Payments processed securely via Paystack. Card details are not stored.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <div className="w-1/3">
                <button
                  type="button"
                  onClick={() => setScreen(1)}
                  className="w-full h-12 rounded-xl border border-zinc-200 text-zinc-600 font-semibold text-base transition-colors active:bg-zinc-50 cursor-pointer"
                >
                  Back
                </button>
              </div>
              <div className="flex-grow">
                <PrimaryButton type="submit" isLoading={isLoading} disabled={isLoading}>
                  Verify & Start Trial
                </PrimaryButton>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
