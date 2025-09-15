"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Download,
  RefreshCw,
  Users,
  Package,
  Target,
  PieChart,
  Activity,
  Eye
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { ApiClient, API_ENDPOINTS } from "@/lib/config"
import { AdminService } from "@/lib/admin-service"

interface SalesReport {
  period: string
  totalSales: number
  totalTransactions: number
  averageTransactionValue: number
  topProducts: Array<{
    name: string
    quantity: number
    revenue: number
  }>
}

interface StaffPerformance {
  staffId: string
  name: string
  totalSales: number
  transactionCount: number
  averageTransaction: number
  efficiency: number
}

interface InventoryReport {
  category: string
  totalProducts: number
  totalValue: number
  lowStockItems: number
  turnoverRate: number
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d")
  const [selectedReportType, setSelectedReportType] = useState("sales")
  const [isLoading, setIsLoading] = useState(false)
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null)
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([])
  const [inventoryReport, setInventoryReport] = useState<InventoryReport[]>([])
  const [financialReport, setFinancialReport] = useState<any>(null)

  useEffect(() => {
    loadReports()
  }, [selectedPeriod, selectedReportType])

  const loadReports = async () => {
    setIsLoading(true)
    try {
      switch (selectedReportType) {
        case "sales":
          const salesData = await ApiClient.get<SalesReport>(`${API_ENDPOINTS.SALES_ANALYTICS}?period=${selectedPeriod}`)
          setSalesReport(salesData)
          break
          
        case "staff":
          const staffData = await ApiClient.get<StaffPerformance[]>(`${API_ENDPOINTS.STAFF_PERFORMANCE}?period=${selectedPeriod}`)
          setStaffPerformance(staffData)
          break
          
        case "inventory":
          const inventoryData = await ApiClient.get<InventoryReport[]>(`${API_ENDPOINTS.INVENTORY_REPORTS}?period=${selectedPeriod}`)
          setInventoryReport(inventoryData)
          break
          
        case "financial":
          const financialData = await AdminService.getFinancialReport(selectedPeriod)
          setFinancialReport(financialData)
          break
      }
    } catch (error) {
      console.error("Failed to load reports:", error)
      // Reset to empty states if API fails
      setSalesReport(null)
      setStaffPerformance([])
      setInventoryReport([])
      setFinancialReport(null)
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = () => {
    // Implementation for exporting reports
    console.log("Exporting report:", selectedReportType, selectedPeriod)
  }

  const periodOptions = [
    { value: "1d", label: "Last 24 Hours" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 3 Months" },
    { value: "1y", label: "Last Year" }
  ]

  const reportTypes = [
    { value: "sales", label: "Sales Analytics", icon: BarChart3 },
    { value: "staff", label: "Staff Performance", icon: Users },
    { value: "inventory", label: "Inventory Reports", icon: Package },
    { value: "financial", label: "Financial Reports", icon: DollarSign }
  ]

  const renderSalesReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesReport?.totalSales || 0)}</div>
            <p className="text-xs text-muted-foreground">in selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesReport?.totalTransactions || 0}</div>
            <p className="text-xs text-muted-foreground">completed sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesReport?.averageTransactionValue || 0)}</div>
            <p className="text-xs text-muted-foreground">per transaction</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity Sold</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesReport?.topProducts.map((product, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{formatCurrency(product.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const renderStaffReport = () => (
    <Card>
      <CardHeader>
        <CardTitle>Staff Performance</CardTitle>
        <CardDescription>Performance metrics for all staff members</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead>Total Sales</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead>Avg Transaction</TableHead>
              <TableHead>Efficiency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffPerformance.map((staff) => (
              <TableRow key={staff.staffId}>
                <TableCell className="font-medium">{staff.name}</TableCell>
                <TableCell>{formatCurrency(staff.totalSales)}</TableCell>
                <TableCell>{staff.transactionCount}</TableCell>
                <TableCell>{formatCurrency(staff.averageTransaction)}</TableCell>
                <TableCell>
                  <Badge variant={staff.efficiency > 80 ? "default" : "secondary"}>
                    {staff.efficiency}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  const renderInventoryReport = () => (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Analysis</CardTitle>
        <CardDescription>Stock levels and turnover by category</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Total Products</TableHead>
              <TableHead>Inventory Value</TableHead>
              <TableHead>Low Stock Items</TableHead>
              <TableHead>Turnover Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryReport.map((category) => (
              <TableRow key={category.category}>
                <TableCell className="font-medium">{category.category}</TableCell>
                <TableCell>{category.totalProducts}</TableCell>
                <TableCell>{formatCurrency(category.totalValue)}</TableCell>
                <TableCell>
                  <Badge variant={category.lowStockItems > 0 ? "destructive" : "default"}>
                    {category.lowStockItems}
                  </Badge>
                </TableCell>
                <TableCell>{category.turnoverRate.toFixed(1)}x</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  const renderFinancialReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(financialReport?.revenue || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(financialReport?.expenses || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(financialReport?.profit || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <PieChart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{financialReport?.profitMargin || 0}%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderReport = () => {
    switch (selectedReportType) {
      case "sales": return renderSalesReport()
      case "staff": return renderStaffReport()
      case "inventory": return renderInventoryReport()
      case "financial": return renderFinancialReport()
      default: return <div>Select a report type</div>
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground">Comprehensive business intelligence and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadReports} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Report Controls */}
      <div className="flex items-center gap-4">
        <Select value={selectedReportType} onValueChange={setSelectedReportType}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {reportTypes.map((type) => {
              const Icon = type.icon
              return (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {type.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((period) => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Report Content */}
      {isLoading ? (
        <Card className="p-12">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading report...</span>
          </div>
        </Card>
      ) : (
        renderReport()
      )}
    </div>
  )
}