"use client"

import { useState, useEffect } from "react"
import { AuthService } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, TrendingUp, Calendar } from "lucide-react"
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

export function MyShiftHistory() {
  const [shifts, setShifts] = useState<ShiftHistory[]>([])
  const [stats, setStats] = useState<ShiftStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedShift, setSelectedShift] = useState<ShiftHistory | null>(null)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  useEffect(() => {
    loadMyShifts()
  }, [startDate, endDate, page])

  const loadMyShifts = async () => {
    try {
      setLoading(true)
      
      const filters = {
        startDate,
        endDate,
        page,
        limit
      }

      // Load my shift history
      const historyResponse = await AuthService.getShiftHistory(filters)
      setShifts(historyResponse.shifts)
      setTotal(historyResponse.total)

      // Load my statistics
      const statsResponse = await AuthService.getShiftStats({
        startDate,
        endDate
      })
      setStats(statsResponse)
    } catch (error) {
      console.error('Failed to load shift data:', error)
    } finally {
      setLoading(false)
    }
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
          <p className="mt-4 text-muted-foreground">Loading your shifts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Shift History</h1>
        <p className="text-muted-foreground">
          View your shift performance and history
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <p className="text-sm text-muted-foreground">Average Sales</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.totalShifts > 0 ? stats.totalSales / stats.totalShifts : 0)}
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
                  <p className="text-sm text-muted-foreground">Cash Variance</p>
                  <p className={`text-2xl font-bold ${getVarianceColor(stats.averageVariance)}`}>
                    {formatCurrency(stats.averageVariance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => {
                  setStartDate(undefined)
                  setEndDate(undefined)
                  setPage(1)
                }} 
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shift History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Shifts</CardTitle>
          <CardDescription>
            {total} shifts found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shifts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <p>No shifts found for the selected period</p>
              </div>
            ) : (
              shifts.map((shift) => (
                <div
                  key={shift._id}
                  className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedShift(shift)}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">
                          {format(new Date(shift.startTime), 'MMM dd, yyyy')}
                        </h3>
                        <Badge className={getStatusColor(shift.status)}>
                          {shift.status}
                        </Badge>
                        {shift.managerApproval && (
                          <Badge variant={shift.managerApproval.approved ? "default" : "destructive"}>
                            {shift.managerApproval.approved ? "Approved" : "Needs Review"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {shift.outletId.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(shift.startTime), 'HH:mm')} - {' '}
                        {shift.endTime ? format(new Date(shift.endTime), 'HH:mm') : 'Active'}
                        {shift.endTime && (
                          <span className="ml-2">
                            ({formatDuration(shift.startTime, shift.endTime)})
                          </span>
                        )}
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
              ))
            )}

            {/* Pagination */}
            {total > limit && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} shifts
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page * limit >= total}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shift Detail Modal */}
      {selectedShift && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Shift Details</CardTitle>
              <CardDescription>
                {format(new Date(selectedShift.startTime), 'MMM dd, yyyy')}
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
                  <p>{format(new Date(selectedShift.startTime), 'HH:mm')}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">End Time</Label>
                  <p>{selectedShift.endTime ? format(new Date(selectedShift.endTime), 'HH:mm') : 'Active'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Duration</Label>
                  <p>{selectedShift.endTime ? formatDuration(selectedShift.startTime, selectedShift.endTime) : 'Active'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Transactions</Label>
                  <p>{selectedShift.transactionCount}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Cash Management</h4>
                <div className="grid grid-cols-2 gap-4">
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
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm text-muted-foreground">Total Sales</Label>
                <p className="text-2xl font-bold">{formatCurrency(selectedShift.totalSales)}</p>
              </div>

              {selectedShift.notes && (
                <div>
                  <Label className="text-sm text-muted-foreground">Notes</Label>
                  <p className="mt-1 p-3 bg-muted rounded-lg">{selectedShift.notes}</p>
                </div>
              )}

              {selectedShift.managerApproval && (
                <div>
                  <Label className="text-sm text-muted-foreground">Manager Review</Label>
                  <div className="mt-1 p-3 bg-muted rounded-lg">
                    <p className={selectedShift.managerApproval.approved ? 'text-green-600' : 'text-orange-600'}>
                      {selectedShift.managerApproval.approved ? 'Approved' : 'Pending Review'}
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