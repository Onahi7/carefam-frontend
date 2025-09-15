"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminService, type SystemMetrics } from "@/lib/admin-service"
import { Building2, DollarSign, ShoppingCart, Package, Users, TrendingUp } from "lucide-react"

export function SystemOverview() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await AdminService.getSystemMetrics()
        setMetrics(data)
      } catch (error) {
        console.error("Failed to load system metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!metrics) return null

  const cards = [
    {
      title: "Total Outlets",
      value: (metrics.totalOutlets || 0).toString(),
      icon: Building2,
      description: "Active pharmacy locations",
    },
    {
      title: "Total Revenue",
      value: AdminService.formatCurrency(metrics.totalRevenue || 0),
      icon: DollarSign,
      description: "Monthly revenue across all outlets",
    },
    {
      title: "Transactions",
      value: (metrics.totalTransactions || 0).toLocaleString(),
      icon: ShoppingCart,
      description: "Total transactions this month",
    },
    {
      title: "Products",
      value: (metrics.totalProducts || 0).toLocaleString(),
      icon: Package,
      description: "Total products in inventory",
    },
    {
      title: "System Users",
      value: (metrics.totalUsers || 0).toString(),
      icon: Users,
      description: "Active staff across all outlets",
    },
    {
      title: "Avg Transaction",
      value: AdminService.formatCurrency(metrics.averageTransactionValue || 0),
      icon: TrendingUp,
      description: "Average transaction value",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
