from __future__ import annotations
from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, EmailStr, field_validator, model_validator
from app.models.models import UserRole, WorkflowState, RiskLevel, NotificationType
import re


# ─── Token Schemas ────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserOut


class TokenData(BaseModel):
    user_id: Optional[int] = None


# ─── User Schemas ─────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str
    role: UserRole = UserRole.MAKER

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain uppercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain a digit")
        return v

    @field_validator("username")
    @classmethod
    def username_valid(cls, v):
        if not re.match(r"^[a-zA-Z0-9_]{3,50}$", v):
            raise ValueError("Username must be 3-50 alphanumeric characters or underscores")
        return v


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    username: str
    password: str


# ─── Loan Request Schemas ─────────────────────────────────────────────────────

class LoanRequestCreate(BaseModel):
    applicant_name: str
    national_id: str
    email: EmailStr
    phone: str
    monthly_salary: float
    employment_type: str
    loan_amount: float
    loan_tenure_months: int
    loan_purpose: str

    @field_validator("national_id")
    @classmethod
    def validate_national_id(cls, v):
        if not re.match(r"^\d{14}$", v):
            raise ValueError("National ID must be exactly 14 digits")
        return v

    @field_validator("monthly_salary")
    @classmethod
    def validate_salary(cls, v):
        if v <= 0:
            raise ValueError("Monthly salary must be positive")
        if v > 10_000_000:
            raise ValueError("Monthly salary exceeds maximum allowed")
        return v

    @field_validator("loan_amount")
    @classmethod
    def validate_loan_amount(cls, v):
        if v <= 0:
            raise ValueError("Loan amount must be positive")
        if v > 100_000_000:
            raise ValueError("Loan amount exceeds maximum allowed")
        return v

    @field_validator("loan_tenure_months")
    @classmethod
    def validate_tenure(cls, v):
        if v < 6 or v > 360:
            raise ValueError("Loan tenure must be between 6 and 360 months")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        if not re.match(r"^\+?[\d\s\-]{10,15}$", v):
            raise ValueError("Invalid phone number format")
        return v

    @field_validator("employment_type")
    @classmethod
    def validate_employment(cls, v):
        allowed = ["EMPLOYED", "SELF_EMPLOYED", "BUSINESS_OWNER", "GOVERNMENT"]
        if v.upper() not in allowed:
            raise ValueError(f"Employment type must be one of {allowed}")
        return v.upper()


class LoanRequestUpdate(BaseModel):
    applicant_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    monthly_salary: Optional[float] = None
    loan_amount: Optional[float] = None
    loan_tenure_months: Optional[int] = None
    loan_purpose: Optional[str] = None


class ApprovalAction(BaseModel):
    action: str  # "APPROVE" or "REJECT"
    reason: Optional[str] = None
    override_reason: Optional[str] = None

    @field_validator("action")
    @classmethod
    def validate_action(cls, v):
        if v.upper() not in ["APPROVE", "REJECT"]:
            raise ValueError("Action must be APPROVE or REJECT")
        return v.upper()


class LoanRequestOut(BaseModel):
    id: int
    reference_number: str
    applicant_name: str
    national_id: str
    email: str
    phone: str
    monthly_salary: float
    employment_type: str
    loan_amount: float
    loan_tenure_months: int
    loan_purpose: str
    status: WorkflowState
    risk_score: Optional[float] = None
    risk_level: Optional[RiskLevel] = None
    eligibility_score: Optional[float] = None
    debt_to_income_ratio: Optional[float] = None
    validation_passed: Optional[bool] = None
    validation_errors: Optional[List[str]] = None
    rules_passed: Optional[bool] = None
    rules_details: Optional[Dict[str, Any]] = None
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    override_reason: Optional[str] = None
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ─── Workflow Log Schemas ─────────────────────────────────────────────────────

class WorkflowLogOut(BaseModel):
    id: int
    loan_request_id: int
    from_state: Optional[WorkflowState]
    to_state: WorkflowState
    transitioned_by: Optional[int]
    transition_reason: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Audit Log Schemas ────────────────────────────────────────────────────────

class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int]
    loan_request_id: Optional[int]
    action: str
    entity_type: str
    entity_id: Optional[int]
    old_values: Optional[Dict]
    new_values: Optional[Dict]
    ip_address: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Notification Schemas ─────────────────────────────────────────────────────

class NotificationOut(BaseModel):
    id: int
    user_id: int
    loan_request_id: Optional[int]
    title: str
    message: str
    notification_type: NotificationType
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Dashboard Schemas ────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_requests: int
    pending_requests: int
    approved_requests: int
    rejected_requests: int
    total_loan_volume: float
    approved_loan_volume: float
    approval_rate: float
    avg_risk_score: Optional[float]
    requests_by_status: Dict[str, int]
    requests_by_risk: Dict[str, int]


# ─── Pagination ───────────────────────────────────────────────────────────────

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int


# Rebuild Token model now that UserOut is defined
Token.model_rebuild()
