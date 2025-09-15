import { ProtectedRoute } from "@/components/auth/protected-route"
import { SupplierList } from "@/components/suppliers/supplier-list"
import { PurchaseOrders } from "@/components/suppliers/purchase-orders"

export default function SuppliersPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "manager"]}>
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Supplier Management</h1>
            <p className="text-muted-foreground mt-1">Manage suppliers, purchase orders, and procurement operations</p>
          </div>
        </div>

        {/* Supplier Management */}
        <section>
          <SupplierList />
        </section>

        {/* Purchase Orders */}
        <section>
          <PurchaseOrders />
        </section>
      </div>
    </ProtectedRoute>
  )
}
