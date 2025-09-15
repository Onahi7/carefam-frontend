"use client"

import { useState, useEffect } from "react"
import { AuthService } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, TrendingUp, Users, Calendar, FileText } from "lucide-react"
import { format } from "date-fns"

interface ShiftHistory {
  _id: string
  userId: {
    firstName: string
    lastName: string
    email: string
  }
  outletId: {
    name: string
    location: string
  }
  status: string
  startTime: string
  endTime: string
  openingCash: number
  expectedCash: number
  actualCash: number
  variance: number
  totalSales: number
  transactionCount: number
  notes?: string
  managerApproval?: {
    approved: boolean
    managerId: string
    timestamp: string
  }
}

interface ShiftStats {
  totalShifts: number
  totalSales: number
  averageVariance: number
  totalVariance: number
  averageShiftDuration: number
  shiftsRequiringApproval: number
}

interface ShiftFilters {
  startDate?: Date
  endDate?: Date
  userId?: string
  status?: string
  page: number
  limit: number
}

export function ShiftHistoryManager() {
  const [shifts, setShifts] = useState<ShiftHistory[]>([])
  const [stats, setStats] = useState<ShiftStats | null>(null)
  const [topPerformers, setTopPerformers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedShift, setSelectedShift] = useState<ShiftHistory | null>(null)
  const [filters, setFilters] = useState<ShiftFilters>({
    page: 1,
    limit: 10
  })
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadShiftData()
  }, [filters])

  const loadShiftData = async () => {
    try {
      setLoading(true)
      
      // Load shift history
      const historyResponse = await AuthService.getShiftHistory(filters)
      setShifts(historyResponse.shifts)
      setTotal(historyResponse.total)

      // Load statistics
      const statsResponse = await AuthService.getShiftStats({
        startDate: filters.startDate,
        endDate: filters.endDate,
        userId: filters.userId
      })
      setStats(statsResponse)

      // Load top performers (managers and admins only)
      const user = AuthService.getCurrentUser()
      if (user?.role === 'manager' || user?.role === 'admin') {
        const performersResponse = await AuthService.getTopPerformers({
          startDate: filters.startDate,
          endDate: filters.endDate
        })
        setTopPerformers(performersResponse)
      }
    } catch (error) {
      console.error('Failed to load shift data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof ShiftFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'ended': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getVarianceColor = (variance: number) => {
    if (variance === 0) return 'text-green-600'
    if (Math.abs(variance) <= 5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDuration = (start: string, end: string) => {
    const startTime = new Date(start)
    const endTime = new Date(end)
    const duration = endTime.getTime() - startTime.getTime()
    const hours = Math.floor(duration / (1000 * 60 * 60))
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  if (loading && shifts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading shift data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Shift Management</h1>
        <p className="text-muted-foreground">
          View and manage shift history, performance, and analytics
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status || ''} onValueChange={(value) => handleFilterChange('status', value || undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => setFilters({ page: 1, limit: 10 })} variant="outline">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Shift History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Shifts</p>
                      <p className="text-2xl font-bold">{stats.totalShifts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Sales</p>
                      <p className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Variance</p>
                      <p className={`text-2xl font-bold ${getVarianceColor(stats.averageVariance)}`}>
                        {formatCurrency(stats.averageVariance)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Variance</p>
                      <p className={`text-2xl font-bold ${getVarianceColor(stats.totalVariance)}`}>
                        {formatCurrency(stats.totalVariance)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Duration</p>
                      <p className="text-2xl font-bold">{Math.round(stats.averageShiftDuration / 60)}h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Need Approval</p>
                      <p className="text-2xl font-bold text-orange-600">{stats.shiftsRequiringApproval}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Top Performers */}
          {topPerformers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Top Performers</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformers.slice(0, 5).map((performer, index) => (
                    <div key={performer._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{performer.staffName}</p>
                          <p className="text-sm text-muted-foreground">{performer.totalShifts} shifts</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(performer.totalSales)}</p>
                        <p className="text-sm text-muted-foreground">
                          Avg: {formatCurrency(performer.averageSales)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Shift History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Shift History</CardTitle>
              <CardDescription>
                {total} shifts found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shifts.map((shift) => (
                  <div
                    key={shift._id}
                    className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedShift(shift)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">
                            {shift.userId.firstName} {shift.userId.lastName}
                          </h3>
                          <Badge className={getStatusColor(shift.status)}>
                            {shift.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {shift.outletId.name} • {format(new Date(shift.startTime), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Duration: {shift.endTime ? formatDuration(shift.startTime, shift.endTime) : 'Active'}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-bold">{formatCurrency(shift.totalSales)}</p>
                        <p className="text-sm text-muted-foreground">{shift.transactionCount} transactions</p>
                        {shift.variance !== 0 && (
                          <p className={`text-sm font-medium ${getVarianceColor(shift.variance)}`}>
                            Variance: {formatCurrency(shift.variance)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(filters.page - 1) * filters.limit + 1} to {Math.min(filters.page * filters.limit, total)} of {total} shifts
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={filters.page === 1}
                      onClick={() => handleFilterChange('page', filters.page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={filters.page * filters.limit >= total}
                      onClick={() => handleFilterChange('page', filters.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Detailed analytics and reporting coming soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <p>Advanced analytics features will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Shift Detail Modal */}
      {selectedShift && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Shift Details</CardTitle>
              <CardDescription>
                {selectedShift.userId.firstName} {selectedShift.userId.lastName} • {format(new Date(selectedShift.startTime), 'MMM dd, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(selectedShift.status)}>
                    {selectedShift.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Outlet</Label>
                  <p>{selectedShift.outletId.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Start Time</Label>
                  <p>{format(new Date(selectedShift.startTime), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">End Time</Label>
                  <p>{selectedShift.endTime ? format(new Date(selectedShift.endTime), 'MMM dd, yyyy HH:mm') : 'Active'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Opening Cash</Label>
                  <p>{formatCurrency(selectedShift.openingCash)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Expected Cash</Label>
                  <p>{formatCurrency(selectedShift.expectedCash)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Actual Cash</Label>
                  <p>{formatCurrency(selectedShift.actualCash)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Variance</Label>
                  <p className={getVarianceColor(selectedShift.variance)}>
                    {formatCurrency(selectedShift.variance)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Total Sales</Label>
                  <p>{formatCurrency(selectedShift.totalSales)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Transactions</Label>
                  <p>{selectedShift.transactionCount}</p>
                </div>
              </div>

              {selectedShift.notes && (
                <div>
                  <Label className="text-sm text-muted-foreground">Notes</Label>
                  <p className="mt-1 p-3 bg-muted rounded-lg">{selectedShift.notes}</p>
                </div>
              )}

              {selectedShift.managerApproval && (
                <div>
                  <Label className="text-sm text-muted-foreground">Manager Approval</Label>
                  <div className="mt-1 p-3 bg-muted rounded-lg">
                    <p className={selectedShift.managerApproval.approved ? 'text-green-600' : 'text-red-600'}>
                      {selectedShift.managerApproval.approved ? 'Approved' : 'Rejected'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedShift.managerApproval.timestamp), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedShift(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}