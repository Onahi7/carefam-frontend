"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, AlertTriangle, Calendar, Search, Settings, BarChart3, History } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Header } from "@/components/layout/header"
import { ProductSearch } from "@/components/inventory/product-search"
import { StockAdjustmentModal } from "@/components/inventory/stock-adjustment-modal"
import { AuthService } from "@/lib/auth"
import { InventoryService } from "@/lib/inventory-service"
import type { User, Product, InventoryItem, AuditLog } from "@/lib/types"
import { formatCurrency, formatDateTime, isExpiringSoon, isExpired } from "@/lib/utils"

function InventoryContent() {
  const [user, setUser] = useState<User | null>(null)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])
  const [expiringItems, setExpiringItems] = useState<InventoryItem[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null)
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
    if (currentUser) {
      loadInventoryData(currentUser.outletId)
    }
  }, [])

  const loadInventoryData = async (outletId: string) => {
    setIsLoading(true)
    try {
      const [inventoryData, lowStock, expiring, logs] = await Promise.all([
        InventoryService.getInventory(outletId),
        InventoryService.getLowStockItems(outletId),
        InventoryService.getExpiringProducts(outletId),
        InventoryService.getAuditLogs(outletId),
      ])

      setInventory(inventoryData)
      setLowStockItems(lowStock)
      setExpiringItems(expiring)
      setAuditLogs(logs)
    } catch (error) {
      console.error("Failed to load inventory data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
  }

  const handleStockAdjustment = (product: Product) => {
    const inventoryItem = inventory.find((item) => item.productId === product.id)
    if (inventoryItem) {
      setSelectedProduct(product)
      setSelectedInventoryItem(inventoryItem)
      setShowAdjustmentModal(true)
    }
  }

  const handleAdjustmentSuccess = () => {
    if (user) {
      loadInventoryData(user.outletId)
    }
  }

  if (!user) return null

  const canManageInventory = AuthService.hasRole("manager")

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-balance mb-2">Inventory Management</h1>
          <p className="text-muted-foreground text-pretty">
            {canManageInventory
              ? "Manage stock levels, track expiry dates, and monitor inventory health"
              : "View current stock levels and product information"}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{inventory.length}</div>
              <p className="text-xs text-muted-foreground">In current outlet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{lowStockItems.length}</div>
              <p className="text-xs text-muted-foreground">Need reordering</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Calendar className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{expiringItems.length}</div>
              <p className="text-xs text-muted-foreground">Within 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {formatCurrency(
                  inventory.reduce((total, item) => total + (item.product?.unitPrice || 0) * item.quantity, 0),
                )}
              </div>
              <p className="text-xs text-muted-foreground">Current stock value</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Products
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="stock" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Stock Levels
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle>Product Search</CardTitle>
                <CardDescription>Search and view product information and stock levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ProductSearch
                  showInventoryInfo={true}
                  outletId={user.outletId}
                  onProductSelect={handleStockAdjustment}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="space-y-6">
              {/* Low Stock Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-secondary" />
                    Low Stock Alerts
                  </CardTitle>
                  <CardDescription>Products that need to be reordered</CardDescription>
                </CardHeader>
                <CardContent>
                  {lowStockItems.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No low stock items</p>
                  ) : (
                    <div className="space-y-4">
                      {lowStockItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product?.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Current: {item.quantity} | Reorder at: {item.reorderPoint}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-secondary border-secondary">
                              Low Stock
                            </Badge>
                            {canManageInventory && (
                              <Button size="sm" onClick={() => item.product && handleStockAdjustment(item.product)}>
                                Adjust Stock
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expiring Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-secondary" />
                    Expiring Products
                  </CardTitle>
                  <CardDescription>Products expiring within 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {expiringItems.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No expiring products</p>
                  ) : (
                    <div className="space-y-4">
                      {expiringItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product?.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Batch: {item.product?.batchNumber} | Quantity: {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={item.product && isExpired(item.product.expiryDate) ? "destructive" : "outline"}
                              className={
                                item.product && !isExpired(item.product.expiryDate)
                                  ? "text-secondary border-secondary"
                                  : ""
                              }
                            >
                              {item.product && isExpired(item.product.expiryDate) ? "Expired" : "Expiring Soon"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {item.product && formatDateTime(item.product.expiryDate)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stock">
            <Card>
              <CardHeader>
                <CardTitle>Current Stock Levels</CardTitle>
                <CardDescription>Overview of all products in your outlet</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Loading inventory...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inventory.map((item) => {
                      const isLowStock = item.quantity <= item.reorderPoint
                      const isProductExpiring = item.product && isExpiringSoon(item.product.expiryDate)
                      const isProductExpired = item.product && isExpired(item.product.expiryDate)

                      return (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product?.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.product?.category} | {formatCurrency(item.product?.unitPrice || 0)}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`font-medium ${isLowStock ? "text-secondary" : ""}`}>
                                {item.quantity} units
                              </p>
                              <p className="text-xs text-muted-foreground">Reorder at {item.reorderPoint}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                              {isLowStock && (
                                <Badge variant="outline" className="text-secondary border-secondary text-xs">
                                  Low Stock
                                </Badge>
                              )}
                              {isProductExpired && (
                                <Badge variant="destructive" className="text-xs">
                                  Expired
                                </Badge>
                              )}
                              {isProductExpiring && !isProductExpired && (
                                <Badge variant="outline" className="text-secondary border-secondary text-xs">
                                  Expiring
                                </Badge>
                              )}
                            </div>
                            {canManageInventory && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => item.product && handleStockAdjustment(item.product)}
                              >
                                <Settings className="h-4 w-4 mr-1" />
                                Adjust
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>Audit Log</CardTitle>
                <CardDescription>Recent inventory changes and adjustments</CardDescription>
              </CardHeader>
              <CardContent>
                {auditLogs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No audit logs available</p>
                ) : (
                  <div className="space-y-4">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium capitalize">{log.action.replace("_", " ")}</h4>
                          <p className="text-sm text-muted-foreground">
                            {log.changes.reason && `Reason: ${log.changes.reason}`}
                            {log.changes.oldQuantity !== undefined &&
                              ` | Changed from ${log.changes.oldQuantity} to ${log.changes.newQuantity}`}
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{formatDateTime(log.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={showAdjustmentModal}
        onClose={() => setShowAdjustmentModal(false)}
        product={selectedProduct}
        inventoryItem={selectedInventoryItem}
        onSuccess={handleAdjustmentSuccess}
      />
    </div>
  )
}

export default function InventoryPage() {
  return (
    <ProtectedRoute requireShift={true}>
      <InventoryContent />
    </ProtectedRoute>
  )
}
