"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Download, RefreshCw } from "lucide-react"
import { AuthService } from "@/lib/auth"
import { formatCurrency } from "@/lib/utils"

interface SalesData {
  period: string
  sales: number
  transactions: number
  customers: number
}

interface ProductSales {
  productId: string
  productName: string
  category: string
  quantity: number
  revenue: number
  profit: number
}

interface AnalyticsData {
  dailySales: SalesData[]
  hourlySales: SalesData[]
  topProducts: ProductSales[]
  categoryBreakdown: { category: string; percentage: number; sales: number }[]
  paymentMethods: { method: string; percentage: number; amount: number }[]
}

export function OutletAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState("7days")

  useEffect(() => {
    loadAnalyticsData()
  }, [dateRange])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      const user = AuthService.getCurrentUser()
      if (!user?.outletId) return

      // Mock data for now - replace with actual API call
      const mockAnalytics: AnalyticsData = {
        dailySales: [
          { period: "Mon", sales: 25480, transactions: 142, customers: 89 },
          { period: "Tue", sales: 31200, transactions: 156, customers: 94 },
          { period: "Wed", sales: 28750, transactions: 138, customers: 86 },
          { period: "Thu", sales: 34560, transactions: 167, customers: 102 },
          { period: "Fri", sales: 42100, transactions: 189, customers: 118 },
          { period: "Sat", sales: 38900, transactions: 178, customers: 115 },
          { period: "Sun", sales: 29800, transactions: 151, customers: 97 }
        ],
        hourlySales: Array.from({ length: 12 }, (_, i) => ({
          period: `${8 + i}:00`,
          sales: Math.random() * 5000 + 1000,
          transactions: Math.floor(Math.random() * 30 + 10),
          customers: Math.floor(Math.random() * 25 + 5)
        })),
        topProducts: [
          { productId: "1", productName: "Paracetamol 500mg", category: "Medicine", quantity: 156, revenue: 4680, profit: 1404 },
          { productId: "2", productName: "Vitamin C", category: "Supplements", quantity: 89, revenue: 2670, profit: 801 },
          { productId: "3", productName: "Blood Pressure Monitor", category: "Medical Devices", quantity: 12, revenue: 3600, profit: 1080 },
          { productId: "4", productName: "Cough Syrup", category: "Medicine", quantity: 67, revenue: 2010, profit: 603 },
          { productId: "5", productName: "First Aid Kit", category: "Medical Supplies", quantity: 23, revenue: 1150, profit: 345 }
        ],
        categoryBreakdown: [
          { category: "Medicines", percentage: 45, sales: 108000 },
          { category: "Supplements", percentage: 25, sales: 60000 },
          { category: "Medical Devices", percentage: 20, sales: 48000 },
          { category: "Personal Care", percentage: 10, sales: 24000 }
        ],
        paymentMethods: [
          { method: "Cash", percentage: 55, amount: 132000 },
          { method: "Mobile Money", percentage: 30, amount: 72000 },
          { method: "Card", percentage: 15, amount: 36000 }
        ]
      }

      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error("Failed to load analytics data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const SimpleChart = ({ 
    data, 
    title, 
    valueKey 
  }: { 
    data: SalesData[]
    title: string
    valueKey: keyof SalesData 
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium">{item.period}</span>
              <div className="flex items-center gap-2">
                <div 
                  className="h-2 bg-primary rounded"
                  style={{ 
                    width: `${(Number(item[valueKey]) / Math.max(...data.map(d => Number(d[valueKey])))) * 100}px`,
                    minWidth: '20px'
                  }}
                />
                <span className="text-sm text-muted-foreground w-16 text-right">
                  {valueKey === 'sales' ? formatCurrency(Number(item[valueKey])) : item[valueKey]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[...Array(7)].map((_, j) => (
                    <div key={j} className="h-4 bg-muted rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Unable to load analytics data</p>
          <Button onClick={loadAnalyticsData} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sales Analytics</h3>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimpleChart 
              data={analytics.dailySales} 
              title="Daily Sales" 
              valueKey="sales" 
            />
            <SimpleChart 
              data={analytics.dailySales} 
              title="Daily Transactions" 
              valueKey="transactions" 
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimpleChart 
              data={analytics.hourlySales} 
              title="Hourly Distribution" 
              valueKey="sales" 
            />
            <SimpleChart 
              data={analytics.dailySales} 
              title="Customer Count" 
              valueKey="customers" 
            />
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Best performing products by revenue and quantity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topProducts.map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <h4 className="font-medium">{product.productName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {product.category} • {product.quantity} units sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(product.revenue)}</p>
                      <p className="text-sm text-muted-foreground">
                        Profit: {formatCurrency(product.profit)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Revenue breakdown by product categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.categoryBreakdown.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.category}</span>
                      <div className="text-right">
                        <span className="font-medium">{formatCurrency(category.sales)}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({category.percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Distribution of payment methods used</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.paymentMethods.map((method) => (
                  <div key={method.method} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{method.method}</span>
                      <div className="text-right">
                        <span className="font-medium">{formatCurrency(method.amount)}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({method.percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${method.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}