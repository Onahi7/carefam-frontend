export const USER_ROLES = {
  STAFF: "staff",
  MANAGER: "manager",
  ADMIN: "admin",
} as const

export const TRANSACTION_STATUS = {
  COMPLETED: "completed",
  PENDING: "pending",
  CANCELLED: "cancelled",
} as const

export const PAYMENT_METHODS = {
  CASH: "cash",
  CARD: "card",
  MOBILE: "mobile",
} as const

export const PURCHASE_ORDER_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  RECEIVED: "received",
  CANCELLED: "cancelled",
} as const

export const PRODUCT_CATEGORIES = [
  "Prescription Drugs",
  "Over-the-Counter",
  "Vitamins & Supplements",
  "Personal Care",
  "Medical Devices",
  "First Aid",
  "Baby Care",
  "Other",
] as const

export const CURRENCY = {
  SLE: "SLE", // Sierra Leone Leone
  USD: "USD",
} as const

export const DEFAULT_PAGINATION = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const
