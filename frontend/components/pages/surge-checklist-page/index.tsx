import * as React from "react"
import { IconArrowLeft, IconCheck, IconPlus, IconDroplet, IconBatteryCharging, IconSnowflake, IconFlame, IconDeviceLaptop, IconSparkles, IconTrash } from "@tabler/icons-react"
import { StandardCard } from "@/components/design-system/card"
import { PrimaryButton } from "@/components/design-system/button"

interface SurgeChecklistPageProps {
  onBack: () => void
}

interface ChecklistItem {
  id: string
  name: string
  icon: React.ReactNode
}

export function SurgeChecklistPage({ onBack }: SurgeChecklistPageProps) {
  const [items, setItems] = React.useState<ChecklistItem[]>([
    { id: "water-pump", name: "Pump Water", icon: <IconDroplet className="w-5 h-5" /> },
    { id: "inverter", name: "Charge Inverter", icon: <IconBatteryCharging className="w-5 h-5" /> },
    { id: "freezer", name: "Turn on Freezer", icon: <IconSnowflake className="w-5 h-5" /> },
    { id: "ironing", name: "Iron Clothes", icon: <IconFlame className="w-5 h-5" /> },
    { id: "devices", name: "Charge Laptops & Backups", icon: <IconDeviceLaptop className="w-5 h-5" /> }
  ])

  const [checked, setChecked] = React.useState<Record<string, boolean>>({})
  const [customName, setCustomName] = React.useState("")
  const [showAddCustom, setShowAddCustom] = React.useState(false)
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)

  const handleToggle = (id: string) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      const totalChecked = Object.keys(next).filter((k) => next[k]).length
      if (totalChecked === items.length) {
        setShowSuccessModal(true)
      }
      return next
    })
  }

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customName.trim()) return
    const id = "custom-" + Date.now()
    setItems((prev) => [
      ...prev,
      {
        id,
        name: customName.trim(),
        icon: <IconSparkles className="w-5 h-5" />
      }
    ])
    setCustomName("")
    setShowAddCustom(false)
  }

  const handleDelete = (id: string) => {
    setItems((prev) => {
      const nextItems = prev.filter((item) => item.id !== id)
      setChecked((prevChecked) => {
        const nextChecked = { ...prevChecked }
        delete nextChecked[id]
        const totalChecked = Object.keys(nextChecked).filter((k) => nextChecked[k] && nextItems.some(i => i.id === k)).length
        if (nextItems.length > 0 && totalChecked === nextItems.length) {
          setShowSuccessModal(true)
        }
        return nextChecked
      })
      return nextItems
    })
  }

  const completedCount = Object.keys(checked).filter((k) => checked[k]).length
  const totalCount = items.length
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const radius = 32
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 overflow-y-auto relative h-full">
      <div className="bg-white px-6 pt-6 pb-4 border-b border-zinc-100 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-[#4B5563] hover:text-[#121212] transition-colors"
        >
          <IconArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-[#121212]">Surge Checklist</h1>
        <div className="w-9" />
      </div>

      <div className="p-5 flex flex-col gap-6">
        <StandardCard className="bg-gradient-to-br from-[#12231A] to-zinc-950 border-zinc-800 text-white p-5 flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="flex flex-col gap-1 z-10 max-w-[65%]">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Active Progress</span>
            <span className="text-lg font-black leading-tight mt-0.5">Surge Tasks</span>
            <span className="text-[11px] text-zinc-400 leading-normal mt-1">
              Maximize stable grid power and avoid high peak startup draw by staggering appliance activations.
            </span>
          </div>

          <div className="relative flex items-center justify-center w-20 h-20 z-10">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-zinc-800"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-[#00BF63] transition-all duration-500"
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-black">
              {completedCount}/{totalCount}
            </span>
          </div>
        </StandardCard>

        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const isChecked = !!checked[item.id]
            return (
              <div
                key={item.id}
                onClick={() => handleToggle(item.id)}
                className={`bg-white border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300 active:scale-[0.98] ${
                  isChecked
                    ? "border-emerald-500 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500/10"
                    : "border-zinc-100 hover:border-zinc-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isChecked
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-zinc-50 text-zinc-500"
                  }`}>
                    {item.icon}
                  </div>
                  <span className={`text-sm font-bold transition-colors ${
                    isChecked ? "text-zinc-900" : "text-zinc-700"
                  }`}>
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(item.id)
                    }}
                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-zinc-50 rounded-lg transition-colors"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>

                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isChecked
                      ? "bg-emerald-500 border-emerald-500 scale-105"
                      : "border-zinc-200"
                  }`}>
                    {isChecked && <IconCheck className="w-4 h-4 text-white stroke-[3.5]" />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {!showAddCustom ? (
          <button
            onClick={() => setShowAddCustom(true)}
            className="flex items-center justify-center gap-2 border border-dashed border-zinc-300 hover:border-zinc-400 bg-white rounded-xl py-4 text-xs font-bold text-zinc-600 transition-colors"
          >
            <IconPlus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        ) : (
          <form onSubmit={handleAddCustom} className="bg-white border border-zinc-100 rounded-xl p-4 flex flex-col gap-3 animate-fade-in shadow-sm">
            <input
              type="text"
              placeholder="e.g. Pump Swimming Pool"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowAddCustom(false)}
                className="px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <PrimaryButton type="submit" className="py-1 px-3 text-[10px]">
                Add Task
              </PrimaryButton>
            </div>
          </form>
        )}
      </div>

      {showSuccessModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center text-center gap-4 max-w-sm shadow-2xl animate-in scale-in duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white animate-in zoom-in-75 duration-300 ease-out shadow-md shadow-emerald-500/20">
              <IconCheck className="w-6 h-6 stroke-[3.5] animate-in slide-in-from-bottom-2 duration-500 delay-100 ease-out" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-black text-zinc-900">Surge Checklist Complete!</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                You've successfully optimized your high-draw appliances for this stable power session.
              </p>
            </div>



            <PrimaryButton onClick={() => { setShowSuccessModal(false); onBack() }} className="w-full py-2 text-xs font-bold mt-2">
              Done
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  )
}
