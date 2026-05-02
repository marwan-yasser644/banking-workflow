import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Enum,
    Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


# ─── Enums ───────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    MAKER = "MAKER"
    CHECKER = "CHECKER"
    APPROVER = "APPROVER"
    ADMIN = "ADMIN"


class WorkflowState(str, enum.Enum):
    INITIATED = "INITIATED"
    VALIDATED = "VALIDATED"
    RULE_CHECKED = "RULE_CHECKED"
    RISK_ASSESSED = "RISK_ASSESSED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class NotificationType(str, enum.Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    SUCCESS = "SUCCESS"
    ERROR = "ERROR"


# ─── User Model ───────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.MAKER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    loan_requests = relationship("LoanRequest", back_populates="created_by_user", foreign_keys="LoanRequest.created_by")
    audit_logs = relationship("AuditLog", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


# ─── Loan Request Model ───────────────────────────────────────────────────────

class LoanRequest(Base):
    __tablename__ = "loan_requests"

    id = Column(Integer, primary_key=True, index=True)
    reference_number = Column(String(50), unique=True, nullable=False, index=True)

    # Applicant info
    applicant_name = Column(String(255), nullable=False)
    national_id = Column(String(20), nullable=False, index=True)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    monthly_salary = Column(Float, nullable=False)
    employment_type = Column(String(50), nullable=False)  # EMPLOYED, SELF_EMPLOYED, etc.

    # Loan details
    loan_amount = Column(Float, nullable=False)
    loan_tenure_months = Column(Integer, nullable=False)
    loan_purpose = Column(String(255), nullable=False)

    # Workflow state
    status = Column(Enum(WorkflowState), default=WorkflowState.INITIATED, nullable=False, index=True)

    # Scoring & risk
    risk_score = Column(Float, nullable=True)
    risk_level = Column(Enum(RiskLevel), nullable=True)
    eligibility_score = Column(Float, nullable=True)
    debt_to_income_ratio = Column(Float, nullable=True)

    # Validation results
    validation_passed = Column(Boolean, nullable=True)
    validation_errors = Column(JSON, nullable=True)

    # Rule check results
    rules_passed = Column(Boolean, nullable=True)
    rules_details = Column(JSON, nullable=True)

    # Approval details
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    override_reason = Column(Text, nullable=True)

    # Meta
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    created_by_user = relationship("User", back_populates="loan_requests", foreign_keys=[created_by])
    approver_user = relationship("User", foreign_keys=[approved_by])
    workflow_logs = relationship("WorkflowLog", back_populates="loan_request")
    audit_logs = relationship("AuditLog", back_populates="loan_request")
    notifications = relationship("Notification", back_populates="loan_request")


# ─── Workflow Log Model ───────────────────────────────────────────────────────

class WorkflowLog(Base):
    __tablename__ = "workflow_logs"

    id = Column(Integer, primary_key=True, index=True)
    loan_request_id = Column(Integer, ForeignKey("loan_requests.id"), nullable=False)
    from_state = Column(Enum(WorkflowState), nullable=True)
    to_state = Column(Enum(WorkflowState), nullable=False)
    transitioned_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    transition_reason = Column(Text, nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    loan_request = relationship("LoanRequest", back_populates="workflow_logs")
    user = relationship("User")


# ─── Audit Log Model ──────────────────────────────────────────────────────────

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    loan_request_id = Column(Integer, ForeignKey("loan_requests.id"), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=True)
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="audit_logs")
    loan_request = relationship("LoanRequest", back_populates="audit_logs")


# ─── Notification Model ───────────────────────────────────────────────────────

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    loan_request_id = Column(Integer, ForeignKey("loan_requests.id"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(Enum(NotificationType), default=NotificationType.INFO)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")
    loan_request = relationship("LoanRequest", back_populates="notifications")
