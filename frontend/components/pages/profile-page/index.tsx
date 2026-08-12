import * as React from "react"
import { TextField, DropdownField } from "@/components/design-system/input"
import { PrimaryButton } from "@/components/design-system/button"
import { StandardCard } from "@/components/design-system/card"
import { IconUser, IconCreditCard, IconBell, IconShieldLock, IconCheck, IconArrowUpRight, IconPencil, IconX } from "@tabler/icons-react"
import { Switch } from "@/components/ui/switch"

interface ProfilePageProps {
  userData: {
    name: string
    phone: string
    email: string
    meterNumber: string
    disco: string
    tariffBand: string
    meterType: string
    notificationPreferences?: {
      dailyReminders: boolean
      lowUnitAlerts: boolean
    }
    subscription?: {
      planType: string
      status: string
      endDate: string
    }
  }
  onSaveProfile: (updatedData: any) => void
  onUpdatePreferences: (prefs: { dailyReminders: boolean; lowUnitAlerts: boolean }) => void
  onLogout: () => void
  onNavigateTo: (page: string) => void
  onVerifyMeter: (
    meterNumber: string,
    disco: string,
    meterType: string,
    tariffBand?: string
  ) => Promise<{ success: boolean; customerName?: string; error?: string }>
  isLoading: boolean
  isSubmitting?: boolean
  onCancelSubscription?: () => Promise<void>
  isCancelling?: boolean
  onDeleteAccount?: () => Promise<void>
}

export function ProfilePage({
  userData,
  onSaveProfile,
  onUpdatePreferences,
  onLogout,
  onNavigateTo,
  onVerifyMeter,
  isLoading,
  isSubmitting = false,
  onCancelSubscription,
  isCancelling = false,
  onDeleteAccount
}: ProfilePageProps) {
  const [phone, setPhone] = React.useState(userData.phone)
  const [meterNumber, setMeterNumber] = React.useState(userData.meterNumber)
  const [disco, setDisco] = React.useState(userData.disco)
  const [tariffBand, setTariffBand] = React.useState(userData.tariffBand)
  const [meterType, setMeterType] = React.useState(userData.meterType)

  const [isEditingElectricity, setIsEditingElectricity] = React.useState(false)

  const [notifDaily, setNotifDaily] = React.useState(true)
  const [notifLowUnit, setNotifLowUnit] = React.useState(true)

  const [validationErrors, setValidationErrors] = React.useState<{ phone?: string; meterNumber?: string }>({})

  const [verifiedName, setVerifiedName] = React.useState("")
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [verificationError, setVerificationError] = React.useState<string | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (userData) {
      setPhone(userData.phone || "")
      setMeterNumber(userData.meterNumber || "")
      setDisco(userData.disco || "")
      setTariffBand(userData.tariffBand || "")
      setMeterType(userData.meterType || "")
      if (userData.notificationPreferences) {
        setNotifDaily(userData.notificationPreferences.dailyReminders)
        setNotifLowUnit(userData.notificationPreferences.lowUnitAlerts)
      }
    }
  }, [userData])

  React.useEffect(() => {
    if (!isEditingElectricity) return

    const cleanMeter = meterNumber.trim()
    const needsVerify =
      cleanMeter !== (userData.meterNumber || "").trim() ||
      disco !== (userData.disco || "") ||
      meterType !== (userData.meterType || "")

    if (needsVerify && cleanMeter.length >= 10 && disco && meterType) {
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
  }, [isEditingElectricity, meterNumber, disco, meterType, tariffBand, userData, onVerifyMeter])

  const needsVerification =
    meterNumber.trim() !== (userData.meterNumber || "").trim() ||
    disco !== (userData.disco || "") ||
    meterType !== (userData.meterType || "")

  const isSaveDisabled =
    isLoading ||
    isSubmitting ||
    isVerifying ||
    (needsVerification && !verifiedName)

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanPhone = phone.trim()
    if (!/^\+?[0-9]{10,14}$/.test(cleanPhone)) {
      setValidationErrors({ phone: "Phone number must be between 10 and 14 digits" })
      return
    }
    setValidationErrors({})
    onSaveProfile({ phone: cleanPhone, meterNumber: userData.meterNumber, disco: userData.disco, tariffBand: userData.tariffBand, meterType: userData.meterType })
  }

  const handleSaveElectricity = () => {
    const cleanMeter = meterNumber.trim()
    if (!/^[0-9]{10,15}$/.test(cleanMeter)) {
      setValidationErrors({ meterNumber: "Meter number must be between 10 and 15 digits" })
      return
    }
    setValidationErrors({})
    onSaveProfile({ phone, meterNumber: cleanMeter, disco, tariffBand, meterType })
    setIsEditingElectricity(false)
  }

  const handleToggleDaily = () => {
    const nextVal = !notifDaily
    setNotifDaily(nextVal)
    onUpdatePreferences({ dailyReminders: nextVal, lowUnitAlerts: notifLowUnit })
  }

  const handleToggleLowUnit = () => {
    const nextVal = !notifLowUnit
    setNotifLowUnit(nextVal)
    onUpdatePreferences({ dailyReminders: notifDaily, lowUnitAlerts: nextVal })
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 overflow-y-auto">
      <div className="bg-white px-6 pt-6 pb-4 border-b border-zinc-100 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-[#121212]">Profile Settings</h1>
        <p className="text-xs text-[#4B5563]">Manage your meter profile and preferences.</p>
      </div>

      <div className="p-5 flex flex-col gap-5">
        <form onSubmit={handleSavePhone} className="flex flex-col gap-5">
          <StandardCard className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <IconUser className="w-5 h-5 text-primary" />
              <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Account Details</span>
            </div>
            
            <TextField label="Full Name" value={userData.name} disabled />
            <TextField label="Email Address" value={userData.email} disabled />
            <TextField
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
            />
            {validationErrors.phone && (
              <span className="text-xs text-[#EF4444] font-bold mt-1">
                {validationErrors.phone}
              </span>
            )}
            {phone !== userData.phone && (
              <PrimaryButton type="submit" disabled={isLoading || isSubmitting} isLoading={isSubmitting}>
                Save Phone Number
              </PrimaryButton>
            )}
          </StandardCard>
        </form>

        <StandardCard className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <IconCreditCard className="w-5 h-5 text-primary" />
              <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Electricity Profile</span>
            </div>
            {!isEditingElectricity ? (
              <button
                type="button"
                onClick={() => setIsEditingElectricity(true)}
                className="flex items-center gap-1 text-xs font-bold text-primary hover:text-emerald-700 cursor-pointer px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/60 transition-all"
              >
                <IconPencil className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Edit</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsEditingElectricity(false)
                  setMeterNumber(userData.meterNumber || "")
                  setDisco(userData.disco || "")
                  setTariffBand(userData.tariffBand || "")
                  setMeterType(userData.meterType || "")
                  setVerifiedName("")
                  setVerificationError(null)
                  setValidationErrors({})
                }}
                className="flex items-center gap-1 text-xs font-bold text-zinc-600 hover:text-zinc-900 cursor-pointer px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200/70 border border-zinc-200 transition-all"
              >
                <IconX className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Cancel</span>
              </button>
            )}
          </div>

          {!isEditingElectricity ? (
            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
              <div className="flex flex-col gap-1 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="text-[#4B5563] font-medium text-[11px]">Meter Number</span>
                <span className="font-bold text-[#121212] font-mono text-sm tracking-wide">{userData.meterNumber || "—"}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="text-[#4B5563] font-medium text-[11px]">Disco</span>
                <span className="font-bold text-[#121212] text-sm">{userData.disco || "—"}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="text-[#4B5563] font-medium text-[11px]">Tariff Band</span>
                <span className="font-bold text-[#121212] text-sm">{userData.tariffBand || "—"}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="text-[#4B5563] font-medium text-[11px]">Meter Type</span>
                <span className="font-bold text-[#121212] text-sm">{userData.meterType || "—"}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <TextField
                label="Meter Number"
                value={meterNumber}
                onChange={(e) => setMeterNumber(e.target.value)}
                disabled={isLoading}
              />


              {validationErrors.meterNumber && (
                <span className="text-xs text-[#EF4444] font-bold">
                  {validationErrors.meterNumber}
                </span>
              )}

              <DropdownField
                label="Disco"
                value={disco}
                onChange={(e) => setDisco(e.target.value)}
                options={[
                  { value: "IKEDC", label: "IKEDC - Ikeja Electricity" },
                  { value: "EKEDC", label: "EKEDC - Eko Electricity" },
                  { value: "KEDCO", label: "KEDCO - Kano Electricity" },
                  { value: "PHED", label: "PHED - Port Harcourt Electricity" },
                  { value: "JED", label: "JED - Jos Electricity" },
                  { value: "IBEDC", label: "IBEDC - Ibadan Electricity" },
                  { value: "KAEDCO", label: "KAEDCO - Kaduna Electricity" },
                  { value: "AEDC", label: "AEDC - Abuja Electricity" },
                  { value: "EEDC", label: "EEDC - Enugu Electricity" },
                  { value: "BEDC", label: "BEDC - Benin Electricity" },
                  { value: "ABA", label: "ABA - Aba Electricity" },
                  { value: "YEDC", label: "YEDC - Yola Electricity" }
                ]}
                disabled={isLoading}
              />

              <DropdownField
                label="Tariff Band"
                value={tariffBand}
                onChange={(e) => setTariffBand(e.target.value)}
                options={[
                  { value: "Band A", label: "Band A" },
                  { value: "Band B", label: "Band B" },
                  { value: "Band C", label: "Band C" },
                  { value: "Band D", label: "Band D" },
                  { value: "Band E", label: "Band E" }
                ]}
                disabled={isLoading}
              />

              <DropdownField
                label="Meter Type"
                value={meterType}
                onChange={(e) => setMeterType(e.target.value)}
                options={[
                  { value: "Prepaid", label: "Prepaid" },
                  { value: "Postpaid", label: "Postpaid" }
                ]}
                disabled={isLoading}
              />

              {isVerifying && (
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-center gap-2 text-xs text-[#4B5563]">
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full" />
                  <span>Verifying meter number with DISCO...</span>
                </div>
              )}

              {verifiedName && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 animate-fade-in">
                  <IconCheck className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#4B5563]">Verified Customer Name</span>
                    <span className="text-sm font-bold text-[#121212]">{verifiedName}</span>
                  </div>
                </div>
              )}

              {verificationError && (
                <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-600 font-medium animate-fade-in">
                  Verification failed: {verificationError}
                </div>
              )}

              <PrimaryButton
                type="button"
                onClick={handleSaveElectricity}
                disabled={isSaveDisabled}
                isLoading={isSubmitting || isLoading}
              >
                Update Electricity Profile
              </PrimaryButton>
            </div>
          )}
        </StandardCard>

        <StandardCard className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <IconBell className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Notifications</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex flex-col">
              <span className="font-bold text-[#121212]">Daily Reminders</span>
              <span className="text-[#4B5563]">Outage hours and consumption confirmation</span>
            </div>
            <Switch
              checked={notifDaily}
              onCheckedChange={handleToggleDaily}
              disabled={isLoading || isSubmitting}
            />
          </div>

          <div className="flex items-center justify-between text-xs border-t border-zinc-100 pt-3">
            <div className="flex flex-col">
              <span className="font-bold text-[#121212]">Low Unit Alerts</span>
              <span className="text-[#4B5563]">Reminders when credits fall below 20 units</span>
            </div>
            <Switch
              checked={notifLowUnit}
              onCheckedChange={handleToggleLowUnit}
              disabled={isLoading || isSubmitting}
            />
          </div>
        </StandardCard>

        <StandardCard className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <IconShieldLock className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Legal</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex flex-col">
              <span className="font-bold text-[#121212]">Terms of Use</span>
              <span className="text-[#4B5563]">Read our terms of service agreement</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTo("terms")}
              className="text-primary hover:text-[#121212] transition-colors cursor-pointer p-1"
            >
              <IconArrowUpRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-zinc-100 pt-3">
            <div className="flex flex-col">
              <span className="font-bold text-[#121212]">Privacy Policy</span>
              <span className="text-[#4B5563]">How we protect and manage your personal data</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTo("privacy")}
              className="text-primary hover:text-[#121212] transition-colors cursor-pointer p-1"
            >
              <IconArrowUpRight className="w-5 h-5" />
            </button>
          </div>
        </StandardCard>

        <StandardCard className="flex flex-col gap-3 bg-emerald-50/20 border-emerald-100/50">
          <div className="flex items-center gap-2 border-b border-zinc-100/50 pb-2">
            <IconShieldLock className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#121212]">Subscription</span>
          </div>
          
          {(() => {
            const sub = userData.subscription || { planType: "Free Trial", status: "trialing", endDate: "2026-06-24T12:00:00.000Z" }
            const calculateDaysLeft = (endDateStr: string) => {
              if (!mounted) return 12
              try {
                const end = new Date(endDateStr).getTime()
                const now = Date.now()
                const diffMs = end - now
                const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
                return days > 0 ? days : 0
              } catch {
                return 0
              }
            }
            const daysLeft = calculateDaysLeft(sub.endDate)
            const formatEnd = (endDateStr: string) => {
              if (!mounted) return "Jun 24, 2026"
              try {
                return new Date(endDateStr).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" })
              } catch {
                return endDateStr
              }
            }
            return (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#4B5563]">Current Plan:</span>
                  <span className="font-bold text-primary uppercase tracking-wider">{sub.planType}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#4B5563]">Status:</span>
                  <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-full ${
                    sub.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {sub.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#4B5563]">
                    {sub.status === "active" ? "Next Renewal:" : "Expiration Date:"}
                  </span>
                  <span className="font-bold text-[#121212]">
                    {formatEnd(sub.endDate)} ({daysLeft} days left)
                  </span>
                </div>

                {onCancelSubscription && (sub.status === "trialing" || sub.status === "active" || sub.status === "past_due") && (
                  <div className="mt-3 pt-3 border-t border-zinc-100/50 flex flex-col gap-2">
                    {showCancelConfirm ? (
                      <div className="flex flex-col gap-2 bg-red-50/50 border border-red-100/80 p-3 rounded-lg">
                        <p className="text-[11px] text-red-800 leading-normal">
                          Are you sure you want to cancel your premium subscription? You will still keep access until your trial/cycle ends on {formatEnd(sub.endDate)}.
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => setShowCancelConfirm(false)}
                            className="px-3 py-1.5 rounded-md border border-zinc-200 text-zinc-600 text-xs font-semibold cursor-pointer"
                          >
                            No, Keep It
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await onCancelSubscription();
                              setShowCancelConfirm(false);
                            }}
                            disabled={isCancelling}
                            className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                          >
                            {isCancelling ? "Cancelling..." : "Yes, Cancel"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowCancelConfirm(true)}
                        className="w-full h-9 rounded-lg border border-red-200 hover:bg-red-50/40 text-red-600 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Cancel Subscription
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })()}
        </StandardCard>

        <div className="flex flex-col items-center gap-3 mt-2 mb-6">
          <button
            onClick={onLogout}
            className="text-sm font-semibold text-[#4B5563] hover:text-[#121212] cursor-pointer transition-colors"
          >
            Log Out Account
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer transition-colors flex items-center gap-1.5 pt-2"
          >
            <span>Delete Account & Data</span>
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl flex flex-col gap-4 border border-red-100 animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 self-center">
                <span className="text-xl font-bold">⚠️</span>
              </div>
              <div className="text-center flex flex-col gap-1.5">
                <h3 className="text-base font-bold text-[#121212]">Delete Account & Data</h3>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  Are you sure you want to permanently delete your account? All your meter profiles, recharge history, appliances, and subscriptions will be deleted. This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-10 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-semibold hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={async () => {
                    setIsDeleting(true)
                    try {
                      if (onDeleteAccount) {
                        await onDeleteAccount()
                      }
                    } catch (e) {
                      console.error(e)
                    } finally {
                      setIsDeleting(false)
                      setShowDeleteConfirm(false)
                    }
                  }}
                  className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete Account"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


