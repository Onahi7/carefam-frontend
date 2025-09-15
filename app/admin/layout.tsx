"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  BarChart3, 
  Users, 
  Building2, 
  Package, 
  TrendingUp,
  FileText,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  Crown,
  ChevronDown,
  Home,
  Database,
  Shield,
  Clock
} from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AuthService } from "@/lib/auth"
import { formatCurrency } from "@/lib/utils"
import type { User as UserType } from "@/lib/types"

interface AdminLayoutProps {
  children: React.ReactNode
}

const sidebarItems = [
  { href: "/admin", icon: Home, label: "Dashboard", description: "System overview" },
  { href: "/admin/outlets", icon: Building2, label: "Outlets", description: "Manage pharmacy locations" },
  { href: "/admin/users", icon: Users, label: "Users", description: "Staff management" },
  { href: "/admin/customers", icon: User, label: "Customers", description: "Customer management" },
  { href: "/admin/inventory", icon: Package, label: "Inventory", description: "Stock management" },
  { href: "/admin/invoices", icon: FileText, label: "Invoices", description: "Billing & invoicing" },
  { href: "/admin/transactions", icon: ShoppingCart, label: "Transactions", description: "Sales history" },
  { href: "/admin/shift-history", icon: Clock, label: "Shift History", description: "Staff shift management" },
  { href: "/admin/reports", icon: BarChart3, label: "Reports", description: "Financial analytics" },
  { href: "/admin/bulk-sales", icon: TrendingUp, label: "Bulk Sales", description: "Wholesale operations" },
  { href: "/admin/settings", icon: Settings, label: "Settings", description: "System configuration" },
]

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const [user, setUser] = useState<UserType | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [systemStats, setSystemStats] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
    if (currentUser) {
      loadSystemStats()
    }
  }, [])

  const loadSystemStats = async () => {
    try {
      // TODO: Replace with real API call
      // const response = await fetch('/api/admin/system-stats')
      // const stats = await response.json()
      
      // Mock stats for now
      const stats = {
        totalRevenue: 0,
        totalTransactions: 0,
        activeOutlets: 0,
        totalUsers: 0
      }
      setSystemStats(stats)
    } catch (error) {
      console.error("Failed to load system stats:", error)
    }
  }

  const handleLogout = () => {
    AuthService.logout()
    router.push("/")
  }

  const handleNavigate = (path: string) => {
    router.push(path)
    setSidebarOpen(false)
  }

  const isActivePage = (path: string) => {
    if (path === "/admin") {
      return pathname === "/admin"
    }
    return pathname.startsWith(path)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-card border-r transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                  <Crown className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">PharmaPOS</h2>
                  <p className="text-sm text-muted-foreground">Admin Portal</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {sidebarItems.map((item) => (
                <Button
                  key={item.href}
                  variant={isActivePage(item.href) ? "default" : "ghost"}
                  className="w-full justify-start h-auto p-3"
                  onClick={() => handleNavigate(item.href)}
                >
                  <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>

          {/* System Stats */}
          {systemStats && (
            <div className="p-4 border-t">
              <div className="text-xs font-medium text-muted-foreground mb-3">SYSTEM OVERVIEW</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="font-medium">{formatCurrency(systemStats.totalRevenue)}</div>
                  <div className="text-xs text-muted-foreground">Total Revenue</div>
                </div>
                <div>
                  <div className="font-medium">{systemStats.totalTransactions}</div>
                  <div className="text-xs text-muted-foreground">Transactions</div>
                </div>
                <div>
                  <div className="font-medium">{systemStats.activeOutlets}</div>
                  <div className="text-xs text-muted-foreground">Active Outlets</div>
                </div>
                <div>
                  <div className="font-medium">{systemStats.totalUsers}</div>
                  <div className="text-xs text-muted-foreground">System Users</div>
                </div>
              </div>
            </div>
          )}

          {/* User Profile */}
          <div className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-3 h-auto">
                  <User className="h-5 w-5 mr-3" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 border-b">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Administrator
                    </Badge>
                  </div>
                </div>
                
                <DropdownMenuItem onClick={() => handleNavigate("/admin/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-card border-b px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold">
                  {sidebarItems.find(item => isActivePage(item.href))?.label || "Admin Dashboard"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {sidebarItems.find(item => isActivePage(item.href))?.description || "System administration"}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            {systemStats && (
              <div className="hidden md:flex items-center gap-6">
                <div className="text-center">
                  <p className="text-sm font-medium">{formatCurrency(systemStats.totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{systemStats.activeOutlets}</p>
                  <p className="text-xs text-muted-foreground">Outlets</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{systemStats.totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Users</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ProtectedRoute>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ProtectedRoute>
  )
}