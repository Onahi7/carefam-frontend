"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, User, DollarSign } from "lucide-react"
import { AuthService } from "@/lib/auth"
import type { User as UserType } from "@/lib/types"
import { formatDateTime, formatCurrency } from "@/lib/utils"
import { EndShiftModal } from "./end-shift-modal"

interface ShiftModalProps {
  user: UserType
  isOpen: boolean
  onClose: () => void
  onShiftStart: () => void
}

export function ShiftModal({ user, isOpen, onClose, onShiftStart }: ShiftModalProps) {
  const [isStarting, setIsStarting] = useState(false)
  const [showEndShift, setShowEndShift] = useState(false)
  const currentShift = user.currentShift

  const handleStartShift = async () => {
    setIsStarting(true)
    try {
      await AuthService.startShift(50000, "Shift started from dashboard") // Default opening cash
      onShiftStart()
      onClose()
    } catch (error) {
      console.error("Failed to start shift:", error)
    } finally {
      setIsStarting(false)
    }
  }

  const handleEndShiftClick = () => {
    setShowEndShift(true)
  }

  const handleShiftEnded = () => {
    onShiftStart() // Refresh the parent component
    setShowEndShift(false)
  }

  const getOutletName = (outletId: string) => {
    const outlets = {
      "550e8400-e29b-41d4-a716-446655440001": "Main Pharmacy - Freetown",
      "550e8400-e29b-41d4-a716-446655440002": "Branch Pharmacy - Bo", 
      "550e8400-e29b-41d4-a716-446655440003": "Express Pharmacy - Kenema"
    }
    return outlets[outletId as keyof typeof outlets] || "Unknown Outlet"
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Shift Management</DialogTitle>
            <DialogDescription>
              {currentShift ? "Manage your current shift" : "Start your work shift"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {user.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <Badge variant="outline" className="text-primary">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                  <span className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3" />
                    {getOutletName(user.outletId)}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentShift && currentShift.status === "active" ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Shift Started:</span>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(new Date(currentShift.startTime))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Opening Cash:</span>
                      <span className="text-sm font-medium">{formatCurrency(currentShift.openingCash)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Sales:</span>
                      <span className="text-sm font-medium">{formatCurrency(currentShift.totalSales || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Transactions:</span>
                      <span className="text-sm font-medium">{currentShift.transactionCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Expected Cash:</span>
                      <span className="text-sm font-medium text-blue-600">
                        {formatCurrency(currentShift.expectedCash || 0)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No active shift. Start your shift to begin working.</p>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              {currentShift && currentShift.status === "active" ? (
                <Button 
                  onClick={handleEndShiftClick} 
                  variant="destructive" 
                  className="flex-1"
                >
                  End Shift
                </Button>
              ) : (
                <Button 
                  onClick={handleStartShift} 
                  disabled={isStarting} 
                  className="flex-1"
                >
                  {isStarting ? "Starting..." : "Start Shift"}
                </Button>
              )}
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* End Shift Modal */}
      {currentShift && showEndShift && (
        <EndShiftModal
          isOpen={showEndShift}
          onClose={() => setShowEndShift(false)}
          onShiftEnded={handleShiftEnded}
          currentShift={currentShift}
        />
      )}
    </>
  )
}
