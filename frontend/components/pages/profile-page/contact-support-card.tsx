import * as React from "react"
import { StandardCard } from "@/components/design-system/card"
import { IconHeadset, IconBrandWhatsapp } from "@tabler/icons-react"
import { Skeleton } from "@/components/ui/skeleton"

export interface ContactSupportCardProps {
  supportUrl?: string
  onContactSupport?: () => void
  isLoading?: boolean
}

export function ContactSupportCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 border border-[#F3F4F6] shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex flex-col gap-3">
      <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
        <Skeleton className="w-5 h-5 rounded-md" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-36" />
        <Skeleton className="h-3 w-full" />
      </div>
      <Skeleton className="h-11 w-full rounded-xl mt-1" />
    </div>
  )
}

export function ContactSupportCard({
  supportUrl = "https://wa.me/message/3OM6TABL45JDK1",
  onContactSupport,
  isLoading = false,
}: ContactSupportCardProps) {
  if (isLoading) {
    return <ContactSupportCardSkeleton />
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onContactSupport) {
      onContactSupport()
    }
  }

  return (
    <StandardCard className="flex flex-col gap-3">
      <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
        <IconHeadset className="w-5 h-5 text-primary" />
        <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Support</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="font-bold text-xs text-[#121212]">Need help with Volt?</span>
        <p className="text-xs text-[#4B5563] leading-relaxed">
          Have questions about your meter, recharge, or subscription? Reach out to our support team on WhatsApp.
        </p>
      </div>

      <a
        href={supportUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm mt-1"
      >
        <IconBrandWhatsapp className="w-4 h-4" />
        <span>Contact Support on WhatsApp</span>
      </a>
    </StandardCard>
  )
}

