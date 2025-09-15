"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Clock, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { StaffPerformance } from "@/lib/manager-service"

interface StaffPerformanceProps {
  data: StaffPerformance[]
}

export function StaffPerformanceCard({ data }: StaffPerformanceProps) {
  const topPerformer = data.reduce((top, staff) => (staff.totalSales > top.totalSales ? staff : top), data[0])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Staff Performance
        </CardTitle>
        <CardDescription>Individual staff sales performance and metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No staff performance data available</p>
          ) : (
            data.map((staff) => (
              <div key={staff.staffId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{staff.staffName}</h4>
                    {staff.staffId === topPerformer?.staffId && (
                      <Badge variant="outline" className="text-primary border-primary">
                        Top Performer
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Sales:</span>
                      <span className="font-medium">{formatCurrency(staff.totalSales)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Transactions:</span>
                      <span className="font-medium">{staff.totalTransactions}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Avg Sale:</span>
                      <span className="font-medium">{formatCurrency(staff.averageTransaction)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Per Hour:</span>
                      <span className="font-medium">{formatCurrency(staff.salesPerHour)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
