import apiClient from './apiClient'
import type { Notification, PaginatedResponse } from '@/types'

export const notificationsService = {
  async getAll(): Promise<PaginatedResponse<Notification>> {
    const response = await apiClient.get<PaginatedResponse<Notification>>('/notifications')
    return response.data
  },

  async markRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`)
  },

  async markAllRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all')
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`)
  },
}
