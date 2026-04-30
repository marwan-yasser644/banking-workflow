"""Initial migration - create all tables

Revision ID: 0001_initial
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enums
    user_role = postgresql.ENUM("MAKER", "CHECKER", "APPROVER", "ADMIN", name="userrole")
    workflow_state = postgresql.ENUM("INITIATED", "VALIDATED", "RULE_CHECKED", "RISK_ASSESSED", "APPROVED", "REJECTED", name="workflowstate")
    risk_level = postgresql.ENUM("LOW", "MEDIUM", "HIGH", name="risklevel")
    notification_type = postgresql.ENUM("INFO", "WARNING", "SUCCESS", "ERROR", name="notificationtype")

    user_role.create(op.get_bind(), checkfirst=True)
    workflow_state.create(op.get_bind(), checkfirst=True)
    risk_level.create(op.get_bind(), checkfirst=True)
    notification_type.create(op.get_bind(), checkfirst=True)

    # Users table
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("username", sa.String(100), nullable=False, unique=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("role", sa.Enum("MAKER", "CHECKER", "APPROVER", "ADMIN", name="userrole"), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )
    op.create_index("ix_users_username", "users", ["username"])
    op.create_index("ix_users_email", "users", ["email"])

    # Loan requests table
    op.create_table(
        "loan_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("reference_number", sa.String(50), nullable=False, unique=True),
        sa.Column("applicant_name", sa.String(255), nullable=False),
        sa.Column("national_id", sa.String(20), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(20), nullable=False),
        sa.Column("monthly_salary", sa.Float(), nullable=False),
        sa.Column("employment_type", sa.String(50), nullable=False),
        sa.Column("loan_amount", sa.Float(), nullable=False),
        sa.Column("loan_tenure_months", sa.Integer(), nullable=False),
        sa.Column("loan_purpose", sa.String(255), nullable=False),
        sa.Column("status", sa.Enum("INITIATED", "VALIDATED", "RULE_CHECKED", "RISK_ASSESSED", "APPROVED", "REJECTED", name="workflowstate"), nullable=False),
        sa.Column("risk_score", sa.Float(), nullable=True),
        sa.Column("risk_level", sa.Enum("LOW", "MEDIUM", "HIGH", name="risklevel"), nullable=True),
        sa.Column("eligibility_score", sa.Float(), nullable=True),
        sa.Column("debt_to_income_ratio", sa.Float(), nullable=True),
        sa.Column("validation_passed", sa.Boolean(), nullable=True),
        sa.Column("validation_errors", sa.JSON(), nullable=True),
        sa.Column("rules_passed", sa.Boolean(), nullable=True),
        sa.Column("rules_details", sa.JSON(), nullable=True),
        sa.Column("approved_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("override_reason", sa.Text(), nullable=True),
        sa.Column("created_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )
    op.create_index("ix_loan_requests_reference_number", "loan_requests", ["reference_number"])
    op.create_index("ix_loan_requests_national_id", "loan_requests", ["national_id"])
    op.create_index("ix_loan_requests_status", "loan_requests", ["status"])

    # Workflow logs
    op.create_table(
        "workflow_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("loan_request_id", sa.Integer(), sa.ForeignKey("loan_requests.id"), nullable=False),
        sa.Column("from_state", sa.Enum("INITIATED", "VALIDATED", "RULE_CHECKED", "RISK_ASSESSED", "APPROVED", "REJECTED", name="workflowstate"), nullable=True),
        sa.Column("to_state", sa.Enum("INITIATED", "VALIDATED", "RULE_CHECKED", "RISK_ASSESSED", "APPROVED", "REJECTED", name="workflowstate"), nullable=False),
        sa.Column("transitioned_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("transition_reason", sa.Text(), nullable=True),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Audit logs
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("loan_request_id", sa.Integer(), sa.ForeignKey("loan_requests.id"), nullable=True),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("entity_type", sa.String(50), nullable=False),
        sa.Column("entity_id", sa.Integer(), nullable=True),
        sa.Column("old_values", sa.JSON(), nullable=True),
        sa.Column("new_values", sa.JSON(), nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("user_agent", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Notifications
    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("loan_request_id", sa.Integer(), sa.ForeignKey("loan_requests.id"), nullable=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("notification_type", sa.Enum("INFO", "WARNING", "SUCCESS", "ERROR", name="notificationtype"), nullable=False),
        sa.Column("is_read", sa.Boolean(), server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("notifications")
    op.drop_table("audit_logs")
    op.drop_table("workflow_logs")
    op.drop_table("loan_requests")
    op.drop_table("users")

    for enum_name in ["userrole", "workflowstate", "risklevel", "notificationtype"]:
        op.execute(f"DROP TYPE IF EXISTS {enum_name}")
