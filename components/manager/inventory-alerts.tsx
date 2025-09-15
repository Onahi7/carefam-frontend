"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Package, Calendar, ExternalLink } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { InventoryAlert } from "@/lib/manager-service"
import Link from "next/link"

interface InventoryAlertsProps {
  alerts: InventoryAlert[]
}

export function InventoryAlertsCard({ alerts }: InventoryAlertsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "outline"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "high":
        return "High Priority"
      case "medium":
        return "Medium Priority"
      case "low":
        return "Low Priority"
      default:
        return "Unknown"
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "low_stock":
        return <Package className="h-4 w-4" />
      case "expiring":
      case "expired":
        return <Calendar className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getAlertDescription = (alert: InventoryAlert) => {
    switch (alert.type) {
      case "low_stock":
        return `${alert.currentStock} units remaining (reorder at ${alert.reorderPoint})`
      case "expired":
        return `Expired on ${formatDate(alert.expiryDate!)}`
      case "expiring":
        return `Expires on ${formatDate(alert.expiryDate!)}`
      default:
        return "Unknown alert"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Inventory Alerts
            </CardTitle>
            <CardDescription>Critical inventory issues requiring attention</CardDescription>
          </div>
          <Link href="/inventory">
            <Button variant="outline" size="sm" className="bg-transparent">
              <ExternalLink className="h-4 w-4 mr-1" />
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No inventory alerts</p>
          ) : (
            alerts.slice(0, 10).map((alert) => (
              <div
                key={`${alert.type}-${alert.productId}`}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{alert.productName}</h4>
                    <p className="text-xs text-muted-foreground">{getAlertDescription(alert)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={getSeverityColor(alert.severity) as any}
                    className={
                      alert.severity === "medium" || alert.severity === "low" ? "text-secondary border-secondary" : ""
                    }
                  >
                    {getSeverityText(alert.severity)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {alert.type.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
