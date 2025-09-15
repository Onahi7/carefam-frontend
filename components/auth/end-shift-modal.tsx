"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, DollarSign, Calculator, Clock, CheckCircle, XCircle } from "lucide-react"
import { AuthService } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"

interface EndShiftModalProps {
  isOpen: boolean
  onClose: () => void
  onShiftEnded: () => void
  currentShift: {
    startTime: Date
    openingCash: number
    totalSales: number
    cashSales: number
    cardSales: number
    mobileSales: number
    transactionCount: number
    totalCashIn: number
    totalCashOut: number
    expectedCash: number
  }
}

export function EndShiftModal({ isOpen, onClose, onShiftEnded, currentShift }: EndShiftModalProps) {
  const { toast } = useToast()
  const [actualCash, setActualCash] = useState<number>(currentShift.expectedCash)
  const [notes, setNotes] = useState("")
  const [isEnding, setIsEnding] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  const variance = actualCash - currentShift.expectedCash
  const hasVariance = Math.abs(variance) > 0
  const isOverVarianceLimit = Math.abs(variance) > 10000 // 10,000 Le limit

  const handleEndShift = async () => {
    setIsEnding(true)
    try {
      const user = AuthService.getCurrentUser()
      if (!user) throw new Error("No user found")

      await AuthService.endShift(user.id, {
        actualCash,
        notes,
        managerApproval: isOverVarianceLimit ? {
          managerId: "",
          managerName: "",
          timestamp: new Date(),
          approved: false
        } : undefined
      })

      setShowSummary(true)
      toast({
        title: "Shift Ended Successfully",
        description: `Your shift has been closed. ${hasVariance ? `Cash variance: ${formatCurrency(variance)}` : "Perfect cash balance!"}`,
        variant: hasVariance ? "destructive" : "default"
      })

      setTimeout(() => {
        onShiftEnded()
        onClose()
        setShowSummary(false)
      }, 3000)
    } catch (error) {
      console.error("Failed to end shift:", error)
      toast({
        title: "Error",
        description: "Failed to end shift. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsEnding(false)
    }
  }

  const getDuration = () => {
    const start = new Date(currentShift.startTime)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  if (showSummary) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {hasVariance ? <XCircle className="h-5 w-5 text-red-500" /> : <CheckCircle className="h-5 w-5 text-green-500" />}
              Shift Closed
            </DialogTitle>
            <DialogDescription>
              Your shift has been successfully ended and recorded.
            </DialogDescription>
          </DialogHeader>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duration:</span>
                  <span className="font-medium">{getDuration()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Sales:</span>
                  <span className="font-medium">{formatCurrency(currentShift.totalSales)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Transactions:</span>
                  <span className="font-medium">{currentShift.transactionCount}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Expected Cash:</span>
                  <span className="font-medium">{formatCurrency(currentShift.expectedCash)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Actual Cash:</span>
                  <span className="font-medium">{formatCurrency(actualCash)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Variance:</span>
                  <Badge variant={hasVariance ? "destructive" : "default"}>
                    {variance >= 0 ? "+" : ""}{formatCurrency(variance)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            End Shift - Cash Reconciliation
          </DialogTitle>
          <DialogDescription>
            Count your cash and reconcile your shift before closing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Shift Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Shift Summary</CardTitle>
              <CardDescription>Duration: {getDuration()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Opening Cash:</span>
                    <span className="font-medium">{formatCurrency(currentShift.openingCash)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cash Sales:</span>
                    <span className="font-medium text-green-600">+{formatCurrency(currentShift.cashSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cash In:</span>
                    <span className="font-medium text-green-600">+{formatCurrency(currentShift.totalCashIn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cash Out:</span>
                    <span className="font-medium text-red-600">-{formatCurrency(currentShift.totalCashOut)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Card Sales:</span>
                    <span className="font-medium">{formatCurrency(currentShift.cardSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Mobile Sales:</span>
                    <span className="font-medium">{formatCurrency(currentShift.mobileSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Sales:</span>
                    <span className="font-medium">{formatCurrency(currentShift.totalSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Transactions:</span>
                    <span className="font-medium">{currentShift.transactionCount}</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Expected Cash in Register:
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(currentShift.expectedCash)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cash Count */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cash Count</CardTitle>
              <CardDescription>Count the actual cash in your register</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="actualCash" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Actual Cash Count (Le)
                </Label>
                <Input
                  id="actualCash"
                  type="number"
                  value={actualCash}
                  onChange={(e) => setActualCash(Number(e.target.value))}
                  placeholder="Enter actual cash amount"
                  className="text-lg font-medium"
                />
              </div>

              {/* Variance Display */}
              {actualCash !== currentShift.expectedCash && (
                <div className={`p-3 rounded-lg border ${
                  variance > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${variance > 0 ? 'text-yellow-600' : 'text-red-600'}`} />
                    <span className="font-medium">
                      Cash Variance: {variance >= 0 ? "+" : ""}{formatCurrency(variance)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {variance > 0 ? "You have more cash than expected." : "You have less cash than expected."}
                    {isOverVarianceLimit && " Manager approval may be required for large variances."}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about your shift or cash variance..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleEndShift}
              disabled={isEnding}
              className="flex-1"
              variant={hasVariance ? "destructive" : "default"}
            >
              {isEnding ? "Ending Shift..." : "End Shift"}
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}