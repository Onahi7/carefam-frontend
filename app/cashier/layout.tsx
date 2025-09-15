"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  ShoppingCart, 
  BarChart3, 
  User, 
  LogOut, 
  Clock,
  CreditCard,
  TrendingUp,
  Settings,
  ChevronDown
} from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AuthService } from "@/lib/auth"
import { formatCurrency } from "@/lib/utils"
import type { User as UserType } from "@/lib/types"

interface CashierLayoutProps {
  children: React.ReactNode
}

function CashierLayoutContent({ children }: CashierLayoutProps) {
  const [user, setUser] = useState<UserType | null>(null)
  const [shiftData, setShiftData] = useState<any>(null)
  const [cashBalance, setCashBalance] = useState(0)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
    if (currentUser) {
      const shift = AuthService.getCurrentShift()
      setShiftData(shift)
      // Update cash balance from shift data
      if (shift) {
        setCashBalance(shift.openingCash + shift.totalCashIn - shift.totalCashOut)
      }
    }
  }, [])

  const handleLogout = () => {
    AuthService.logout()
    router.push("/")
  }

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  const isActivePage = (path: string) => {
    return pathname === path
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Navigation */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">PharmaPOS</h1>
                  <p className="text-sm text-muted-foreground">Cashier Terminal</p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="hidden md:flex items-center gap-1">
                <Button
                  variant={isActivePage("/cashier/pos") ? "default" : "ghost"}
                  onClick={() => handleNavigate("/cashier/pos")}
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  POS Terminal
                </Button>
                <Button
                  variant={isActivePage("/cashier/dashboard") ? "default" : "ghost"}
                  onClick={() => handleNavigate("/cashier/dashboard")}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant={isActivePage("/cashier/shift-history") ? "default" : "ghost"}
                  onClick={() => handleNavigate("/cashier/shift-history")}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  My Shifts
                </Button>
              </nav>
            </div>

            {/* Status and User Info */}
            <div className="flex items-center gap-4">
              {/* Shift Status */}
              {shiftData ? (
                <div className="hidden lg:flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Cash Balance</p>
                    <p className="font-semibold text-green-600">{formatCurrency(cashBalance)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Shift Sales</p>
                    <p className="font-semibold">{formatCurrency(shiftData?.totalSales || 0)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Transactions</p>
                    <p className="font-semibold">{shiftData?.transactionCount || 0}</p>
                  </div>
                </div>
              ) : (
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  <Clock className="h-3 w-3 mr-1" />
                  No Active Shift
                </Badge>
              )}

              {/* User Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                  
                  <DropdownMenuItem onClick={() => handleNavigate("/cashier/pos")}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    POS Terminal
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => handleNavigate("/cashier/dashboard")}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => handleNavigate("/cashier/shift-history")}>
                    <Clock className="h-4 w-4 mr-2" />
                    My Shift History
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  
                  {shiftData && (
                    <>
                      <div className="px-3 py-2 border-b">
                        <p className="text-xs font-medium text-muted-foreground">CURRENT SHIFT</p>
                        <div className="mt-1 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Sales:</span>
                            <span className="font-medium">{formatCurrency(shiftData.totalSales || 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Cash:</span>
                            <span className="font-medium text-green-600">{formatCurrency(cashBalance)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Transactions:</span>
                            <span className="font-medium">{shiftData.transactionCount || 0}</span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden mt-3 flex gap-2">
            <Button
              variant={isActivePage("/cashier/pos") ? "default" : "outline"}
              size="sm"
              onClick={() => handleNavigate("/cashier/pos")}
              className="flex-1"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              POS
            </Button>
            <Button
              variant={isActivePage("/cashier/dashboard") ? "default" : "outline"}
              size="sm"
              onClick={() => handleNavigate("/cashier/dashboard")}
              className="flex-1"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={isActivePage("/cashier/shift-history") ? "default" : "outline"}
              size="sm"
              onClick={() => handleNavigate("/cashier/shift-history")}
              className="flex-1"
            >
              <Clock className="h-4 w-4 mr-2" />
              Shifts
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}

export default function CashierLayout({ children }: CashierLayoutProps) {
  return (
    <ProtectedRoute>
      <CashierLayoutContent>{children}</CashierLayoutContent>
    </ProtectedRoute>
  )
}