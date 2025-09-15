"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Filter, 
  ShoppingCart,
  Eye,
  Download,
  RefreshCw,
  CreditCard,
  Smartphone,
  Banknote,
  Calendar,
  User,
  Package,
  TrendingUp,
  Clock
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AuthService } from "@/lib/auth"
import { formatCurrency } from "@/lib/utils"

interface Transaction {
  id: string
  transactionId: string
  customerId?: string
  customerName: string
  customerType: "walk_in" | "b2b" | "institutional"
  items: Array<{
    productId: string
    productName: string
    category: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  paymentMethod: "cash" | "card" | "mobile_money" | "bank_transfer" | "credit"
  paymentStatus: "completed" | "pending" | "failed" | "refunded"
  transactionDate: string
  cashierName: string
  outletId: string
  notes?: string
}

interface TransactionStats {
  totalTransactions: number
  totalRevenue: number
  averageTransaction: number
  cashTransactions: number
  cardTransactions: number
  mobileMoneyTransactions: number
  todayTransactions: number
  todayRevenue: number
}

export default function ManagerTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [stats, setStats] = useState<TransactionStats>({
    totalTransactions: 0,
    totalRevenue: 0,
    averageTransaction: 0,
    cashTransactions: 0,
    cardTransactions: 0,
    mobileMoneyTransactions: 0,
    todayTransactions: 0,
    todayRevenue: 0
  })

  useEffect(() => {
    loadTransactions()
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm, paymentMethodFilter, dateFilter])

  const loadTransactions = async () => {
    setIsLoading(true)
    try {
      const user = AuthService.getCurrentUser()
      if (!user?.outletId) return

      // Mock data for now - replace with actual API call
      const mockTransactions: Transaction[] = [
        {
          id: "1",
          transactionId: "TXN-2024-001",
          customerName: "John Doe",
          customerType: "walk_in",
          items: [
            {
              productId: "1",
              productName: "Paracetamol 500mg",
              category: "Medicine",
              quantity: 2,
              unitPrice: 2.50,
              totalPrice: 5.00
            }
          ],
          subtotal: 5.00,
          taxAmount: 0.75,
          discountAmount: 0.00,
          totalAmount: 5.75,
          paymentMethod: "cash",
          paymentStatus: "completed",
          transactionDate: new Date().toISOString(),
          cashierName: "Sarah Johnson",
          outletId: user.outletId,
          notes: ""
        },
        {
          id: "2",
          transactionId: "TXN-2024-002",
          customerId: "cust_1",
          customerName: "Healthcare Plus Ltd",
          customerType: "b2b",
          items: [
            {
              productId: "2",
              productName: "Vitamin C 1000mg",
              category: "Supplements",
              quantity: 50,
              unitPrice: 15.00,
              totalPrice: 750.00
            }
          ],
          subtotal: 750.00,
          taxAmount: 112.50,
          discountAmount: 37.50,
          totalAmount: 825.00,
          paymentMethod: "bank_transfer",
          paymentStatus: "completed",
          transactionDate: new Date(Date.now() - 86400000).toISOString(),
          cashierName: "Michael Chen",
          outletId: user.outletId
        }
      ]

      // Filter transactions for this outlet
      const outletTransactions = mockTransactions.filter(t => t.outletId === user.outletId)
      
      setTransactions(outletTransactions)
      calculateStats(outletTransactions)
    } catch (error) {
      console.error("Failed to load transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (transactionList: Transaction[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayTransactions = transactionList.filter(t => 
      new Date(t.transactionDate) >= today
    )

    const stats: TransactionStats = {
      totalTransactions: transactionList.length,
      totalRevenue: transactionList.reduce((sum, t) => sum + t.totalAmount, 0),
      averageTransaction: transactionList.length > 0 
        ? transactionList.reduce((sum, t) => sum + t.totalAmount, 0) / transactionList.length 
        : 0,
      cashTransactions: transactionList.filter(t => t.paymentMethod === "cash").length,
      cardTransactions: transactionList.filter(t => t.paymentMethod === "card").length,
      mobileMoneyTransactions: transactionList.filter(t => t.paymentMethod === "mobile_money").length,
      todayTransactions: todayTransactions.length,
      todayRevenue: todayTransactions.reduce((sum, t) => sum + t.totalAmount, 0)
    }
    
    setStats(stats)
  }

  const filterTransactions = () => {
    let filtered = [...transactions]

    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.cashierName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (paymentMethodFilter !== "all") {
      filtered = filtered.filter(transaction => transaction.paymentMethod === paymentMethodFilter)
    }

    if (dateFilter !== "all") {
      const now = new Date()
      let startDate = new Date()

      switch (dateFilter) {
        case "today":
          startDate.setHours(0, 0, 0, 0)
          break
        case "week":
          startDate.setDate(now.getDate() - 7)
          break
        case "month":
          startDate.setMonth(now.getMonth() - 1)
          break
      }

      filtered = filtered.filter(transaction => 
        new Date(transaction.transactionDate) >= startDate
      )
    }

    setFilteredTransactions(filtered)
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cash": return <Banknote className="h-4 w-4" />
      case "card": return <CreditCard className="h-4 w-4" />
      case "mobile_money": return <Smartphone className="h-4 w-4" />
      case "bank_transfer": return <CreditCard className="h-4 w-4" />
      case "credit": return <Clock className="h-4 w-4" />
      default: return <CreditCard className="h-4 w-4" />
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "cash": return "bg-green-100 text-green-800"
      case "card": return "bg-blue-100 text-blue-800"
      case "mobile_money": return "bg-purple-100 text-purple-800"
      case "bank_transfer": return "bg-indigo-100 text-indigo-800"
      case "credit": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case "walk_in": return "bg-blue-100 text-blue-800"
      case "b2b": return "bg-green-100 text-green-800"
      case "institutional": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Sales</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Total Revenue</span>
            </div>
            <div className="text-2xl font-bold mt-1">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Today's Sales</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.todayTransactions}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(stats.todayRevenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Avg Transaction</span>
            </div>
            <div className="text-2xl font-bold mt-1">{formatCurrency(stats.averageTransaction)}</div>
            <p className="text-xs text-muted-foreground">Per sale</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sales & Transactions</CardTitle>
              <CardDescription>View and manage your outlet's transaction history</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadTransactions}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
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
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transaction Tabs */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="cash">Cash Sales</TabsTrigger>
              <TabsTrigger value="credit">Credit Sales</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No transactions found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getPaymentMethodIcon(transaction.paymentMethod)}
                          <div>
                            <h4 className="font-medium">{transaction.transactionId}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>{transaction.customerName}</span>
                              <Calendar className="h-3 w-3 ml-2" />
                              <span>{new Date(transaction.transactionDate).toLocaleDateString()}</span>
                              <span className="ml-2">by {transaction.cashierName}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getPaymentMethodColor(transaction.paymentMethod)}>
                                {transaction.paymentMethod.replace('_', ' ')}
                              </Badge>
                              <Badge className={getCustomerTypeColor(transaction.customerType)}>
                                {transaction.customerType.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {transaction.items.length} item{transaction.items.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm font-medium">{formatCurrency(transaction.subtotal)}</p>
                          <p className="text-xs text-muted-foreground">Subtotal</p>
                        </div>
                        {transaction.taxAmount > 0 && (
                          <div className="text-center">
                            <p className="text-sm font-medium">{formatCurrency(transaction.taxAmount)}</p>
                            <p className="text-xs text-muted-foreground">Tax</p>
                          </div>
                        )}
                        <div className="text-center">
                          <p className="text-sm font-medium">{formatCurrency(transaction.totalAmount)}</p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Print Receipt
                            </DropdownMenuItem>
                            {transaction.paymentMethod === "credit" && (
                              <DropdownMenuItem>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Payment History
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="today" className="space-y-3">
              {filteredTransactions.filter(t => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                return new Date(t.transactionDate) >= today
              }).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-medium">{transaction.transactionId}</h4>
                      <p className="text-sm text-muted-foreground">{transaction.customerName}</p>
                      <Badge className={getPaymentMethodColor(transaction.paymentMethod)}>
                        {transaction.paymentMethod.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium">{formatCurrency(transaction.totalAmount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.transactionDate).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="cash" className="space-y-3">
              {filteredTransactions.filter(t => t.paymentMethod === "cash").map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-center space-x-4">
                    <Banknote className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">{transaction.transactionId}</h4>
                      <p className="text-sm text-muted-foreground">{transaction.customerName}</p>
                      <p className="text-xs text-green-600">
                        {new Date(transaction.transactionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-green-600">{formatCurrency(transaction.totalAmount)}</p>
                      <p className="text-xs text-muted-foreground">Cash Payment</p>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="credit" className="space-y-3">
              {filteredTransactions.filter(t => t.paymentMethod === "credit").map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50">
                  <div className="flex items-center space-x-4">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <div>
                      <h4 className="font-medium">{transaction.transactionId}</h4>
                      <p className="text-sm text-muted-foreground">{transaction.customerName}</p>
                      <p className="text-xs text-orange-600">
                        Credit Sale - {new Date(transaction.transactionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-orange-600">{formatCurrency(transaction.totalAmount)}</p>
                      <p className="text-xs text-muted-foreground">Outstanding</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Collect Payment
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