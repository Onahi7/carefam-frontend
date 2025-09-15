"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  BarChart3, 
  Clock, 
  CreditCard, 
  TrendingUp, 
  DollarSign,
  ShoppingCart,
  Users,
  AlertCircle,
  Eye,
  ArrowRight,
  CalendarDays,
  Target,
  Activity
} from "lucide-react"
import { AuthService } from "@/lib/auth"
import { POSService } from "@/lib/pos-service"
import { formatCurrency } from "@/lib/utils"
import type { User } from "@/lib/types"

interface ShiftSummary {
  totalSales: number
  cashSales: number
  cardSales: number
  mobileSales: number
  transactionCount: number
  averageTransaction: number
  openingCash: number
  currentCash: number
  cashIn: number
  cashOut: number
  startTime: Date
  duration: string
}

interface DashboardStats {
  todayTransactions: number
  todayRevenue: number
  weekTransactions: number
  weekRevenue: number
  popularProducts: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  paymentBreakdown: {
    cash: number
    card: number
    mobile: number
  }
}

export default function CashierDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [shiftData, setShiftData] = useState<any>(null)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
    
    if (currentUser) {
      const shift = AuthService.getCurrentShift()
      setShiftData(shift)
      loadDashboardData(currentUser.id)
    }
    
    setIsLoading(false)
  }, [])

  const loadDashboardData = async (userId: string) => {
    try {
      // TODO: Replace with real API calls
      // const response = await fetch(`/api/cashier/${userId}/stats`)
      // const stats = await response.json()
      
      // For now, set empty stats until API is connected
      const stats: DashboardStats = {
        todayTransactions: 0,
        todayRevenue: 0,
        weekTransactions: 0,
        weekRevenue: 0,
        popularProducts: [],
        paymentBreakdown: {
          cash: 0,
          card: 0,
          mobile: 0
        }
      }
      setDashboardStats(stats)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    }
  }

  const getShiftDuration = () => {
    if (!shiftData?.startTime) return "N/A"
    
    const start = new Date(shiftData.startTime)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
  }

  const getCurrentCash = () => {
    if (!shiftData) return 0
    return (shiftData.openingCash || 0) + (shiftData.totalCashIn || 0) - (shiftData.totalCashOut || 0)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { 
              weekday: "long", 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {shiftData ? (
            <Badge variant="outline" className="text-green-600 border-green-300">
              <Activity className="h-3 w-3 mr-1" />
              Active Shift • {getShiftDuration()}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              <Clock className="h-3 w-3 mr-1" />
              No Active Shift
            </Badge>
          )}
          
          <Button asChild>
            <a href="/cashier/pos">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Go to POS
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>

      {/* Current Shift Overview */}
      {shiftData ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Current Shift Summary
            </CardTitle>
            <CardDescription>
              Started {new Date(shiftData.startTime).toLocaleTimeString()} • Duration: {getShiftDuration()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{formatCurrency(shiftData.totalSales || 0)}</p>
                <p className="text-sm text-muted-foreground">Total Sales</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{shiftData.transactionCount || 0}</p>
                <p className="text-sm text-muted-foreground">Transactions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(getCurrentCash())}</p>
                <p className="text-sm text-muted-foreground">Cash Balance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatCurrency(shiftData.cashSales || 0)}</p>
                <p className="text-sm text-muted-foreground">Cash Sales</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatCurrency(shiftData.cardSales || 0)}</p>
                <p className="text-sm text-muted-foreground">Card Sales</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {shiftData.transactionCount > 0 
                    ? formatCurrency((shiftData.totalSales || 0) / shiftData.transactionCount)
                    : formatCurrency(0)
                  }
                </p>
                <p className="text-sm text-muted-foreground">Avg. Sale</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have an active shift. Start a shift from the POS terminal to begin processing transactions.
          </AlertDescription>
        </Alert>
      )}

      {/* Performance Stats */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Transactions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.todayTransactions}</div>
              <p className="text-xs text-muted-foreground">transactions today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(dashboardStats.todayRevenue)}</div>
              <p className="text-xs text-muted-foreground">revenue today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.weekTransactions}</div>
              <p className="text-xs text-muted-foreground">transactions this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Revenue</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(dashboardStats.weekRevenue)}</div>
              <p className="text-xs text-muted-foreground">revenue this week</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Products */}
        {dashboardStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Selling Products
              </CardTitle>
              <CardDescription>Most popular items today</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardStats.popularProducts.length > 0 ? (
                <div className="space-y-4">
                  {dashboardStats.popularProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.quantity} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(product.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No sales data available</p>
                  <p className="text-sm text-muted-foreground">Start selling products to see popular items</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Methods Breakdown */}
        {dashboardStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </CardTitle>
              <CardDescription>Transaction breakdown by payment type</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardStats.todayTransactions > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded bg-green-500"></div>
                      <span>Cash Payments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{dashboardStats.paymentBreakdown.cash}%</span>
                      <Badge variant="outline">{Math.round(dashboardStats.todayTransactions * dashboardStats.paymentBreakdown.cash / 100)} txns</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded bg-blue-500"></div>
                      <span>Card Payments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{dashboardStats.paymentBreakdown.card}%</span>
                      <Badge variant="outline">{Math.round(dashboardStats.todayTransactions * dashboardStats.paymentBreakdown.card / 100)} txns</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded bg-purple-500"></div>
                      <span>Mobile Payments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{dashboardStats.paymentBreakdown.mobile}%</span>
                      <Badge variant="outline">{Math.round(dashboardStats.todayTransactions * dashboardStats.paymentBreakdown.mobile / 100)} txns</Badge>
                    </div>
                  </div>

                  {/* Visual representation */}
                  <div className="mt-4">
                    <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                      <div 
                        className="bg-green-500" 
                        style={{ width: `${dashboardStats.paymentBreakdown.cash}%` }}
                      ></div>
                      <div 
                        className="bg-blue-500" 
                        style={{ width: `${dashboardStats.paymentBreakdown.card}%` }}
                      ></div>
                      <div 
                        className="bg-purple-500" 
                        style={{ width: `${dashboardStats.paymentBreakdown.mobile}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No payment data available</p>
                  <p className="text-sm text-muted-foreground">Process transactions to see payment method breakdown</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col gap-2" asChild>
              <a href="/cashier/pos">
                <ShoppingCart className="h-6 w-6" />
                <span>Start Transaction</span>
              </a>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex-col gap-2" disabled>
              <Eye className="h-6 w-6" />
              <span>View Reports</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex-col gap-2" asChild>
              <a href="/cashier/shift-history">
                <CalendarDays className="h-6 w-6" />
                <span>Shift History</span>
              </a>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex-col gap-2" disabled>
              <Users className="h-6 w-6" />
              <span>Customer Lookup</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}