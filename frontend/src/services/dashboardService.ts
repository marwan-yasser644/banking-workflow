import apiClient from './apiClient'
import type { DashboardStats, TimeSeriesData, RiskDistribution } from '@/types'

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/dashboard/stats')
    return response.data
  },

  async getTimeSeries(): Promise<TimeSeriesData[]> {
    const response = await apiClient.get<TimeSeriesData[]>('/dashboard/time-series')
    return response.data
  },

  async getRiskDistribution(): Promise<RiskDistribution> {
    const response = await apiClient.get<RiskDistribution>('/dashboard/risk-distribution')
    return response.data
  },
}
