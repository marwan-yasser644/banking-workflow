export type Role = 'MAKER' | 'CHECKER' | 'APPROVER' | 'ADMIN';

export type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
};

export type User = {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  created_at: string;
};

export type DashboardStats = {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  total_loan_volume: number;
  approved_loan_volume: number;
  approval_rate: number;
  avg_risk_score?: number;
  requests_by_status: Record<string, number>;
  requests_by_risk: Record<string, number>;
};

export type LoanRequest = {
  id: number;
  reference_number: string;
  applicant_name: string;
  national_id: string;
  email: string;
  phone: string;
  monthly_salary: number;
  employment_type: string;
  loan_amount: number;
  loan_tenure_months: number;
  loan_purpose: string;
  status: string;
  risk_score?: number;
  risk_level?: string;
  eligibility_score?: number;
  debt_to_income_ratio?: number;
  validation_passed?: boolean;
  validation_errors?: string[];
  rules_passed?: boolean;
  rules_details?: Record<string, unknown>;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  override_reason?: string;
  created_by: number;
  created_at: string;
  updated_at?: string;
};

export type WorkflowLog = {
  id: number;
  loan_request_id: number;
  from_state?: string;
  to_state: string;
  transitioned_by?: number;
  transition_reason?: string;
  created_at: string;
};

export type NotificationItem = {
  id: number;
  user_id: number;
  loan_request_id?: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
};

export type AuditLog = {
  id: number;
  user_id?: number;
  loan_request_id?: number;
  action: string;
  entity_type: string;
  entity_id?: number;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
};
