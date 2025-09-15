"use client"

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, TrendingUp, FileText } from "lucide-react"
import Link from "next/link"

interface EmptySalesProps {
  showActions?: boolean
}

export function EmptySales({ showActions = true }: EmptySalesProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <TrendingUp className="h-8 w-8 text-muted-foreground" />
        </div>

        <CardTitle className="text-xl mb-2">No Sales Data Available</CardTitle>
        <CardDescription className="text-center mb-6 max-w-md">
          Start processing sales to see analytics and performance data. Your sales history and reports will appear here.
        </CardDescription>

        {showActions && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/pos">
              <Button className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Start First Sale
              </Button>
            </Link>
            <Button variant="outline" className="gap-2 bg-transparent">
              <FileText className="h-4 w-4" />
              Learn POS System
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
