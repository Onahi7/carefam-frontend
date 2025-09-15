"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { 
  Package, 
  Search, 
  Filter, 
  Plus,
  AlertTriangle,
  TrendingDown,
  Calendar,
  BarChart3,
  RefreshCw,
  Download,
  Upload,
  Scan
} from "lucide-react"
import { AuthService } from "@/lib/auth"
import { AdminService } from "@/lib/admin-service"
import { formatCurrency } from "@/lib/utils"

interface Product {
  id: string
  name: string
  category: string
  productType: string
  currentStock: number
  minimumStock: number
  maximumStock: number
  unitPrice: number
  costPrice: number
  totalValue: number
  lastRestocked: string
  expiryDate?: string
  batchNumber?: string
  supplier: string
  status: "in_stock" | "low_stock" | "out_of_stock" | "expiring_soon" | "expired"
  outletId: string
}

interface InventoryStats {
  totalProducts: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  expiringItems: number
  expiredItems: number
  averageStockLevel: number
}

export default function ManagerInventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    expiringItems: 0,
    expiredItems: 0,
    averageStockLevel: 0
  })

  useEffect(() => {
    loadInventory()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, categoryFilter, statusFilter])

  const loadInventory = async () => {
    setIsLoading(true)
    try {
      const user = AuthService.getCurrentUser()
      if (!user?.outletId) return

      // Get products for this outlet
  const raw = (await AdminService.getProducts()) as unknown
  const productArray: any[] = Array.isArray(raw) ? (raw as any[]) : []
      const outletProducts = productArray
        .filter((product: any) => product && product.outletId === user.outletId)
        .map((product: any) => ({
          ...product,
          status: getProductStatus(product),
          totalValue: product.currentStock * product.unitPrice
        }))
      
      setProducts(outletProducts)
      calculateStats(outletProducts)
    } catch (error) {
      console.error("Failed to load inventory:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getProductStatus = (product: any) => {
    if (product.currentStock === 0) return "out_of_stock"
    if (product.currentStock <= product.minimumStock) return "low_stock"
    if (product.expiryDate) {
      const expiryDate = new Date(product.expiryDate)
      const now = new Date()
      const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
      
      if (expiryDate < now) return "expired"
      if (expiryDate < thirtyDaysFromNow) return "expiring_soon"
    }
    return "in_stock"
  }

  const calculateStats = (productList: Product[]) => {
    const stats = {
      totalProducts: productList.length,
      totalValue: productList.reduce((sum, p) => sum + p.totalValue, 0),
      lowStockItems: productList.filter(p => p.status === "low_stock").length,
      outOfStockItems: productList.filter(p => p.status === "out_of_stock").length,
      expiringItems: productList.filter(p => p.status === "expiring_soon").length,
      expiredItems: productList.filter(p => p.status === "expired").length,
      averageStockLevel: productList.length > 0 
        ? Math.round(productList.reduce((sum, p) => sum + (p.currentStock / p.maximumStock * 100), 0) / productList.length)
        : 0
    }
    setStats(stats)
  }

  const filterProducts = () => {
    let filtered = [...products]

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(product => product.category === categoryFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(product => product.status === statusFilter)
    }

    setFilteredProducts(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock": return "bg-green-100 text-green-800"
      case "low_stock": return "bg-yellow-100 text-yellow-800"
      case "out_of_stock": return "bg-red-100 text-red-800"
      case "expiring_soon": return "bg-orange-100 text-orange-800"
      case "expired": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
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

  const categories = Array.from(new Set(products.map(p => p.category)))

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
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
            <p className="text-xs text-muted-foreground">Of capacity</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Low Stock</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-yellow-600">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
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
            <p className="text-xs text-muted-foreground">Urgent restock</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>Monitor and manage your outlet's stock levels</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadInventory}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
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
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Inventory Tabs */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Products</TabsTrigger>
              <TabsTrigger value="alerts">Alerts ({stats.lowStockItems + stats.outOfStockItems + stats.expiringItems})</TabsTrigger>
              <TabsTrigger value="expiring">Expiring</TabsTrigger>
              <TabsTrigger value="low_stock">Low Stock</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No products found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(product.status)}>
                              {getStatusText(product.status)}
                            </Badge>
                            {product.batchNumber && (
                              <span className="text-xs text-muted-foreground">
                                Batch: {product.batchNumber}
                              </span>
                            )}
                            {product.expiryDate && (
                              <span className="text-xs text-muted-foreground">
                                Exp: {new Date(product.expiryDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm font-medium">{product.currentStock}</p>
                          <p className="text-xs text-muted-foreground">Current</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{product.minimumStock}</p>
                          <p className="text-xs text-muted-foreground">Minimum</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{formatCurrency(product.unitPrice)}</p>
                          <p className="text-xs text-muted-foreground">Unit Price</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{formatCurrency(product.totalValue)}</p>
                          <p className="text-xs text-muted-foreground">Total Value</p>
                        </div>
                        <div className="w-24">
                          <Progress 
                            value={(product.currentStock / product.maximumStock) * 100} 
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground text-center mt-1">
                            {Math.round((product.currentStock / product.maximumStock) * 100)}%
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Scan className="h-4 w-4 mr-2" />
                          Update Stock
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="alerts" className="space-y-3">
              {filteredProducts.filter(p => ["low_stock", "out_of_stock", "expiring_soon", "expired"].includes(p.status)).map((product) => (
                <div key={product.id} className={`flex items-center justify-between p-4 border rounded-lg ${
                  product.status === "out_of_stock" || product.status === "expired" ? "border-red-200 bg-red-50" :
                  product.status === "low_stock" ? "border-yellow-200 bg-yellow-50" :
                  "border-orange-200 bg-orange-50"
                }`}>
                  <div className="flex items-center space-x-4">
                    <AlertTriangle className={`h-5 w-5 ${
                      product.status === "out_of_stock" || product.status === "expired" ? "text-red-500" :
                      product.status === "low_stock" ? "text-yellow-500" :
                      "text-orange-500"
                    }`} />
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                      <Badge className={getStatusColor(product.status)}>
                        {getStatusText(product.status)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium">{product.currentStock}</p>
                      <p className="text-xs text-muted-foreground">Stock</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Take Action
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="expiring" className="space-y-3">
              {filteredProducts.filter(p => p.status === "expiring_soon" || p.status === "expired").map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg border-orange-200 bg-orange-50">
                  <div className="flex items-center space-x-4">
                    <Calendar className="h-5 w-5 text-orange-500" />
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Expires: {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'Unknown'}
                      </p>
                      <Badge className={getStatusColor(product.status)}>
                        {getStatusText(product.status)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium">{product.currentStock}</p>
                      <p className="text-xs text-muted-foreground">Stock</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Mark for Disposal
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="low_stock" className="space-y-3">
              {filteredProducts.filter(p => p.status === "low_stock" || p.status === "out_of_stock").map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg border-yellow-200 bg-yellow-50">
                  <div className="flex items-center space-x-4">
                    <TrendingDown className="h-5 w-5 text-yellow-500" />
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Minimum: {product.minimumStock} | Current: {product.currentStock}
                      </p>
                      <Badge className={getStatusColor(product.status)}>
                        {getStatusText(product.status)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium">{product.minimumStock - product.currentStock}</p>
                      <p className="text-xs text-muted-foreground">Needed</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Reorder
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}