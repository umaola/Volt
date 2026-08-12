import * as React from "react"
import { TextField, DropdownField } from "@/components/design-system/input"
import { PrimaryButton } from "@/components/design-system/button"
import { StandardCard } from "@/components/design-system/card"
import { IconCheck, IconCopy, IconX, IconBolt, IconMailCheck, IconUser, IconHome } from "@tabler/icons-react"
import { toast } from "sonner"

interface PurchaseUnitsModalProps {
  isOpen: boolean
  onClose: () => void
  currentUserMeter: string
  currentUserDisco: string
  currentUserTariffBand: string
  currentUserMeterType: string
  userEmail: string
  userPhone: string
  uid: string
  onVerifyMeter: (
    meterNumber: string,
    disco: string,
    meterType: string,
    tariffBand?: string
  ) => Promise<{ success: boolean; customerName?: string; error?: string }>
  onPurchaseSuccess: (purchaseData: {
    token: string
    units: number
    amount: number
    meterNumber: string
    disco: string
    customerName: string
    isThirdParty: boolean
  }) => void
}

export function PurchaseUnitsModal({
  isOpen,
  onClose,
  currentUserMeter,
  currentUserDisco,
  currentUserTariffBand,
  currentUserMeterType,
  userEmail,
  userPhone,
  uid,
  onVerifyMeter,
  onPurchaseSuccess
}: PurchaseUnitsModalProps) {
  const [targetType, setTargetType] = React.useState<"my_meter" | "third_party">("my_meter")
  const [meterNumber, setMeterNumber] = React.useState(currentUserMeter || "")
  const [disco, setDisco] = React.useState(currentUserDisco || "IKEDC")
  const [tariffBand, setTariffBand] = React.useState(currentUserTariffBand || "Band A")
  const [meterType, setMeterType] = React.useState(currentUserMeterType || "Prepaid")
  const [amount, setAmount] = React.useState("5000")

  const [verifiedName, setVerifiedName] = React.useState("")
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [verificationError, setVerificationError] = React.useState<string | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)

  const [receiptData, setReceiptData] = React.useState<{
    token: string
    units: number
    amount: number
    meterNumber: string
    disco: string
    customerName: string
    isThirdParty: boolean
  } | null>(null)

  React.useEffect(() => {
    if (targetType === "my_meter") {
      setMeterNumber(currentUserMeter || "")
      setDisco(currentUserDisco || "IKEDC")
      setTariffBand(currentUserTariffBand || "Band A")
      setMeterType(currentUserMeterType || "Prepaid")
      setVerifiedName("")
      setVerificationError(null)
    } else {
      setMeterNumber("")
      setVerifiedName("")
      setVerificationError(null)
    }
  }, [targetType, currentUserMeter, currentUserDisco, currentUserTariffBand, currentUserMeterType])

  React.useEffect(() => {
    if (targetType === "my_meter") return

    const cleanMeter = meterNumber.trim()
    if (cleanMeter.length >= 10 && disco && meterType) {
      setIsVerifying(true)
      setVerificationError(null)
      setVerifiedName("")

      const delayDebounce = setTimeout(() => {
        onVerifyMeter(cleanMeter, disco, meterType, tariffBand)
          .then((res) => {
            if (res.success && res.customerName) {
              setVerifiedName(res.customerName)
            } else {
              setVerificationError(res.error || "Verification failed")
            }
          })
          .catch(() => {
            setVerificationError("Verification failed")
          })
          .finally(() => {
            setIsVerifying(false)
          })
      }, 500)

      return () => clearTimeout(delayDebounce)
    } else {
      setVerifiedName("")
      setVerificationError(null)
    }
  }, [targetType, meterNumber, disco, meterType, tariffBand, onVerifyMeter])

  if (!isOpen) return null

  const tariffRates: Record<string, number> = {
    "Band A": 209.50,
    "Band B": 63.00,
    "Band C": 50.00,
    "Band D": 38.00,
    "Band E": 35.00
  }

  const currentRate = tariffRates[tariffBand] || 209.50
  const vendorServiceFee = 100
  const numAmount = Number(amount) || 0
  const netVendedAmount = Math.max(0, numAmount - vendorServiceFee)
  const estimatedUnits = netVendedAmount > 0 ? Number((netVendedAmount / currentRate).toFixed(2)) : 0

  const isBuyDisabled =
    isProcessing ||
    isVerifying ||
    numAmount < 500 ||
    meterNumber.trim().length < 10 ||
    !disco

  const handleProceedPaystack = async () => {
    if (isBuyDisabled) return
    setIsProcessing(true)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL
      const isThirdParty = targetType === "third_party"

      const payload = {
        uid: uid || "mock-uid",
        meterNumber: meterNumber.trim(),
        disco,
        meterType,
        tariffBand,
        amount: numAmount,
        phone: userPhone || "08000000000",
        email: userEmail || "user@voltdigitalservices.com",
        isThirdParty
      }

      const initRes = await fetch(`${backendUrl}/initializeUnitPurchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const initData = await initRes.json().catch(() => null)
      if (!initRes.ok || !initData?.success || !initData?.authorization_url) {
        toast.error(initData?.error || "Failed to initialize payment gateway.")
        setIsProcessing(false)
        return
      }

      const { authorization_url, reference } = initData

      // If mock or local redirect, directly verify and vend
      if (authorization_url.includes("unit-purchase-callback") || authorization_url.includes("localhost")) {
        const verifyRes = await fetch(`${backendUrl}/verifyAndVendUnits`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference })
        })
        const verifyData = await verifyRes.json().catch(() => null)
        if (verifyRes.ok && verifyData?.success && verifyData?.token) {
          const result = {
            token: verifyData.token,
            units: verifyData.units || estimatedUnits,
            amount: verifyData.amount,
            meterNumber: verifyData.meterNumber,
            disco: verifyData.disco,
            customerName: verifyData.customerName || verifiedName || "Valued Customer",
            isThirdParty
          }
          setReceiptData(result)
          onPurchaseSuccess(result)
          toast.success("Payment settled & electricity units vended successfully!")
        } else {
          toast.error(verifyData?.error || "Unit vending failed after payment settlement.")
        }
      } else {
        // Real Paystack redirect / popup
        const payWindow = window.open(authorization_url, "_blank", "width=500,height=700")
        const checkTimer = setInterval(async () => {
          if (payWindow && payWindow.closed) {
            clearInterval(checkTimer)
            const verifyRes = await fetch(`${backendUrl}/verifyAndVendUnits`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reference })
            })
            const verifyData = await verifyRes.json().catch(() => null)
            if (verifyRes.ok && verifyData?.success && verifyData?.token) {
              const result = {
                token: verifyData.token,
                units: verifyData.units || estimatedUnits,
                amount: verifyData.amount,
                meterNumber: verifyData.meterNumber,
                disco: verifyData.disco,
                customerName: verifyData.customerName || verifiedName || "Valued Customer",
                isThirdParty
              }
              setReceiptData(result)
              onPurchaseSuccess(result)
              toast.success("Payment settled & electricity units vended successfully!")
            } else {
              toast.error(verifyData?.error || "Payment not completed or vending failed.")
            }
            setIsProcessing(false)
          }
        }, 1500)
        return
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to complete purchase. Please check network connection.")
    } finally {
      setIsProcessing(false)
    }
  }


  const handleCopyToken = () => {
    if (!receiptData?.token) return
    const raw = receiptData.token.replace(/\s+/g, "").replace(/-/g, "")
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 - ")
    navigator.clipboard.writeText(formatted)
    toast.success("Token copied to clipboard!")
  }

  const handleCloseAll = () => {
    setReceiptData(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up border border-zinc-100">
        <div className="bg-white px-5 py-4 border-b border-zinc-100 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-primary">
              <IconBolt className="w-4 h-4 fill-primary text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#121212]">Buy Electricity Units</h2>
              <p className="text-[11px] text-[#4B5563]">Instant DISCO token vending</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCloseAll}
            className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex flex-col gap-4 flex-1">
          {receiptData ? (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex flex-col items-center justify-center text-center p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white mb-2 shadow-md">
                  <IconCheck className="w-7 h-7 stroke-[3]" />
                </div>
                <h3 className="text-base font-bold text-[#121212]">Purchase Successful!</h3>
                <p className="text-xs text-[#4B5563] mt-0.5">Your 20-digit token has been generated</p>
              </div>

              <StandardCard className="flex flex-col items-center justify-center gap-2 p-5 bg-zinc-900 border-zinc-800 text-white rounded-2xl">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">20-Digit Electricity Token</span>
                <span className="text-xl font-extrabold font-mono tracking-widest text-emerald-400 select-all my-1">
                  {receiptData.token.replace(/\s+/g, "").replace(/-/g, "").replace(/(\d{4})(?=\d)/g, "$1 - ")}
                </span>
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm mt-1"
                >
                  <IconCopy className="w-3.5 h-3.5" />
                  <span>Copy Token</span>
                </button>
              </StandardCard>

              <StandardCard className="flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between border-b border-zinc-100 pb-2">
                  <span className="text-[#4B5563]">Customer Name</span>
                  <span className="font-bold text-[#121212]">{receiptData.customerName}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 pb-2">
                  <span className="text-[#4B5563]">Meter Number</span>
                  <span className="font-bold text-[#121212] font-mono">{receiptData.meterNumber}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 pb-2">
                  <span className="text-[#4B5563]">DISCO</span>
                  <span className="font-bold text-[#121212]">{receiptData.disco}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 pb-2">
                  <span className="text-[#4B5563]">Amount Paid</span>
                  <span className="font-bold text-[#121212]">₦{receiptData.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-[#4B5563]">Units Credited</span>
                  <span className="font-extrabold text-primary text-sm">{receiptData.units} kWh</span>
                </div>
              </StandardCard>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2 text-xs text-blue-800">
                <IconMailCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <span>
                  Receipt and token sent to <strong>{userEmail || "your email"}</strong>.
                  {receiptData.isThirdParty ? " (3rd Party Recharge - units not added to your tracker)" : " (Units credited to your Volt tracker)"}
                </span>
              </div>

              <PrimaryButton onClick={handleCloseAll} className="w-full mt-1">
                Done
              </PrimaryButton>
            </div>
          ) : (
            <>
              <div className="p-1 bg-zinc-100/90 rounded-xl border border-zinc-200/60 grid grid-cols-2 gap-1 select-none">
                <button
                  type="button"
                  onClick={() => setTargetType("my_meter")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    targetType === "my_meter"
                      ? "bg-white text-emerald-800 shadow-xs border border-emerald-100"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  <IconHome className="w-3.5 h-3.5" />
                  <span>My Saved Meter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType("third_party")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    targetType === "third_party"
                      ? "bg-white text-amber-800 shadow-xs border border-amber-100"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  <IconUser className="w-3.5 h-3.5" />
                  <span>3rd Party Meter</span>
                </button>
              </div>

              {targetType === "my_meter" ? (
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Saved Meter Profile</span>
                    <span className="font-bold text-[#121212] font-mono text-sm tracking-wide">{currentUserMeter || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 bg-white border border-emerald-200 rounded-md text-xs font-bold text-emerald-900 shadow-2xs">
                      {currentUserDisco || "IKEDC"}
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-md text-xs font-bold shadow-2xs">
                      {currentUserTariffBand || "Band A"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3.5">
                  <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2 text-[11px] text-amber-800">
                    <IconUser className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>3rd Party Recharge: Token sent to your email, but units won't affect your balance.</span>
                  </div>

                  <TextField
                    label="3rd Party Meter Number"
                    value={meterNumber}
                    onChange={(e) => setMeterNumber(e.target.value)}
                    disabled={isProcessing}
                    placeholder="Enter 11-13 digit meter number"
                  />



                  <div className="grid grid-cols-2 gap-3">
                    <DropdownField
                      label="DISCO"
                      value={disco}
                      onChange={(e) => setDisco(e.target.value)}
                      disabled={isProcessing}
                      options={[
                        { value: "IKEDC", label: "IKEDC (Ikeja)" },
                        { value: "EKEDC", label: "EKEDC (Eko)" },
                        { value: "KEDCO", label: "KEDCO (Kano)" },
                        { value: "PHED", label: "PHED (Port Harcourt)" },
                        { value: "JED", label: "JED (Jos)" },
                        { value: "IBEDC", label: "IBEDC (Ibadan)" },
                        { value: "KAEDCO", label: "KAEDCO (Kaduna)" },
                        { value: "AEDC", label: "AEDC (Abuja)" },
                        { value: "EEDC", label: "EEDC (Enugu)" },
                        { value: "BEDC", label: "BEDC (Benin)" },
                        { value: "ABA", label: "ABA (Aba)" },
                        { value: "YEDC", label: "YEDC (Yola)" }
                      ]}
                    />
                    <DropdownField
                      label="Tariff Band"
                      value={tariffBand}
                      onChange={(e) => setTariffBand(e.target.value)}
                      disabled={isProcessing}
                      options={[
                        { value: "Band A", label: "Band A" },
                        { value: "Band B", label: "Band B" },
                        { value: "Band C", label: "Band C" },
                        { value: "Band D", label: "Band D" },
                        { value: "Band E", label: "Band E" }
                      ]}
                    />
                  </div>

                  {isVerifying && (
                    <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-center gap-2 text-xs text-[#4B5563]">
                      <span className="animate-spin h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full" />
                      <span>Verifying meter details...</span>
                    </div>
                  )}

                  {verifiedName && (
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2">
                      <IconCheck className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-xs font-bold text-emerald-900">{verifiedName}</span>
                    </div>
                  )}

                  {verificationError && (
                    <div className="p-2.5 bg-red-50 rounded-xl border border-red-100 text-xs text-red-600 font-medium">
                      {verificationError}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2 pt-1">
                <TextField
                  label="Purchase Amount (₦)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  disabled={isProcessing}
                  placeholder="Minimum ₦500"
                />

                <div className="flex flex-wrap gap-1.5 mt-1">
                  {["1000", "2000", "5000", "10000", "20000"].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        amount === val
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                          : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      ₦{Number(val).toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <PrimaryButton
                type="button"
                onClick={handleProceedPaystack}
                disabled={isBuyDisabled}
                isLoading={isProcessing}
                className="w-full h-12 shrink-0 mt-2"
              >
                Proceed
              </PrimaryButton>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
