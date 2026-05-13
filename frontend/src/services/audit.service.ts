import api from './api-client';
import { AuditLog } from '../types';

export const getAuditLogs = async (params?: { loan_request_id?: string; user_id?: string; entity_type?: string; skip?: number; limit?: number; }): Promise<AuditLog[]> => {
  const response = await api.get<AuditLog[]>('/audit', { params });
  return response.data;
};
