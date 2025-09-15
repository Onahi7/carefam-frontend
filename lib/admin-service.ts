import { ApiClient, API_ENDPOINTS } from "./config"
import type { Outlet } from "./types"

export interface OutletMetrics {
  id: string
  name: string
  location: string
  dailySales: number
  monthlySales: number
  staffCount: number
  inventoryValue: number
  lowStockItems: number
  status: "active" | "inactive"
}

export interface SystemMetrics {
  totalOutlets: number
  totalRevenue: number
  totalTransactions: number
  totalProducts: number
  totalUsers: number
  averageTransactionValue: number
}

export interface FinancialReport {
  period: string
  revenue: number
  expenses: number
  profit: number
  profitMargin: number
  topSellingProducts: Array<{
    name: string
    quantity: number
    revenue: number
  }>
}

export interface CreateOutletRequest {
  name: string
  address: string
  phone: string
  managerId?: string
  email?: string
  city?: string
  licenseNumber?: string
  licenseExpiry?: string
  operatingHours?: {
    open: string
    close: string
    timezone?: string
  }
}

export interface CreateUserRequest {
  firstName: string
  lastName: string
  username: string
  password: string
  email: string
  role: 'admin' | 'manager' | 'cashier'
  outletId: string
}

export interface UpdateOutletRequest extends Partial<CreateOutletRequest> {}

export class AdminService {
  // Provide auth headers for legacy fetch usages in some components
  static getAuthHeaders(): Record<string, string> {
    try {
      const sessionData = typeof window !== 'undefined' ? localStorage.getItem('pharmacy_pos_user') : null
      if (!sessionData) return {}
      const session = JSON.parse(sessionData)
      if (session?.token) {
        return { Authorization: `Bearer ${session.token}` }
      }
      return {}
    } catch {
      return {}
    }
  }
  static async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      return await ApiClient.get<SystemMetrics>(`${API_ENDPOINTS.ANALYTICS}/system-metrics`)
    } catch (error) {
      console.error("Failed to fetch system metrics:", error)
      throw error
    }
  }

  static async getOutletMetrics(): Promise<OutletMetrics[]> {
    try {
      return await ApiClient.get<OutletMetrics[]>(`${API_ENDPOINTS.OUTLET_COMPARISON}`)
    } catch (error) {
      console.error("Failed to fetch outlet metrics:", error)
      throw error
    }
  }

  // Outlet Management Methods
  static async getOutlets(): Promise<Outlet[]> {
    try {
      return await ApiClient.get<Outlet[]>(`${API_ENDPOINTS.OUTLETS}`)
    } catch (error) {
      console.error("Failed to fetch outlets:", error)
      throw error
    }
  }

  static async getOutletById(id: string): Promise<Outlet> {
    try {
      return await ApiClient.get<Outlet>(`${API_ENDPOINTS.OUTLETS}/${id}`)
    } catch (error) {
      console.error("Failed to fetch outlet:", error)
      throw error
    }
  }

  static async createOutlet(outletData: CreateOutletRequest): Promise<Outlet> {
    try {
      return await ApiClient.post<Outlet>(`${API_ENDPOINTS.OUTLETS}`, outletData)
    } catch (error) {
      console.error("Failed to create outlet:", error)
      throw error
    }
  }

  static async updateOutlet(id: string, outletData: UpdateOutletRequest): Promise<Outlet> {
    try {
      return await ApiClient.put<Outlet>(`${API_ENDPOINTS.OUTLETS}/${id}`, outletData)
    } catch (error) {
      console.error("Failed to update outlet:", error)
      throw error
    }
  }

  static async deleteOutlet(id: string): Promise<void> {
    try {
      await ApiClient.delete(`${API_ENDPOINTS.OUTLETS}/${id}`)
    } catch (error) {
      console.error("Failed to delete outlet:", error)
      throw error
    }
  }

  static async getFinancialReport(period: string): Promise<FinancialReport> {
    try {
      return await ApiClient.get<FinancialReport>(`${API_ENDPOINTS.FINANCIAL_REPORTS}/summary?period=${period}`)
    } catch (error) {
      console.error("Failed to fetch financial report:", error)
      throw error
    }
  }

  static async getBulkSalesData() {
    try {
      return await ApiClient.get(`${API_ENDPOINTS.BULK_SALES}`)
    } catch (error) {
      console.error("Failed to fetch bulk sales data:", error)
      throw error
    }
  }

  static async getOutletComparison(dateRange: { from: Date; to: Date }) {
    try {
      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      })

      return await ApiClient.get(`${API_ENDPOINTS.OUTLET_COMPARISON}/detailed?${params.toString()}`)
    } catch (error) {
      console.error("Failed to fetch outlet comparison:", error)
      throw error
    }
  }

  static async getUsers() {
    try {
      return await ApiClient.get(`/users`)
    } catch (error) {
      console.error("Failed to fetch users:", error)
      throw error
    }
  }

  static async createUser(userData: CreateUserRequest) {
    try {
      return await ApiClient.post(`${API_ENDPOINTS.REGISTER}`, userData)
    } catch (error) {
      console.error("Failed to create user:", error)
      throw error
    }
  }

  static async updateUser(
    userId: string,
    userData: Partial<{
      firstName: string
      lastName: string
      email: string
      role: "admin" | "manager" | "cashier"
      outletId: string
      isActive: boolean
    }>,
  ) {
    try {
      return await ApiClient.put(`/users/${userId}`, userData)
    } catch (error) {
      console.error("Failed to update user:", error)
      throw error
    }
  }

  static async deactivateUser(userId: string) {
    try {
      return await ApiClient.delete(`/users/${userId}`)
    } catch (error) {
      console.error("Failed to deactivate user:", error)
      throw error
    }
  }

  static async getUserManagement() {
    try {
      return await ApiClient.get(`${API_ENDPOINTS.ANALYTICS}/users`)
    } catch (error) {
      console.error("Failed to fetch user management data:", error)
      throw error
    }
  }

  static async deleteUser(userId: string) {
    try {
      return await ApiClient.delete(`${API_ENDPOINTS.ANALYTICS}/users/${userId}`)
    } catch (error) {
      console.error("Failed to delete user:", error)
      throw error
    }
  }

  // Product Management Methods
  static async getProducts() {
    try {
      return await ApiClient.get(`${API_ENDPOINTS.PRODUCTS}`)
    } catch (error) {
      console.error("Failed to fetch products:", error)
      throw error
    }
  }

  static async createProduct(productData: any) {
    try {
      return await ApiClient.post(`${API_ENDPOINTS.PRODUCTS}`, productData)
    } catch (error) {
      console.error("Failed to create product:", error)
      throw error
    }
  }

  static async updateProduct(productId: string, productData: any) {
    try {
      return await ApiClient.put(`${API_ENDPOINTS.PRODUCTS}/${productId}`, productData)
    } catch (error) {
      console.error("Failed to update product:", error)
      throw error
    }
  }

  static async deleteProduct(productId: string) {
    try {
      return await ApiClient.delete(`${API_ENDPOINTS.PRODUCTS}/${productId}`)
    } catch (error) {
      console.error("Failed to delete product:", error)
      throw error
    }
  }

  static async getProductCategories() {
    try {
      return await ApiClient.get(`${API_ENDPOINTS.PRODUCTS}/categories`)
    } catch (error) {
      console.error("Failed to fetch product categories:", error)
      throw error
    }
  }

  static async getProductTypes() {
    try {
      return await ApiClient.get(`${API_ENDPOINTS.PRODUCTS}/types`)
    } catch (error) {
      console.error("Failed to fetch product types:", error)
      throw error
    }
  }

  // Customer Management Methods
  static async getCustomers() {
    try {
      return await ApiClient.get(`${API_ENDPOINTS.CUSTOMERS}`)
    } catch (error) {
      console.error("Failed to fetch customers:", error)
      throw error
    }
  }

  static async getCustomersByOutlet(outletId: string) {
    try {
      return await ApiClient.get(`${API_ENDPOINTS.CUSTOMERS}/outlet/${outletId}`)
    } catch (error) {
      console.error("Failed to fetch customers for outlet:", error)
      throw error
    }
  }

  static async createCustomer(customerData: any) {
    try {
      return await ApiClient.post(`${API_ENDPOINTS.CUSTOMERS}`, customerData)
    } catch (error) {
      console.error("Failed to create customer:", error)
      throw error
    }
  }

  static async updateCustomer(customerId: string, customerData: any) {
    try {
      return await ApiClient.put(`${API_ENDPOINTS.CUSTOMERS}/${customerId}`, customerData)
    } catch (error) {
      console.error("Failed to update customer:", error)
      throw error
    }
  }

  static async deleteCustomer(customerId: string) {
    try {
      return await ApiClient.delete(`${API_ENDPOINTS.CUSTOMERS}/${customerId}`)
    } catch (error) {
      console.error("Failed to delete customer:", error)
      throw error
    }
  }

  // Invoice Management Methods
  static async getInvoices() {
    try {
      return await ApiClient.get(`/invoices`)
    } catch (error) {
      console.error("Failed to fetch invoices:", error)
      throw error
    }
  }

  static async getInvoicesByOutlet(outletId: string) {
    try {
      return await ApiClient.get(`/invoices/outlet/${outletId}`)
    } catch (error) {
      console.error("Failed to fetch invoices for outlet:", error)
      throw error
    }
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-SL", {
      style: "currency",
      currency: "SLL",
      minimumFractionDigits: 0,
    }).format(amount)
  }
}
