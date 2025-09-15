"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Star, 
  Calendar,
  MoreHorizontal,
  UserPlus,
  Settings
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
  role: string
  avatar?: string
  status: "active" | "inactive" | "on_break"
  hoursWorked: number
  targetHours: number
  salesMade: number
  performance: number
  shiftStart?: string
  shiftEnd?: string
  lastActive: string
}

interface TeamStats {
  totalStaff: number
  activeStaff: number
  averagePerformance: number
  totalHours: number
  totalSales: number
}

export function StaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStaffData()
  }, [])

  const loadStaffData = async () => {
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
          role: "Senior Cashier",
          avatar: undefined,
          status: "active",
          hoursWorked: 38,
          targetHours: 40,
          salesMade: 156,
          performance: 95,
          shiftStart: "08:00",
          shiftEnd: "16:00",
          lastActive: "5 minutes ago"
        },
        {
          id: "2",
          name: "Michael Chen",
          email: "michael.c@pharmacy.com",
          role: "Pharmacist",
          avatar: undefined,
          status: "active",
          hoursWorked: 40,
          targetHours: 40,
          salesMade: 89,
          performance: 88,
          shiftStart: "09:00",
          shiftEnd: "17:00",
          lastActive: "2 minutes ago"
        },
        {
          id: "3",
          name: "Emma Wilson",
          email: "emma.w@pharmacy.com",
          role: "Cashier",
          avatar: undefined,
          status: "on_break",
          hoursWorked: 32,
          targetHours: 35,
          salesMade: 67,
          performance: 82,
          shiftStart: "10:00",
          shiftEnd: "18:00",
          lastActive: "15 minutes ago"
        },
        {
          id: "4",
          name: "David Brown",
          email: "david.b@pharmacy.com",
          role: "Stock Assistant",
          avatar: undefined,
          status: "inactive",
          hoursWorked: 35,
          targetHours: 35,
          salesMade: 23,
          performance: 76,
          shiftStart: "07:00",
          shiftEnd: "15:00",
          lastActive: "2 hours ago"
        }
      ]

      const mockTeamStats: TeamStats = {
        totalStaff: mockStaff.length,
        activeStaff: mockStaff.filter(s => s.status === "active").length,
        averagePerformance: Math.round(mockStaff.reduce((sum, s) => sum + s.performance, 0) / mockStaff.length),
        totalHours: mockStaff.reduce((sum, s) => sum + s.hoursWorked, 0),
        totalSales: mockStaff.reduce((sum, s) => sum + s.salesMade, 0) * 150 // Mock sales value
      }

      setStaff(mockStaff)
      setTeamStats(mockTeamStats)
    } catch (error) {
      console.error("Failed to load staff data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500"
      case "on_break": return "bg-yellow-500"
      case "inactive": return "bg-gray-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Active"
      case "on_break": return "On Break"
      case "inactive": return "Off Duty"
      default: return "Unknown"
    }
  }

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "bg-green-500"
    if (performance >= 75) return "bg-yellow-500"
    return "bg-red-500"
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
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
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Team Stats */}
      {teamStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Staff</span>
              </div>
              <div className="text-2xl font-bold mt-1">{teamStats.totalStaff}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Active Now</span>
              </div>
              <div className="text-2xl font-bold mt-1 text-green-600">{teamStats.activeStaff}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Avg Performance</span>
              </div>
              <div className="text-2xl font-bold mt-1">{teamStats.averagePerformance}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Sales</span>
              </div>
              <div className="text-2xl font-bold mt-1">{formatCurrency(teamStats.totalSales)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Staff Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your outlet staff and monitor performance</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="schedules">Schedules</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {staff.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div 
                        className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-background`}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getStatusText(member.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Last active: {member.lastActive}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium">{member.salesMade}</p>
                      <p className="text-xs text-muted-foreground">Sales</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{member.hoursWorked}h</p>
                      <p className="text-xs text-muted-foreground">This week</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{member.performance}%</p>
                      <p className="text-xs text-muted-foreground">Performance</p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Schedule</DropdownMenuItem>
                        <DropdownMenuItem>Performance Review</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Remove Access
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              {staff.map((member) => (
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
                    <Badge 
                      variant="outline" 
                      className={`${getPerformanceColor(member.performance)} text-white`}
                    >
                      {member.performance}% Performance
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Hours Worked</span>
                        <span>{member.hoursWorked}/{member.targetHours}h</span>
                      </div>
                      <Progress 
                        value={(member.hoursWorked / member.targetHours) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Sales Made</p>
                        <p className="font-medium">{member.salesMade} transactions</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg. Sale Value</p>
                        <p className="font-medium">{formatCurrency(150)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="schedules" className="space-y-4">
              {staff.map((member) => (
                <div key={member.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
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
                    
                    <div className="flex items-center space-x-4">
                      {member.shiftStart && member.shiftEnd && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {member.shiftStart} - {member.shiftEnd}
                          </span>
                        </div>
                      )}
                      <Button variant="outline" size="sm">
                        Edit Schedule
                      </Button>
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