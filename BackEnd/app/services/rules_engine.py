"""
Business Rules Engine - evaluates loan eligibility based on predefined rules.
"""
from typing import Dict, Tuple, List
from dataclasses import dataclass


@dataclass
class RuleResult:
    rule_name: str
    passed: bool
    score_impact: float
    reason: str


def rule_minimum_salary(monthly_salary: float) -> RuleResult:
    THRESHOLD = 5000.0
    passed = monthly_salary >= THRESHOLD
    return RuleResult(
        rule_name="MINIMUM_SALARY",
        passed=passed,
        score_impact=15.0 if passed else 0.0,
        reason=f"Salary {monthly_salary:.0f} {'meets' if passed else 'does not meet'} minimum {THRESHOLD:.0f}"
    )


def rule_loan_to_salary_ratio(loan_amount: float, monthly_salary: float) -> RuleResult:
    ratio = loan_amount / monthly_salary
    passed = ratio <= 36  # Max 36 months salary
    score = max(0, 20.0 - (ratio - 12) * 0.5) if ratio > 12 else 20.0
    return RuleResult(
        rule_name="LOAN_TO_SALARY_RATIO",
        passed=passed,
        score_impact=min(20.0, max(0.0, score)),
        reason=f"Loan/salary ratio: {ratio:.1f}x ({'acceptable' if passed else 'exceeds limit of 36x'})"
    )


def rule_dti_ratio(loan_amount: float, monthly_salary: float, tenure_months: int) -> RuleResult:
    monthly_installment = loan_amount / tenure_months
    dti = (monthly_installment / monthly_salary) * 100
    passed = dti <= 40
    score = max(0, 20.0 - (dti - 20) * 0.5) if dti > 20 else 20.0
    return RuleResult(
        rule_name="DEBT_TO_INCOME_RATIO",
        passed=passed,
        score_impact=min(20.0, max(0.0, score)),
        reason=f"DTI ratio: {dti:.1f}% ({'acceptable' if passed else 'exceeds 40% threshold'})"
    )


def rule_employment_type(employment_type: str) -> RuleResult:
    scores = {
        "GOVERNMENT": 20.0,
        "EMPLOYED": 15.0,
        "BUSINESS_OWNER": 10.0,
        "SELF_EMPLOYED": 5.0,
    }
    score = scores.get(employment_type.upper(), 0.0)
    passed = score > 0
    return RuleResult(
        rule_name="EMPLOYMENT_TYPE",
        passed=passed,
        score_impact=score,
        reason=f"Employment type '{employment_type}' scores {score:.0f} points"
    )


def rule_tenure_appropriateness(loan_amount: float, tenure_months: int) -> RuleResult:
    """Penalize very long tenures for smaller loans."""
    loan_per_month = loan_amount / tenure_months
    passed = loan_per_month >= 500  # At least 500 per month installment
    return RuleResult(
        rule_name="TENURE_APPROPRIATENESS",
        passed=passed,
        score_impact=10.0 if passed else 5.0,
        reason=f"Monthly installment {loan_per_month:.0f} ({'appropriate' if passed else 'too low - consider shorter tenure'})"
    )


def rule_loan_amount_threshold(loan_amount: float) -> RuleResult:
    """Flag very high loan amounts for extra scrutiny."""
    HIGH_VALUE = 1_000_000.0
    passed = loan_amount <= HIGH_VALUE
    return RuleResult(
        rule_name="LOAN_AMOUNT_THRESHOLD",
        passed=passed,
        score_impact=15.0 if passed else 5.0,
        reason=f"Loan amount {'within' if passed else 'exceeds'} standard threshold of {HIGH_VALUE:,.0f}"
    )


def run_business_rules(
    monthly_salary: float,
    loan_amount: float,
    tenure_months: int,
    employment_type: str,
) -> Tuple[bool, float, Dict]:
    """
    Returns: (rules_passed, eligibility_score, details_dict)
    """
    rules: List[RuleResult] = [
        rule_minimum_salary(monthly_salary),
        rule_loan_to_salary_ratio(loan_amount, monthly_salary),
        rule_dti_ratio(loan_amount, monthly_salary, tenure_months),
        rule_employment_type(employment_type),
        rule_tenure_appropriateness(loan_amount, tenure_months),
        rule_loan_amount_threshold(loan_amount),
    ]

    total_score = sum(r.score_impact for r in rules)
    critical_failed = [r for r in rules if not r.passed and r.rule_name in [
        "MINIMUM_SALARY", "DEBT_TO_INCOME_RATIO", "LOAN_TO_SALARY_RATIO"
    ]]

    rules_passed = len(critical_failed) == 0

    details = {
        "rules": [
            {
                "name": r.rule_name,
                "passed": r.passed,
                "score": r.score_impact,
                "reason": r.reason,
            }
            for r in rules
        ],
        "total_score": round(total_score, 2),
        "max_score": 100.0,
        "critical_failures": [r.rule_name for r in critical_failed],
        "auto_decision": "APPROVE" if rules_passed and total_score >= 60 else "REVIEW" if rules_passed else "REJECT"
    }

    return rules_passed, round(total_score, 2), details
