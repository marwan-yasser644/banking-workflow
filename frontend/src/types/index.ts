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
