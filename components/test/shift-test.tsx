"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, DollarSign, Users, ShoppingCart } from "lucide-react"
import { AuthService } from "@/lib/auth"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export function ShiftTest() {
  const [user, setUser] = useState(AuthService.getCurrentUser())
  const [currentShift, setCurrentShift] = useState(AuthService.getCurrentShift())
  const [openingCash, setOpeningCash] = useState("")
  const [actualCash, setActualCash] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentShift(AuthService.getCurrentShift())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  const handleStartShift = async () => {
    if (!openingCash || isNaN(Number(openingCash)) || Number(openingCash) < 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid opening cash amount",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      await AuthService.startShift(Number(openingCash), notes)
      setCurrentShift(AuthService.getCurrentShift())
      setUser(AuthService.getCurrentUser())
      toast({
        title: "Success",
        description: `Shift started with opening cash of ${formatCurrency(Number(openingCash))}`
      })
      setOpeningCash("")
      setNotes("")
    } catch (error) {
      console.error("Failed to start shift:", error)
      toast({
        title: "Error",
        description: "Failed to start shift. Check console for details.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndShift = async () => {
    if (!actualCash || isNaN(Number(actualCash)) || Number(actualCash) < 0) {
      toast({
        title: "Invalid Amount", 
        description: "Please enter a valid actual cash amount",
        variant: "destructive"
      })
      return
    }

    if (!user) {
      toast({
        title: "Error",
        description: "User not found. Please log in again.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await AuthService.endShift(user.id, {
        actualCash: Number(actualCash),
        notes: notes || undefined
      })
      setCurrentShift(AuthService.getCurrentShift())
      setUser(AuthService.getCurrentUser())
      
      const variance = result.summary?.variance || 0
      toast({
        title: "Shift Ended",
        description: `Variance: ${formatCurrency(Math.abs(variance))} ${variance >= 0 ? 'over' : 'under'}`
      })
      setActualCash("")
      setNotes("")
    } catch (error) {
      console.error("Failed to end shift:", error)
      toast({
        title: "Error",
        description: "Failed to end shift. Check console for details.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Please log in to test shift functionality</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Shift Management Test
          </CardTitle>
          <CardDescription>
            Test the shift start/end functionality for user: {user.name} ({user.role})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Status:</span>
            <Badge variant={currentShift ? "default" : "secondary"}>
              {currentShift ? "Shift Active" : "No Active Shift"}
            </Badge>
          </div>

          {/* Current Shift Details */}
          {currentShift && (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-semibold">Current Shift Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Started: {currentShift.startTime ? new Date(currentShift.startTime).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Opening: {formatCurrency(currentShift.openingCash)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Sales: {formatCurrency(currentShift.totalSales)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Transactions: {currentShift.transactionCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Expected Cash: {formatCurrency(currentShift.expectedCash)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Status: {currentShift.status}</span>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Start Shift Form */}
          {!currentShift && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Start New Shift</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openingCash">Opening Cash Amount</Label>
                  <Input
                    id="openingCash"
                    type="number"
                    placeholder="e.g., 50000"
                    value={openingCash}
                    onChange={(e) => setOpeningCash(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startNotes">Notes (Optional)</Label>
                  <Textarea
                    id="startNotes"
                    placeholder="Any notes about opening..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
              <Button 
                onClick={handleStartShift} 
                disabled={isLoading || !openingCash}
                className="w-full"
              >
                {isLoading ? "Starting..." : "Start Shift"}
              </Button>
            </div>
          )}

          {/* End Shift Form */}
          {currentShift && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">End Current Shift</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="actualCash">Actual Cash Amount</Label>
                  <Input
                    id="actualCash"
                    type="number"
                    placeholder="Count actual cash in register"
                    value={actualCash}
                    onChange={(e) => setActualCash(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endNotes">Notes (Optional)</Label>
                  <Textarea
                    id="endNotes"
                    placeholder="Any notes about closing..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
              <Button 
                onClick={handleEndShift} 
                disabled={isLoading || !actualCash}
                variant="outline"
                className="w-full"
              >
                {isLoading ? "Ending..." : "End Shift"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}