import apiClient from './apiClient'
import type { AuditLog, PaginatedResponse, QueryParams } from '@/types'

export const auditService = {
  async getAll(params?: QueryParams): Promise<PaginatedResponse<AuditLog>> {
    const response = await apiClient.get<PaginatedResponse<AuditLog>>('/audit-logs', { params })
    return response.data
  },
}
