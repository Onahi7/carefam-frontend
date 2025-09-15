"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminService } from "@/lib/admin-service"
import { Package, Plus, Eye, FileText } from "lucide-react"

interface BulkSale {
  id: string
  customer: string
  amount: number
  items: number
  date: string
  status: "pending" | "completed" | "cancelled"
}

export function BulkSalesManagement() {
  const [bulkSales, setBulkSales] = useState<BulkSale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBulkSales = async () => {
      try {
        const data = await AdminService.getBulkSalesData()
        setBulkSales(data)
      } catch (error) {
        console.error("Failed to load bulk sales:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBulkSales()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bulk Sales Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "pending":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Bulk Sales Management
        </CardTitle>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Bulk Order
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bulkSales && Array.isArray(bulkSales) && bulkSales.length > 0 ? (
            bulkSales.map((sale) => (
              <div key={sale.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{sale.customer}</h3>
                    <p className="text-sm text-muted-foreground">
                      {sale.items} items • {new Date(sale.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(sale.status)}>{sale.status}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-foreground">{AdminService.formatCurrency(sale.amount)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <FileText className="h-3 w-3" />
                      Invoice
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>{loading ? "Loading bulk sales..." : "No bulk sales found"}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
