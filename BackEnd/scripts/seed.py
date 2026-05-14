"""
Seed script - creates initial admin, sample users and test loan requests.
Run: python scripts/seed.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.models import User, UserRole, LoanRequest, WorkflowState
from app.services.workflow_engine import process_full_workflow


USERS = [
    {"username": "admin", "email": "admin@bank.com", "full_name": "System Administrator", "password": "Admin@1234", "role": UserRole.ADMIN},
    {"username": "maker1", "email": "maker1@bank.com", "full_name": "Ahmed Hassan (Maker)", "password": "Maker@1234", "role": UserRole.MAKER},
    {"username": "checker1", "email": "checker1@bank.com", "full_name": "Sara Ibrahim (Checker)", "password": "Checker@1234", "role": UserRole.CHECKER},
    {"username": "approver1", "email": "approver1@bank.com", "full_name": "Mohamed Ali (Approver)", "password": "Approver@1234", "role": UserRole.APPROVER},
]

LOAN_REQUESTS = [
    {
        "applicant_name": "Khaled Mansour",
        "national_id": "29901011234567",
        "email": "khaled@example.com",
        "phone": "+201001234567",
        "monthly_salary": 15000.0,
        "employment_type": "EMPLOYED",
        "loan_amount": 200000.0,
        "loan_tenure_months": 60,
        "loan_purpose": "Home renovation",
    },
    {
        "applicant_name": "Dina Samir",
        "national_id": "30001015678901",
        "email": "dina@example.com",
        "phone": "+201119876543",
        "monthly_salary": 8000.0,
        "employment_type": "GOVERNMENT",
        "loan_amount": 50000.0,
        "loan_tenure_months": 24,
        "loan_purpose": "Car purchase",
    },
    {
        "applicant_name": "Omar Farouk",
        "national_id": "29505089012345",
        "email": "omar@example.com",
        "phone": "+201234567890",
        "monthly_salary": 4000.0,
        "employment_type": "SELF_EMPLOYED",
        "loan_amount": 500000.0,  # Will fail rules
        "loan_tenure_months": 120,
        "loan_purpose": "Business expansion",
    },
    {
        "applicant_name": "Nada Youssef",
        "national_id": "30201023456789",
        "email": "nada@example.com",
        "phone": "+201567890123",
        "monthly_salary": 25000.0,
        "employment_type": "BUSINESS_OWNER",
        "loan_amount": 800000.0,
        "loan_tenure_months": 180,
        "loan_purpose": "Real estate investment",
    },
]


async def seed():
    print("🌱 Starting database seed...")
    async with AsyncSessionLocal() as db:
        # Create users
        created_users = {}
        for u_data in USERS:
            from sqlalchemy import select
            result = await db.execute(select(User).where(User.username == u_data["username"]))
            existing = result.scalar_one_or_none()
            if existing:
                print(f"  ⏭  User '{u_data['username']}' already exists, skipping.")
                created_users[u_data["role"]] = existing
                continue

            user = User(
                username=u_data["username"],
                email=u_data["email"],
                full_name=u_data["full_name"],
                hashed_password=get_password_hash(u_data["password"]),
                role=u_data["role"],
            )
            db.add(user)
            await db.flush()
            created_users[u_data["role"]] = user
            print(f"  ✅ Created user: {u_data['username']} ({u_data['role'].value})")

        await db.commit()

        # Reload maker user
        from sqlalchemy import select
        result = await db.execute(select(User).where(User.username == "maker1"))
        maker = result.scalar_one()

        # Create loan requests
        import uuid
        for lr_data in LOAN_REQUESTS:
            loan = LoanRequest(
                reference_number=f"LN-{uuid.uuid4().hex[:8].upper()}",
                created_by=maker.id,
                status=WorkflowState.INITIATED,
                **lr_data,
            )
            db.add(loan)
            await db.flush()
            print(f"  📋 Created loan request: {loan.reference_number} for {lr_data['applicant_name']}")

            # Auto-process workflow
            loan = await process_full_workflow(db, loan)
            print(f"     → Final status: {loan.status.value} | Risk: {loan.risk_level.value if loan.risk_level else 'N/A'}")

        await db.commit()

    print("\n✅ Seed complete!")
    print("\n📋 Login credentials:")
    print("  Admin:    admin / Admin@1234")
    print("  Maker:    maker1 / Maker@1234")
    print("  Checker:  checker1 / Checker@1234")
    print("  Approver: approver1 / Approver@1234")


if __name__ == "__main__":
    asyncio.run(seed())
