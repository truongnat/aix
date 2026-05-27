"""Tests for budget enforcement and LimitsConfig."""

import pytest

from agentic_goal.config import (
    BudgetConfig,
    BudgetExceededError,
    LimitsConfig,
    check_budget,
)


def test_check_budget_under_limit_no_raise() -> None:
    check_budget(0.5, BudgetConfig(per_goal_usd=5.0, hard_stop=True))


def test_check_budget_at_limit_raises() -> None:
    with pytest.raises(BudgetExceededError):
        check_budget(5.0, BudgetConfig(per_goal_usd=5.0, hard_stop=True))


def test_check_budget_over_limit_raises() -> None:
    with pytest.raises(BudgetExceededError) as exc_info:
        check_budget(7.5, BudgetConfig(per_goal_usd=5.0, hard_stop=True))
    assert "$7.5" in str(exc_info.value) or "$7.50" in str(exc_info.value)


def test_check_budget_hard_stop_off_does_not_raise() -> None:
    # Even when over, hard_stop=False allows continuing
    check_budget(100.0, BudgetConfig(per_goal_usd=5.0, hard_stop=False))


def test_limits_defaults() -> None:
    limits = LimitsConfig()
    assert limits.coder_max_iterations == 10
    assert limits.recursion_limit == 200
    assert limits.subprocess_timeout_seconds == 300
    assert limits.review_approval_score == 7
    assert "rm -rf /" in limits.shell_command_denylist
    assert "sudo " in limits.shell_command_denylist


def test_limits_override() -> None:
    limits = LimitsConfig(coder_max_iterations=5, review_approval_score=9)
    assert limits.coder_max_iterations == 5
    assert limits.review_approval_score == 9
    # Defaults preserved for unset fields
    assert limits.recursion_limit == 200
