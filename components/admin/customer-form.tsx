"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AdminService } from "@/lib/admin-service"
import { useToast } from "@/hooks/use-toast"

interface Customer {
  _id: string
  name: string
  email?: string
  phone?: string
  customerType: "walk_in" | "b2b" | "institutional"
  businessName?: string
  businessRegistrationNumber?: string
  taxIdentificationNumber?: string
  address?: {
    street?: string
    city?: string
    region?: string
    postalCode?: string
    country?: string
  }
  contactPerson?: string
  contactPersonPhone?: string
  preferredPaymentMethods?: string[]
  creditLimit: number
  creditTermDays: number
  isWholesaleCustomer: boolean
  discountPercentage: number
  assignedOutlet?: {
    _id: string
    name: string
    location: string
  } | string
  notes?: string
}

interface Outlet {
  _id: string
  name: string
  location: string
}

interface CustomerFormProps {
  customer?: Customer | null
  onSave: () => void
  onCancel: () => void
}

export function CustomerForm({ customer, onSave, onCancel }: CustomerFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [outlets, setOutlets] = useState<Outlet[]>([])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    customerType: "walk_in" as "walk_in" | "b2b" | "institutional",
    businessName: "",
    businessRegistrationNumber: "",
    taxIdentificationNumber: "",
    address: {
      street: "",
      city: "",
      region: "",
      postalCode: "",
      country: ""
    },
    contactPerson: "",
    contactPersonPhone: "",
    preferredPaymentMethods: [] as string[],
    creditLimit: 0,
    creditTermDays: 30,
    isWholesaleCustomer: false,
    discountPercentage: 0,
    assignedOutlet: "",
    notes: ""
  })

  const paymentMethods = [
    { value: "cash", label: "Cash" },
    { value: "afrimoney", label: "AfriMoney" },
    { value: "mobile_money", label: "Mobile Money" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "credit", label: "Credit" },
    { value: "cheque", label: "Cheque" }
  ]

  useEffect(() => {
    fetchOutlets()
    if (customer) {
      setFormData({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        customerType: customer.customerType || "walk_in",
        businessName: customer.businessName || "",
        businessRegistrationNumber: customer.businessRegistrationNumber || "",
        taxIdentificationNumber: customer.taxIdentificationNumber || "",
        address: {
          street: customer.address?.street || "",
          city: customer.address?.city || "",
          region: customer.address?.region || "",
          postalCode: customer.address?.postalCode || "",
          country: customer.address?.country || ""
        },
        contactPerson: customer.contactPerson || "",
        contactPersonPhone: customer.contactPersonPhone || "",
        preferredPaymentMethods: customer.preferredPaymentMethods || [],
        creditLimit: customer.creditLimit || 0,
        creditTermDays: customer.creditTermDays || 30,
        isWholesaleCustomer: customer.isWholesaleCustomer || false,
        discountPercentage: customer.discountPercentage || 0,
        assignedOutlet: typeof customer.assignedOutlet === 'string' 
          ? customer.assignedOutlet 
          : customer.assignedOutlet?._id || "",
        notes: customer.notes || ""
      })
    }
  }, [customer])

  const fetchOutlets = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/outlets", {
        headers: AdminService.getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setOutlets(data)
      }
    } catch (error) {
      console.error("Error fetching outlets:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = customer 
        ? `http://localhost:3001/api/customers/${customer._id}`
        : "http://localhost:3001/api/customers"
      
      const method = customer ? "PATCH" : "POST"

      // Clean up the form data
      const submitData = {
        ...formData,
        assignedOutlet: formData.assignedOutlet || undefined,
        address: Object.values(formData.address).some(value => value) ? formData.address : undefined
      }

      const response = await fetch(url, {
        method,
        headers: {
          ...AdminService.getAuthHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to save customer")
      }

      toast({
        title: "Success",
        description: `Customer ${customer ? "updated" : "created"} successfully.`
      })

      onSave()
    } catch (error) {
      console.error("Error saving customer:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save customer",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentMethodChange = (method: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        preferredPaymentMethods: [...formData.preferredPaymentMethods, method]
      })
    } else {
      setFormData({
        ...formData,
        preferredPaymentMethods: formData.preferredPaymentMethods.filter(m => m !== method)
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Customer identification and contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Customer Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="customerType">Customer Type *</Label>
              <Select 
                value={formData.customerType} 
                onValueChange={(value: "walk_in" | "b2b" | "institutional") => 
                  setFormData({ ...formData, customerType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk_in">Walk-in Customer</SelectItem>
                  <SelectItem value="b2b">B2B Customer</SelectItem>
                  <SelectItem value="institutional">Institutional Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information (for B2B customers) */}
      {(formData.customerType === "b2b" || formData.customerType === "institutional") && (
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Business details and registration information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  required={formData.customerType === "b2b" || formData.customerType === "institutional"}
                />
              </div>
              <div>
                <Label htmlFor="businessRegistrationNumber">Registration Number *</Label>
                <Input
                  id="businessRegistrationNumber"
                  value={formData.businessRegistrationNumber}
                  onChange={(e) => setFormData({ ...formData, businessRegistrationNumber: e.target.value })}
                  required={formData.customerType === "b2b" || formData.customerType === "institutional"}
                />
              </div>
              <div>
                <Label htmlFor="taxIdentificationNumber">Tax ID Number</Label>
                <Input
                  id="taxIdentificationNumber"
                  value={formData.taxIdentificationNumber}
                  onChange={(e) => setFormData({ ...formData, taxIdentificationNumber: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contactPersonPhone">Contact Person Phone</Label>
                <Input
                  id="contactPersonPhone"
                  value={formData.contactPersonPhone}
                  onChange={(e) => setFormData({ ...formData, contactPersonPhone: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
          <CardDescription>
            Customer address for delivery and correspondence
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={formData.address.street}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, street: e.target.value }
                })}
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.address.city}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, city: e.target.value }
                })}
              />
            </div>
            <div>
              <Label htmlFor="region">Region/State</Label>
              <Input
                id="region"
                value={formData.address.region}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, region: e.target.value }
                })}
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.address.postalCode}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, postalCode: e.target.value }
                })}
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.address.country}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, country: e.target.value }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit and Pricing (for B2B customers) */}
      {formData.customerType === "b2b" && (
        <Card>
          <CardHeader>
            <CardTitle>Credit and Pricing</CardTitle>
            <CardDescription>
              Credit limits, payment terms, and pricing information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="creditLimit">Credit Limit</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="creditTermDays">Credit Terms (Days)</Label>
                <Input
                  id="creditTermDays"
                  type="number"
                  min="7"
                  max="365"
                  value={formData.creditTermDays}
                  onChange={(e) => setFormData({ ...formData, creditTermDays: parseInt(e.target.value) || 30 })}
                />
              </div>
              <div>
                <Label htmlFor="discountPercentage">Discount Percentage</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isWholesaleCustomer"
                checked={formData.isWholesaleCustomer}
                onCheckedChange={(checked) => setFormData({ ...formData, isWholesaleCustomer: checked as boolean })}
              />
              <Label htmlFor="isWholesaleCustomer">Wholesale Customer</Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Preferred payment methods for this customer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {paymentMethods.map((method) => (
              <div key={method.value} className="flex items-center space-x-2">
                <Checkbox
                  id={method.value}
                  checked={formData.preferredPaymentMethods.includes(method.value)}
                  onCheckedChange={(checked) => handlePaymentMethodChange(method.value, checked as boolean)}
                />
                <Label htmlFor={method.value}>{method.label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>
            Outlet assignment and notes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="assignedOutlet">Assigned Outlet</Label>
            <Select 
              value={formData.assignedOutlet} 
              onValueChange={(value) => setFormData({ ...formData, assignedOutlet: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select outlet (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No specific outlet</SelectItem>
                {outlets.map((outlet) => (
                  <SelectItem key={outlet._id} value={outlet._id}>
                    {outlet.name} - {outlet.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about this customer..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : customer ? "Update Customer" : "Create Customer"}
        </Button>
      </div>
    </form>
  )
}