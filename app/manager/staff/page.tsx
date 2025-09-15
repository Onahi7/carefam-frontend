"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  Plus, 
  Search, 
  Filter, 
  Users,
  UserPlus,
  Edit,
  MoreHorizontal,
  Clock,
  Calendar,
  Star,
  TrendingUp,
  Settings,
  Shield
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AuthService } from "@/lib/auth"
import { formatCurrency } from "@/lib/utils"

interface StaffMember {
  id: string
  name: string
  email: string
  phone: string
  role: "cashier" | "pharmacist" | "assistant"
  status: "active" | "inactive" | "on_leave"
  hireDate: string
  avatar?: string
  permissions: string[]
  performance: {
    hoursWorked: number
    targetHours: number
    salesMade: number
    customerRating: number
    efficiency: number
  }
  schedule: {
    mondayStart?: string
    mondayEnd?: string
    tuesdayStart?: string
    tuesdayEnd?: string
    wednesdayStart?: string
    wednesdayEnd?: string
    thursdayStart?: string
    thursdayEnd?: string
    fridayStart?: string
    fridayEnd?: string
    saturdayStart?: string
    saturdayEnd?: string
    sundayStart?: string
    sundayEnd?: string
  }
  lastActive: string
  outletId: string
}

interface StaffStats {
  totalStaff: number
  activeStaff: number
  onLeaveStaff: number
  averagePerformance: number
  totalHoursWorked: number
  newHiresThisMonth: number
}

export default function ManagerStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stats, setStats] = useState<StaffStats>({
    totalStaff: 0,
    activeStaff: 0,
    onLeaveStaff: 0,
    averagePerformance: 0,
    totalHoursWorked: 0,
    newHiresThisMonth: 0
  })

  useEffect(() => {
    loadStaff()
  }, [])

  useEffect(() => {
    filterStaff()
  }, [staff, searchTerm, roleFilter, statusFilter])

  const loadStaff = async () => {
    setIsLoading(true)
    try {
      const user = AuthService.getCurrentUser()
      if (!user?.outletId) return

      // Mock data for now - replace with actual API call
      const mockStaff: StaffMember[] = [
        {
          id: "1",
          name: "Sarah Johnson",
          email: "sarah.j@pharmacy.com",
          phone: "+1234567890",
          role: "cashier",
          status: "active",
          hireDate: "2023-06-15",
          permissions: ["pos_access", "customer_management"],
          performance: {
            hoursWorked: 38,
            targetHours: 40,
            salesMade: 156,
            customerRating: 4.8,
            efficiency: 95
          },
          schedule: {
            mondayStart: "08:00",
            mondayEnd: "16:00",
            tuesdayStart: "08:00",
            tuesdayEnd: "16:00",
            wednesdayStart: "08:00",
            wednesdayEnd: "16:00",
            thursdayStart: "08:00",
            thursdayEnd: "16:00",
            fridayStart: "08:00",
            fridayEnd: "16:00"
          },
          lastActive: "5 minutes ago",
          outletId: user.outletId
        },
        {
          id: "2",
          name: "Michael Chen",
          email: "michael.c@pharmacy.com",
          phone: "+1234567891",
          role: "pharmacist",
          status: "active",
          hireDate: "2023-03-10",
          permissions: ["dispensing", "inventory_management", "pos_access"],
          performance: {
            hoursWorked: 40,
            targetHours: 40,
            salesMade: 89,
            customerRating: 4.9,
            efficiency: 88
          },
          schedule: {
            mondayStart: "09:00",
            mondayEnd: "17:00",
            tuesdayStart: "09:00",
            tuesdayEnd: "17:00",
            wednesdayStart: "09:00",
            wednesdayEnd: "17:00",
            thursdayStart: "09:00",
            thursdayEnd: "17:00",
            fridayStart: "09:00",
            fridayEnd: "17:00"
          },
          lastActive: "2 minutes ago",
          outletId: user.outletId
        },
        {
          id: "3",
          name: "Emma Wilson",
          email: "emma.w@pharmacy.com",
          phone: "+1234567892",
          role: "assistant",
          status: "on_leave",
          hireDate: "2023-08-20",
          permissions: ["inventory_management"],
          performance: {
            hoursWorked: 32,
            targetHours: 35,
            salesMade: 67,
            customerRating: 4.6,
            efficiency: 82
          },
          schedule: {
            mondayStart: "10:00",
            mondayEnd: "18:00",
            tuesdayStart: "10:00",
            tuesdayEnd: "18:00",
            wednesdayStart: "10:00",
            wednesdayEnd: "18:00",
            thursdayStart: "10:00",
            thursdayEnd: "18:00",
            fridayStart: "10:00",
            fridayEnd: "18:00"
          },
          lastActive: "2 days ago",
          outletId: user.outletId
        }
      ]

      setStaff(mockStaff)
      calculateStats(mockStaff)
    } catch (error) {
      console.error("Failed to load staff:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (staffList: StaffMember[]) => {
    const stats: StaffStats = {
      totalStaff: staffList.length,
      activeStaff: staffList.filter(s => s.status === "active").length,
      onLeaveStaff: staffList.filter(s => s.status === "on_leave").length,
      averagePerformance: staffList.length > 0 
        ? Math.round(staffList.reduce((sum, s) => sum + s.performance.efficiency, 0) / staffList.length)
        : 0,
      totalHoursWorked: staffList.reduce((sum, s) => sum + s.performance.hoursWorked, 0),
      newHiresThisMonth: staffList.filter(s => {
        const hireDate = new Date(s.hireDate)
        const now = new Date()
        return hireDate.getMonth() === now.getMonth() && hireDate.getFullYear() === now.getFullYear()
      }).length
    }
    setStats(stats)
  }

  const filterStaff = () => {
    let filtered = [...staff]

    if (searchTerm) {
      filtered = filtered.filter(member =>
        (member.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.phone || '').includes(searchTerm)
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(member => member.role === roleFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(member => member.status === statusFilter)
    }

    setFilteredStaff(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "inactive": return "bg-gray-100 text-gray-800"
      case "on_leave": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "pharmacist": return "bg-blue-100 text-blue-800"
      case "cashier": return "bg-green-100 text-green-800"
      case "assistant": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "pharmacist": return <Shield className="h-4 w-4" />
      case "cashier": return <Users className="h-4 w-4" />
      case "assistant": return <Settings className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
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
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Staff</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.totalStaff}</div>
            <p className="text-xs text-muted-foreground">Team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Active Now</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-green-600">{stats.activeStaff}</div>
            <p className="text-xs text-muted-foreground">On duty</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Avg Performance</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.averagePerformance}%</div>
            <p className="text-xs text-muted-foreground">Team efficiency</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">New Hires</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.newHiresThisMonth}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Staff Management</CardTitle>
              <CardDescription>Manage your outlet team members and their performance</CardDescription>
            </div>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff Member
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
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="pharmacist">Pharmacist</SelectItem>
                <SelectItem value="cashier">Cashier</SelectItem>
                <SelectItem value="assistant">Assistant</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Staff Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Team Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="schedules">Schedules</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-3">
              {filteredStaff.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No staff members found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredStaff.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {(member.name || '').split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getRoleColor(member.role)}>
                              {getRoleIcon(member.role)}
                              <span className="ml-1">{member.role}</span>
                            </Badge>
                            <Badge className={getStatusColor(member.status)}>
                              {member.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Last active: {member.lastActive}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm font-medium">{member.performance.hoursWorked}h</p>
                          <p className="text-xs text-muted-foreground">This week</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{member.performance.salesMade}</p>
                          <p className="text-xs text-muted-foreground">Sales</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <p className="text-sm font-medium">{member.performance.customerRating}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">Rating</p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="h-4 w-4 mr-2" />
                              Manage Schedule
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Clock className="h-4 w-4 mr-2" />
                              View Performance
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="performance" className="space-y-3">
              {filteredStaff.map((member) => (
                <div key={member.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-xs">
                          {(member.name || '').split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <Badge className={`${
                      member.performance.efficiency >= 90 ? "bg-green-100 text-green-800" :
                      member.performance.efficiency >= 75 ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {member.performance.efficiency}% Efficiency
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Hours Worked</span>
                        <span>{member.performance.hoursWorked}/{member.performance.targetHours}h</span>
                      </div>
                      <Progress 
                        value={(member.performance.hoursWorked / member.performance.targetHours) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Sales Made</p>
                        <p className="font-medium">{member.performance.salesMade}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Customer Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <p className="font-medium">{member.performance.customerRating}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Efficiency</p>
                        <p className="font-medium">{member.performance.efficiency}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="schedules" className="space-y-3">
              {filteredStaff.map((member) => (
                <div key={member.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Schedule
                    </Button>
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-sm">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                      const dayKey = day.toLowerCase() + 'Start' as keyof typeof member.schedule
                      const endKey = day.toLowerCase() + 'End' as keyof typeof member.schedule
                      const startTime = member.schedule[dayKey]
                      const endTime = member.schedule[endKey]

                      return (
                        <div key={day} className="text-center p-2 border rounded">
                          <p className="font-medium">{day}</p>
                          {startTime && endTime ? (
                            <p className="text-xs text-muted-foreground">
                              {startTime} - {endTime}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">Off</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="permissions" className="space-y-3">
              {filteredStaff.map((member) => (
                <div key={member.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Permissions
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Current Permissions:</p>
                    <div className="flex flex-wrap gap-2">
                      {member.permissions.map((permission) => (
                        <Badge key={permission} variant="outline">
                          {permission.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
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