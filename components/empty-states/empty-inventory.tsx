"use client"

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Plus, Upload, FileText } from "lucide-react"

interface EmptyInventoryProps {
  onAddProduct?: () => void
  onImportProducts?: () => void
  showActions?: boolean
}

export function EmptyInventory({ onAddProduct, onImportProducts, showActions = true }: EmptyInventoryProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>

        <CardTitle className="text-xl mb-2">No Products in Inventory</CardTitle>
        <CardDescription className="text-center mb-6 max-w-md">
          Get started by adding your first products to the inventory. You can add them individually or import from a
          spreadsheet.
        </CardDescription>

        {showActions && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onAddProduct} className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Product
            </Button>
            <Button variant="outline" onClick={onImportProducts} className="gap-2 bg-transparent">
              <Upload className="h-4 w-4" />
              Import Products
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <FileText className="h-4 w-4" />
              View Guide
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
