"""
Validation Module - validates loan request inputs beyond basic Pydantic checks.
"""
from typing import List, Tuple
import re


def validate_national_id(national_id: str) -> Tuple[bool, List[str]]:
    errors = []
    if not re.match(r"^\d{14}$", national_id):
        errors.append("National ID must be exactly 14 numeric digits")
        return False, errors  # Can't continue parsing if wrong length/format

    century_code = int(national_id[0])
    if century_code not in [2, 3]:
        errors.append("National ID century code invalid (must be 2 or 3)")
    month = int(national_id[3:5])
    if month < 1 or month > 12:
        errors.append("National ID contains invalid birth month")
    day = int(national_id[5:7])
    if day < 1 or day > 31:
        errors.append("National ID contains invalid birth day")
    return len(errors) == 0, errors


def validate_salary(monthly_salary: float, loan_amount: float, tenure_months: int) -> Tuple[bool, List[str]]:
    errors = []
    MIN_SALARY = 3000.0
    if monthly_salary < MIN_SALARY:
        errors.append(f"Monthly salary must be at least {MIN_SALARY} EGP")

    monthly_installment = loan_amount / tenure_months
    dti = (monthly_installment / monthly_salary) * 100
    if dti > 50:
        errors.append(f"Debt-to-income ratio {dti:.1f}% exceeds maximum allowed 50%")

    return len(errors) == 0, errors


def validate_loan_parameters(loan_amount: float, monthly_salary: float, tenure_months: int) -> Tuple[bool, List[str]]:
    errors = []
    MAX_MULTIPLIER = 60
    max_loan = monthly_salary * MAX_MULTIPLIER
    if loan_amount > max_loan:
        errors.append(f"Loan amount exceeds maximum allowed ({max_loan:.2f} based on salary)")

    if tenure_months < 6:
        errors.append("Minimum loan tenure is 6 months")
    if tenure_months > 360:
        errors.append("Maximum loan tenure is 360 months (30 years)")

    return len(errors) == 0, errors


def run_full_validation(
    national_id: str,
    monthly_salary: float,
    loan_amount: float,
    tenure_months: int,
) -> Tuple[bool, List[str]]:
    all_errors = []

    _, id_errors = validate_national_id(national_id)
    all_errors.extend(id_errors)

    _, salary_errors = validate_salary(monthly_salary, loan_amount, tenure_months)
    all_errors.extend(salary_errors)

    _, loan_errors = validate_loan_parameters(loan_amount, monthly_salary, tenure_months)
    all_errors.extend(loan_errors)

    return len(all_errors) == 0, all_errors
