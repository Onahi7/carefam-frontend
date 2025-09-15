"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, Smartphone, Banknote, AlertCircle } from "lucide-react"
import type { PaymentDetails } from "@/lib/pos-service"
import { formatCurrency } from "@/lib/utils"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  total: number
  onPaymentConfirm: (paymentDetails: PaymentDetails) => void
}

export function PaymentModal({ isOpen, onClose, total, onPaymentConfirm }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mobile">("cash")
  const [amountReceived, setAmountReceived] = useState("")
  const [reference, setReference] = useState("")
  const [error, setError] = useState("")

  const change = paymentMethod === "cash" && amountReceived ? Number.parseFloat(amountReceived) - total : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (paymentMethod === "cash") {
      const received = Number.parseFloat(amountReceived)
      if (isNaN(received) || received < total) {
        setError("Amount received must be at least the total amount")
        return
      }
    }

    if ((paymentMethod === "card" || paymentMethod === "mobile") && !reference.trim()) {
      setError("Reference number is required for card and mobile payments")
      return
    }

    const paymentDetails: PaymentDetails = {
      method: paymentMethod,
      amountReceived: paymentMethod === "cash" ? Number.parseFloat(amountReceived) : total,
      change: paymentMethod === "cash" ? change : 0,
      reference: reference || undefined,
    }

    onPaymentConfirm(paymentDetails)
  }

  const handleClose = () => {
    setPaymentMethod("cash")
    setAmountReceived("")
    setReference("")
    setError("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
          <DialogDescription>Complete the transaction by processing payment</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(total)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Cash
                  </div>
                </SelectItem>
                <SelectItem value="card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Card
                  </div>
                </SelectItem>
                <SelectItem value="mobile">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Mobile Money
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === "cash" && (
            <div className="space-y-2">
              <Label htmlFor="amountReceived">Amount Received</Label>
              <Input
                id="amountReceived"
                type="number"
                step="0.01"
                min={total}
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                placeholder={`Minimum: ${formatCurrency(total)}`}
                required
              />
              {change > 0 && (
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Change:</span>
                    <span className="font-medium text-green-600">{formatCurrency(change)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {(paymentMethod === "card" || paymentMethod === "mobile") && (
            <div className="space-y-2">
              <Label htmlFor="reference">
                {paymentMethod === "card" ? "Transaction Reference" : "Mobile Money Reference"}
              </Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={
                  paymentMethod === "card" ? "Enter card transaction reference" : "Enter mobile money reference"
                }
                required
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Complete Payment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
