"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SupplierService, type PurchaseOrder } from "@/lib/supplier-service"
import { FileText, Plus, Eye, Truck, Calendar, DollarSign } from "lucide-react"

export function PurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await SupplierService.getPurchaseOrders()
        setOrders(data)
      } catch (error) {
        console.error("Failed to load purchase orders:", error)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse h-24 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "shipped":
        return <Truck className="h-3 w-3" />
      case "delivered":
        return <FileText className="h-3 w-3" />
      default:
        return <Calendar className="h-3 w-3" />
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Purchase Orders
        </CardTitle>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Order
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{order.id}</h3>
                  <p className="text-sm text-muted-foreground">{order.supplierName}</p>
                </div>
                <Badge variant={SupplierService.getStatusColor(order.status)} className="gap-1">
                  {getStatusIcon(order.status)}
                  {order.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Order Date
                  </p>
                  <p className="font-medium text-foreground">{new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    Expected
                  </p>
                  <p className="font-medium text-foreground">{new Date(order.expectedDelivery).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Items</p>
                  <p className="font-medium text-foreground">{order.items.length} products</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Total
                  </p>
                  <p className="font-medium text-foreground">{SupplierService.formatCurrency(order.totalAmount)}</p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium text-foreground mb-2">Order Items:</p>
                <div className="space-y-1">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm bg-muted/50 p-2 rounded">
                      <span>{item.productName}</span>
                      <span className="text-muted-foreground">
                        {item.quantity} × {SupplierService.formatCurrency(item.unitCost)} ={" "}
                        <strong className="text-foreground">{SupplierService.formatCurrency(item.totalCost)}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {order.notes && (
                <div className="mb-3 p-2 bg-muted/50 rounded">
                  <p className="text-sm text-muted-foreground">
                    <strong>Notes:</strong> {order.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Eye className="h-3 w-3" />
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <FileText className="h-3 w-3" />
                  Print PO
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
