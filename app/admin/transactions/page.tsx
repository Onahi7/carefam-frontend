"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  ShoppingCart,
  Users,
  Package
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { ApiClient, API_ENDPOINTS } from "@/lib/config"
import { AdminService } from "@/lib/admin-service"
import type { Transaction } from "@/lib/types"

interface TransactionStats {
  totalTransactions: number
  totalRevenue: number
  averageTransaction: number
  todayTransactions: number
  pendingTransactions: number
  completedTransactions: number
  bulkSalesCount?: number
  cashTransactions?: number
  cardTransactions?: number
  mobileTransactions?: number
}

interface BulkSaleData {
  id: string
  customerName: string
  totalAmount: number
  itemCount: number
  discountPercentage: number
  createdAt: Date
  status: "pending" | "approved" | "completed" | "cancelled"
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [bulkSales, setBulkSales] = useState<BulkSaleData[]>([])
  const [stats, setStats] = useState<TransactionStats>({
    totalTransactions: 0,
    totalRevenue: 0,
    averageTransaction: 0,
    todayTransactions: 0,
    pendingTransactions: 0,
    completedTransactions: 0,
    bulkSalesCount: 0,
    cashTransactions: 0,
    cardTransactions: 0,
    mobileTransactions: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all")
  const [selectedPeriod, setSelectedPeriod] = useState("7d")
  const [viewMode, setViewMode] = useState<"all" | "bulk">("all")
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  useEffect(() => {
    loadTransactionData()
  }, [selectedPeriod, viewMode])

  const loadTransactionData = async () => {
    setIsLoading(true)
    try {
      if (viewMode === "bulk") {
        const bulkData = await AdminService.getBulkSalesData()
        setBulkSales(Array.isArray(bulkData) ? bulkData as BulkSaleData[] : [])
      } else {
        const transactionData = await ApiClient.get<Transaction[]>(`${API_ENDPOINTS.TRANSACTIONS}?period=${selectedPeriod}`)
        setTransactions(Array.isArray(transactionData) ? transactionData : [])
      }

      // Calculate stats
      calculateStats()
    } catch (error) {
      console.error("Failed to load transaction data:", error)
      // Set empty arrays if API fails
      setTransactions([])
      setBulkSales([])
      setStats({
        totalTransactions: 0,
        totalRevenue: 0,
        averageTransaction: 0,
        todayTransactions: 0,
        pendingTransactions: 0,
        completedTransactions: 0
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = () => {
    // Calculate real stats based on loaded data
    const revenue = transactions.reduce((sum, t) => sum + t.total, 0)
    const avgTransaction = transactions.length > 0 ? revenue / transactions.length : 0
    const bulkCount = transactions.filter(t => t.isBulkSale).length
    
    // Calculate today's transactions
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayTransactions = transactions.filter(t => 
      new Date(t.createdAt) >= todayStart
    ).length
    
    // Calculate status counts
    const pendingCount = transactions.filter(t => t.status === 'pending').length
    const completedCount = transactions.filter(t => t.status === 'completed').length
    
    const paymentMethods = transactions.reduce((acc, t) => {
      acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    setStats({
      totalTransactions: transactions.length,
      totalRevenue: revenue,
      averageTransaction: avgTransaction,
      todayTransactions,
      pendingTransactions: pendingCount,
      completedTransactions: completedCount,
      bulkSalesCount: bulkCount,
      cashTransactions: paymentMethods.cash || 0,
      cardTransactions: paymentMethods.card || 0,
      mobileTransactions: paymentMethods.mobile || 0
    })
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || transaction.status === selectedStatus
    const matchesPayment = selectedPaymentMethod === "all" || transaction.paymentMethod === selectedPaymentMethod
    return matchesSearch && matchesStatus && matchesPayment
  })

  const filteredBulkSales = bulkSales.filter(bulk => {
    const matchesSearch = bulk.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bulk.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || bulk.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const viewReceipt = async (transactionId: string) => {
    try {
      const transaction = transactions.find(t => t.id === transactionId)
      if (transaction) {
        setSelectedTransaction(transaction)
        setIsReceiptDialogOpen(true)
      }
    } catch (error) {
      console.error("Failed to load receipt:", error)
    }
  }

  const exportTransactions = () => {
    console.log("Exporting transactions:", viewMode, selectedPeriod)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default"
      case "pending": return "secondary"
      case "cancelled": return "destructive"
      case "approved": return "outline"
      default: return "secondary"
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cash": return "💰"
      case "card": return "💳"
      case "mobile": return "📱"
      default: return "💰"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transaction Management</h2>
          <p className="text-muted-foreground">Monitor sales transactions and bulk sales operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadTransactionData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportTransactions}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">completed sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">in selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageTransaction)}</div>
            <p className="text-xs text-muted-foreground">per sale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bulk Sales</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bulkSalesCount}</div>
            <p className="text-xs text-muted-foreground">large orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Payments</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cashTransactions}</div>
            <p className="text-xs text-muted-foreground">cash transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Card Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cardTransactions}</div>
            <p className="text-xs text-muted-foreground">card transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mobile Payments</CardTitle>
            <span className="text-2xl">📱</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mobileTransactions}</div>
            <p className="text-xs text-muted-foreground">mobile transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Mode */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {viewMode === "bulk" ? "Bulk Sales Management" : "Transaction History"}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("all")}
              >
                All Transactions
              </Button>
              <Button
                variant={viewMode === "bulk" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("bulk")}
              >
                Bulk Sales
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={viewMode === "bulk" ? "Search bulk sales..." : "Search transactions..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 3 Months</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                {viewMode === "bulk" && <SelectItem value="approved">Approved</SelectItem>}
              </SelectContent>
            </Select>

            {viewMode === "all" && (
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {viewMode === "bulk" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bulk Sale ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBulkSales.map((bulk) => (
                  <TableRow key={bulk.id}>
                    <TableCell className="font-mono">{bulk.id}</TableCell>
                    <TableCell className="font-medium">{bulk.customerName}</TableCell>
                    <TableCell>{bulk.itemCount} items</TableCell>
                    <TableCell>{bulk.discountPercentage}%</TableCell>
                    <TableCell>{formatCurrency(bulk.totalAmount)}</TableCell>
                    <TableCell>{bulk.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(bulk.status)}>{bulk.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono">{transaction.id}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{transaction.items.length} items</span>
                        {transaction.isBulkSale && (
                          <Badge variant="outline" className="ml-2">Bulk</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{getPaymentMethodIcon(transaction.paymentMethod)}</span>
                        <span className="capitalize">{transaction.paymentMethod}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(transaction.total)}</TableCell>
                    <TableCell>{transaction.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => viewReceipt(transaction.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Receipt
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Transaction Receipt</DialogTitle>
            <DialogDescription>
              Receipt for transaction {selectedTransaction?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <h3 className="font-bold">Pharmacy POS System</h3>
                <p className="text-sm text-muted-foreground">Transaction Receipt</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="font-mono">{selectedTransaction.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{selectedTransaction.createdAt ? new Date(selectedTransaction.createdAt).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="capitalize">{selectedTransaction.paymentMethod}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Items:</h4>
                {selectedTransaction.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.quantity}x Product</span>
                    <span>{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedTransaction.subtotal)}</span>
                </div>
                {selectedTransaction.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(selectedTransaction.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedTransaction.total)}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReceiptDialogOpen(false)}>
              Close
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}