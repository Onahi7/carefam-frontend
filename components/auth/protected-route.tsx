"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AuthService } from "@/lib/auth"
import type { User } from "@/lib/types"
import { LoginForm } from "./login-form"
import { ShiftModal } from "./shift-modal"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: User["role"]
  requireShift?: boolean
}

export function ProtectedRoute({ children, requiredRole, requireShift = false }: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showShiftModal, setShowShiftModal] = useState(false)

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)

    // Check if shift is required and user doesn't have an active shift
    if (currentUser && requireShift && currentUser.role !== "admin") {
      const currentShift = AuthService.getCurrentShift(currentUser.id)
      if (!currentShift || !currentShift.startTime) {
        setShowShiftModal(true)
      }
    }
  }, [requireShift])

  const handleLoginSuccess = () => {
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)

    // Check shift requirement after login
    if (currentUser && requireShift && currentUser.role !== "admin") {
      const currentShift = AuthService.getCurrentShift(currentUser.id)
      if (!currentShift || !currentShift.startTime) {
        setShowShiftModal(true)
      }
    }
  }

  const handleShiftUpdate = () => {
    // Force re-render to update shift status
    setUser({ ...user! })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />
  }

  if (requiredRole && !AuthService.hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {children}
      {showShiftModal && (
        <ShiftModal
          user={user}
          isOpen={showShiftModal}
          onClose={() => setShowShiftModal(false)}
          onShiftStart={handleShiftUpdate}
        />
      )}
    </>
  )
}
