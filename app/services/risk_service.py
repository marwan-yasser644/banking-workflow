"""
Risk Assessment Module - computes risk score and classification.
"""
from typing import Tuple
from app.models.models import RiskLevel


def compute_risk_score(
    monthly_salary: float,
    loan_amount: float,
    tenure_months: int,
    employment_type: str,
    eligibility_score: float,
) -> Tuple[float, RiskLevel]:
    """
    Returns (risk_score 0-100, risk_level).
    Higher score = higher risk.
    """
    score = 0.0

    # DTI contribution (0-30 points)
    monthly_payment = loan_amount / tenure_months
    dti = (monthly_payment / monthly_salary) * 100
    if dti > 45:
        score += 30
    elif dti > 35:
        score += 20
    elif dti > 25:
        score += 10
    elif dti > 15:
        score += 5

    # Loan-to-salary ratio (0-25 points)
    lts_ratio = loan_amount / monthly_salary
    if lts_ratio > 48:
        score += 25
    elif lts_ratio > 36:
        score += 18
    elif lts_ratio > 24:
        score += 12
    elif lts_ratio > 12:
        score += 6

    # Employment stability (0-20 points)
    employment_risk = {
        "GOVERNMENT": 0,
        "EMPLOYED": 5,
        "BUSINESS_OWNER": 12,
        "SELF_EMPLOYED": 18,
    }
    score += employment_risk.get(employment_type.upper(), 20)

    # Tenure risk - longer tenure = more risk (0-15 points)
    if tenure_months > 240:
        score += 15
    elif tenure_months > 180:
        score += 10
    elif tenure_months > 120:
        score += 5
    elif tenure_months > 60:
        score += 2

    # Low eligibility = higher risk (0-10 points)
    if eligibility_score < 40:
        score += 10
    elif eligibility_score < 60:
        score += 5

    risk_score = min(100.0, round(score, 2))

    if risk_score >= 60:
        risk_level = RiskLevel.HIGH
    elif risk_score >= 30:
        risk_level = RiskLevel.MEDIUM
    else:
        risk_level = RiskLevel.LOW

    return risk_score, risk_level


def compute_dti(loan_amount: float, monthly_salary: float, tenure_months: int) -> float:
    monthly_payment = loan_amount / tenure_months
    return round((monthly_payment / monthly_salary) * 100, 2)
