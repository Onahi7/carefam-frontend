"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react"
import { AuthService } from "@/lib/auth"
import { formatCurrency } from "@/lib/utils"

interface OverviewStats {
  dailySales: number
  dailyTransactions: number
  averageTransaction: number
  totalCustomers: number
  activeStaff: number
  inventoryValue: number
  percentageChanges: {
    sales: number
    transactions: number
    customers: number
  }
}

export function ManagerOverview() {
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadOverviewData()
  }, [])

  const loadOverviewData = async () => {
    setIsLoading(true)
    try {
      const user = AuthService.getCurrentUser()
      if (!user?.outletId) return

      // Mock data for now - replace with actual API call
      const mockStats: OverviewStats = {
        dailySales: 25480.75,
        dailyTransactions: 142,
        averageTransaction: 179.44,
        totalCustomers: 89,
        activeStaff: 6,
        inventoryValue: 485750.00,
        percentageChanges: {
          sales: 12.5,
          transactions: 8.2,
          customers: -3.1
        }
      }

      setStats(mockStats)
    } catch (error) {
      console.error("Failed to load overview data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    description 
  }: {
    title: string
    value: string | number
    icon: any
    change?: number
    description: string
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span>{description}</span>
          {change !== undefined && (
            <Badge 
              variant={change >= 0 ? "default" : "destructive"} 
              className="h-5 px-1.5 text-xs"
            >
              {change >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(change)}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-20 mb-2"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Unable to load overview data</p>
          <Button onClick={loadOverviewData} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Today's Sales"
        value={formatCurrency(stats.dailySales)}
        icon={DollarSign}
        change={stats.percentageChanges.sales}
        description="vs yesterday"
      />
      
      <StatCard
        title="Transactions"
        value={stats.dailyTransactions}
        icon={ShoppingCart}
        change={stats.percentageChanges.transactions}
        description="sales today"
      />

      <StatCard
        title="Average Sale"
        value={formatCurrency(stats.averageTransaction)}
        icon={TrendingUp}
        description="per transaction"
      />

      <StatCard
        title="Customers Served"
        value={stats.totalCustomers}
        icon={Users}
        change={stats.percentageChanges.customers}
        description="today"
      />

      <StatCard
        title="Active Staff"
        value={stats.activeStaff}
        icon={Users}
        description="on duty"
      />

      <StatCard
        title="Inventory Value"
        value={formatCurrency(stats.inventoryValue)}
        icon={Package}
        description="total stock"
      />
    </div>
  )
}