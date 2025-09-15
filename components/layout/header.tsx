"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Building2, User, LogOut, Clock, Settings } from "lucide-react"
import { AuthService } from "@/lib/auth"
import type { User as UserType } from "@/lib/types"
import { ShiftModal } from "@/components/auth/shift-modal"

interface HeaderProps {
  user: UserType
  onLogout: () => void
}

export function Header({ user, onLogout }: HeaderProps) {
  const [showShiftModal, setShowShiftModal] = useState(false)
  const currentShift = AuthService.getCurrentShift(user.id)

  const handleLogout = () => {
    AuthService.logout()
    onLogout()
  }

  const getOutletName = (outletId: string) => {
    const outlets = {
      "550e8400-e29b-41d4-a716-446655440001": "Main Pharmacy - Freetown",
      "550e8400-e29b-41d4-a716-446655440002": "Branch Pharmacy - Bo",
      "550e8400-e29b-41d4-a716-446655440003": "Express Pharmacy - Kenema",
    }
    return outlets[outletId as keyof typeof outlets] || "Unknown Outlet"
  }

  return (
    <>
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-card-foreground">PharmaPOS</h1>
                <p className="text-sm text-muted-foreground">
                  {user.role === "admin" ? "System Administration" : getOutletName(user.outletId)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Shift Status */}
              {user.role !== "admin" && (
                <div className="flex items-center gap-2">
                  <Badge variant={currentShift ? "default" : "outline"} className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {currentShift ? "On Shift" : "Off Shift"}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => setShowShiftModal(true)} className="text-xs">
                    Manage Shift
                  </Button>
                </div>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    <User className="h-4 w-4" />
                    {user.name}
                    <Badge variant="secondary" className="ml-1">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  {user.role !== "admin" && (
                    <DropdownMenuItem onClick={() => setShowShiftModal(true)}>
                      <Clock className="mr-2 h-4 w-4" />
                      Manage Shift
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {showShiftModal && (
        <ShiftModal
          user={user}
          isOpen={showShiftModal}
          onClose={() => setShowShiftModal(false)}
          onShiftStart={() => {
            // Force re-render to update shift status
            window.location.reload()
          }}
        />
      )}
    </>
  )
}
