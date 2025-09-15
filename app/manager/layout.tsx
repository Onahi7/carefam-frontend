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
import { 
  Settings, 
  BarChart3, 
  Users, 
  Package, 
  TrendingUp,
  FileText,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  Building2,
  ChevronDown,
  Home,
  Shield,
  DollarSign,
  CheckSquare,
  Clock,
  AlertTriangle
} from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AuthService } from "@/lib/auth"
import { formatCurrency } from "@/lib/utils"
import type { User as UserType } from "@/lib/types"

interface ManagerLayoutProps {
  children: React.ReactNode
}

const sidebarItems = [
  { href: "/manager", icon: Home, label: "Dashboard", description: "Outlet overview" },
  { href: "/manager/customers", icon: Users, label: "Customers", description: "Customer management" },
  { href: "/manager/inventory", icon: Package, label: "Inventory", description: "Stock management" },
  { href: "/manager/invoices", icon: FileText, label: "Invoices", description: "Billing & invoicing" },
  { href: "/manager/transactions", icon: ShoppingCart, label: "Sales", description: "Transaction history" },
  { href: "/manager/shift-history", icon: Clock, label: "Shift History", description: "Staff shift tracking" },
  { href: "/manager/reports", icon: BarChart3, label: "Reports", description: "Outlet analytics" },
  { href: "/manager/staff", icon: Users, label: "Staff", description: "Team management" },
  { href: "/manager/settings", icon: Settings, label: "Settings", description: "Outlet configuration" },
]

function ManagerLayoutContent({ children }: ManagerLayoutProps) {
  const [user, setUser] = useState<UserType | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [outletStats, setOutletStats] = useState<any>(null)
  const [outletInfo, setOutletInfo] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
    if (currentUser) {
      loadOutletStats()
      loadOutletInfo()
    }
  }, [])

  const loadOutletStats = async () => {
    try {
      // TODO: Replace with real API call to get outlet-specific stats
      // const response = await fetch('/api/manager/outlet-stats')
      // const stats = await response.json()
      
      // Mock stats for now
      const stats = {
        todayRevenue: 0,
        todayTransactions: 0,
        lowStockItems: 0,
        pendingInvoices: 0,
        staffOnDuty: 0,
        creditCustomers: 0,
        overdueInvoices: 0
      }
      setOutletStats(stats)
    } catch (error) {
      console.error("Failed to load outlet stats:", error)
    }
  }

  const loadOutletInfo = async () => {
    try {
      // TODO: Replace with real API call to get outlet info
      // const response = await fetch('/api/outlets/current')
      // const outlet = await response.json()
      
      // Mock outlet info for now
      const outlet = {
        name: "Main Pharmacy",
        location: "Downtown",
        phone: "+1234567890",
        status: "active"
      }
      setOutletInfo(outlet)
    } catch (error) {
      console.error("Failed to load outlet info:", error)
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
    if (path === "/manager") {
      return pathname === "/manager"
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
                <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">PharmaPOS</h2>
                  <p className="text-sm text-muted-foreground">Manager Portal</p>
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

          {/* Outlet Info */}
          {outletInfo && (
            <div className="p-4 border-b bg-muted/50">
              <div className="text-xs font-medium text-muted-foreground mb-2">CURRENT OUTLET</div>
              <div className="space-y-1">
                <div className="font-medium text-sm">{outletInfo.name}</div>
                <div className="text-xs text-muted-foreground">{outletInfo.location}</div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {outletInfo.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          )}

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

          {/* Quick Stats */}
          {outletStats && (
            <div className="p-4 border-t">
              <div className="text-xs font-medium text-muted-foreground mb-3">TODAY'S OVERVIEW</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="font-medium text-green-600">{formatCurrency(outletStats.todayRevenue)}</div>
                  <div className="text-xs text-muted-foreground">Revenue</div>
                </div>
                <div>
                  <div className="font-medium">{outletStats.todayTransactions}</div>
                  <div className="text-xs text-muted-foreground">Sales</div>
                </div>
                <div>
                  <div className="font-medium text-orange-600">{outletStats.lowStockItems}</div>
                  <div className="text-xs text-muted-foreground">Low Stock</div>
                </div>
                <div>
                  <div className="font-medium text-blue-600">{outletStats.pendingInvoices}</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
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
                      Manager
                    </Badge>
                  </div>
                </div>
                
                <DropdownMenuItem onClick={() => handleNavigate("/manager/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Outlet Settings
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />

                {outletStats && (
                  <>
                    <div className="px-3 py-2 border-b">
                      <p className="text-xs font-medium text-muted-foreground">QUICK STATS</p>
                      <div className="mt-1 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Today's Sales:</span>
                          <span className="font-medium">{outletStats.todayTransactions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Revenue:</span>
                          <span className="font-medium text-green-600">{formatCurrency(outletStats.todayRevenue)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Staff on Duty:</span>
                          <span className="font-medium">{outletStats.staffOnDuty}</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                
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
                  {sidebarItems.find(item => isActivePage(item.href))?.label || "Manager Dashboard"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {outletInfo ? `${outletInfo.name} - ${outletInfo.location}` : "Outlet management"}
                </p>
              </div>
            </div>

            {/* Quick Stats Bar */}
            {outletStats && (
              <div className="hidden md:flex items-center gap-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-green-600">{formatCurrency(outletStats.todayRevenue)}</p>
                  <p className="text-xs text-muted-foreground">Today's Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{outletStats.todayTransactions}</p>
                  <p className="text-xs text-muted-foreground">Sales</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-orange-600">{outletStats.lowStockItems}</p>
                  <p className="text-xs text-muted-foreground">Low Stock</p>
                </div>
                {outletStats.overdueInvoices > 0 && (
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <p className="text-sm font-medium text-red-600">{outletStats.overdueInvoices}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Overdue</p>
                  </div>
                )}
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

export default function ManagerLayout({ children }: ManagerLayoutProps) {
  return (
    <ProtectedRoute>
      <ManagerLayoutContent>{children}</ManagerLayoutContent>
    </ProtectedRoute>
  )
}