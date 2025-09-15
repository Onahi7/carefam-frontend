import type { Product, InventoryItem, AuditLog } from "./types"
import { ApiClient, API_ENDPOINTS } from "./config"

export class InventoryService {
  static async getProducts(search?: string, category?: string): Promise<Product[]> {
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (category && category !== "all") params.append("category", category)

      const endpoint = `${API_ENDPOINTS.PRODUCTS}${params.toString() ? `?${params.toString()}` : ""}`
      return await ApiClient.get<Product[]>(endpoint)
    } catch (error) {
      console.error("Failed to fetch products:", error)
      throw error
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      return await ApiClient.get<Product>(`${API_ENDPOINTS.PRODUCTS}/${id}`)
    } catch (error) {
      console.error("Failed to fetch product:", error)
      return null
    }
  }

  static async getProductByBarcode(barcode: string): Promise<Product | null> {
    try {
      return await ApiClient.get<Product>(`${API_ENDPOINTS.PRODUCT_BY_BARCODE}/${barcode}`)
    } catch (error) {
      console.error("Failed to fetch product by barcode:", error)
      return null
    }
  }

  static async getInventory(outletId: string): Promise<InventoryItem[]> {
    try {
      return await ApiClient.get<InventoryItem[]>(`${API_ENDPOINTS.PRODUCTS}/inventory/${outletId}`)
    } catch (error) {
      console.error("Failed to fetch inventory:", error)
      throw error
    }
  }

  static async getInventoryItem(productId: string, outletId: string): Promise<InventoryItem | null> {
    try {
      return await ApiClient.get<InventoryItem>(`${API_ENDPOINTS.PRODUCTS}/inventory/${outletId}/${productId}`)
    } catch (error) {
      console.error("Failed to fetch inventory item:", error)
      return null
    }
  }

  static async getLowStockItems(outletId: string): Promise<InventoryItem[]> {
    try {
      return await ApiClient.get<InventoryItem[]>(`${API_ENDPOINTS.LOW_STOCK_ALERTS}/${outletId}`)
    } catch (error) {
      console.error("Failed to fetch low stock items:", error)
      throw error
    }
  }

  static async getExpiringProducts(outletId: string, daysThreshold = 30): Promise<InventoryItem[]> {
    try {
      return await ApiClient.get<InventoryItem[]>(`${API_ENDPOINTS.EXPIRY_ALERTS}/${outletId}?days=${daysThreshold}`)
    } catch (error) {
      console.error("Failed to fetch expiring products:", error)
      throw error
    }
  }

  static async updateStock(productId: string, outletId: string, newQuantity: number, reason: string): Promise<boolean> {
    try {
      await ApiClient.post(API_ENDPOINTS.STOCK_ADJUSTMENT, {
        productId,
        outletId,
        newQuantity,
        reason,
        type: "absolute",
      })
      return true
    } catch (error) {
      console.error("Failed to update stock:", error)
      throw error
    }
  }

  static async adjustStock(productId: string, outletId: string, adjustment: number, reason: string): Promise<boolean> {
    try {
      await ApiClient.post(API_ENDPOINTS.STOCK_ADJUSTMENT, {
        productId,
        outletId,
        adjustment,
        reason,
        type: "relative",
      })
      return true
    } catch (error) {
      console.error("Failed to adjust stock:", error)
      throw error
    }
  }

  static async updateReorderPoint(productId: string, outletId: string, reorderPoint: number): Promise<boolean> {
    try {
      await ApiClient.put(`${API_ENDPOINTS.PRODUCTS}/inventory/${outletId}/${productId}/reorder-point`, {
        reorderPoint,
      })
      return true
    } catch (error) {
      console.error("Failed to update reorder point:", error)
      throw error
    }
  }

  static async getAuditLogs(outletId: string, limit = 50): Promise<AuditLog[]> {
    try {
      return await ApiClient.get<AuditLog[]>(`${API_ENDPOINTS.PRODUCTS}/audit/${outletId}?limit=${limit}`)
    } catch (error) {
      console.error("Failed to fetch audit logs:", error)
      throw error
    }
  }

  static async createProduct(productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    try {
      return await ApiClient.post<Product>(API_ENDPOINTS.PRODUCTS, productData)
    } catch (error) {
      console.error("Failed to create product:", error)
      throw error
    }
  }

  static async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    try {
      return await ApiClient.put<Product>(`${API_ENDPOINTS.PRODUCTS}/${id}`, productData)
    } catch (error) {
      console.error("Failed to update product:", error)
      throw error
    }
  }

  static async deleteProduct(id: string): Promise<boolean> {
    try {
      await ApiClient.delete(`${API_ENDPOINTS.PRODUCTS}/${id}`)
      return true
    } catch (error) {
      console.error("Failed to delete product:", error)
      throw error
    }
  }

  static getCategories(): string[] {
    return [
      "Prescription Drugs",
      "Over-the-Counter",
      "Vitamins & Supplements",
      "Personal Care",
      "Medical Devices",
      "First Aid",
      "Baby Care",
      "Other",
    ]
  }
}
