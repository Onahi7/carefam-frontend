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
  Plus, 
  Search, 
  Filter, 
  User, 
  Building, 
  CreditCard,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  AlertTriangle
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { CustomerForm } from "./customer-form"
import { AdminService } from "@/lib/admin-service"

interface Customer {
  _id: string
  name: string
  email?: string
  phone?: string
  customerType: "walk_in" | "b2b" | "institutional"
  businessName?: string
  businessRegistrationNumber?: string
  creditLimit: number
  currentCreditBalance: number
  creditTermDays: number
  creditStatus: "good" | "overdue" | "suspended" | "blocked"
  isWholesaleCustomer: boolean
  discountPercentage: number
  totalPurchases: number
  lifetimeValue: number
  lastPurchaseDate?: string
  assignedOutlet?: {
    _id: string
    name: string
    location: string
  }
  isActive: boolean
  createdAt: string
}

interface CustomerFilters {
  customerType?: string
  creditStatus?: string
  assignedOutlet?: string
  search?: string
}

export function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [filters, setFilters] = useState<CustomerFilters>({})
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    fetchCustomers()
  }, [page, limit, filters])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      })

      const response = await fetch(`http://localhost:3001/api/customers?${params}`, {
        headers: AdminService.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error("Failed to fetch customers")
      }

      const data = await response.json()
      setCustomers(data.customers)
      setTotal(data.total)
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCustomer = () => {
    setSelectedCustomer(null)
    setShowCustomerForm(true)
  }

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowCustomerForm(true)
  }

  const handleCustomerSaved = () => {
    setShowCustomerForm(false)
    setSelectedCustomer(null)
    fetchCustomers()
  }

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case "b2b":
        return "bg-blue-100 text-blue-800"
      case "institutional":
        return "bg-purple-100 text-purple-800"
      case "walk_in":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCreditStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-100 text-green-800"
      case "overdue":
        return "bg-yellow-100 text-yellow-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      case "blocked":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCustomerType = (type: string) => {
    switch (type) {
      case "b2b":
        return "B2B"
      case "institutional":
        return "Institutional"
      case "walk_in":
        return "Walk-in"
      default:
        return type
    }
  }

  const formatCreditStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Customer Management</h3>
          <p className="text-muted-foreground">
            Manage walk-in, B2B, and institutional customers
          </p>
        </div>
        <Button onClick={handleCreateCustomer} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search customers..."
                value={filters.search || ""}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="flex items-center gap-2"
              />
            </div>
            <Select 
              value={filters.customerType || ""} 
              onValueChange={(value) => setFilters({ ...filters, customerType: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Customer Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="walk_in">Walk-in</SelectItem>
                <SelectItem value="b2b">B2B</SelectItem>
                <SelectItem value="institutional">Institutional</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={filters.creditStatus || ""} 
              onValueChange={(value) => setFilters({ ...filters, creditStatus: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Credit Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
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

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customers ({total})</CardTitle>
          <CardDescription>
            Manage your customer database and credit relationships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Credit Info</TableHead>
                <TableHead>Purchase History</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{customer.name}</div>
                      {customer.businessName && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {customer.businessName}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCustomerTypeColor(customer.customerType)}>
                      {formatCustomerType(customer.customerType)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {customer.phone && (
                        <div className="text-sm flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      )}
                      {customer.email && (
                        <div className="text-sm flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                      )}
                      {customer.assignedOutlet && (
                        <div className="text-sm flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {customer.assignedOutlet.name}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.customerType === "b2b" ? (
                      <div className="space-y-1">
                        <div className="text-sm">
                          Limit: {formatCurrency(customer.creditLimit)}
                        </div>
                        <div className="text-sm">
                          Balance: {formatCurrency(customer.currentCreditBalance)}
                        </div>
                        <Badge className={getCreditStatusColor(customer.creditStatus)}>
                          {formatCreditStatus(customer.creditStatus)}
                        </Badge>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Cash customer
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        Total: {formatCurrency(customer.lifetimeValue)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Orders: {customer.totalPurchases}
                      </div>
                      {customer.lastPurchaseDate && (
                        <div className="text-xs text-muted-foreground">
                          Last: {new Date(customer.lastPurchaseDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={customer.isActive ? "default" : "secondary"}>
                        {customer.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {customer.discountPercentage > 0 && (
                        <Badge variant="outline" className="text-green-600">
                          {customer.discountPercentage}% off
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCustomer(customer)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {customers.length === 0 && (
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No customers found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by adding your first customer.
              </p>
              <Button onClick={handleCreateCustomer} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Form Dialog */}
      <Dialog open={showCustomerForm} onOpenChange={setShowCustomerForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCustomer ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
            <DialogDescription>
              {selectedCustomer 
                ? "Update customer information and credit settings."
                : "Add a new customer to your database."
              }
            </DialogDescription>
          </DialogHeader>
          <CustomerForm
            customer={selectedCustomer}
            onSave={handleCustomerSaved}
            onCancel={() => setShowCustomerForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}