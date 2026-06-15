import * as React from "react"
import { IconBulb } from "@tabler/icons-react"

export function SavingsTip() {
  return (
    <div className="bg-[#EAF9F1] border border-[#00BF63]/20 rounded-[1.5rem] p-4 flex items-start gap-3.5 shadow-sm mb-4">
      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#008F47] shrink-0 mt-0.5 shadow-sm">
        <IconBulb className="w-4 h-4 fill-[#008F47]/10" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-bold text-[#008F47] uppercase tracking-wider">Save tip of the day</span>
        <p className="text-[11px] text-[#008F47] leading-relaxed font-medium">
          Running your AC at 24°C instead of 20°C can cut cooling costs by up to 20%.
        </p>
      </div>
    </div>
  )
}
