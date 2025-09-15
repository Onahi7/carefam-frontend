"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminService, type FinancialReport } from "@/lib/admin-service"
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react"

export function FinancialReports() {
  const [report, setReport] = useState<FinancialReport | null>(null)
  const [period, setPeriod] = useState("monthly")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true)
      try {
        const data = await AdminService.getFinancialReport(period)
        setReport(data)
      } catch (error) {
        console.error("Failed to load financial report:", error)
      } finally {
        setLoading(false)
      }
    }

    loadReport()
  }, [period])

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!report) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Overview
          </CardTitle>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-muted-foreground">Revenue</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{AdminService.formatCurrency(report.revenue)}</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-muted-foreground">Expenses</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{AdminService.formatCurrency(report.expenses)}</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-muted-foreground">Profit</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{AdminService.formatCurrency(report.profit)}</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Percent className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-muted-foreground">Margin</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{report.profitMargin.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(report.topSellingProducts && Array.isArray(report.topSellingProducts) && report.topSellingProducts.length > 0) ? (
              report.topSellingProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.quantity} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{AdminService.formatCurrency(product.revenue)}</p>
                    <p className="text-sm text-muted-foreground">#{index + 1} bestseller</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No product data available for this period</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
