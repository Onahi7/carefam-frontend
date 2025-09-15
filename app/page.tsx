"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Package, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Header } from "@/components/layout/header"
import { AuthService } from "@/lib/auth"
import type { User } from "@/lib/types"
import Link from "next/link"

function DashboardContent() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(AuthService.getCurrentUser())
  }, [])

  const handleLogout = () => {
    setUser(null)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-balance mb-2">Welcome back, {user.name}</h2>
          <p className="text-muted-foreground text-pretty">
            {user.role === "admin" && "System administration and multi-outlet oversight"}
            {user.role === "manager" && "Manage your pharmacy operations and staff"}
            {user.role === "staff" && "Process sales and assist customers"}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">2,847</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">Le 1,245,000</div>
              <p className="text-xs text-muted-foreground">+8% from yesterday</p>
            </CardContent>
          </Card>

          {user.role === "admin" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Outlets</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">3</div>
                <p className="text-xs text-muted-foreground">All operational</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">23</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Role-based Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                {user.role === "staff" && "Staff operations and POS functions"}
                {user.role === "manager" && "Manager tools and inventory control"}
                {user.role === "admin" && "System administration and multi-outlet oversight"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.role === "staff" && (
                <>
                  <Link href="/pos">
                    <Button className="w-full justify-start" size="lg">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Start New Sale
                    </Button>
                  </Link>
                  <Link href="/inventory">
                    <Button variant="outline" className="w-full justify-start bg-transparent" size="lg">
                      <Package className="mr-2 h-4 w-4" />
                      Search Products
                    </Button>
                  </Link>
                </>
              )}

              {user.role === "manager" && (
                <>
                  <Link href="/inventory">
                    <Button className="w-full justify-start" size="lg">
                      <Package className="mr-2 h-4 w-4" />
                      Manage Inventory
                    </Button>
                  </Link>
                  <Link href="/manager">
                    <Button variant="outline" className="w-full justify-start bg-transparent" size="lg">
                      <Users className="mr-2 h-4 w-4" />
                      Manager Dashboard
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start bg-transparent" size="lg">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Sales Reports
                  </Button>
                </>
              )}

              {user.role === "admin" && (
                <>
                  <Link href="/admin">
                    <Button className="w-full justify-start" size="lg">
                      <Building2 className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start bg-transparent" size="lg">
                    <Users className="mr-2 h-4 w-4" />
                    User Management
                  </Button>
                  <Link href="/inventory">
                    <Button variant="outline" className="w-full justify-start bg-transparent" size="lg">
                      <Package className="mr-2 h-4 w-4" />
                      Inventory Overview
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system health and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Authentication</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">User Session</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Valid
                </Badge>
              </div>
              {user.role !== "admin" && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Shift Status</span>
                  <Badge
                    variant="outline"
                    className={
                      AuthService.getCurrentShift(user.id)
                        ? "text-green-600 border-green-600"
                        : "text-secondary border-secondary"
                    }
                  >
                    {AuthService.getCurrentShift(user.id) ? "Active" : "Inactive"}
                  </Badge>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm">Inventory System</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Low Stock Alerts</span>
                <Badge variant="outline" className="text-secondary border-secondary">
                  23 items
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Expiring Products</span>
                <Badge variant="outline" className="text-secondary border-secondary">
                  7 items
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Development Progress */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Development Progress</CardTitle>
            <CardDescription>Current implementation status of pharmacy POS features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database & Backend API</span>
                <Badge className="bg-green-600 text-white">Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Authentication System</span>
                <Badge className="bg-green-600 text-white">Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Inventory Management</span>
                <Badge className="bg-green-600 text-white">Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">POS Terminal Interface</span>
                <Badge className="bg-primary text-primary-foreground">Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Manager Dashboard</span>
                <Badge className="bg-primary text-primary-foreground">Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Admin Dashboard</span>
                <Badge className="bg-green-600 text-white">Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Supplier Management</span>
                <Badge className="bg-green-600 text-white">Complete</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function HomePage() {
  return (
    <ProtectedRoute requireShift={true}>
      <DashboardContent />
    </ProtectedRoute>
  )
}
