"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Activity,
  Database,
  Server,
  HardDrive,
  Cpu,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react"

interface SystemMetric {
  name: string
  value: number
  status: "healthy" | "warning" | "critical"
  unit: string
  icon: React.ReactNode
}

interface ServiceStatus {
  name: string
  status: "online" | "offline" | "degraded"
  uptime: string
  lastCheck: string
}

export function SystemHealth() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    {
      name: "CPU Usage",
      value: 45,
      status: "healthy",
      unit: "%",
      icon: <Cpu className="h-4 w-4" />,
    },
    {
      name: "Memory Usage",
      value: 68,
      status: "warning",
      unit: "%",
      icon: <Server className="h-4 w-4" />,
    },
    {
      name: "Disk Usage",
      value: 32,
      status: "healthy",
      unit: "%",
      icon: <HardDrive className="h-4 w-4" />,
    },
    {
      name: "Database Performance",
      value: 92,
      status: "healthy",
      unit: "%",
      icon: <Database className="h-4 w-4" />,
    },
  ])

  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: "Authentication Service",
      status: "online",
      uptime: "99.9%",
      lastCheck: "2 minutes ago",
    },
    {
      name: "Database Connection",
      status: "online",
      uptime: "99.8%",
      lastCheck: "1 minute ago",
    },
    {
      name: "Backup Service",
      status: "online",
      uptime: "98.5%",
      lastCheck: "5 minutes ago",
    },
    {
      name: "Network Connectivity",
      status: "online",
      uptime: "99.9%",
      lastCheck: "30 seconds ago",
    },
  ])

  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshMetrics = async () => {
    setIsRefreshing(true)

    // Simulate API call to get fresh metrics
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update metrics with simulated data
    setMetrics((prev) =>
      prev.map((metric) => ({
        ...metric,
        value: Math.max(10, Math.min(95, metric.value + (Math.random() - 0.5) * 20)),
        status: Math.random() > 0.8 ? "warning" : "healthy",
      })),
    )

    setIsRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "online":
        return "text-success"
      case "warning":
      case "degraded":
        return "text-warning"
      case "critical":
      case "offline":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "online":
        return <CheckCircle className="h-4 w-4 text-success" />
      case "warning":
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-warning" />
      case "critical":
      case "offline":
        return <XCircle className="h-4 w-4 text-destructive" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-success"
      case "warning":
        return "bg-warning"
      case "critical":
        return "bg-destructive"
      default:
        return "bg-primary"
    }
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health Overview
            </CardTitle>
            <CardDescription>Real-time monitoring of system performance and health</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshMetrics}
            disabled={isRefreshing}
            className="bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <div key={metric.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {metric.icon}
                    <span className="text-sm font-medium">{metric.name}</span>
                  </div>
                  <Badge variant="outline" className={getStatusColor(metric.status)}>
                    {metric.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {metric.value}
                      {metric.unit}
                    </span>
                  </div>
                  <Progress value={metric.value} className={`h-2 ${getProgressColor(metric.status)}`} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Service Status
          </CardTitle>
          <CardDescription>Status of critical system services and components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-muted-foreground">Last checked: {service.lastCheck}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">Uptime: {service.uptime}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>System Maintenance</CardTitle>
          <CardDescription>Quick actions for system maintenance and optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <Database className="h-5 w-5" />
              <span>Optimize Database</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <HardDrive className="h-5 w-5" />
              <span>Clear Cache</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <Activity className="h-5 w-5" />
              <span>Run Diagnostics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
