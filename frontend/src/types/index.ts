<<<<<<< HEAD
// User & Auth Types
export type UserRole = 'maker' | 'checker' | 'approver' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  department?: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role: UserRole
  department?: string
}

// Loan / Request Types
export type RequestStatus = 'INITIATED' | 'VALIDATED' | 'RULE_CHECKED' | 'RISK_ASSESSED' | 'APPROVED' | 'REJECTED' | 'PENDING' | 'IN_REVIEW'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export interface LoanRequest {
  id: string
  applicant: string
  amount: number
  status: RequestStatus
  risk: RiskLevel
  createdAt: string
  updatedAt: string
  purpose?: string
  term?: number
  assignedTo?: string
  notes?: string
  workflowSteps?: WorkflowStep[]
}

export interface WorkflowStep {
  id: string
  name: string
  status: 'completed' | 'active' | 'pending'
  completedAt?: string
  completedBy?: string
  notes?: string
}

// Dashboard Types
export interface DashboardStats {
  totalRequests: number
  totalRequestsChange: number
  approved: number
  approvedChange: number
  pending: number
  pendingChange: number
  rejected: number
  rejectedChange: number
}

export interface TimeSeriesData {
  month: string
  requests: number
  approved: number
  rejected: number
}

export interface RiskDistribution {
  low: number
  medium: number
  high: number
}

// Notification Types
export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}

// Audit Log Types
export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  resource: string
  resourceId: string
  details: string
  ipAddress: string
  createdAt: string
}

// Report Types
export interface Report {
  id: string
  title: string
  type: string
  generatedAt: string
  generatedBy: string
  period: string
  fileUrl?: string
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface QueryParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  risk?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
=======
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
>>>>>>> 2c26bb1eb455214f77113d5d43609d94c252cf3c
