"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, UserCheck, AlertTriangle, DollarSign, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { User, Transaction } from "@/lib/types"

interface SecurityOverrideProps {
  isOpen: boolean
  onClose: () => void
  onApprove: (managerPin: string) => void
  overrideType: "void" | "discount" | "price-override" | "return"
  amount?: number
  reason?: string
}

interface AuditLogEntry {
  id: string
  timestamp: Date
  action: string
  user: string
  manager?: string
  amount?: number
  details: string
}

export function SecurityOverride({ 
  isOpen, 
  onClose, 
  onApprove, 
  overrideType, 
  amount, 
  reason 
}: SecurityOverrideProps) {
  const [managerPin, setManagerPin] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState("")

  const handleApprove = async () => {
    if (!managerPin) {
      setError("Please enter manager PIN")
      return
    }

    setIsVerifying(true)
    setError("")

    try {
      // Simulate PIN verification - in real app, validate against backend
      if (managerPin === "1234") {
        onApprove(managerPin)
        setManagerPin("")
        onClose()
      } else {
        setError("Invalid manager PIN")
      }
    } catch (err) {
      setError("Verification failed")
    } finally {
      setIsVerifying(false)
    }
  }

  const getOverrideDetails = () => {
    switch (overrideType) {
      case "void":
        return {
          title: "Void Transaction",
          description: "This action will void the current transaction",
          icon: Trash2,
          color: "text-red-600"
        }
      case "discount":
        return {
          title: "Apply Discount",
          description: `Apply discount of ${formatCurrency(amount || 0)}`,
          icon: DollarSign,
          color: "text-blue-600"
        }
      case "price-override":
        return {
          title: "Price Override",
          description: `Override price to ${formatCurrency(amount || 0)}`,
          icon: DollarSign,
          color: "text-orange-600"
        }
      case "return":
        return {
          title: "Process Return",
          description: `Process return of ${formatCurrency(amount || 0)}`,
          icon: DollarSign,
          color: "text-purple-600"
        }
      default:
        return {
          title: "Manager Override",
          description: "Manager authorization required",
          icon: Shield,
          color: "text-gray-600"
        }
    }
  }

  const details = getOverrideDetails()
  const IconComponent = details.icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-600" />
            Manager Authorization Required
          </DialogTitle>
          <DialogDescription>
            This action requires manager approval for security purposes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Override Details */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <IconComponent className={`h-6 w-6 ${details.color}`} />
                <div>
                  <h3 className="font-medium">{details.title}</h3>
                  <p className="text-sm text-muted-foreground">{details.description}</p>
                  {reason && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Reason: {reason}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manager PIN Input */}
          <div className="space-y-2">
            <Label htmlFor="manager-pin">Manager PIN</Label>
            <Input
              id="manager-pin"
              type="password"
              value={managerPin}
              onChange={(e) => setManagerPin(e.target.value)}
              placeholder="Enter 4-digit PIN"
              maxLength={4}
              disabled={isVerifying}
            />
            <p className="text-xs text-muted-foreground">
              Demo PIN: 1234 (for testing purposes)
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleApprove}
              disabled={!managerPin || isVerifying}
              className="flex-1"
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Approve
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isVerifying}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AuditLog({ entries }: { entries: AuditLogEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Audit Log
        </CardTitle>
        <CardDescription>Recent security-related actions and overrides</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No audit entries yet
            </p>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {entry.action}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{entry.details}</p>
                  <p className="text-xs text-muted-foreground">
                    User: {entry.user}
                    {entry.manager && ` | Approved by: ${entry.manager}`}
                  </p>
                </div>
                {entry.amount && (
                  <div className="text-sm font-medium">
                    {formatCurrency(entry.amount)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Transaction limits checker
export const TransactionLimits = {
  SINGLE_ITEM_MAX: 1000000, // Le 1,000,000
  TRANSACTION_MAX: 5000000, // Le 5,000,000
  DISCOUNT_MAX_PERCENT: 20, // 20%
  DISCOUNT_MAX_AMOUNT: 100000, // Le 100,000

  checkSingleItemLimit: (amount: number) => amount <= TransactionLimits.SINGLE_ITEM_MAX,
  checkTransactionLimit: (amount: number) => amount <= TransactionLimits.TRANSACTION_MAX,
  checkDiscountLimit: (discountAmount: number, originalAmount: number) => {
    const percentDiscount = (discountAmount / originalAmount) * 100
    return discountAmount <= TransactionLimits.DISCOUNT_MAX_AMOUNT && 
           percentDiscount <= TransactionLimits.DISCOUNT_MAX_PERCENT
  }
}

// Audit logger utility
export const AuditLogger = {
  log: (action: string, user: string, details: string, amount?: number, manager?: string): AuditLogEntry => {
    const entry: AuditLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      action,
      user,
      details,
      amount,
      manager
    }
    
    // In real implementation, send to backend
    console.log("Audit Log:", entry)
    
    // Store locally for demo
    const existing = JSON.parse(localStorage.getItem("audit_log") || "[]")
    existing.push(entry)
    localStorage.setItem("audit_log", JSON.stringify(existing.slice(-50))) // Keep last 50 entries
    
    return entry
  },

  getEntries: (): AuditLogEntry[] => {
    try {
      const entries = JSON.parse(localStorage.getItem("audit_log") || "[]")
      return entries.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }))
    } catch {
      return []
    }
  }
}