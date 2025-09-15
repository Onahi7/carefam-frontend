"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShoppingCart, CreditCard, AlertCircle, Clock, TrendingUp } from "lucide-react"
import { BarcodeScanner } from "@/components/pos/barcode-scanner"
import { ProductSearch } from "@/components/pos/product-search"
import { CashDrawer } from "@/components/pos/cash-drawer"
import { ShoppingCartComponent } from "@/components/pos/shopping-cart"
import { PaymentModal } from "@/components/pos/payment-modal"
import { ReceiptModal } from "@/components/pos/receipt-modal"
import { EnhancedShiftModal } from "@/components/pos/enhanced-shift-modal"
import { AuthService } from "@/lib/auth"
import { InventoryService } from "@/lib/inventory-service"
import { POSService, type CartItem, type PaymentDetails } from "@/lib/pos-service"
import type { User, Product, Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

export default function POSPage() {
  const [user, setUser] = useState<User | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showShiftModal, setShowShiftModal] = useState(false)
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null)
  const [receiptNumber, setReceiptNumber] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [shiftData, setShiftData] = useState<any>(null)
  const [cashBalance, setCashBalance] = useState(0)

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
    if (currentUser) {
      const shift = AuthService.getCurrentShift(currentUser.id)
      setShiftData(shift)
    }
  }, [])

  const handleShiftStart = (openingCash: number) => {
    // Initialize cash drawer and start shift
    const newShift = {
      startTime: new Date(),
      openingCash,
      totalSales: 0,
      cashSales: 0,
      cardSales: 0,
      mobileSales: 0,
      transactionCount: 0,
      totalCashIn: 0,
      totalCashOut: 0
    }
    setShiftData(newShift)
    setCashBalance(openingCash)
  }

  const handleShiftEnd = (summary: any) => {
    // End shift and clear data
    setShiftData(null)
    setCashBalance(0)
  }

  const handleProductScanned = async (product: Product) => {
    setError("")

    // Check if product is in stock
    if (user) {
      try {
        const inventoryItem = await InventoryService.getInventoryItem(product.id, user.outletId)
        if (!inventoryItem || inventoryItem.quantity <= 0) {
          setError(`${product.name} is out of stock`)
          return
        }

        // Check if adding one more would exceed available stock
        const currentCartQuantity = cartItems.find((item) => item.product.id === product.id)?.quantity || 0
        if (currentCartQuantity >= inventoryItem.quantity) {
          setError(`Only ${inventoryItem.quantity} units of ${product.name} available`)
          return
        }
      } catch (err) {
        setError("Failed to check stock availability")
        return
      }
    }

    // Add to cart or increase quantity
    const existingItemIndex = cartItems.findIndex((item) => item.product.id === product.id)

    if (existingItemIndex >= 0) {
      const updatedItems = [...cartItems]
      updatedItems[existingItemIndex].quantity += 1
      updatedItems[existingItemIndex].total =
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice
      setCartItems(updatedItems)
    } else {
      const newItem: CartItem = {
        product,
        quantity: 1,
        unitPrice: product.unitPrice,
        discount: 0,
        total: product.unitPrice,
      }
      setCartItems([...cartItems, newItem])
    }
  }

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId)
      return
    }

    // Check stock availability
    if (user) {
      try {
        const inventoryItem = await InventoryService.getInventoryItem(productId, user.outletId)
        if (!inventoryItem || quantity > inventoryItem.quantity) {
          setError(`Only ${inventoryItem?.quantity || 0} units available`)
          return
        }
      } catch (err) {
        setError("Failed to check stock availability")
        return
      }
    }

    const updatedItems = cartItems.map((item) => {
      if (item.product.id === productId) {
        return {
          ...item,
          quantity,
          total: quantity * item.unitPrice - item.discount * quantity,
        }
      }
      return item
    })
    setCartItems(updatedItems)
    setError("")
  }

  const handleRemoveItem = (productId: string) => {
    setCartItems(cartItems.filter((item) => item.product.id !== productId))
  }

  const handleClearCart = () => {
    setCartItems([])
    setError("")
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setError("Cart is empty")
      return
    }

    // Check for prescription requirements
    const prescriptionItems = cartItems.filter((item) => item.product.requiresPrescription)
    if (prescriptionItems.length > 0) {
      const itemNames = prescriptionItems.map((item) => item.product.name).join(", ")
      setError(`Prescription required for: ${itemNames}`)
      return
    }

    setShowPaymentModal(true)
  }

  const handlePaymentConfirm = async (paymentDetails: PaymentDetails) => {
    setIsProcessing(true)
    setError("")

    try {
      const { transaction, receiptNumber: receipt } = await POSService.processTransaction(
        cartItems,
        paymentDetails,
        undefined,
        false,
      )

      setCompletedTransaction(transaction)
      setReceiptNumber(receipt)
      setShowPaymentModal(false)
      setShowReceiptModal(true)
      setCartItems([])

      // Update shift data
      if (user) {
        const updatedShift = AuthService.getCurrentShift(user.id)
        setShiftData(updatedShift)
      }
    } catch (err: any) {
      setError(err.message || "Failed to process payment")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReceiptClose = () => {
    setShowReceiptModal(false)
    setCompletedTransaction(null)
    setReceiptNumber("")
  }

  if (!user) return null

  const totals = POSService.calculateCartTotals(cartItems)

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Shift Required Alert */}
      {!shiftData && (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Please start your shift to begin processing transactions.
            <Button
              variant="link"
              onClick={() => setShowShiftModal(true)}
              className="ml-2 p-0 h-auto text-amber-700 underline"
            >
              Start Shift Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Sidebar - Product Search & Cash Drawer */}
        <div className="xl:col-span-3 space-y-6">
          <ProductSearch onProductSelected={handleProductScanned} />
          {shiftData && (
            <CashDrawer
              user={user}
              isShiftActive={!!shiftData}
              onBalanceUpdate={setCashBalance}
            />
          )}
        </div>

        {/* Main Content - Scanner and Cart */}
        <div className="xl:col-span-6 space-y-6">
          <BarcodeScanner onProductScanned={handleProductScanned} />
          <ShoppingCartComponent
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
          />
        </div>

        {/* Right Sidebar - Checkout & Stats */}
        <div className="xl:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Checkout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.length > 0 ? (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items:</span>
                      <span>{totals.itemCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (15%):</span>
                      <span>{formatCurrency(totals.tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t pt-3">
                      <span>Total:</span>
                      <span className="text-primary">{formatCurrency(totals.total)}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCheckout} 
                    className="w-full" 
                    size="lg" 
                    disabled={isProcessing || !shiftData}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Process Payment
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Add items to cart to checkout</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Performance Stats */}
          {shiftData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Shift Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shift Sales:</span>
                    <span className="font-medium">{formatCurrency(shiftData?.totalSales || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Transactions:</span>
                    <span className="font-medium">{shiftData?.transactionCount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg. Sale:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        shiftData?.transactionCount > 0
                          ? (shiftData.totalSales || 0) / shiftData.transactionCount
                          : 0,
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Action Button for Shift Management */}
      {!shiftData && (
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={() => setShowShiftModal(true)}
            size="lg"
            className="rounded-full shadow-lg"
          >
            <Clock className="h-5 w-5 mr-2" />
            Start Shift
          </Button>
        </div>
      )}

      {/* Enhanced Shift Modal */}
      <EnhancedShiftModal
        user={user}
        isOpen={showShiftModal}
        onClose={() => setShowShiftModal(false)}
        onShiftStart={handleShiftStart}
        onShiftEnd={handleShiftEnd}
        currentShift={shiftData}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={totals.total}
        onPaymentConfirm={handlePaymentConfirm}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={handleReceiptClose}
        transaction={completedTransaction}
        receiptNumber={receiptNumber}
      />
    </div>
  )
}