import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function OnboardingSkeleton() {
  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white min-h-[500px]">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-1">
            <Skeleton className="h-1.5 w-4 rounded-full" />
            <Skeleton className="h-1.5 w-1.5 rounded-full" />
            <Skeleton className="h-1.5 w-1.5 rounded-full" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6">
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}
