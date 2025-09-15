"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Plus, Minus, Trash2, Package } from "lucide-react"
import type { CartItem } from "@/lib/pos-service"
import { formatCurrency } from "@/lib/utils"
import { POSService } from "@/lib/pos-service"

interface ShoppingCartProps {
  items: CartItem[]
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  onClearCart: () => void
}

export function ShoppingCartComponent({ items, onUpdateQuantity, onRemoveItem, onClearCart }: ShoppingCartProps) {
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null)
  const [tempQuantity, setTempQuantity] = useState("")

  const totals = POSService.calculateCartTotals(items)

  const handleQuantityEdit = (productId: string, currentQuantity: number) => {
    setEditingQuantity(productId)
    setTempQuantity(currentQuantity.toString())
  }

  const handleQuantitySubmit = (productId: string) => {
    const quantity = Number.parseInt(tempQuantity)
    if (quantity > 0) {
      onUpdateQuantity(productId, quantity)
    }
    setEditingQuantity(null)
    setTempQuantity("")
  }

  const handleQuantityCancel = () => {
    setEditingQuantity(null)
    setTempQuantity("")
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
          </CardTitle>
          <CardDescription>Items will appear here when scanned</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Cart is empty</p>
            <p className="text-sm text-muted-foreground mt-1">Scan products to add them to the cart</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping Cart
            </CardTitle>
            <CardDescription>{totals.itemCount} items</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onClearCart} className="text-destructive bg-transparent">
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {items.map((item) => (
            <div key={item.product.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{item.product.name}</h4>
                <p className="text-xs text-muted-foreground">{formatCurrency(item.unitPrice)} each</p>
                {item.product.requiresPrescription && (
                  <Badge variant="outline" className="text-xs mt-1">
                    Prescription Required
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                {editingQuantity === item.product.id ? (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="1"
                      value={tempQuantity}
                      onChange={(e) => setTempQuantity(e.target.value)}
                      className="w-16 h-8 text-center"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleQuantitySubmit(item.product.id)
                        } else if (e.key === "Escape") {
                          handleQuantityCancel()
                        }
                      }}
                      autoFocus
                    />
                    <Button size="sm" variant="outline" onClick={() => handleQuantitySubmit(item.product.id)}>
                      ✓
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleQuantityCancel}>
                      ✕
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span
                      className="w-12 text-center text-sm font-medium cursor-pointer hover:bg-muted rounded px-2 py-1"
                      onClick={() => handleQuantityEdit(item.product.id, item.quantity)}
                    >
                      {item.quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="text-right">
                <p className="font-medium text-sm">{formatCurrency(item.total)}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveItem(item.product.id)}
                  className="text-destructive hover:text-destructive h-6 w-6 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Totals */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>
          {totals.totalDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount:</span>
              <span className="text-green-600">-{formatCurrency(totals.totalDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (15%):</span>
            <span>{formatCurrency(totals.tax)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold border-t pt-2">
            <span>Total:</span>
            <span className="text-primary">{formatCurrency(totals.total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
