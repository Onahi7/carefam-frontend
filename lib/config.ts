// API Configuration for Pharmacy POS System
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  REFRESH: "/auth/refresh",
  START_SHIFT: "/auth/start-shift",
  END_SHIFT: "/auth/end-shift",
  SHIFT_HISTORY: "/shift-history",

  // Products & Inventory
  PRODUCTS: "/products",
  PRODUCT_BY_BARCODE: "/products/barcode",
  STOCK_ADJUSTMENT: "/products/stock-adjustment",
  LOW_STOCK_ALERTS: "/products/low-stock",
  EXPIRY_ALERTS: "/products/expiring",

  // Transactions
  TRANSACTIONS: "/transactions",
  BULK_SALES: "/transactions/bulk",
  TRANSACTION_RECEIPT: "/transactions/receipt",

  // Analytics
  ANALYTICS: "/analytics",
  SALES_ANALYTICS: "/analytics/sales",
  STAFF_PERFORMANCE: "/analytics/staff",
  INVENTORY_REPORTS: "/analytics/inventory",
  FINANCIAL_REPORTS: "/analytics/financial",

  // Outlets
  OUTLETS: "/outlets",
  OUTLET_COMPARISON: "/outlets/comparison",

  // Suppliers
  SUPPLIERS: "/suppliers",
  PURCHASE_ORDERS: "/suppliers/purchase-orders",

  // Customers
  CUSTOMERS: "/customers",
} as const

// API Client with error handling and retry logic
export class ApiClient {
  private static async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`
    const token = this.getAuthToken()

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    }

    let lastError: Error

    for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          if (response.status === 401) {
            // Handle unauthorized - redirect to login
            this.handleUnauthorized()
            throw new Error("Unauthorized")
          }

          const errorData = await response.json().catch(() => ({}))
          const error = new Error(errorData.message || `HTTP ${response.status}`)
          ;(error as any).response = { status: response.status, data: errorData }
          throw error
        }

        return await response.json()
      } catch (error) {
        lastError = error as Error

        // Don't retry on certain errors
        if (error instanceof Error && error.message === "Unauthorized") {
          throw lastError
        }

        if (attempt === API_CONFIG.RETRY_ATTEMPTS) {
          // Import dynamically to avoid circular dependency
          const { ErrorHandler, ToastManager } = await import("./error-handler")
          const apiError = ErrorHandler.handleApiError(lastError)

          // Show toast notification for user-facing errors
          if (apiError.status !== 401) {
            // Don't show toast for auth errors (handled by redirect)
            ToastManager.error("Request Failed", apiError.message)
          }

          throw lastError
        }

        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }

    throw lastError!
  }

  static async get<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: "GET" })
  }

  static async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  static async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: "DELETE" })
  }

  private static getAuthToken(): string | null {
    try {
      const sessionData = localStorage.getItem("pharmacy_pos_user")
      if (!sessionData) return null

      const session = JSON.parse(sessionData)
      return session.token || null
    } catch {
      return null
    }
  }

  private static handleUnauthorized(): void {
    localStorage.removeItem("pharmacy_pos_user")
    window.location.href = "/"
  }
}
