import type { Transaction } from "./types"
import { ApiClient, API_ENDPOINTS } from "./config"

export interface SalesAnalytics {
  totalSales: number
  totalTransactions: number
  averageTransaction: number
  topProducts: Array<{
    productId: string
    productName: string
    quantitySold: number
    revenue: number
  }>
  salesByHour: Array<{
    hour: number
    sales: number
    transactions: number
  }>
  salesByDay: Array<{
    date: string
    sales: number
    transactions: number
  }>
}

export interface StaffPerformance {
  staffId: string
  staffName: string
  totalSales: number
  totalTransactions: number
  averageTransaction: number
  hoursWorked: number
  salesPerHour: number
}

export interface InventoryAlert {
  type: "low_stock" | "expiring" | "expired"
  productId: string
  productName: string
  currentStock: number
  reorderPoint?: number
  expiryDate?: Date
  severity: "high" | "medium" | "low"
}

export class ManagerService {
  static async getSalesAnalytics(outletId: string, dateRange: { from: Date; to: Date }): Promise<SalesAnalytics> {
    try {
      const params = new URLSearchParams({
        outletId,
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      })

      return await ApiClient.get<SalesAnalytics>(`${API_ENDPOINTS.SALES_ANALYTICS}?${params.toString()}`)
    } catch (error) {
      console.error("Failed to fetch sales analytics:", error)
      throw error
    }
  }

  static async getStaffPerformance(outletId: string, dateRange: { from: Date; to: Date }): Promise<StaffPerformance[]> {
    try {
      const params = new URLSearchParams({
        outletId,
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      })

      return await ApiClient.get<StaffPerformance[]>(`${API_ENDPOINTS.STAFF_PERFORMANCE}?${params.toString()}`)
    } catch (error) {
      console.error("Failed to fetch staff performance:", error)
      throw error
    }
  }

  static async getInventoryAlerts(outletId: string): Promise<InventoryAlert[]> {
    try {
      return await ApiClient.get<InventoryAlert[]>(`${API_ENDPOINTS.INVENTORY_REPORTS}/alerts/${outletId}`)
    } catch (error) {
      console.error("Failed to fetch inventory alerts:", error)
      throw error
    }
  }

  static async generateSalesReport(
    outletId: string,
    dateRange: { from: Date; to: Date },
  ): Promise<{
    summary: SalesAnalytics
    transactions: Transaction[]
    staffPerformance: StaffPerformance[]
  }> {
    try {
      const params = new URLSearchParams({
        outletId,
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      })

      return await ApiClient.get(`${API_ENDPOINTS.SALES_ANALYTICS}/report?${params.toString()}`)
    } catch (error) {
      console.error("Failed to generate sales report:", error)
      throw error
    }
  }

  static async getRecentActivity(
    outletId: string,
    limit = 20,
  ): Promise<
    Array<{
      id: string
      type: "sale" | "inventory_adjustment" | "staff_action"
      description: string
      amount?: number
      timestamp: Date
      staffName?: string
    }>
  > {
    try {
      return await ApiClient.get(`${API_ENDPOINTS.SALES_ANALYTICS}/activity/${outletId}?limit=${limit}`)
    } catch (error) {
      console.error("Failed to fetch recent activity:", error)
      throw error
    }
  }

  static async getFinancialReport(
    outletId: string,
    dateRange: { from: Date; to: Date },
  ): Promise<{
    revenue: number
    profit: number
    expenses: number
    profitMargin: number
    revenueByCategory: Array<{ category: string; revenue: number }>
    monthlyTrend: Array<{ month: string; revenue: number; profit: number }>
  }> {
    try {
      const params = new URLSearchParams({
        outletId,
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      })

      return await ApiClient.get(`${API_ENDPOINTS.FINANCIAL_REPORTS}?${params.toString()}`)
    } catch (error) {
      console.error("Failed to fetch financial report:", error)
      throw error
    }
  }

  static async getInventoryReport(outletId: string): Promise<{
    totalProducts: number
    totalValue: number
    lowStockCount: number
    expiringCount: number
    categoryBreakdown: Array<{ category: string; count: number; value: number }>
    turnoverRate: number
  }> {
    try {
      return await ApiClient.get(`${API_ENDPOINTS.INVENTORY_REPORTS}/${outletId}`)
    } catch (error) {
      console.error("Failed to fetch inventory report:", error)
      throw error
    }
  }
}
