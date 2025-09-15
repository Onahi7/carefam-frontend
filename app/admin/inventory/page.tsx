"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  Package2,
  DollarSign,
  ShoppingCart,
  AlertCircle,
  FlaskConical,
  Stethoscope
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ProductForm, PRODUCT_TYPES, PRODUCT_CATEGORIES } from "@/components/admin/product-form"
import { AdminService } from "@/lib/admin-service"
import { toast } from "@/hooks/use-toast"

interface Product {
  _id: string
  name: string
  description: string
  barcode: string
  productType: string
  category: string
  retailPrice: number
  wholesalePrice: number
  costPrice: number
  currentStock: number
  minimumStock: number
  manufacturer: string
  brand?: string
  model?: string
  activeIngredient?: string
  strength?: string
  dosageForm?: string
  expiryDate?: string
  batchNumber?: string
  warrantyPeriod?: string
  requiresPrescription?: boolean
  isControlledSubstance?: boolean
  packSize?: string
  storageConditions?: string
  isActive: boolean
}

interface StockAlert {
  _id: string
  product: Product
  type: 'low_stock' | 'out_of_stock' | 'expired' | 'expiring_soon'
  message: string
  severity: 'low' | 'medium' | 'high'
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [productTypes, setProductTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all_categories")
  const [selectedType, setSelectedType] = useState<string>("all_types")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchProductTypes()
    fetchStockAlerts()
  }, [])

  const fetchProducts = async () => {
    try {
  const data = await AdminService.getProducts()
  const productsData: Product[] = Array.isArray(data) ? (data as Product[]) : []
  setProducts(productsData)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
  const data = await AdminService.getProductCategories()
  const categoriesData: string[] = Array.isArray(data) ? (data as string[]) : []
  setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchProductTypes = async () => {
    try {
  const data = await AdminService.getProductTypes()
  const typesData: string[] = Array.isArray(data) ? (data as string[]) : []
  setProductTypes(typesData)
    } catch (error) {
      console.error('Failed to fetch product types:', error)
    }
  }

  const fetchStockAlerts = async () => {
    try {
      // Mock stock alerts for demonstration
      const mockAlerts: StockAlert[] = [
        {
          _id: '1',
          product: products[0],
          type: 'low_stock',
          message: 'Stock running low',
          severity: 'medium'
        }
      ]
      setStockAlerts(mockAlerts)
    } catch (error) {
      console.error('Failed to fetch stock alerts:', error)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm) ||
                         product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all_categories" || !selectedCategory || product.category === selectedCategory
    const matchesType = selectedType === "all_types" || !selectedType || product.productType === selectedType
    return matchesSearch && matchesCategory && matchesType
  })

  const inventoryStats = {
    totalProducts: products.length,
    totalValue: products.reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0),
    lowStockItems: products.filter(p => p.currentStock <= p.minimumStock).length,
    outOfStockItems: products.filter(p => p.currentStock === 0).length
  }

  const getProductTypeIcon = (type: string) => {
    switch (type) {
      case "drug": return <Package className="h-4 w-4" />
      case "lab_equipment": return <FlaskConical className="h-4 w-4" />
      case "medical_device": return <Stethoscope className="h-4 w-4" />
      case "general_pharmacy": return <ShoppingCart className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const handleCreateProduct = async (productData: any) => {
    setFormLoading(true)
    try {
      await AdminService.createProduct(productData)
      await fetchProducts()
      setIsCreateDialogOpen(false)
      toast({
        title: "Success",
        description: "Product created successfully",
      })
    } catch (error) {
      console.error('Failed to create product:', error)
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateProduct = async (productData: any) => {
    if (!selectedProduct) return
    
    setFormLoading(true)
    try {
      await AdminService.updateProduct(selectedProduct._id, productData)
      await fetchProducts()
      setIsEditDialogOpen(false)
      setSelectedProduct(null)
      toast({
        title: "Success",
        description: "Product updated successfully",
      })
    } catch (error) {
      console.error('Failed to update product:', error)
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      await AdminService.deleteProduct(productId)
      await fetchProducts()
      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
    } catch (error) {
      console.error('Failed to delete product:', error)
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your pharmacy's inventory across all product types
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Create a new product in your inventory
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              onSubmit={handleCreateProduct}
              onCancel={() => setIsCreateDialogOpen(false)}
              isLoading={formLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Active products in inventory
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(inventoryStats.totalValue || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total inventory value at cost
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{inventoryStats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Items below minimum stock
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inventoryStats.outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Items currently out of stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts */}
      {stockAlerts.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {stockAlerts.length} stock alert(s) that require attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Product Type Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(PRODUCT_TYPES).map(([key, label]) => {
          const count = products.filter(p => p.productType === key).length
          return (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                {getProductTypeIcon(key)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">
                  {count === 1 ? 'Product' : 'Products'}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            View and manage all products in your inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_types">All Types</SelectItem>
                {Object.entries(PRODUCT_TYPES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      {getProductTypeIcon(key)}
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_categories">All Categories</SelectItem>
                {Object.entries(PRODUCT_CATEGORIES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Type & Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.barcode}</div>
                        <div className="text-sm text-muted-foreground">{product.manufacturer}</div>
                        {product.brand && (
                          <div className="text-sm text-muted-foreground">Brand: {product.brand}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          {getProductTypeIcon(product.productType)}
                          <Badge variant="outline" className="text-xs">
                            {PRODUCT_TYPES[product.productType as keyof typeof PRODUCT_TYPES]}
                          </Badge>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {PRODUCT_CATEGORIES[product.category as keyof typeof PRODUCT_CATEGORIES]}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.currentStock}</div>
                        <div className="text-sm text-muted-foreground">Min: {product.minimumStock}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">${product.retailPrice}</div>
                        <div className="text-sm text-muted-foreground">Cost: ${product.costPrice}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {product.productType === 'drug' && (
                          <>
                            {product.activeIngredient && (
                              <div>{product.activeIngredient}</div>
                            )}
                            {product.strength && (
                              <div className="text-muted-foreground">{product.strength}</div>
                            )}
                            {product.dosageForm && (
                              <div className="text-muted-foreground">{product.dosageForm}</div>
                            )}
                            {product.requiresPrescription && (
                              <Badge variant="destructive" className="text-xs mt-1">Rx</Badge>
                            )}
                          </>
                        )}
                        {(product.productType === 'lab_equipment' || product.productType === 'medical_device') && (
                          <>
                            {product.model && (
                              <div className="text-muted-foreground">Model: {product.model}</div>
                            )}
                            {product.warrantyPeriod && (
                              <div className="text-muted-foreground">Warranty: {product.warrantyPeriod}</div>
                            )}
                          </>
                        )}
                        {product.expiryDate && (
                          <div className="text-muted-foreground">
                            Exp: {new Date(product.expiryDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={product.currentStock <= product.minimumStock ? "destructive" : "default"}
                      >
                        {product.currentStock === 0 ? "Out of Stock" : 
                         product.currentStock <= product.minimumStock ? "Low Stock" : "In Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedProduct(product)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No products found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <ProductForm
              initialData={selectedProduct}
              onSubmit={handleUpdateProduct}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedProduct(null)
              }}
              isLoading={formLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}