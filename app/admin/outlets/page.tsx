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
  Building2, 
  Users, 
  TrendingUp, 
  Plus, 
  MapPin, 
  Phone, 
  User,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  DollarSign
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/utils"
import { AdminService } from "@/lib/admin-service"
import type { Outlet } from "@/lib/types"

interface OutletFormData {
  name: string
  address: string
  phone: string
  managerId: string
}

export default function OutletsPage() {
  const [outlets, setOutlets] = useState<Outlet[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<OutletFormData>({
    name: "",
    address: "",
    phone: "",
    managerId: ""
  })

  const [managers, setManagers] = useState([
    { id: "1", name: "John Smith", email: "john@pharmacy.com" },
    { id: "2", name: "Sarah Johnson", email: "sarah@pharmacy.com" },
    { id: "3", name: "Mike Wilson", email: "mike@pharmacy.com" }
  ])

  useEffect(() => {
    loadOutlets()
  }, [])

  const loadOutlets = async () => {
    try {
      const outletsData = await AdminService.getOutlets()
      setOutlets(Array.isArray(outletsData) ? outletsData : [])
    } catch (error) {
      console.error("Failed to load outlets:", error)
      // Set empty array if API fails
      setOutlets([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (editingOutlet) {
        // Update existing outlet
        const updatedOutlet = await AdminService.updateOutlet(editingOutlet.id, formData)
        setOutlets(outlets.map(outlet => 
          outlet.id === editingOutlet.id ? updatedOutlet : outlet
        ))
        setIsEditDialogOpen(false)
        setEditingOutlet(null)
      } else {
        // Create new outlet
        const newOutlet = await AdminService.createOutlet(formData)
        setOutlets([...outlets, newOutlet])
        setIsAddDialogOpen(false)
      }

      // Reset form
      setFormData({ name: "", address: "", phone: "", managerId: "" })
    } catch (error) {
      console.error("Failed to save outlet:", error)
      // Show error to user - you might want to add a toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (outlet: Outlet) => {
    setEditingOutlet(outlet)
    setFormData({
      name: outlet.name,
      address: outlet.address,
      phone: outlet.phone,
      managerId: outlet.managerId
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (outletId: string) => {
    if (!confirm("Are you sure you want to delete this outlet?")) return

    try {
      await AdminService.deleteOutlet(outletId)
      setOutlets(outlets.filter(outlet => outlet.id !== outletId))
    } catch (error) {
      console.error("Failed to delete outlet:", error)
      // Show error to user - you might want to add a toast notification here
    }
  }

  const getManagerName = (managerId: string) => {
    return managers.find(m => m.id === managerId)?.name || "Unassigned"
  }

  // TODO: Replace with real API data from outlet metrics
  const getOutletStats = (outletId: string) => ({
    dailySales: 2500,
    staffCount: 8,
    productCount: 350,
    monthlyRevenue: 25000
  })

  const OutletForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Outlet Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter outlet name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+232 22 123 456"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Enter complete address"
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="manager">Outlet Manager</Label>
        <Select value={formData.managerId} onValueChange={(value) => setFormData({ ...formData, managerId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a manager" />
          </SelectTrigger>
          <SelectContent>
            {managers.map((manager) => (
              <SelectItem key={manager.id} value={manager.id}>
                <div className="flex flex-col">
                  <span>{manager.name}</span>
                  <span className="text-sm text-muted-foreground">{manager.email}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsAddDialogOpen(false)
            setIsEditDialogOpen(false)
            setEditingOutlet(null)
            setFormData({ name: "", address: "", phone: "", managerId: "" })
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : editingOutlet ? "Update Outlet" : "Create Outlet"}
        </Button>
      </DialogFooter>
    </form>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Outlet Management</h2>
          <p className="text-muted-foreground">Manage pharmacy locations and performance</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Outlet
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Outlet</DialogTitle>
              <DialogDescription>
                Create a new pharmacy location in your network
              </DialogDescription>
            </DialogHeader>
            <OutletForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outlets</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outlets.length}</div>
            <p className="text-xs text-muted-foreground">active locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(outlets.reduce((sum, outlet) => sum + getOutletStats(outlet.id).monthlyRevenue, 0))}</div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outlets.reduce((sum, outlet) => sum + getOutletStats(outlet.id).staffCount, 0)}</div>
            <p className="text-xs text-muted-foreground">across all outlets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Daily Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {outlets.length > 0 
                ? formatCurrency(outlets.reduce((sum, outlet) => sum + getOutletStats(outlet.id).dailySales, 0) / outlets.length)
                : formatCurrency(0)
              }
            </div>
            <p className="text-xs text-muted-foreground">per outlet</p>
          </CardContent>
        </Card>
      </div>

      {/* Outlets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {outlets.map((outlet) => {
          const stats = getOutletStats(outlet.id)
          return (
            <Card key={outlet.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {outlet.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={outlet.isActive ? "default" : "secondary"}>
                      {outlet.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(outlet)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Outlet
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(outlet.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Outlet
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardDescription className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {outlet.address}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{outlet.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Manager: {getManagerName(outlet.managerId)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Created: {outlet.createdAt.toLocaleDateString()}</span>
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Daily Sales:</span>
                      <span className="font-medium">{formatCurrency(stats.dailySales)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Staff:</span>
                      <span className="font-medium">{stats.staffCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Products:</span>
                      <span className="font-medium">{stats.productCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Revenue:</span>
                      <span className="font-medium text-green-600">{formatCurrency(stats.monthlyRevenue)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Add New Outlet Card */}
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Button
              variant="ghost"
              size="lg"
              className="h-auto flex-col gap-4 text-muted-foreground hover:text-foreground"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Building2 className="h-12 w-12" />
              <div className="text-center">
                <p className="font-medium">Add New Outlet</p>
                <p className="text-sm">Expand your pharmacy network</p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Outlet</DialogTitle>
            <DialogDescription>
              Update outlet information and settings
            </DialogDescription>
          </DialogHeader>
          <OutletForm />
        </DialogContent>
      </Dialog>
    </div>
  )
}