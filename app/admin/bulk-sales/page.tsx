"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  TrendingUp, 
  Users, 
  DollarSign, 
  Package,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Calendar
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { ApiClient, API_ENDPOINTS } from "@/lib/config"
import { AdminService } from "@/lib/admin-service"

interface BulkSale {
  id: string
  customerName: string
  customerType: "hospital" | "clinic" | "distributor" | "pharmacy"
  contactPerson: string
  email: string
  phone: string
  items: BulkSaleItem[]
  subtotal: number
  discountPercentage: number
  discountAmount: number
  total: number
  status: "pending" | "approved" | "completed" | "cancelled"
  createdAt: Date
  approvedBy?: string
  notes?: string
}

interface BulkSaleItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

interface BulkSaleStats {
  totalBulkSales: number
  totalRevenue: number
  averageOrderValue: number
  pendingApprovals: number
  topCustomers: Array<{
    name: string
    orders: number
    revenue: number
  }>
}

export default function BulkSalesPage() {
  const [bulkSales, setBulkSales] = useState<BulkSale[]>([])
  const [stats, setStats] = useState<BulkSaleStats>({
    totalBulkSales: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    pendingApprovals: 0,
    topCustomers: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedCustomerType, setSelectedCustomerType] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedBulkSale, setSelectedBulkSale] = useState<BulkSale | null>(null)
  const [newBulkSale, setNewBulkSale] = useState({
    customerName: "",
    customerType: "hospital" as const,
    contactPerson: "",
    email: "",
    phone: "",
    notes: ""
  })

  useEffect(() => {
    loadBulkSalesData()
  }, [])

  const loadBulkSalesData = async () => {
    setIsLoading(true)
    try {
      // Get real bulk sales analytics from the backend
      const bulkSalesAnalytics = await ApiClient.get(`${API_ENDPOINTS.BULK_SALES}`) as any
      
      // Transform the analytics data to match our interface
      const bulkSalesData = bulkSalesAnalytics.recentBulkSales?.map((sale: any) => ({
        id: sale._id || sale.id,
        customerName: sale.customerName || "Unknown Customer",
        customerType: "hospital", // Default since backend doesn't have customer type
        contactPerson: sale.customerName || "Unknown",
        email: sale.customerPhone || "N/A", // Using phone as contact info
        phone: sale.customerPhone || "N/A",
        items: sale.items?.map((item: any) => ({
          productId: item.product?._id || item.product,
          productName: item.product?.name || "Unknown Product",
          quantity: item.quantity || 0,
          unitPrice: item.unitPrice || 0,
          discount: item.discount || 0,
          total: item.totalPrice || (item.unitPrice * item.quantity)
        })) || [],
        subtotal: sale.subtotal || 0,
        discountPercentage: sale.discount ? Math.round((sale.discount / sale.subtotal) * 100) : 0,
        discountAmount: sale.discount || 0,
        total: sale.total || 0,
        status: sale.status === "completed" ? "completed" : "pending",
        createdAt: new Date(sale.createdAt || Date.now()),
        approvedBy: sale.staff?.firstName ? `${sale.staff.firstName} ${sale.staff.lastName}` : "System",
        notes: sale.notes || ""
      })) || []

      setBulkSales(bulkSalesData)
      
      // Calculate stats from analytics
      const pendingCount = bulkSalesData.filter((sale: any) => sale.status === "pending").length
      const stats = {
        totalBulkSales: bulkSalesAnalytics.totalBulkSales || 0,
        totalRevenue: bulkSalesAnalytics.totalRevenue || 0,
        averageOrderValue: bulkSalesAnalytics.averageOrderValue || 0,
        pendingApprovals: pendingCount,
        topCustomers: bulkSalesAnalytics.topCustomers?.map((customer: any) => ({
          name: customer.name,
          orders: customer.totalOrders,
          revenue: customer.totalSpent,
          type: "hospital" // Default type
        })) || []
      }
      setStats(stats)
      
    } catch (error) {
      console.error("Failed to load bulk sales data:", error)
      // Show empty state instead of mock data
      setBulkSales([])
      setStats({
        totalBulkSales: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        pendingApprovals: 0,
        topCustomers: []
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (bulkSaleId: string) => {
    try {
      // TODO: Implement API call
      // await ApiClient.post(`${API_ENDPOINTS.BULK_SALES}/${bulkSaleId}/approve`)
      
      setBulkSales(bulkSales.map(sale => 
        sale.id === bulkSaleId 
          ? { ...sale, status: "approved" as const, approvedBy: "Current Admin" }
          : sale
      ))
    } catch (error) {
      console.error("Failed to approve bulk sale:", error)
    }
  }

  const handleReject = async (bulkSaleId: string) => {
    try {
      // TODO: Implement API call
      // await ApiClient.post(`${API_ENDPOINTS.BULK_SALES}/${bulkSaleId}/reject`)
      
      setBulkSales(bulkSales.map(sale => 
        sale.id === bulkSaleId 
          ? { ...sale, status: "cancelled" as const }
          : sale
      ))
    } catch (error) {
      console.error("Failed to reject bulk sale:", error)
    }
  }

  const filteredBulkSales = bulkSales.filter(sale => {
    const matchesSearch = sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sale.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || sale.status === selectedStatus
    const matchesType = selectedCustomerType === "all" || sale.customerType === selectedCustomerType
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default"
      case "approved": return "outline"
      case "pending": return "secondary"
      case "cancelled": return "destructive"
      default: return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />
      case "approved": return <CheckCircle className="h-4 w-4 text-blue-600" />
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />
      case "cancelled": return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bulk Sales Management</h2>
          <p className="text-muted-foreground">Manage wholesale orders and institutional sales</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadBulkSalesData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Bulk Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Bulk Sale</DialogTitle>
                <DialogDescription>
                  Set up a new wholesale order for institutional customers
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={newBulkSale.customerName}
                    onChange={(e) => setNewBulkSale({ ...newBulkSale, customerName: e.target.value })}
                    placeholder="Hospital/Clinic name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerType">Customer Type *</Label>
                  <Select 
                    value={newBulkSale.customerType} 
                    onValueChange={(value: any) => setNewBulkSale({ ...newBulkSale, customerType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="clinic">Clinic</SelectItem>
                      <SelectItem value="distributor">Distributor</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    value={newBulkSale.contactPerson}
                    onChange={(e) => setNewBulkSale({ ...newBulkSale, contactPerson: e.target.value })}
                    placeholder="Dr. John Smith"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={newBulkSale.phone}
                    onChange={(e) => setNewBulkSale({ ...newBulkSale, phone: e.target.value })}
                    placeholder="+232 22 123 456"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newBulkSale.email}
                    onChange={(e) => setNewBulkSale({ ...newBulkSale, email: e.target.value })}
                    placeholder="procurement@hospital.sl"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newBulkSale.notes}
                    onChange={(e) => setNewBulkSale({ ...newBulkSale, notes: e.target.value })}
                    placeholder="Special instructions or requirements..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button>Create Order</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bulk Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBulkSales}</div>
            <p className="text-xs text-muted-foreground">wholesale orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">from bulk sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">per bulk order</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">need review</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
          <CardDescription>Highest revenue generating customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topCustomers && Array.isArray(stats.topCustomers) && stats.topCustomers.length > 0 ? (
              stats.topCustomers.map((customer, index) => (
                <div key={customer.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(customer.revenue)}</p>
                    <p className="text-sm text-muted-foreground">total revenue</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No customer data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Sales Orders</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCustomerType} onValueChange={setSelectedCustomerType}>
              <SelectTrigger className="w-40">
                <Users className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="hospital">Hospital</SelectItem>
                <SelectItem value="clinic">Clinic</SelectItem>
                <SelectItem value="distributor">Distributor</SelectItem>
                <SelectItem value="pharmacy">Pharmacy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBulkSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-mono">{sale.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{sale.customerName}</div>
                      <div className="text-sm text-muted-foreground">{sale.contactPerson}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {sale.customerType}
                    </Badge>
                  </TableCell>
                  <TableCell>{sale.items.length} items</TableCell>
                  <TableCell>{formatCurrency(sale.total)}</TableCell>
                  <TableCell>{sale.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(sale.status)}
                      <Badge variant={getStatusColor(sale.status)} className="capitalize">
                        {sale.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedBulkSale(sale)
                          setIsViewDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {sale.status === "pending" && (
                        <>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleApprove(sale.id)}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleReject(sale.id)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Bulk Sale Details</DialogTitle>
            <DialogDescription>
              Order {selectedBulkSale?.id} - {selectedBulkSale?.customerName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBulkSale && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Customer Information</Label>
                  <div className="mt-2 space-y-1">
                    <p className="font-medium">{selectedBulkSale.customerName}</p>
                    <p className="text-sm text-muted-foreground">{selectedBulkSale.contactPerson}</p>
                    <p className="text-sm text-muted-foreground">{selectedBulkSale.email}</p>
                    <p className="text-sm text-muted-foreground">{selectedBulkSale.phone}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Order Information</Label>
                  <div className="mt-2 space-y-1">
                    <p>Date: {selectedBulkSale.createdAt.toLocaleDateString()}</p>
                    <p>Type: <Badge variant="outline" className="capitalize">{selectedBulkSale.customerType}</Badge></p>
                    <p>Status: <Badge variant={getStatusColor(selectedBulkSale.status)} className="capitalize">{selectedBulkSale.status}</Badge></p>
                    {selectedBulkSale.approvedBy && <p>Approved by: {selectedBulkSale.approvedBy}</p>}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <Label className="text-sm font-medium">Order Items</Label>
                <Table className="mt-2">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedBulkSale.items && Array.isArray(selectedBulkSale.items) ? (
                      selectedBulkSale.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell>{formatCurrency(item.discount)}</TableCell>
                          <TableCell>{formatCurrency(item.total)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          No items available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedBulkSale.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({selectedBulkSale.discountPercentage}%):</span>
                    <span>-{formatCurrency(selectedBulkSale.discountAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedBulkSale.total)}</span>
                  </div>
                </div>
              </div>

              {selectedBulkSale.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedBulkSale.notes}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}