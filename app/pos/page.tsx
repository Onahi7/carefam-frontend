"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"

function POSRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new cashier POS route
    router.replace("/cashier/pos")
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to POS Terminal...</p>
      </div>
    </div>
  )
}

export default function POSPage() {
  return (
    <ProtectedRoute requireShift={true}>
      <POSRedirect />
    </ProtectedRoute>
  )
}
