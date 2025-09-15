"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminService, type OutletMetrics } from "@/lib/admin-service"
import { MapPin, AlertTriangle, Users, Building2 } from "lucide-react"

export function OutletComparison() {
  const [outlets, setOutlets] = useState<OutletMetrics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOutlets = async () => {
      try {
        const data = await AdminService.getOutletMetrics()
        setOutlets(data)
      } catch (error) {
        console.error("Failed to load outlet metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    loadOutlets()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Outlet Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Outlet Performance Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(outlets && Array.isArray(outlets) && outlets.length > 0) ? (
            outlets.map((outlet) => (
              <div key={outlet.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{outlet.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {outlet.location}
                    </p>
                  </div>
                  <Badge variant={outlet.status === "active" ? "default" : "secondary"}>{outlet.status}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Daily Sales</p>
                    <p className="font-semibold text-foreground">{AdminService.formatCurrency(outlet.dailySales)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Monthly Sales</p>
                    <p className="font-semibold text-foreground">{AdminService.formatCurrency(outlet.monthlySales)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Staff
                    </p>
                    <p className="font-semibold text-foreground">{outlet.staffCount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Low Stock
                    </p>
                    <p className="font-semibold text-destructive">{outlet.lowStockItems}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Inventory Value:{" "}
                    <span className="font-semibold text-foreground">
                      {AdminService.formatCurrency(outlet.inventoryValue)}
                    </span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No outlet data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
