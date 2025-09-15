// Global Error Handling and Toast Notifications for Pharmacy POS
export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: any
}

export class ErrorHandler {
  static handleApiError(error: any): ApiError {
    // Network errors
    if (error.name === "AbortError") {
      return {
        message: "Request timed out. Please check your connection and try again.",
        code: "TIMEOUT",
        status: 408,
      }
    }

    if (!navigator.onLine) {
      return {
        message: "No internet connection. Please check your network and try again.",
        code: "OFFLINE",
        status: 0,
      }
    }

    // API errors with response
    if (error.response) {
      const status = error.response.status
      const data = error.response.data

      switch (status) {
        case 400:
          return {
            message: data?.message || "Invalid request. Please check your input.",
            code: "BAD_REQUEST",
            status: 400,
            details: data?.details,
          }
        case 401:
          return {
            message: "Session expired. Please log in again.",
            code: "UNAUTHORIZED",
            status: 401,
          }
        case 403:
          return {
            message: "You do not have permission to perform this action.",
            code: "FORBIDDEN",
            status: 403,
          }
        case 404:
          return {
            message: "The requested resource was not found.",
            code: "NOT_FOUND",
            status: 404,
          }
        case 409:
          return {
            message: data?.message || "A conflict occurred. The resource may already exist.",
            code: "CONFLICT",
            status: 409,
          }
        case 422:
          return {
            message: data?.message || "Validation failed. Please check your input.",
            code: "VALIDATION_ERROR",
            status: 422,
            details: data?.errors,
          }
        case 429:
          return {
            message: "Too many requests. Please wait a moment and try again.",
            code: "RATE_LIMIT",
            status: 429,
          }
        case 500:
          return {
            message: "Server error. Please try again later or contact support.",
            code: "SERVER_ERROR",
            status: 500,
          }
        case 503:
          return {
            message: "Service temporarily unavailable. Please try again later.",
            code: "SERVICE_UNAVAILABLE",
            status: 503,
          }
        default:
          return {
            message: data?.message || `An error occurred (${status}). Please try again.`,
            code: "UNKNOWN_ERROR",
            status,
          }
      }
    }

    // Generic errors
    if (error.message) {
      return {
        message: error.message,
        code: "GENERIC_ERROR",
      }
    }

    return {
      message: "An unexpected error occurred. Please try again.",
      code: "UNKNOWN_ERROR",
    }
  }

  static getErrorMessage(error: any): string {
    const apiError = this.handleApiError(error)
    return apiError.message
  }

  static shouldRetry(error: ApiError): boolean {
    const retryableCodes = ["TIMEOUT", "OFFLINE", "SERVER_ERROR", "SERVICE_UNAVAILABLE", "RATE_LIMIT"]
    return retryableCodes.includes(error.code || "")
  }

  static logError(error: any, context?: string) {
    const apiError = this.handleApiError(error)
    console.error(`[${context || "API"}] Error:`, {
      message: apiError.message,
      code: apiError.code,
      status: apiError.status,
      details: apiError.details,
      timestamp: new Date().toISOString(),
    })
  }
}

// Toast notification types
export type ToastType = "success" | "error" | "warning" | "info"

export interface ToastMessage {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

// Simple toast manager for error notifications
export class ToastManager {
  private static toasts: ToastMessage[] = []
  private static listeners: Array<(toasts: ToastMessage[]) => void> = []

  static show(toast: Omit<ToastMessage, "id">): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: ToastMessage = {
      id,
      duration: 5000,
      ...toast,
    }

    this.toasts.push(newToast)
    this.notifyListeners()

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.remove(id)
      }, newToast.duration)
    }

    return id
  }

  static remove(id: string) {
    this.toasts = this.toasts.filter((toast) => toast.id !== id)
    this.notifyListeners()
  }

  static clear() {
    this.toasts = []
    this.notifyListeners()
  }

  static subscribe(listener: (toasts: ToastMessage[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private static notifyListeners() {
    this.listeners.forEach((listener) => listener([...this.toasts]))
  }

  // Convenience methods
  static success(title: string, description?: string) {
    return this.show({ type: "success", title, description })
  }

  static error(title: string, description?: string) {
    return this.show({ type: "error", title, description, duration: 7000 })
  }

  static warning(title: string, description?: string) {
    return this.show({ type: "warning", title, description })
  }

  static info(title: string, description?: string) {
    return this.show({ type: "info", title, description })
  }
}

// Error boundary for React components
export class ErrorBoundary {
  static handleError(error: Error, errorInfo?: any) {
    console.error("React Error Boundary:", error, errorInfo)

    ToastManager.error(
      "Application Error",
      "Something went wrong. Please refresh the page or contact support if the problem persists.",
    )

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === "production") {
      // Send to error reporting service (e.g., Sentry, LogRocket, etc.)
    }
  }
}
