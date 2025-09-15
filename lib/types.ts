export interface User {
  id: string
  email: string
  name: string
  role: "staff" | "manager" | "admin"
  outletId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  currentShift?: {
    status: string
    startTime: Date
    endTime?: Date
    openingCash: number
    totalSales: number
    cashSales: number
    cardSales: number
    mobileSales: number
    transactionCount: number
    totalCashIn: number
    totalCashOut: number
    expectedCash: number
    actualCash?: number
    variance?: number
    notes?: string
  }
}

export interface Outlet {
  id: string
  name: string
  address: string
  phone: string
  managerId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  barcode: string
  description?: string
  category: string
  manufacturer: string
  unitPrice: number
  wholesalePrice: number
  costPrice: number
  expiryDate: Date
  batchNumber: string
  requiresPrescription: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface InventoryItem {
  id: string
  productId: string
  outletId: string
  quantity: number
  reorderPoint: number
  maxStock: number
  lastRestocked: Date
  product?: Product
}

export interface Transaction {
  id: string
  outletId: string
  staffId: string
  customerId?: string
  items: TransactionItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: "cash" | "card" | "mobile"
  status: "completed" | "pending" | "cancelled"
  isBulkSale: boolean
  createdAt: Date
}

export interface TransactionItem {
  productId: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
  product?: Product
}

export interface Supplier {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PurchaseOrder {
  id: string
  supplierId: string
  outletId: string
  orderNumber: string
  items: PurchaseOrderItem[]
  subtotal: number
  tax: number
  total: number
  status: "pending" | "approved" | "received" | "cancelled"
  orderDate: Date
  expectedDelivery?: Date
  receivedDate?: Date
  createdBy: string
  supplier?: Supplier
}

export interface PurchaseOrderItem {
  productId: string
  quantity: number
  unitCost: number
  total: number
  received?: number
  product?: Product
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  entityType: string
  entityId: string
  changes: Record<string, any>
  timestamp: Date
  outletId: string
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  customerType: "walk_in" | "b2b" | "institutional"
  businessName?: string
  businessRegistrationNumber?: string
  taxIdentificationNumber?: string
  address?: {
    street?: string
    city?: string
    region?: string
    postalCode?: string
    country?: string
  }
  contactPerson?: string
  contactPersonPhone?: string
  preferredPaymentMethods?: PaymentMethod[]
  creditLimit: number
  currentCreditBalance: number
  creditTermDays: number
  creditStatus: "good" | "overdue" | "suspended" | "blocked"
  isWholesaleCustomer: boolean
  discountPercentage: number
  assignedOutlet?: string
  totalPurchases: number
  lifetimeValue: number
  lastPurchaseDate?: Date
  isActive: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Invoice {
  id: string
  invoiceNumber: string
  invoiceType: "proforma" | "invoice" | "credit_note" | "debit_note"
  status: "draft" | "pending" | "approved" | "sent" | "paid" | "partially_paid" | "overdue" | "cancelled" | "void"
  customer: Customer
  outlet: Outlet
  issueDate: Date
  dueDate?: Date
  validUntil?: Date
  items: InvoiceItem[]
  subtotal: number
  discountPercentage: number
  discountAmount: number
  taxes: TaxBreakdown[]
  totalTaxAmount: number
  totalAmount: number
  amountPaid: number
  amountDue: number
  payments: PaymentRecord[]
  acceptedPaymentMethods: PaymentMethod[]
  isCreditSale: boolean
  creditTermDays: number
  customerNotes?: string
  internalNotes?: string
  termsAndConditions?: string
  purchaseOrderNumber?: string
  deliveryAddress?: {
    street?: string
    city?: string
    region?: string
    postalCode?: string
    country?: string
  }
  deliveryDate?: Date
  deliveryNotes?: string
  createdAt: Date
  updatedAt: Date
}

export interface InvoiceItem {
  product: Product
  productName: string
  quantity: number
  unitPrice: number
  discountPercentage: number
  lineTotal: number
  notes?: string
}

export interface TaxBreakdown {
  taxType: "vat" | "withholding_tax" | "excise_duty" | "import_duty"
  taxName: string
  taxRate: number
  taxableAmount: number
  taxAmount: number
}

export interface PaymentRecord {
  amount: number
  paymentMethod: PaymentMethod
  paymentDate: Date
  paymentReference?: string
  paymentNotes?: string
  recordedBy: string
}

export type PaymentMethod = "cash" | "afrimoney" | "mobile_money" | "bank_transfer" | "credit" | "cheque"

export interface CreditTransaction {
  id: string
  transactionNumber: string
  customer: Customer
  transactionType: "credit_sale" | "payment" | "credit_adjustment" | "interest_charge" | "late_fee" | "credit_limit_adjustment"
  amount: number
  description: string
  relatedInvoice?: Invoice
  status: "pending" | "approved" | "rejected" | "reversed"
  transactionDate: Date
  dueDate?: Date
  runningBalance: number
  outlet: Outlet
  createdAt: Date
  updatedAt: Date
}
