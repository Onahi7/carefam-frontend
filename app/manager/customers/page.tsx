"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  CreditCard,
  TrendingUp,
  Users,
  AlertCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AdminService } from "@/lib/admin-service"
import { AuthService } from "@/lib/auth"
import { formatCurrency } from "@/lib/utils"
import type { Customer } from "@/lib/types"

export default function ManagerCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [creditStatusFilter, setCreditStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [stats, setStats] = useState({
    total: 0,
    walkIn: 0,
    b2b: 0,
    institutional: 0,
    totalCredit: 0,
    overdue: 0
  })

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchTerm, creditStatusFilter, typeFilter])

  const loadCustomers = async () => {
    setIsLoading(true)
    try {
      const user = AuthService.getCurrentUser()
      if (!user?.outletId) return

      // Direct API for outlet customers (already filtered server-side)
      const outletCustomers = await AdminService.getCustomersByOutlet(user.outletId) as Customer[]

      setCustomers(outletCustomers || [])
      calculateStats(outletCustomers || [])
    } catch (error) {
      console.error("Failed to load customers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (customerList: Customer[]) => {
    const stats = {
      total: customerList.length,
      walkIn: customerList.filter(c => c.customerType === "walk_in").length,
      b2b: customerList.filter(c => c.customerType === "b2b").length,
      institutional: customerList.filter(c => c.customerType === "institutional").length,
      totalCredit: customerList.reduce((sum, c) => sum + (c.currentCreditBalance || 0), 0),
      overdue: customerList.filter(c => c.creditStatus === "overdue").length
    }
    setStats(stats)
  }

  const filterCustomers = () => {
    let filtered = [...customers]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.phone && customer.phone.includes(searchTerm))
      )
    }

    // Credit status filter
    if (creditStatusFilter !== "all") {
      filtered = filtered.filter(customer => customer.creditStatus === creditStatusFilter)
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(customer => customer.customerType === typeFilter)
    }

    setFilteredCustomers(filtered)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "walk_in": return "bg-blue-100 text-blue-800"
      case "b2b": return "bg-green-100 text-green-800"
      case "institutional": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCreditStatusColor = (status: Customer["creditStatus"]) => {
    switch (status) {
      case "good": return "bg-green-100 text-green-800"
      case "overdue": return "bg-red-100 text-red-800"
      case "suspended": return "bg-orange-100 text-orange-800"
      case "blocked": return "bg-gray-200 text-gray-800"
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
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-5 bg-muted rounded w-24"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
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
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Customers</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">B2B Customers</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-green-600">{stats.b2b}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Credit</span>
            </div>
            <div className="text-2xl font-bold mt-1">{formatCurrency(stats.totalCredit)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Overdue</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>Manage your outlet customers and their accounts</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="walk_in">Walk-in</SelectItem>
                <SelectItem value="b2b">B2B</SelectItem>
                <SelectItem value="institutional">Institutional</SelectItem>
              </SelectContent>
            </Select>
            <Select value={creditStatusFilter} onValueChange={setCreditStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Credit Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Credit Status</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Customer List */}
          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">Customer List</TabsTrigger>
              <TabsTrigger value="credit">Credit Accounts</TabsTrigger>
              <TabsTrigger value="overdue">Overdue Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No customers found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">{customer.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>{customer.email}</span>
                            <Phone className="h-3 w-3 ml-2" />
                            <span>{customer.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getTypeColor(customer.customerType)}>
                              {customer.customerType.replace('_', ' ')}
                            </Badge>
                            <Badge className={getCreditStatusColor(customer.creditStatus)}>
                              {customer.creditStatus.replace('_',' ')}
                            </Badge>
                            {customer.currentCreditBalance > 0 && (
                              <Badge variant={customer.creditStatus === "overdue" ? "destructive" : "secondary"}>
                                {customer.creditStatus === "overdue" ? "Overdue" : "Credit"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        {customer.currentCreditBalance > 0 && (
                          <div className="text-center">
                            <p className="text-sm font-medium">{formatCurrency(customer.currentCreditBalance)}</p>
                            <p className="text-xs text-muted-foreground">Credit</p>
                          </div>
                        )}
                        <div className="text-center">
                          <p className="text-sm font-medium">{customer.totalPurchases || 0}</p>
                          <p className="text-xs text-muted-foreground">Orders</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{formatCurrency(customer.lifetimeValue || 0)}</p>
                          <p className="text-xs text-muted-foreground">Lifetime Value</p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Customer</DropdownMenuItem>
                            <DropdownMenuItem>View Orders</DropdownMenuItem>
                            <DropdownMenuItem>Payment History</DropdownMenuItem>
                            {customer.customerType !== "walk_in" && (
                              <DropdownMenuItem>Credit Management</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="credit" className="space-y-4">
              {filteredCustomers.filter(c => (c.currentCreditBalance || 0) > 0).map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-medium">{customer.name}</h4>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                      <Badge className={getTypeColor(customer.customerType)}>
                        {customer.customerType.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium">{formatCurrency(customer.currentCreditBalance || 0)}</p>
                      <p className="text-xs text-muted-foreground">Current Credit</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{formatCurrency(customer.creditLimit || 0)}</p>
                      <p className="text-xs text-muted-foreground">Credit Limit</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage Credit
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="overdue" className="space-y-4">
              {filteredCustomers.filter(c => c.creditStatus === "overdue").map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center space-x-4">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <h4 className="font-medium">{customer.name}</h4>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                      <p className="text-xs text-red-600">
                        Last purchase: {customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-red-600">{formatCurrency(customer.currentCreditBalance || 0)}</p>
                      <p className="text-xs text-muted-foreground">Overdue Amount</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Send Reminder
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