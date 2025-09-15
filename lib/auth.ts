import type { User } from "./types"
import { ApiClient, API_ENDPOINTS } from "./config"

export class AuthService {
  private static readonly STORAGE_KEY = "pharmacy_pos_user"
  private static readonly SESSION_DURATION = 8 * 60 * 60 * 1000 // 8 hours

  static async login(email: string, password: string): Promise<{ user: User; token: string } | null> {
    try {
      const response = await ApiClient.post<{ user: User; token: string }>(API_ENDPOINTS.LOGIN, { email, password })

      const session = {
        user: response.user,
        token: response.token,
        expiresAt: Date.now() + this.SESSION_DURATION,
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session))
      return response
    } catch (error) {
      console.error("Login failed:", error)
      return null
    }
  }

  static logout(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  static getCurrentUser(): User | null {
    try {
      const sessionData = localStorage.getItem(this.STORAGE_KEY)
      if (!sessionData) return null

      const session = JSON.parse(sessionData)
      if (Date.now() > session.expiresAt) {
        this.logout()
        return null
      }

      return session.user
    } catch {
      return null
    }
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }

  static hasRole(requiredRole: User["role"]): boolean {
    const user = this.getCurrentUser()
    if (!user) return false

    const roleHierarchy = { staff: 1, manager: 2, admin: 3 }
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
  }

  static canAccessOutlet(outletId: string): boolean {
    const user = this.getCurrentUser()
    if (!user) return false

    // Admin can access all outlets
    if (user.role === "admin") return true

    // Manager and staff can only access their assigned outlet
    return user.outletId === outletId
  }

  static async startShift(openingCash: number, notes?: string): Promise<{ message: string; shift: any }> {
    try {
      const response = await ApiClient.post<{ message: string; shift: any }>(API_ENDPOINTS.START_SHIFT, { 
        openingCash, 
        notes 
      })
      
      // Update current user session with new shift
      const sessionData = localStorage.getItem(this.STORAGE_KEY)
      if (sessionData) {
        const session = JSON.parse(sessionData)
        session.user.currentShift = response.shift
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session))
      }
      
      return response
    } catch (error) {
      console.error("Failed to start shift:", error)
      throw error
    }
  }

  static async endShift(userId: string, endShiftData: {
    actualCash: number
    notes?: string
    managerApproval?: {
      managerId: string
      managerName: string
      timestamp: Date
      approved: boolean
    }
  }): Promise<{ message: string; shift: any; summary: any }> {
    try {
      const response = await ApiClient.post<{ message: string; shift: any; summary: any }>(
        API_ENDPOINTS.END_SHIFT, 
        endShiftData
      )
      
      // Clear stored shift data
      localStorage.removeItem(`shift_${userId}`)
      
      return response
    } catch (error) {
      console.error("Failed to end shift:", error)
      throw error
    }
  }

  static getCurrentShift(): any | null {
    try {
      const user = this.getCurrentUser()
      return user?.currentShift || null
    } catch {
      return null
    }
  }

  // Shift History Methods
  static async getShiftHistory(filters?: {
    userId?: string
    outletId?: string
    startDate?: Date
    endDate?: Date
    status?: string
    page?: number
    limit?: number
  }): Promise<{ shifts: any[]; total: number }> {
    try {
      const params = new URLSearchParams()
      if (filters?.userId) params.append('userId', filters.userId)
      if (filters?.outletId) params.append('outletId', filters.outletId)
      if (filters?.startDate) params.append('startDate', filters.startDate.toISOString())
      if (filters?.endDate) params.append('endDate', filters.endDate.toISOString())
      if (filters?.status) params.append('status', filters.status)
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const response = await ApiClient.get<{ shifts: any[]; total: number }>(
        `${API_ENDPOINTS.SHIFT_HISTORY}?${params.toString()}`
      )
      return response
    } catch (error) {
      console.error("Failed to get shift history:", error)
      throw error
    }
  }

  static async getShiftStats(filters?: {
    userId?: string
    outletId?: string
    startDate?: Date
    endDate?: Date
  }): Promise<any> {
    try {
      const params = new URLSearchParams()
      if (filters?.userId) params.append('userId', filters.userId)
      if (filters?.outletId) params.append('outletId', filters.outletId)
      if (filters?.startDate) params.append('startDate', filters.startDate.toISOString())
      if (filters?.endDate) params.append('endDate', filters.endDate.toISOString())

      const response = await ApiClient.get<any>(
        `${API_ENDPOINTS.SHIFT_HISTORY}/stats?${params.toString()}`
      )
      return response
    } catch (error) {
      console.error("Failed to get shift stats:", error)
      throw error
    }
  }

  static async getTopPerformers(filters?: {
    startDate?: Date
    endDate?: Date
  }): Promise<any[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.startDate) params.append('startDate', filters.startDate.toISOString())
      if (filters?.endDate) params.append('endDate', filters.endDate.toISOString())

      const response = await ApiClient.get<any[]>(
        `${API_ENDPOINTS.SHIFT_HISTORY}/top-performers?${params.toString()}`
      )
      return response
    } catch (error) {
      console.error("Failed to get top performers:", error)
      throw error
    }
  }

  static async getShiftById(shiftId: string): Promise<any> {
    try {
      const response = await ApiClient.get<any>(`${API_ENDPOINTS.SHIFT_HISTORY}/${shiftId}`)
      return response
    } catch (error) {
      console.error("Failed to get shift details:", error)
      throw error
    }
  }
}
