"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Download,
  RefreshCw,
  Calendar,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Clock,
  AlertTriangle
} from "lucide-react"
import { AuthService } from "@/lib/auth"
import { formatCurrency } from "@/lib/utils"

interface ReportData {
  salesSummary: {
    totalRevenue: number
    totalTransactions: number
    averageTransaction: number
    previousPeriodRevenue: number
    revenueGrowth: number
    transactionGrowth: number
  }
  productPerformance: Array<{
    productId: string
    productName: string
    category: string
    quantitySold: number
    revenue: number
    profit: number
    profitMargin: number
  }>
  categoryBreakdown: Array<{
    category: string
    revenue: number
    percentage: number
    transactions: number
  }>
  paymentMethods: Array<{
    method: string
    amount: number
    percentage: number
    transactions: number
  }>
  hourlyTrends: Array<{
    hour: number
    transactions: number
    revenue: number
  }>
  customerAnalytics: {
    walkInCustomers: number
    b2bCustomers: number
    institutionalCustomers: number
    repeatCustomers: number
    newCustomers: number
  }
}

export default function ManagerReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState("7days")
  const [reportType, setReportType] = useState("sales")

  useEffect(() => {
    loadReportData()
  }, [dateRange])

  const loadReportData = async () => {
    setIsLoading(true)
    try {
      const user = AuthService.getCurrentUser()
      if (!user?.outletId) return

      // Mock data for now - replace with actual API call
      const mockReportData: ReportData = {
        salesSummary: {
          totalRevenue: 25480.75,
          totalTransactions: 142,
          averageTransaction: 179.44,
          previousPeriodRevenue: 22100.50,
          revenueGrowth: 15.3,
          transactionGrowth: 8.2
        },
        productPerformance: [
          {
            productId: "1",
            productName: "Paracetamol 500mg",
            category: "Medicine",
            quantitySold: 156,
            revenue: 4680,
            profit: 1404,
            profitMargin: 30
          },
          {
            productId: "2",
            productName: "Vitamin C 1000mg",
            category: "Supplements",
            quantitySold: 89,
            revenue: 2670,
            profit: 801,
            profitMargin: 30
          },
          {
            productId: "3",
            productName: "Blood Pressure Monitor",
            category: "Medical Devices",
            quantitySold: 12,
            revenue: 3600,
            profit: 1080,
            profitMargin: 30
          }
        ],
        categoryBreakdown: [
          { category: "Medicines", revenue: 12000, percentage: 47, transactions: 85 },
          { category: "Supplements", revenue: 7500, percentage: 29, transactions: 32 },
          { category: "Medical Devices", revenue: 4000, percentage: 16, transactions: 15 },
          { category: "Personal Care", revenue: 1980, percentage: 8, transactions: 10 }
        ],
        paymentMethods: [
          { method: "Cash", amount: 14000, percentage: 55, transactions: 78 },
          { method: "Mobile Money", amount: 7600, percentage: 30, transactions: 42 },
          { method: "Card", amount: 3880, percentage: 15, transactions: 22 }
        ],
        hourlyTrends: Array.from({ length: 12 }, (_, i) => ({
          hour: 8 + i,
          transactions: Math.floor(Math.random() * 20 + 5),
          revenue: Math.random() * 3000 + 500
        })),
        customerAnalytics: {
          walkInCustomers: 89,
          b2bCustomers: 12,
          institutionalCustomers: 3,
          repeatCustomers: 45,
          newCustomers: 59
        }
      }

      setReportData(mockReportData)
    } catch (error) {
      console.error("Failed to load report data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    trend,
    description 
  }: {
    title: string
    value: string | number
    change?: number
    icon: any
    trend?: "up" | "down"
    description: string
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-muted-foreground">{description}</span>
          {change !== undefined && (
            <div className={`flex items-center space-x-1 ${
              trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"
            }`}>
              {trend === "up" && <TrendingUp className="h-3 w-3" />}
              {trend === "down" && <TrendingDown className="h-3 w-3" />}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const SimpleChart = ({ 
    data, 
    title, 
    valueKey,
    labelKey 
  }: { 
    data: any[]
    title: string
    valueKey: string
    labelKey: string
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
              <span className="text-sm font-medium">{item[labelKey]}</span>
              <div className="flex items-center gap-2">
                <div 
                  className="h-2 bg-primary rounded"
                  style={{ 
                    width: `${(item[valueKey] / Math.max(...data.map(d => d[valueKey]))) * 100}px`,
                    minWidth: '20px'
                  }}
                />
                <span className="text-sm text-muted-foreground w-16 text-right">
                  {valueKey.includes('revenue') || valueKey.includes('amount') 
                    ? formatCurrency(item[valueKey]) 
                    : item[valueKey]
                  }
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
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Unable to load report data</p>
            <Button onClick={loadReportData} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground">Comprehensive outlet performance insights</p>
        </div>
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
          <Button variant="outline" size="sm" onClick={loadReportData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(reportData.salesSummary.totalRevenue)}
          change={reportData.salesSummary.revenueGrowth}
          trend="up"
          icon={DollarSign}
          description="vs previous period"
        />
        <StatCard
          title="Transactions"
          value={reportData.salesSummary.totalTransactions}
          change={reportData.salesSummary.transactionGrowth}
          trend="up"
          icon={ShoppingCart}
          description="total sales"
        />
        <StatCard
          title="Average Sale"
          value={formatCurrency(reportData.salesSummary.averageTransaction)}
          icon={TrendingUp}
          description="per transaction"
        />
        <StatCard
          title="Active Customers"
          value={reportData.customerAnalytics.walkInCustomers + reportData.customerAnalytics.b2bCustomers}
          icon={Users}
          description="served this period"
        />
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales">Sales Performance</TabsTrigger>
          <TabsTrigger value="products">Product Analysis</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
          <TabsTrigger value="trends">Trends & Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimpleChart 
              data={reportData.categoryBreakdown} 
              title="Sales by Category" 
              valueKey="revenue"
              labelKey="category"
            />
            <SimpleChart 
              data={reportData.paymentMethods} 
              title="Payment Methods" 
              valueKey="amount"
              labelKey="method"
            />
          </div>

          {/* Sales Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Summary</CardTitle>
              <CardDescription>Detailed breakdown of sales performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Revenue Growth</h4>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-2xl font-bold text-green-600">
                      +{reportData.salesSummary.revenueGrowth}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    From {formatCurrency(reportData.salesSummary.previousPeriodRevenue)} to {formatCurrency(reportData.salesSummary.totalRevenue)}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Transaction Volume</h4>
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-4 w-4 text-blue-500" />
                    <span className="text-2xl font-bold text-blue-600">
                      {reportData.salesSummary.totalTransactions}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    +{reportData.salesSummary.transactionGrowth}% from previous period
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Average Transaction</h4>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-purple-500" />
                    <span className="text-2xl font-bold text-purple-600">
                      {formatCurrency(reportData.salesSummary.averageTransaction)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Per sale value
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>Best selling products by revenue and profit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.productPerformance.map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{product.productName}</h4>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm font-medium">{product.quantitySold}</p>
                        <p className="text-xs text-muted-foreground">Units Sold</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{formatCurrency(product.revenue)}</p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{formatCurrency(product.profit)}</p>
                        <p className="text-xs text-muted-foreground">Profit</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{product.profitMargin}%</p>
                        <p className="text-xs text-muted-foreground">Margin</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Walk-in</span>
                </div>
                <div className="text-2xl font-bold mt-1">{reportData.customerAnalytics.walkInCustomers}</div>
                <p className="text-xs text-muted-foreground">Regular customers</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">B2B</span>
                </div>
                <div className="text-2xl font-bold mt-1">{reportData.customerAnalytics.b2bCustomers}</div>
                <p className="text-xs text-muted-foreground">Business customers</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Repeat</span>
                </div>
                <div className="text-2xl font-bold mt-1">{reportData.customerAnalytics.repeatCustomers}</div>
                <p className="text-xs text-muted-foreground">Returning customers</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">New</span>
                </div>
                <div className="text-2xl font-bold mt-1">{reportData.customerAnalytics.newCustomers}</div>
                <p className="text-xs text-muted-foreground">First-time buyers</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Distribution</CardTitle>
              <CardDescription>Breakdown of customer types and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Walk-in Customers</span>
                    <span>{reportData.customerAnalytics.walkInCustomers} ({Math.round((reportData.customerAnalytics.walkInCustomers / (reportData.customerAnalytics.walkInCustomers + reportData.customerAnalytics.b2bCustomers + reportData.customerAnalytics.institutionalCustomers)) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(reportData.customerAnalytics.walkInCustomers / (reportData.customerAnalytics.walkInCustomers + reportData.customerAnalytics.b2bCustomers + reportData.customerAnalytics.institutionalCustomers)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">B2B Customers</span>
                    <span>{reportData.customerAnalytics.b2bCustomers} ({Math.round((reportData.customerAnalytics.b2bCustomers / (reportData.customerAnalytics.walkInCustomers + reportData.customerAnalytics.b2bCustomers + reportData.customerAnalytics.institutionalCustomers)) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${(reportData.customerAnalytics.b2bCustomers / (reportData.customerAnalytics.walkInCustomers + reportData.customerAnalytics.b2bCustomers + reportData.customerAnalytics.institutionalCustomers)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Institutional</span>
                    <span>{reportData.customerAnalytics.institutionalCustomers} ({Math.round((reportData.customerAnalytics.institutionalCustomers / (reportData.customerAnalytics.walkInCustomers + reportData.customerAnalytics.b2bCustomers + reportData.customerAnalytics.institutionalCustomers)) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${(reportData.customerAnalytics.institutionalCustomers / (reportData.customerAnalytics.walkInCustomers + reportData.customerAnalytics.b2bCustomers + reportData.customerAnalytics.institutionalCustomers)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <SimpleChart 
            data={reportData.hourlyTrends} 
            title="Hourly Sales Pattern" 
            valueKey="revenue"
            labelKey="hour"
          />

          <Card>
            <CardHeader>
              <CardTitle>Business Insights</CardTitle>
              <CardDescription>Key trends and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Revenue Growth</h4>
                    <p className="text-sm text-muted-foreground">
                      Your outlet is showing strong growth with {reportData.salesSummary.revenueGrowth}% increase in revenue.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Peak Hours</h4>
                    <p className="text-sm text-muted-foreground">
                      Highest sales activity typically occurs between 10 AM - 2 PM and 5 PM - 7 PM.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Package className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Top Category</h4>
                    <p className="text-sm text-muted-foreground">
                      Medicines account for {reportData.categoryBreakdown[0]?.percentage}% of total sales revenue.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Recommendations</h4>
                    <p className="text-sm text-muted-foreground">
                      Consider increasing stock for top-performing products and promoting slower-moving inventory.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}