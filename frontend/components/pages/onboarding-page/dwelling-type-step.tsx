import * as React from "react"
import {
  IconHome,
  IconBuilding,
  IconBuildingSkyscraper,
  IconHome2,
  IconUsers,
  IconCheck
} from "@tabler/icons-react"
import { Skeleton } from "@/components/ui/skeleton"

export interface DwellingTypeOption {
  id: string
  name: string
  rooms: number
}

export const DWELLING_TYPES: DwellingTypeOption[] = [
  { id: "self_contain", name: "Self-Contain / Studio", rooms: 1 },
  { id: "mini_flat", name: "1-Bedroom Mini-Flat", rooms: 2 },
  { id: "two_bed_flat", name: "2-Bedroom Flat", rooms: 3 },
  { id: "three_bed_flat", name: "3-Bedroom Flat", rooms: 4 },
  { id: "duplex", name: "Duplex / Detached House", rooms: 6 },
  { id: "shared_compound", name: "Shared Compound", rooms: 4 }
]

interface DwellingTypeStepProps {
  selectedType: string
  onSelectType: (typeId: string) => void
  isLoading?: boolean
}

export function DwellingTypeSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-8 w-44" />
      </div>
      <div className="flex flex-col gap-3 mt-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

export function DwellingTypeStep({
  selectedType,
  onSelectType,
  isLoading = false
}: DwellingTypeStepProps) {
  const getIcon = (id: string) => {
    switch (id) {
      case "self_contain":
        return <IconHome className="w-5 h-5 text-emerald-600" />
      case "mini_flat":
        return <IconHome2 className="w-5 h-5 text-indigo-600" />
      case "two_bed_flat":
        return <IconBuilding className="w-5 h-5 text-sky-600" />
      case "three_bed_flat":
        return <IconBuildingSkyscraper className="w-5 h-5 text-cyan-600" />
      case "duplex":
        return <IconHome2 className="w-5 h-5 text-amber-600" />
      case "shared_compound":
        return <IconUsers className="w-5 h-5 text-purple-600" />
      default:
        return <IconHome className="w-5 h-5 text-zinc-600" />
    }
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#121212]">Dwelling Type</h1>
      </div>

      <div className="flex flex-col gap-2.5 mt-1">
        {DWELLING_TYPES.map((type) => {
          const isSelected = selectedType === type.id
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onSelectType(type.id)}
              disabled={isLoading}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                  : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-primary/10" : "bg-zinc-100"
                  }`}
                >
                  {getIcon(type.id)}
                </div>
                <span className="text-sm font-bold text-[#121212] tracking-tight">
                  {type.name}
                </span>
              </div>

              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                  isSelected
                    ? "border-primary bg-primary text-white"
                    : "border-zinc-300 bg-transparent"
                }`}
              >
                {isSelected && <IconCheck className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
