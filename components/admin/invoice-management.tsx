"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Eye,
  Edit,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { InvoiceForm } from "./invoice-form"
import { InvoiceDetails } from "./invoice-details"
import { AdminService } from "@/lib/admin-service"

interface Invoice {
  _id: string
  invoiceNumber: string
  invoiceType: "proforma" | "invoice" | "credit_note" | "debit_note"
  status: "draft" | "pending" | "approved" | "sent" | "paid" | "partially_paid" | "overdue" | "cancelled" | "void"
  customer: {
    _id: string
    name: string
    businessName?: string
    customerType: string
  }
  outlet: {
    _id: string
    name: string
    location: string
  }
  issueDate: string
  dueDate?: string
  subtotal: number
  totalTaxAmount: number
  totalAmount: number
  amountPaid: number
  amountDue: number
  isCreditSale: boolean
  createdBy: {
    name: string
    email: string
  }
  createdAt: string
}

interface InvoiceFilters {
  status?: string
  invoiceType?: string
  customer?: string
  outlet?: string
  startDate?: string
  endDate?: string
  search?: string
}

export function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [filters, setFilters] = useState<InvoiceFilters>({})
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  useEffect(() => {
    fetchInvoices()
  }, [page, limit, filters])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      })

      const response = await fetch(`http://localhost:3001/api/invoices?${params}`, {
        headers: AdminService.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error("Failed to fetch invoices")
      }

      const data = await response.json()
      setInvoices(data.invoices)
      setTotal(data.total)
    } catch (error) {
      console.error("Error fetching invoices:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInvoice = (type: "proforma" | "invoice") => {
    setSelectedInvoice(null)
    setFormMode("create")
    setShowInvoiceForm(true)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setFormMode("edit")
    setShowInvoiceForm(true)
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowInvoiceDetails(true)
  }

  const handleInvoiceSaved = () => {
    setShowInvoiceForm(false)
    setSelectedInvoice(null)
    fetchInvoices()
  }

  const getInvoiceTypeColor = (type: string) => {
    switch (type) {
      case "proforma":
        return "bg-blue-100 text-blue-800"
      case "invoice":
        return "bg-green-100 text-green-800"
      case "credit_note":
        return "bg-red-100 text-red-800"
      case "debit_note":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "cancelled":
      case "void":
        return "bg-gray-100 text-gray-800"
      case "draft":
        return "bg-gray-100 text-gray-600"
      case "partially_paid":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatInvoiceType = (type: string) => {
    switch (type) {
      case "proforma":
        return "Proforma"
      case "invoice":
        return "Invoice"
      case "credit_note":
        return "Credit Note"
      case "debit_note":
        return "Debit Note"
      default:
        return type
    }
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />
      case "pending":
      case "partially_paid":
        return <Clock className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading invoices...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Invoice Management</h3>
          <p className="text-muted-foreground">
            Create and manage proforma invoices, invoices, and credit notes
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => handleCreateInvoice("proforma")} 
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Proforma Invoice
          </Button>
          <Button 
            onClick={() => handleCreateInvoice("invoice")} 
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Invoice
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="Search invoices..."
                value={filters.search || ""}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <Select 
              value={filters.invoiceType || ""} 
              onValueChange={(value) => setFilters({ ...filters, invoiceType: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Invoice Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="proforma">Proforma</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="credit_note">Credit Note</SelectItem>
                <SelectItem value="debit_note">Debit Note</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={filters.status || ""} 
              onValueChange={(value) => setFilters({ ...filters, status: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <Input
                type="date"
                placeholder="Start Date"
                value={filters.startDate || ""}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setFilters({})}
              className="flex items-center gap-2"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices ({total})</CardTitle>
          <CardDescription>
            Manage your invoicing and billing operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice._id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        {invoice.outlet.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{invoice.customer.name}</div>
                      {invoice.customer.businessName && (
                        <div className="text-sm text-muted-foreground">
                          {invoice.customer.businessName}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getInvoiceTypeColor(invoice.invoiceType)}>
                      {formatInvoiceType(invoice.invoiceType)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </div>
                      {invoice.dueDate && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {formatCurrency(invoice.totalAmount)}
                      </div>
                      {invoice.totalTaxAmount > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Tax: {formatCurrency(invoice.totalTaxAmount)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {invoice.amountPaid > 0 && (
                        <div className="text-sm text-green-600">
                          Paid: {formatCurrency(invoice.amountPaid)}
                        </div>
                      )}
                      {invoice.amountDue > 0 && (
                        <div className="text-sm text-red-600">
                          Due: {formatCurrency(invoice.amountDue)}
                        </div>
                      )}
                      {invoice.isCreditSale && (
                        <Badge variant="outline" className="text-xs">
                          Credit
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(invoice.status)}
                      <Badge className={getStatusColor(invoice.status)}>
                        {formatStatus(invoice.status)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {invoice.status === "draft" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditInvoice(invoice)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {invoices.length === 0 && (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No invoices found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by creating your first invoice.
              </p>
              <div className="flex justify-center gap-2 mt-4">
                <Button 
                  variant="outline"
                  onClick={() => handleCreateInvoice("proforma")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Proforma Invoice
                </Button>
                <Button onClick={() => handleCreateInvoice("invoice")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Invoice
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Form Dialog */}
      <Dialog open={showInvoiceForm} onOpenChange={setShowInvoiceForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Create New Invoice" : "Edit Invoice"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "create" 
                ? "Create a new invoice or proforma invoice for your customer."
                : "Update the invoice information."
              }
            </DialogDescription>
          </DialogHeader>
          <InvoiceForm
            invoice={selectedInvoice}
            mode={formMode}
            onSave={handleInvoiceSaved}
            onCancel={() => setShowInvoiceForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Invoice Details Dialog */}
      <Dialog open={showInvoiceDetails} onOpenChange={setShowInvoiceDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              View and manage invoice information and payments
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <InvoiceDetails
              invoice={selectedInvoice}
              onUpdate={fetchInvoices}
              onClose={() => setShowInvoiceDetails(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}