"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()
  React.useEffect(() => {
    router.replace("/?page=profile")
  }, [router])
  return null
}
