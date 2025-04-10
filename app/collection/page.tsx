"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CollectionPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home page since collection is disabled
    router.push("/")
  }, [router])

  return null
}
