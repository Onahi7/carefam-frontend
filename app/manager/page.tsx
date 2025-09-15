import { ManagerOverview } from "@/components/manager/manager-overview"
import { OutletAnalytics } from "@/components/manager/outlet-analytics"
import { StaffManagement } from "@/components/manager/staff-management"
import { InventoryOverview } from "@/components/manager/inventory-overview"

export default function ManagerPage() {
  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Manager Dashboard</h2>
        <p className="text-muted-foreground">
          Comprehensive outlet management and team oversight for your pharmacy location
        </p>
      </div>

      {/* Outlet Overview */}
      <section>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">Outlet Overview</h3>
          <p className="text-sm text-muted-foreground">Real-time outlet performance metrics</p>
        </div>
        <ManagerOverview />
      </section>

      {/* Sales Analytics */}
      <section>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">Sales & Analytics</h3>
          <p className="text-sm text-muted-foreground">Track sales performance and trends</p>
        </div>
        <OutletAnalytics />
      </section>

      {/* Staff Management */}
      <section>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">Team Management</h3>
          <p className="text-sm text-muted-foreground">Monitor staff performance and schedules</p>
        </div>
        <StaffManagement />
      </section>

      {/* Inventory Overview */}
      <section>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">Inventory Status</h3>
          <p className="text-sm text-muted-foreground">Monitor stock levels and alerts</p>
        </div>
        <InventoryOverview />
      </section>
    </div>
  )
}
