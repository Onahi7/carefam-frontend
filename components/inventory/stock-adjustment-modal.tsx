"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { AlertCircle, Package } from "lucide-react"
import { InventoryService } from "@/lib/inventory-service"
import type { Product, InventoryItem } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface StockAdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  inventoryItem: InventoryItem | null
  onSuccess: () => void
}

export function StockAdjustmentModal({
  isOpen,
  onClose,
  product,
  inventoryItem,
  onSuccess,
}: StockAdjustmentModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove" | "set">("add")
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product || !inventoryItem) return

    setIsLoading(true)
    setError("")

    try {
      const qty = Number.parseInt(quantity)
      if (isNaN(qty) || qty <= 0) {
        setError("Please enter a valid quantity")
        return
      }

      if (!reason.trim()) {
        setError("Please provide a reason for the adjustment")
        return
      }

      let success = false

      if (adjustmentType === "set") {
        success = await InventoryService.updateStock(product.id, inventoryItem.outletId, qty, reason)
      } else {
        const adjustment = adjustmentType === "add" ? qty : -qty
        success = await InventoryService.adjustStock(product.id, inventoryItem.outletId, adjustment, reason)
      }

      if (success) {
        onSuccess()
        onClose()
        setQuantity("")
        setReason("")
        setAdjustmentType("add")
      }
    } catch (err: any) {
      setError(err.message || "Failed to adjust stock")
    } finally {
      setIsLoading(false)
    }
  }

  const calculateNewQuantity = () => {
    if (!inventoryItem || !quantity) return inventoryItem?.quantity || 0

    const qty = Number.parseInt(quantity)
    if (isNaN(qty)) return inventoryItem.quantity

    switch (adjustmentType) {
      case "add":
        return inventoryItem.quantity + qty
      case "remove":
        return Math.max(0, inventoryItem.quantity - qty)
      case "set":
        return qty
      default:
        return inventoryItem.quantity
    }
  }

  if (!product || !inventoryItem) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Adjust Stock
          </DialogTitle>
          <DialogDescription>Update inventory levels for {product.name}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Stock:</span>
              <span className="font-medium">{inventoryItem.quantity} units</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Reorder Point:</span>
              <span className="font-medium">{inventoryItem.reorderPoint} units</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Unit Price:</span>
              <span className="font-medium">{formatCurrency(product.unitPrice)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustmentType">Adjustment Type</Label>
            <Select value={adjustmentType} onValueChange={(value: any) => setAdjustmentType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add Stock</SelectItem>
                <SelectItem value="remove">Remove Stock</SelectItem>
                <SelectItem value="set">Set Exact Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              {adjustmentType === "set" ? "New Quantity" : "Quantity to " + adjustmentType}
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              required
            />
          </div>

          {quantity && (
            <div className="bg-card p-3 rounded-lg border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">New Stock Level:</span>
                <span className="font-medium text-card-foreground">{calculateNewQuantity()} units</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Adjustment</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Received new shipment, Damaged goods, Stock count correction..."
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
