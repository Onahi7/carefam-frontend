"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Clock, DollarSign, TrendingUp, AlertTriangle, CheckCircle, UserCheck } from "lucide-react"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import type { User } from "@/lib/types"

interface ShiftSummary {
  startTime: Date
  endTime?: Date
  openingCash: number
  totalSales: number
  cashSales: number
  cardSales: number
  mobileSales: number
  transactionCount: number
  totalCashIn: number
  totalCashOut: number
  expectedCash: number
  actualCash?: number
  variance?: number
  notes?: string
  managerApproval?: {
    managerId: string
    managerName: string
    timestamp: Date
    approved: boolean
  }
}

interface EnhancedShiftModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onShiftStart: (openingCash: number) => void
  onShiftEnd: (summary: ShiftSummary) => void
  currentShift?: ShiftSummary | null
}

export function EnhancedShiftModal({ 
  user, 
  isOpen, 
  onClose, 
  onShiftStart, 
  onShiftEnd, 
  currentShift 
}: EnhancedShiftModalProps) {
  const [step, setStep] = useState<"start" | "end" | "summary">("start")
  const [openingCash, setOpeningCash] = useState("")
  const [actualCashCount, setActualCashCount] = useState("")
  const [notes, setNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [requiresApproval, setRequiresApproval] = useState(false)
  const [managerPin, setManagerPin] = useState("")

  useEffect(() => {
    if (currentShift && currentShift.startTime && !currentShift.endTime) {
      setStep("end")
    } else {
      setStep("start")
    }
  }, [currentShift, isOpen])

  const calculateExpectedCash = () => {
    if (!currentShift) return 0
    return currentShift.openingCash + 
           currentShift.cashSales + 
           currentShift.totalCashIn - 
           currentShift.totalCashOut
  }

  const calculateVariance = () => {
    const expected = calculateExpectedCash()
    const actual = parseFloat(actualCashCount) || 0
    return actual - expected
  }

  const handleStartShift = async () => {
    const amount = parseFloat(openingCash)
    if (isNaN(amount) || amount < 0) {
      alert("Please enter a valid opening cash amount")
      return
    }

    setIsProcessing(true)
    try {
      // In real implementation, this would validate with manager if amount > threshold
      await onShiftStart(amount)
      setOpeningCash("")
      onClose()
    } catch (error) {
      console.error("Failed to start shift:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEndShift = async () => {
    if (!currentShift) return

    const actualCash = parseFloat(actualCashCount)
    if (isNaN(actualCash)) {
      alert("Please enter the actual cash count")
      return
    }

    const variance = calculateVariance()
    const significantVariance = Math.abs(variance) > 10000 // Le 10,000 threshold

    if (significantVariance && !requiresApproval) {
      setRequiresApproval(true)
      return
    }

    setIsProcessing(true)
    try {
      const summary: ShiftSummary = {
        ...currentShift,
        endTime: new Date(),
        actualCash,
        variance,
        notes: notes.trim() || undefined,
        managerApproval: requiresApproval ? {
          managerId: "manager-id", // In real app, get from manager PIN
          managerName: "Manager Name",
          timestamp: new Date(),
          approved: true
        } : undefined
      }

      await onShiftEnd(summary)
      setStep("summary")
    } catch (error) {
      console.error("Failed to end shift:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleManagerApproval = () => {
    // In real implementation, validate manager PIN
    if (managerPin === "1234") { // Demo PIN
      setRequiresApproval(false)
      setManagerPin("")
      handleEndShift()
    } else {
      alert("Invalid manager PIN")
    }
  }

  const renderStartShiftView = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Start Your Shift</CardTitle>
          <CardDescription>Initialize your cash drawer and begin working</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="opening-cash">Opening Cash Amount</Label>
            <Input
              id="opening-cash"
              type="number"
              value={openingCash}
              onChange={(e) => setOpeningCash(e.target.value)}
              placeholder="500000.00"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Recommended starting amount: Le 500,000
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setOpeningCash("500000")}
              variant="outline"
              size="sm"
            >
              Le 500,000
            </Button>
            <Button
              onClick={() => setOpeningCash("750000")}
              variant="outline"
              size="sm"
            >
              Le 750,000
            </Button>
            <Button
              onClick={() => setOpeningCash("1000000")}
              variant="outline"
              size="sm"
            >
              Le 1,000,000
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleStartShift} disabled={!openingCash || isProcessing}>
              {isProcessing ? "Starting..." : "Start Shift"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderEndShiftView = () => {
    const expectedCash = calculateExpectedCash()
    const variance = calculateVariance()

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">End Your Shift</CardTitle>
            <CardDescription>Count your cash drawer and reconcile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Shift Summary */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Opening Cash:</span>
                  <span>{formatCurrency(currentShift?.openingCash || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cash Sales:</span>
                  <span className="text-green-600">+{formatCurrency(currentShift?.cashSales || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cash In:</span>
                  <span className="text-blue-600">+{formatCurrency(currentShift?.totalCashIn || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cash Out:</span>
                  <span className="text-red-600">-{formatCurrency(currentShift?.totalCashOut || 0)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Transactions:</span>
                  <span>{currentShift?.transactionCount || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Card Sales:</span>
                  <span>{formatCurrency(currentShift?.cardSales || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Mobile Sales:</span>
                  <span>{formatCurrency(currentShift?.mobileSales || 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Expected Cash:</span>
                  <span>{formatCurrency(expectedCash)}</span>
                </div>
              </div>
            </div>

            {/* Cash Count */}
            <div>
              <Label htmlFor="actual-cash">Actual Cash Count</Label>
              <Input
                id="actual-cash"
                type="number"
                value={actualCashCount}
                onChange={(e) => setActualCashCount(e.target.value)}
                placeholder="0.00"
              />
              {actualCashCount && (
                <div className={`text-sm mt-1 ${Math.abs(variance) > 10000 ? 'text-red-600' : 'text-green-600'}`}>
                  Variance: {formatCurrency(variance)}
                  {Math.abs(variance) > 10000 && " (Requires manager approval)"}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="shift-notes">Notes (Optional)</Label>
              <Textarea
                id="shift-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any issues or observations during the shift..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleEndShift} disabled={!actualCashCount || isProcessing}>
                {isProcessing ? "Processing..." : "End Shift"}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manager Approval Modal */}
        {requiresApproval && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Manager Approval Required
              </CardTitle>
              <CardDescription>
                Cash variance of {formatCurrency(Math.abs(variance))} requires manager approval
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="manager-pin">Manager PIN</Label>
                <Input
                  id="manager-pin"
                  type="password"
                  value={managerPin}
                  onChange={(e) => setManagerPin(e.target.value)}
                  placeholder="Enter manager PIN"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Demo PIN: 1234
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleManagerApproval} disabled={!managerPin}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button variant="outline" onClick={() => setRequiresApproval(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderSummaryView = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Shift Completed Successfully
          </CardTitle>
          <CardDescription>Your shift has been ended and recorded</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-3 bg-green-50 border border-green-200 rounded">
            <div className="space-y-1">
              <p className="text-sm font-medium">Shift Duration</p>
              <p className="text-sm">{formatDateTime(currentShift?.startTime!)} - {formatDateTime(new Date())}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Total Sales</p>
              <p className="text-sm">{formatCurrency(currentShift?.totalSales || 0)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Transactions</p>
              <p className="text-sm">{currentShift?.transactionCount || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Cash Variance</p>
              <p className={`text-sm ${Math.abs(calculateVariance()) <= 10000 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(calculateVariance())}
              </p>
            </div>
          </div>

          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === "start" && "Start Shift"}
            {step === "end" && "End Shift"}
            {step === "summary" && "Shift Summary"}
          </DialogTitle>
          <DialogDescription>
            {step === "start" && "Initialize your work shift and cash drawer"}
            {step === "end" && "Complete your shift and reconcile cash"}
            {step === "summary" && "Review your completed shift details"}
          </DialogDescription>
        </DialogHeader>

        {step === "start" && renderStartShiftView()}
        {step === "end" && renderEndShiftView()}
        {step === "summary" && renderSummaryView()}
      </DialogContent>
    </Dialog>
  )
}