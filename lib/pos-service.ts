import type { Product, Transaction, TransactionItem } from "./types"
import { AuthService } from "./auth"
import { InventoryService } from "./inventory-service"
import { ApiClient, API_ENDPOINTS } from "./config"

export interface CartItem {
  product: Product
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

export interface PaymentDetails {
  method: "cash" | "card" | "mobile"
  amountReceived?: number
  change?: number
  reference?: string
}

export class POSService {
  static async processBarcodeScan(barcode: string): Promise<Product | null> {
    try {
      return await InventoryService.getProductByBarcode(barcode)
    } catch (error) {
      console.error("Barcode scan failed:", error)
      return null
    }
  }

  static calculateCartTotals(items: CartItem[]) {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const totalDiscount = items.reduce((sum, item) => sum + item.discount * item.quantity, 0)
    const tax = subtotal * 0.15 // 15% tax rate for Sierra Leone
    const total = subtotal + tax

    return {
      subtotal,
      totalDiscount,
      tax,
      total,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    }
  }

  static async processTransaction(
    items: CartItem[],
    paymentDetails: PaymentDetails,
    customerId?: string,
    isBulkSale = false,
  ): Promise<{ transaction: Transaction; receiptNumber: string }> {
    try {
      const user = AuthService.getCurrentUser()
      if (!user) {
        throw new Error("User not authenticated")
      }

      const totals = this.calculateCartTotals(items)

      // Create transaction items
      const transactionItems: TransactionItem[] = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        total: item.total,
        product: item.product,
      }))

      const transactionData = {
        outletId: user.outletId,
        staffId: user.id,
        customerId,
        items: transactionItems,
        subtotal: totals.subtotal,
        tax: totals.tax,
        discount: totals.totalDiscount,
        total: totals.total,
        paymentMethod: paymentDetails.method,
        isBulkSale,
        paymentDetails: {
          amountReceived: paymentDetails.amountReceived,
          change: paymentDetails.change,
          reference: paymentDetails.reference,
        },
      }

      const response = await ApiClient.post<{ transaction: Transaction; receiptNumber: string }>(
        isBulkSale ? API_ENDPOINTS.BULK_SALES : API_ENDPOINTS.TRANSACTIONS,
        transactionData,
      )

      return response
    } catch (error) {
      console.error("Failed to process transaction:", error)
      throw error
    }
  }

  static async getTransactionHistory(outletId: string, limit = 50): Promise<Transaction[]> {
    try {
      return await ApiClient.get<Transaction[]>(`${API_ENDPOINTS.TRANSACTIONS}?outletId=${outletId}&limit=${limit}`)
    } catch (error) {
      console.error("Failed to fetch transaction history:", error)
      throw error
    }
  }

  static async getTransactionById(id: string): Promise<Transaction | null> {
    try {
      return await ApiClient.get<Transaction>(`${API_ENDPOINTS.TRANSACTIONS}/${id}`)
    } catch (error) {
      console.error("Failed to fetch transaction:", error)
      return null
    }
  }

  static async generateReceipt(transactionId: string): Promise<string> {
    try {
      const response = await ApiClient.get<{ receipt: string }>(`${API_ENDPOINTS.TRANSACTION_RECEIPT}/${transactionId}`)
      return response.receipt
    } catch (error) {
      console.error("Failed to generate receipt:", error)
      throw error
    }
  }

  static async voidTransaction(transactionId: string, reason: string): Promise<boolean> {
    try {
      const user = AuthService.getCurrentUser()
      if (!user || !AuthService.hasRole("manager")) {
        throw new Error("Insufficient permissions to void transaction")
      }

      await ApiClient.post(`${API_ENDPOINTS.TRANSACTIONS}/${transactionId}/void`, { reason })
      return true
    } catch (error) {
      console.error("Failed to void transaction:", error)
      throw error
    }
  }

  static async getDailySales(
    outletId: string,
    date?: string,
  ): Promise<{
    totalSales: number
    transactionCount: number
    averageTransaction: number
    topProducts: Array<{ product: Product; quantity: number; revenue: number }>
  }> {
    try {
      const dateParam = date || new Date().toISOString().split("T")[0]
      return await ApiClient.get(`${API_ENDPOINTS.TRANSACTIONS}/daily-sales/${outletId}?date=${dateParam}`)
    } catch (error) {
      console.error("Failed to fetch daily sales:", error)
      throw error
    }
  }

  static async getShiftSummary(shiftId: string): Promise<{
    shiftId: string
    startTime: string
    endTime?: string
    totalSales: number
    transactionCount: number
    cashSales: number
    cardSales: number
    mobileSales: number
  }> {
    try {
      return await ApiClient.get(`${API_ENDPOINTS.TRANSACTIONS}/shift-summary/${shiftId}`)
    } catch (error) {
      console.error("Failed to fetch shift summary:", error)
      throw error
    }
  }
}
