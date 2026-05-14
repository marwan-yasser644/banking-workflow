import api from './api-client';
import { LoanRequest, PaginatedResponse, User } from '../types';

export type LoanFilter = {
  status?: string;
  risk_level?: string;
  page?: number;
  size?: number;
};

export const getLoanRequests = async (params: LoanFilter = {}): Promise<PaginatedResponse<LoanRequest>> => {
  const response = await api.get<PaginatedResponse<LoanRequest>>('/loans', { params });
  return response.data;
};

export const getLoanRequest = async (requestId: string): Promise<LoanRequest> => {
  const response = await api.get<LoanRequest>(`/loans/${requestId}`);
  return response.data;
};

export const createLoanRequest = async (payload: Omit<LoanRequest, 'id' | 'status' | 'created_by' | 'created_at' | 'updated_at' | 'approved_by' | 'approved_at' | 'validation_passed' | 'rules_passed' | 'rules_details' | 'risk_score' | 'risk_level' | 'eligibility_score' | 'debt_to_income_ratio' | 'validation_errors' | 'rejection_reason' | 'override_reason' | 'reference_number'>) => {
  const response = await api.post<LoanRequest>('/loans', payload);
  return response.data;
};

export const updateLoanRequest = async (requestId: string, payload: Partial<LoanRequest>) => {
  const response = await api.patch<LoanRequest>(`/loans/${requestId}`, payload);
  return response.data;
};

export const getLoanWorkflowHistory = async (requestId: string) => {
  const response = await api.get<{ items?: unknown } | any>(`/loans/${requestId}/workflow`);
  return response.data;
};
