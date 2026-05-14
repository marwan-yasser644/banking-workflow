import apiClient from './apiClient'
import type { LoanRequest, PaginatedResponse, QueryParams } from '@/types'

export const requestsService = {
  async getAll(params?: QueryParams): Promise<PaginatedResponse<LoanRequest>> {
    const response = await apiClient.get<PaginatedResponse<LoanRequest>>('/requests', { params })
    return response.data
  },

  async getById(id: string): Promise<LoanRequest> {
    const response = await apiClient.get<LoanRequest>(`/requests/${id}`)
    return response.data
  },

  async create(data: Partial<LoanRequest>): Promise<LoanRequest> {
    const response = await apiClient.post<LoanRequest>('/requests', data)
    return response.data
  },

  async update(id: string, data: Partial<LoanRequest>): Promise<LoanRequest> {
    const response = await apiClient.put<LoanRequest>(`/requests/${id}`, data)
    return response.data
  },

  async approve(id: string, notes?: string): Promise<LoanRequest> {
    const response = await apiClient.post<LoanRequest>(`/requests/${id}/approve`, { notes })
    return response.data
  },

  async reject(id: string, reason: string): Promise<LoanRequest> {
    const response = await apiClient.post<LoanRequest>(`/requests/${id}/reject`, { reason })
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/requests/${id}`)
  },
}
