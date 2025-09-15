import { SystemOverview } from "@/components/admin/system-overview"
import { OutletComparison } from "@/components/admin/outlet-comparison"
import { FinancialReports } from "@/components/admin/financial-reports"
import { BulkSalesManagement } from "@/components/admin/bulk-sales-management"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Users, TrendingUp, ArrowRight } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Comprehensive system oversight and multi-outlet management for your pharmacy network
        </p>
      </div>

      {/* System Overview */}
      <section>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">System Overview</h3>
          <p className="text-sm text-muted-foreground">Real-time system performance metrics</p>
        </div>
        <SystemOverview />
      </section>

      {/* Outlet Comparison */}
      <section>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">Multi-Outlet Performance</h3>
          <p className="text-sm text-muted-foreground">Compare performance across all pharmacy locations</p>
        </div>
        <OutletComparison />
      </section>

      {/* Financial Reports */}
      <section>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">Financial Analytics</h3>
          <p className="text-sm text-muted-foreground">Revenue trends and financial insights</p>
        </div>
        <FinancialReports />
      </section>

      {/* Bulk Sales Management */}
      <section>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">Wholesale Operations</h3>
          <p className="text-sm text-muted-foreground">Manage bulk sales and wholesale transactions</p>
        </div>
        <BulkSalesManagement />
      </section>

      {/* Shift Management Overview */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Shift Management</h3>
            <p className="text-sm text-muted-foreground">Monitor staff shifts and performance across all outlets</p>
          </div>
          <Button asChild>
            <a href="/admin/shift-history">
              View All Shifts
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">staff currently on duty</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Shifts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">completed shifts today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0</div>
              <p className="text-xs text-muted-foreground">average shift sales</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
