"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Package, Calendar, Barcode } from "lucide-react"
import { InventoryService } from "@/lib/inventory-service"
import type { Product } from "@/lib/types"
import { formatCurrency, formatDate, isExpiringSoon, isExpired } from "@/lib/utils"

interface ProductSearchProps {
  onProductSelect?: (product: Product) => void
  showInventoryInfo?: boolean
  outletId?: string
}

export function ProductSearch({ onProductSelect, showInventoryInfo = false, outletId }: ProductSearchProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [inventory, setInventory] = useState<any[]>([])

  const categories = InventoryService.getCategories()

  useEffect(() => {
    loadProducts()
    if (showInventoryInfo && outletId) {
      loadInventory()
    }
  }, [searchTerm, selectedCategory, showInventoryInfo, outletId])

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      const results = await InventoryService.getProducts(searchTerm, selectedCategory)
      setProducts(results)
    } catch (error) {
      console.error("Failed to load products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadInventory = async () => {
    if (!outletId) return
    try {
      const inventoryData = await InventoryService.getInventory(outletId)
      setInventory(inventoryData)
    } catch (error) {
      console.error("Failed to load inventory:", error)
    }
  }

  const getInventoryInfo = (productId: string) => {
    return inventory.find((item) => item.productId === productId)
  }

  const handleProductClick = (product: Product) => {
    if (onProductSelect) {
      onProductSelect(product)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, barcode, or manufacturer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Searching products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => {
              const inventoryInfo = showInventoryInfo ? getInventoryInfo(product.id) : null
              const isLowStock = inventoryInfo && inventoryInfo.quantity <= inventoryInfo.reorderPoint
              const isProductExpiring = isExpiringSoon(product.expiryDate)
              const isProductExpired = isExpired(product.expiryDate)

              return (
                <Card
                  key={product.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    onProductSelect ? "hover:border-primary" : ""
                  }`}
                  onClick={() => handleProductClick(product)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-card-foreground">{product.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Barcode className="h-3 w-3" />
                          {product.barcode}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-1">
                        {product.requiresPrescription && (
                          <Badge variant="outline" className="text-xs">
                            Rx
                          </Badge>
                        )}
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
                            Expiring Soon
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Category:</span>
                      <Badge variant="outline">{product.category}</Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">{formatCurrency(product.unitPrice)}</span>
                    </div>

                    {showInventoryInfo && inventoryInfo && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Stock:</span>
                        <span className={`font-medium ${isLowStock ? "text-secondary" : ""}`}>
                          {inventoryInfo.quantity} units
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Expires:</span>
                      <span
                        className={`text-xs flex items-center gap-1 ${
                          isProductExpired
                            ? "text-destructive"
                            : isProductExpiring
                              ? "text-secondary"
                              : "text-muted-foreground"
                        }`}
                      >
                        <Calendar className="h-3 w-3" />
                        {formatDate(product.expiryDate)}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <p className="truncate">{product.description}</p>
                      <p className="mt-1">Batch: {product.batchNumber}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
