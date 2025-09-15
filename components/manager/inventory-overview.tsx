"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Calendar,
  BarChart3,
  RefreshCw,
  Filter,
  Search
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuthService } from "@/lib/auth"
import { formatCurrency } from "@/lib/utils"

interface InventoryItem {
  id: string
  name: string
  category: string
  currentStock: number
  minimumStock: number
  maximumStock: number
  unitPrice: number
  totalValue: number
  lastRestocked: string
  expiryDate?: string
  batchNumber?: string
  supplier: string
  status: "in_stock" | "low_stock" | "out_of_stock" | "expiring_soon" | "expired"
}

interface InventoryAlert {
  id: string
  productId: string
  productName: string
  type: "low_stock" | "out_of_stock" | "expiring_soon" | "expired"
  severity: "low" | "medium" | "high"
  message: string
  createdAt: string
}

interface InventoryStats {
  totalProducts: number
  totalValue: number
  lowStockItems: number
  expiringItems: number
  outOfStockItems: number
  averageStockLevel: number
}

export function InventoryOverview() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    loadInventoryData()
  }, [])

  const loadInventoryData = async () => {
    setIsLoading(true)
    try {
      const user = AuthService.getCurrentUser()
      if (!user?.outletId) return

      // Mock data for now - replace with actual API call
      const mockInventory: InventoryItem[] = [
        {
          id: "1",
          name: "Paracetamol 500mg",
          category: "Medicine",
          currentStock: 150,
          minimumStock: 50,
          maximumStock: 500,
          unitPrice: 2.50,
          totalValue: 375.00,
          lastRestocked: "2024-01-15",
          expiryDate: "2025-06-30",
          batchNumber: "PCM2024001",
          supplier: "PharmaCorp Ltd",
          status: "in_stock"
        },
        {
          id: "2",
          name: "Vitamin C 1000mg",
          category: "Supplements",
          currentStock: 25,
          minimumStock: 30,
          maximumStock: 200,
          unitPrice: 15.00,
          totalValue: 375.00,
          lastRestocked: "2024-01-10",
          expiryDate: "2025-12-31",
          batchNumber: "VTC2024001",
          supplier: "Wellness Solutions",
          status: "low_stock"
        },
        {
          id: "3",
          name: "Blood Pressure Monitor",
          category: "Medical Devices",
          currentStock: 8,
          minimumStock: 5,
          maximumStock: 25,
          unitPrice: 120.00,
          totalValue: 960.00,
          lastRestocked: "2024-01-08",
          batchNumber: "BPM2024001",
          supplier: "MediTech Supplies",
          status: "in_stock"
        },
        {
          id: "4",
          name: "Cough Syrup 100ml",
          category: "Medicine",
          currentStock: 0,
          minimumStock: 20,
          maximumStock: 100,
          unitPrice: 8.50,
          totalValue: 0.00,
          lastRestocked: "2024-01-05",
          expiryDate: "2024-08-30",
          batchNumber: "CS2024001",
          supplier: "PharmaCorp Ltd",
          status: "out_of_stock"
        },
        {
          id: "5",
          name: "Insulin Pen",
          category: "Medicine",
          currentStock: 12,
          minimumStock: 10,
          maximumStock: 50,
          unitPrice: 45.00,
          totalValue: 540.00,
          lastRestocked: "2024-01-12",
          expiryDate: "2024-02-15",
          batchNumber: "INS2024001",
          supplier: "Diabetes Care Inc",
          status: "expiring_soon"
        }
      ]

      const mockAlerts: InventoryAlert[] = [
        {
          id: "1",
          productId: "2",
          productName: "Vitamin C 1000mg",
          type: "low_stock",
          severity: "medium",
          message: "Stock level below minimum threshold",
          createdAt: "2024-01-16T10:30:00Z"
        },
        {
          id: "2",
          productId: "4",
          productName: "Cough Syrup 100ml",
          type: "out_of_stock",
          severity: "high",
          message: "Product is completely out of stock",
          createdAt: "2024-01-16T09:15:00Z"
        },
        {
          id: "3",
          productId: "5",
          productName: "Insulin Pen",
          type: "expiring_soon",
          severity: "high",
          message: "Product expires in 30 days",
          createdAt: "2024-01-16T08:45:00Z"
        }
      ]

      const mockStats: InventoryStats = {
        totalProducts: mockInventory.length,
        totalValue: mockInventory.reduce((sum, item) => sum + item.totalValue, 0),
        lowStockItems: mockInventory.filter(item => item.status === "low_stock").length,
        expiringItems: mockInventory.filter(item => item.status === "expiring_soon").length,
        outOfStockItems: mockInventory.filter(item => item.status === "out_of_stock").length,
        averageStockLevel: Math.round(
          mockInventory.reduce((sum, item) => sum + (item.currentStock / item.maximumStock * 100), 0) / mockInventory.length
        )
      }

      setInventory(mockInventory)
      setAlerts(mockAlerts)
      setStats(mockStats)
    } catch (error) {
      console.error("Failed to load inventory data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock": return "bg-green-500"
      case "low_stock": return "bg-yellow-500"
      case "out_of_stock": return "bg-red-500"
      case "expiring_soon": return "bg-orange-500"
      case "expired": return "bg-red-600"
      default: return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_stock": return "In Stock"
      case "low_stock": return "Low Stock"
      case "out_of_stock": return "Out of Stock"
      case "expiring_soon": return "Expiring Soon"
      case "expired": return "Expired"
      default: return "Unknown"
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "high": return "border-red-500 bg-red-50"
      case "medium": return "border-yellow-500 bg-yellow-50"
      case "low": return "border-blue-500 bg-blue-50"
      default: return "border-gray-500 bg-gray-50"
    }
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const categories = Array.from(new Set(inventory.map(item => item.category)))

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-16 mb-2"></div>
                <div className="h-6 bg-muted rounded w-8"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Inventory Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Products</span>
              </div>
              <div className="text-2xl font-bold mt-1">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">In inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Value</span>
              </div>
              <div className="text-2xl font-bold mt-1">{formatCurrency(stats.totalValue)}</div>
              <p className="text-xs text-muted-foreground">Stock value</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Avg Stock Level</span>
              </div>
              <div className="text-2xl font-bold mt-1">{stats.averageStockLevel}%</div>
              <p className="text-xs text-muted-foreground">Of maximum capacity</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Low Stock</span>
              </div>
              <div className="text-2xl font-bold mt-1 text-yellow-600">{stats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">Items need restocking</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Expiring Soon</span>
              </div>
              <div className="text-2xl font-bold mt-1 text-orange-600">{stats.expiringItems}</div>
              <p className="text-xs text-muted-foreground">Within 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Out of Stock</span>
              </div>
              <div className="text-2xl font-bold mt-1 text-red-600">{stats.outOfStockItems}</div>
              <p className="text-xs text-muted-foreground">Urgent restock needed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Inventory Alerts
            </CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className={`p-3 border rounded-lg ${getAlertColor(alert.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{alert.productName}</h4>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                    <Badge variant="outline" className={`ml-2 ${
                      alert.severity === 'high' ? 'border-red-500 text-red-700' :
                      alert.severity === 'medium' ? 'border-yellow-500 text-yellow-700' :
                      'border-blue-500 text-blue-700'
                    }`}>
                      {alert.severity} priority
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Overview</CardTitle>
              <CardDescription>Monitor stock levels and manage inventory</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadInventoryData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm">
                <Package className="h-4 w-4 mr-2" />
                Full Inventory
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Inventory List */}
          <div className="space-y-3">
            {filteredInventory.slice(0, 10).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-xs ${getStatusColor(item.status)} text-white`}>
                        {getStatusText(item.status)}
                      </Badge>
                      {item.expiryDate && (
                        <span className="text-xs text-muted-foreground">
                          Exp: {new Date(item.expiryDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm font-medium">{item.currentStock}</p>
                    <p className="text-xs text-muted-foreground">Current</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{item.minimumStock}</p>
                    <p className="text-xs text-muted-foreground">Minimum</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{formatCurrency(item.totalValue)}</p>
                    <p className="text-xs text-muted-foreground">Value</p>
                  </div>
                  <div className="w-24">
                    <Progress 
                      value={(item.currentStock / item.maximumStock) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      {Math.round((item.currentStock / item.maximumStock) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredInventory.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No inventory items found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}