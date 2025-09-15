"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, UserPlus, Shield, User, Edit, Trash2, Eye, EyeOff, Copy, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AdminService } from "@/lib/admin-service"

interface User {
  _id: string
  firstName: string
  lastName: string
  username: string
  email: string
  role: 'admin' | 'manager' | 'cashier'
  outletId?: string
  outletName?: string
  isActive: boolean
  lastLogin?: string
  createdAt: string
}

interface UserOutlet {
  _id: string
  name: string
  address: string
  city?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [outlets, setOutlets] = useState<UserOutlet[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOutlet, setSelectedOutlet] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)
  const [generatedCredentials, setGeneratedCredentials] = useState<{username: string, password: string} | null>(null)
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "cashier" as const,
    outletId: ""
  })
  const { toast } = useToast()

  const generateCredentials = () => {
    const username = `${newUser.firstName.toLowerCase()}.${newUser.lastName.toLowerCase()}`.replace(/\s+/g, '')
    const password = Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 100)
    return { username, password }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersData, outletsData] = await Promise.all([
        AdminService.getUsers(),
        AdminService.getOutlets()
      ])
      setUsers(Array.isArray(usersData) ? usersData : [])
      // Map Outlet[] to UserOutlet[] to match the expected interface
      const mappedOutlets = Array.isArray(outletsData) ? outletsData.map(outlet => ({
        _id: outlet.id,
        name: outlet.name,
        address: outlet.address,
        city: undefined // Outlet interface doesn't have city, but UserOutlet expects it as optional
      })) : []
      setOutlets(mappedOutlets)
    } catch (error) {
      console.error('Error loading data:', error)
      setUsers([])
      setOutlets([])
      toast({
        title: "Error",
        description: "Failed to load users and outlets",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateUser = async () => {
    try {
      if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.outletId) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        })
        return
      }

      const credentials = generateCredentials()
      
      const userData = {
        ...newUser,
        username: credentials.username,
        password: credentials.password
      }

      await AdminService.createUser(userData)
      setGeneratedCredentials(credentials)
      setShowCredentials(true)
      setShowAddDialog(false)
      
      // Reset form
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        role: "cashier",
        outletId: ""
      })
      
      // Reload users
      await loadData()
      
      toast({
        title: "Success",
        description: "User created successfully",
      })
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      })
    }
  }

  const handleToggleUser = async (userId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await AdminService.deactivateUser(userId)
        toast({
          title: "Success",
          description: "User deactivated successfully",
        })
      } else {
        await AdminService.updateUser(userId, { isActive: true })
        toast({
          title: "Success",
          description: "User activated successfully",
        })
      }
      await loadData()
    } catch (error) {
      console.error('Error toggling user:', error)
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Credentials copied to clipboard",
    })
  }

  const filteredUsers = selectedOutlet === "all" 
    ? users 
    : users.filter(user => user.outletId === selectedOutlet)

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length,
    cashiers: users.filter(u => u.role === 'cashier').length,
    active: users.filter(u => u.isActive).length
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'cashier': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage system users and permissions</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with outlet assignment and role permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="john.doe@pharmacy.com"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={(value: any) => setNewUser({...newUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cashier">Cashier</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="outlet">Outlet</Label>
                <Select value={newUser.outletId} onValueChange={(value) => setNewUser({...newUser, outletId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select outlet" />
                  </SelectTrigger>
                  <SelectContent>
                    {outlets.map((outlet) => (
                      <SelectItem key={outlet._id} value={outlet._id}>
                        {outlet.name} - {outlet.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Outlet Filter */}
      <div className="flex items-center gap-4">
        <Label htmlFor="outletFilter">Filter by Outlet:</Label>
        <Select value={selectedOutlet} onValueChange={setSelectedOutlet}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outlets</SelectItem>
            {outlets.map((outlet) => (
              <SelectItem key={outlet._id} value={outlet._id}>
                {outlet.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">system users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
            <p className="text-xs text-muted-foreground">admin users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.managers}</div>
            <p className="text-xs text-muted-foreground">manager users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cashiers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cashiers}</div>
            <p className="text-xs text-muted-foreground">cashier users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">active accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users found</p>
              <p className="text-sm text-muted-foreground">
                {selectedOutlet === "all" ? "Add users to start managing the system" : "No users in selected outlet"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Outlet</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.outletName || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleUser(user._id, user.isActive)}
                        >
                          {user.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Credentials Dialog */}
      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              User Credentials Generated
            </DialogTitle>
            <DialogDescription>
              Please save these credentials. They will not be shown again.
            </DialogDescription>
          </DialogHeader>
          {generatedCredentials && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Username:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-background px-2 py-1 rounded text-sm">
                      {generatedCredentials.username}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedCredentials.username)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Password:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-background px-2 py-1 rounded text-sm">
                      {generatedCredentials.password}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedCredentials.password)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>• Share these credentials securely with the user</p>
                <p>• User should change password on first login</p>
                <p>• These credentials will not be displayed again</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowCredentials(false)}>
              I've Saved the Credentials
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}