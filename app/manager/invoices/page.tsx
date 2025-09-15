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
  FileText,
  Eye,
  Edit,
  Download,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  User
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
import type { Invoice } from "@/lib/types"

export default function ManagerInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    paid: 0,
    overdue: 0,
    totalAmount: 0,
    outstandingAmount: 0
  })

  useEffect(() => {
    loadInvoices()
  }, [])

  useEffect(() => {
    filterInvoices()
  }, [invoices, searchTerm, statusFilter, typeFilter])

  const loadInvoices = async () => {
    setIsLoading(true)
    try {
      const user = AuthService.getCurrentUser()
      if (!user?.outletId) return

      // Fetch invoices already scoped by outlet (server should filter)
      const outletInvoices = await AdminService.getInvoicesByOutlet(user.outletId) as Invoice[]
      setInvoices(outletInvoices || [])
      calculateStats(outletInvoices || [])
    } catch (error) {
      console.error("Failed to load invoices:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (invoiceList: Invoice[]) => {
    const stats = {
      total: invoiceList.length,
      pending: invoiceList.filter(i => i.status === "pending").length,
      approved: invoiceList.filter(i => i.status === "approved").length,
      paid: invoiceList.filter(i => i.status === "paid").length,
      overdue: invoiceList.filter(i => 
        i.status === "approved" && 
        i.dueDate && 
        new Date(i.dueDate) < new Date()
      ).length,
      totalAmount: invoiceList.reduce((sum, i) => sum + i.totalAmount, 0),
      outstandingAmount: invoiceList
        .filter(i => i.status === "approved" || i.status === "pending")
        .reduce((sum, i) => sum + i.totalAmount, 0)
    }
    setStats(stats)
  }

  const filterInvoices = () => {
    let filtered = [...invoices]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(term) ||
        invoice.customer?.name.toLowerCase().includes(term)
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(invoice => invoice.status === statusFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(invoice => invoice.invoiceType === typeFilter)
    }

    setFilteredInvoices(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "approved": return "bg-blue-100 text-blue-800"
      case "paid": return "bg-green-100 text-green-800"
      case "cancelled": return "bg-red-100 text-red-800"
      case "overdue": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "proforma": return "bg-purple-100 text-purple-800"
      case "invoice": return "bg-blue-100 text-blue-800"
      case "credit_note": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />
      case "approved": return <CheckCircle className="h-4 w-4" />
      case "paid": return <CheckCircle className="h-4 w-4" />
      case "overdue": return <AlertCircle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const isOverdue = (invoice: Invoice) => {
    return invoice.status === "approved" && 
           invoice.dueDate && 
           new Date(invoice.dueDate) < new Date()
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
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Invoices</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Pending Approval</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Total Amount</span>
            </div>
            <div className="text-2xl font-bold mt-1">{formatCurrency(stats.totalAmount)}</div>
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
              <CardTitle>Invoice Management</CardTitle>
              <CardDescription>Manage your outlet's invoices and billing</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
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
                  placeholder="Search invoices..."
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
                <SelectItem value="proforma">Proforma</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="credit_note">Credit Note</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invoice Tabs */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Invoices</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="overdue">Overdue ({stats.overdue})</TabsTrigger>
              <TabsTrigger value="paid">Paid ({stats.paid})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No invoices found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredInvoices.map((invoice) => (
                    <div key={invoice.id} className={`flex items-center justify-between p-4 border rounded-lg ${
                      isOverdue(invoice) ? "border-red-200 bg-red-50" : ""
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(isOverdue(invoice) ? "overdue" : invoice.status)}
                          <div>
                            <h4 className="font-medium">{invoice.invoiceNumber}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>{invoice.customer?.name}</span>
                              <Calendar className="h-3 w-3 ml-2" />
                              <span>{new Date(invoice.issueDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getTypeColor(invoice.invoiceType)}>
                                {invoice.invoiceType.replace('_', ' ')}
                              </Badge>
                              <Badge className={getStatusColor(isOverdue(invoice) ? "overdue" : invoice.status)}>
                                {isOverdue(invoice) ? "Overdue" : invoice.status}
                              </Badge>
                              {invoice.dueDate && (
                                <span className="text-xs text-muted-foreground">
                                  Due: {new Date(invoice.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm font-medium">{formatCurrency(invoice.totalAmount)}</p>
                          <p className="text-xs text-muted-foreground">Amount</p>
                        </div>
                        {invoice.amountPaid && invoice.amountPaid > 0 && (
                          <div className="text-center">
                            <p className="text-sm font-medium text-green-600">{formatCurrency(invoice.amountPaid)}</p>
                            <p className="text-xs text-muted-foreground">Paid</p>
                          </div>
                        )}
                        <div className="text-center">
                          <p className="text-sm font-medium">{formatCurrency(invoice.amountDue)}</p>
                          <p className="text-xs text-muted-foreground">Balance</p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            {invoice.status === "pending" && (
                              <DropdownMenuItem>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Invoice
                              </DropdownMenuItem>
                            )}
                            {invoice.status === "approved" && (
                              <DropdownMenuItem>
                                <Send className="h-4 w-4 mr-2" />
                                Send to Customer
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

            <TabsContent value="pending" className="space-y-3">
              {filteredInvoices.filter(i => i.status === "pending").map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                  <div className="flex items-center space-x-4">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <div>
                      <h4 className="font-medium">{invoice.invoiceNumber}</h4>
                      <p className="text-sm text-muted-foreground">{invoice.customer?.name}</p>
                      <p className="text-xs text-yellow-600">Created: {new Date(invoice.issueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium">{formatCurrency(invoice.totalAmount)}</p>
                      <p className="text-xs text-muted-foreground">Amount</p>
                    </div>
                    <Button size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="overdue" className="space-y-3">
              {filteredInvoices.filter(i => isOverdue(i)).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center space-x-4">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <h4 className="font-medium">{invoice.invoiceNumber}</h4>
                      <p className="text-sm text-muted-foreground">{invoice.customer?.name}</p>
                      <p className="text-xs text-red-600">
                        Overdue since: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-red-600">{formatCurrency(invoice.totalAmount)}</p>
                      <p className="text-xs text-muted-foreground">Overdue Amount</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Send Reminder
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="paid" className="space-y-3">
              {filteredInvoices.filter(i => i.status === "paid").map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-center space-x-4">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">{invoice.invoiceNumber}</h4>
                      <p className="text-sm text-muted-foreground">{invoice.customer?.name}</p>
                      <p className="text-xs text-green-600">Paid: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-green-600">{formatCurrency(invoice.amountPaid)}</p>
                      <p className="text-xs text-muted-foreground">Paid Total</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Receipt
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