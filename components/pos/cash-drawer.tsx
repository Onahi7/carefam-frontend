"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Wallet, Plus, Minus, DollarSign, Calculator, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { User } from "@/lib/types"

interface CashTransaction {
  id: string
  type: "cash-in" | "cash-out"
  amount: number
  reason: string
  timestamp: Date
  approvedBy?: string
}

interface CashDrawerState {
  openingBalance: number
  currentBalance: number
  totalSales: number
  totalCashIn: number
  totalCashOut: number
  transactions: CashTransaction[]
  lastReconciliation?: Date
}

interface CashDrawerProps {
  user: User
  isShiftActive: boolean
  onBalanceUpdate: (balance: number) => void
}

export function CashDrawer({ user, isShiftActive, onBalanceUpdate }: CashDrawerProps) {
  const [drawerState, setDrawerState] = useState<CashDrawerState>({
    openingBalance: 0,
    currentBalance: 0,
    totalSales: 0,
    totalCashIn: 0,
    totalCashOut: 0,
    transactions: []
  })
  
  const [showCashInModal, setShowCashInModal] = useState(false)
  const [showCashOutModal, setShowCashOutModal] = useState(false)
  const [showReconciliationModal, setShowReconciliationModal] = useState(false)
  const [cashInAmount, setCashInAmount] = useState("")
  const [cashOutAmount, setCashOutAmount] = useState("")
  const [cashInReason, setCashInReason] = useState("")
  const [cashOutReason, setCashOutReason] = useState("")
  const [physicalCount, setPhysicalCount] = useState("")
  const [reconciliationNotes, setReconciliationNotes] = useState("")

  useEffect(() => {
    // Load drawer state from localStorage or API
    loadDrawerState()
  }, [])

  useEffect(() => {
    onBalanceUpdate(drawerState.currentBalance)
  }, [drawerState.currentBalance, onBalanceUpdate])

  const loadDrawerState = () => {
    try {
      const saved = localStorage.getItem(`cash_drawer_${user.id}`)
      if (saved) {
        const state = JSON.parse(saved)
        setDrawerState({
          ...state,
          transactions: state.transactions.map((t: any) => ({
            ...t,
            timestamp: new Date(t.timestamp)
          }))
        })
      }
    } catch (error) {
      console.error("Failed to load drawer state:", error)
    }
  }

  const saveDrawerState = (newState: CashDrawerState) => {
    try {
      localStorage.setItem(`cash_drawer_${user.id}`, JSON.stringify(newState))
      setDrawerState(newState)
    } catch (error) {
      console.error("Failed to save drawer state:", error)
    }
  }

  const handleCashIn = () => {
    const amount = parseFloat(cashInAmount)
    if (isNaN(amount) || amount <= 0 || !cashInReason.trim()) return

    const transaction: CashTransaction = {
      id: Date.now().toString(),
      type: "cash-in",
      amount,
      reason: cashInReason,
      timestamp: new Date()
    }

    const newState = {
      ...drawerState,
      currentBalance: drawerState.currentBalance + amount,
      totalCashIn: drawerState.totalCashIn + amount,
      transactions: [...drawerState.transactions, transaction]
    }

    saveDrawerState(newState)
    setCashInAmount("")
    setCashInReason("")
    setShowCashInModal(false)
  }

  const handleCashOut = () => {
    const amount = parseFloat(cashOutAmount)
    if (isNaN(amount) || amount <= 0 || !cashOutReason.trim()) return
    if (amount > drawerState.currentBalance) {
      alert("Insufficient cash in drawer")
      return
    }

    const transaction: CashTransaction = {
      id: Date.now().toString(),
      type: "cash-out",
      amount,
      reason: cashOutReason,
      timestamp: new Date()
    }

    const newState = {
      ...drawerState,
      currentBalance: drawerState.currentBalance - amount,
      totalCashOut: drawerState.totalCashOut + amount,
      transactions: [...drawerState.transactions, transaction]
    }

    saveDrawerState(newState)
    setCashOutAmount("")
    setCashOutReason("")
    setShowCashOutModal(false)
  }

  const handleReconciliation = () => {
    const countAmount = parseFloat(physicalCount)
    if (isNaN(countAmount)) return

    const variance = countAmount - drawerState.currentBalance
    
    // In real implementation, this would be saved to backend
    const newState = {
      ...drawerState,
      lastReconciliation: new Date()
    }

    saveDrawerState(newState)
    setPhysicalCount("")
    setReconciliationNotes("")
    setShowReconciliationModal(false)

    // Show variance report
    alert(`Reconciliation Complete!\nSystem Balance: ${formatCurrency(drawerState.currentBalance)}\nPhysical Count: ${formatCurrency(countAmount)}\nVariance: ${formatCurrency(variance)}`)
  }

  const initializeDrawer = (openingAmount: number) => {
    const newState = {
      openingBalance: openingAmount,
      currentBalance: openingAmount,
      totalSales: 0,
      totalCashIn: 0,
      totalCashOut: 0,
      transactions: []
    }
    saveDrawerState(newState)
  }

  const addSaleToDrawer = (saleAmount: number) => {
    const newState = {
      ...drawerState,
      currentBalance: drawerState.currentBalance + saleAmount,
      totalSales: drawerState.totalSales + saleAmount
    }
    saveDrawerState(newState)
  }

  const variance = drawerState.currentBalance - (drawerState.openingBalance + drawerState.totalSales + drawerState.totalCashIn - drawerState.totalCashOut)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Cash Drawer
          </CardTitle>
          <CardDescription>Monitor and manage cash transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Balance */}
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(drawerState.currentBalance)}</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 border rounded">
              <p className="text-xs text-muted-foreground">Opening</p>
              <p className="font-semibold">{formatCurrency(drawerState.openingBalance)}</p>
            </div>
            <div className="text-center p-3 border rounded">
              <p className="text-xs text-muted-foreground">Sales</p>
              <p className="font-semibold text-green-600">{formatCurrency(drawerState.totalSales)}</p>
            </div>
            <div className="text-center p-3 border rounded">
              <p className="text-xs text-muted-foreground">Cash In</p>
              <p className="font-semibold text-blue-600">{formatCurrency(drawerState.totalCashIn)}</p>
            </div>
            <div className="text-center p-3 border rounded">
              <p className="text-xs text-muted-foreground">Cash Out</p>
              <p className="font-semibold text-red-600">{formatCurrency(drawerState.totalCashOut)}</p>
            </div>
          </div>

          {/* Variance Alert */}
          {Math.abs(variance) > 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-800">
                Cash variance detected: {formatCurrency(variance)}
              </span>
            </div>
          )}

          {/* Actions */}
          {isShiftActive && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCashInModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Cash In
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCashOutModal(true)}
                className="flex items-center gap-2"
              >
                <Minus className="h-4 w-4" />
                Cash Out
              </Button>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReconciliationModal(true)}
            className="w-full flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Till Reconciliation
          </Button>

          {/* Recent Transactions */}
          {drawerState.transactions.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs">Recent Transactions</Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {drawerState.transactions.slice(-5).reverse().map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between text-xs p-2 border rounded">
                    <div>
                      <Badge variant={transaction.type === "cash-in" ? "default" : "destructive"} className="text-xs">
                        {transaction.type === "cash-in" ? "IN" : "OUT"}
                      </Badge>
                      <span className="ml-2">{transaction.reason}</span>
                    </div>
                    <span className={transaction.type === "cash-in" ? "text-green-600" : "text-red-600"}>
                      {transaction.type === "cash-in" ? "+" : "-"}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cash In Modal */}
      <Dialog open={showCashInModal} onOpenChange={setShowCashInModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cash In Transaction</DialogTitle>
            <DialogDescription>Add cash to the drawer</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cash-in-amount">Amount</Label>
              <Input
                id="cash-in-amount"
                type="number"
                value={cashInAmount}
                onChange={(e) => setCashInAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="cash-in-reason">Reason</Label>
              <Input
                id="cash-in-reason"
                value={cashInReason}
                onChange={(e) => setCashInReason(e.target.value)}
                placeholder="e.g., Change fund replenishment"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCashIn} disabled={!cashInAmount || !cashInReason}>
                <Plus className="h-4 w-4 mr-2" />
                Add Cash
              </Button>
              <Button variant="outline" onClick={() => setShowCashInModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cash Out Modal */}
      <Dialog open={showCashOutModal} onOpenChange={setShowCashOutModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cash Out Transaction</DialogTitle>
            <DialogDescription>Remove cash from the drawer</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cash-out-amount">Amount</Label>
              <Input
                id="cash-out-amount"
                type="number"
                value={cashOutAmount}
                onChange={(e) => setCashOutAmount(e.target.value)}
                placeholder="0.00"
                max={drawerState.currentBalance}
              />
              <p className="text-xs text-muted-foreground">
                Available: {formatCurrency(drawerState.currentBalance)}
              </p>
            </div>
            <div>
              <Label htmlFor="cash-out-reason">Reason</Label>
              <Input
                id="cash-out-reason"
                value={cashOutReason}
                onChange={(e) => setCashOutReason(e.target.value)}
                placeholder="e.g., Petty cash, Bank deposit"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCashOut} disabled={!cashOutAmount || !cashOutReason}>
                <Minus className="h-4 w-4 mr-2" />
                Remove Cash
              </Button>
              <Button variant="outline" onClick={() => setShowCashOutModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reconciliation Modal */}
      <Dialog open={showReconciliationModal} onOpenChange={setShowReconciliationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Till Reconciliation</DialogTitle>
            <DialogDescription>Count physical cash and reconcile with system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded">
              <p className="text-sm font-medium">System Balance: {formatCurrency(drawerState.currentBalance)}</p>
            </div>
            <div>
              <Label htmlFor="physical-count">Physical Cash Count</Label>
              <Input
                id="physical-count"
                type="number"
                value={physicalCount}
                onChange={(e) => setPhysicalCount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            {physicalCount && (
              <div className="p-3 border rounded">
                <p className="text-sm">
                  Variance: {formatCurrency(parseFloat(physicalCount) - drawerState.currentBalance)}
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="reconciliation-notes">Notes (Optional)</Label>
              <Textarea
                id="reconciliation-notes"
                value={reconciliationNotes}
                onChange={(e) => setReconciliationNotes(e.target.value)}
                placeholder="Any notes about discrepancies..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleReconciliation} disabled={!physicalCount}>
                <Calculator className="h-4 w-4 mr-2" />
                Complete Reconciliation
              </Button>
              <Button variant="outline" onClick={() => setShowReconciliationModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}