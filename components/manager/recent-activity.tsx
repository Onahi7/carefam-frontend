"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, ShoppingCart, Package, User } from "lucide-react"
import { formatCurrency, formatDateTime } from "@/lib/utils"

interface RecentActivityProps {
  activities: Array<{
    id: string
    type: "sale" | "inventory_adjustment" | "staff_action"
    description: string
    amount?: number
    timestamp: Date
    staffName?: string
  }>
}

export function RecentActivityCard({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "sale":
        return <ShoppingCart className="h-4 w-4" />
      case "inventory_adjustment":
        return <Package className="h-4 w-4" />
      case "staff_action":
        return <User className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "sale":
        return "text-green-600"
      case "inventory_adjustment":
        return "text-blue-600"
      case "staff_action":
        return "text-purple-600"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest transactions and system activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={`mt-0.5 ${getActivityColor(activity.type)}`}>{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    {activity.amount && (
                      <span className="text-sm font-medium text-green-600">{formatCurrency(activity.amount)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDateTime(activity.timestamp)}</span>
                    {activity.staffName && (
                      <>
                        <span>•</span>
                        <span>{activity.staffName}</span>
                      </>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {activity.type.replace("_", " ")}
                    </Badge>
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
