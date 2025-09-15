"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { SalesAnalytics } from "@/lib/manager-service"

interface SalesChartProps {
  data: SalesAnalytics
  type: "daily" | "hourly"
}

export function SalesChart({ data, type }: SalesChartProps) {
  const chartData = type === "daily" ? data.salesByDay : data.salesByHour

  const formatXAxis = (value: any) => {
    if (type === "daily") {
      return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
    return `${value}:00`
  }

  const formatTooltip = (value: any, name: string) => {
    if (name === "sales") {
      return [formatCurrency(value), "Sales"]
    }
    return [value, "Transactions"]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Sales {type === "daily" ? "by Day" : "by Hour"}
        </CardTitle>
        <CardDescription>
          {type === "daily" ? "Daily sales performance over the last 7 days" : "Hourly sales distribution"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {type === "daily" ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={type === "daily" ? "date" : "hour"} tickFormatter={formatXAxis} />
                <YAxis />
                <Tooltip formatter={formatTooltip} labelFormatter={formatXAxis} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickFormatter={formatXAxis} />
                <YAxis />
                <Tooltip formatter={formatTooltip} labelFormatter={formatXAxis} />
                <Bar dataKey="sales" fill="hsl(var(--primary))" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
