import { ApiClient, API_ENDPOINTS } from "./config"

export interface Supplier {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  status: "active" | "inactive"
  rating: number
  totalOrders: number
  lastOrderDate: string
  paymentTerms: string
}

export interface PurchaseOrder {
  id: string
  supplierId: string
  supplierName: string
  orderDate: string
  expectedDelivery: string
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  items: Array<{
    productId: string
    productName: string
    quantity: number
    unitCost: number
    totalCost: number
  }>
  totalAmount: number
  notes?: string
}

export class SupplierService {
  static async getSuppliers(): Promise<Supplier[]> {
    try {
      return await ApiClient.get<Supplier[]>(API_ENDPOINTS.SUPPLIERS)
    } catch (error) {
      console.error("Failed to fetch suppliers:", error)
      throw error
    }
  }

  static async getSupplierById(id: string): Promise<Supplier | null> {
    try {
      return await ApiClient.get<Supplier>(`${API_ENDPOINTS.SUPPLIERS}/${id}`)
    } catch (error) {
      console.error("Failed to fetch supplier:", error)
      return null
    }
  }

  static async createSupplier(
    supplierData: Omit<Supplier, "id" | "totalOrders" | "lastOrderDate" | "rating">,
  ): Promise<Supplier> {
    try {
      return await ApiClient.post<Supplier>(API_ENDPOINTS.SUPPLIERS, supplierData)
    } catch (error) {
      console.error("Failed to create supplier:", error)
      throw error
    }
  }

  static async updateSupplier(id: string, supplierData: Partial<Supplier>): Promise<Supplier> {
    try {
      return await ApiClient.put<Supplier>(`${API_ENDPOINTS.SUPPLIERS}/${id}`, supplierData)
    } catch (error) {
      console.error("Failed to update supplier:", error)
      throw error
    }
  }

  static async deleteSupplier(id: string): Promise<boolean> {
    try {
      await ApiClient.delete(`${API_ENDPOINTS.SUPPLIERS}/${id}`)
      return true
    } catch (error) {
      console.error("Failed to delete supplier:", error)
      throw error
    }
  }

  static async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    try {
      return await ApiClient.get<PurchaseOrder[]>(API_ENDPOINTS.PURCHASE_ORDERS)
    } catch (error) {
      console.error("Failed to fetch purchase orders:", error)
      throw error
    }
  }

  static async getPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
    try {
      return await ApiClient.get<PurchaseOrder>(`${API_ENDPOINTS.PURCHASE_ORDERS}/${id}`)
    } catch (error) {
      console.error("Failed to fetch purchase order:", error)
      return null
    }
  }

  static async createPurchaseOrder(orderData: Omit<PurchaseOrder, "id">): Promise<PurchaseOrder> {
    try {
      return await ApiClient.post<PurchaseOrder>(API_ENDPOINTS.PURCHASE_ORDERS, orderData)
    } catch (error) {
      console.error("Failed to create purchase order:", error)
      throw error
    }
  }

  static async updatePurchaseOrderStatus(
    id: string,
    status: PurchaseOrder["status"],
    notes?: string,
  ): Promise<PurchaseOrder> {
    try {
      return await ApiClient.put<PurchaseOrder>(`${API_ENDPOINTS.PURCHASE_ORDERS}/${id}/status`, { status, notes })
    } catch (error) {
      console.error("Failed to update purchase order status:", error)
      throw error
    }
  }

  static async receivePurchaseOrder(
    id: string,
    receivedItems: Array<{
      productId: string
      quantityReceived: number
      expiryDate?: string
      batchNumber?: string
    }>,
  ): Promise<boolean> {
    try {
      await ApiClient.post(`${API_ENDPOINTS.PURCHASE_ORDERS}/${id}/receive`, { receivedItems })
      return true
    } catch (error) {
      console.error("Failed to receive purchase order:", error)
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

  static getStatusColor(status: string) {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "pending":
        return "secondary"
      case "confirmed":
        return "default"
      case "shipped":
        return "default"
      case "delivered":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }
}
