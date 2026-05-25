"""LangGraph state definition — placeholder for graph wiring."""

from __future__ import annotations

from typing import Annotated, Any

from langgraph.graph.message import add_messages
from typing_extensions import TypedDict


class AgentState(TypedDict):
    """Shared state across all graph nodes."""

    goal_id: str
    idea: str
    phase: str  # planning | rules | tasks | execution | done
    messages: Annotated[list[Any], add_messages]
    plan: str
    rules: str
    tasks: list[dict[str, Any]]
    current_ticket_id: str | None
    kanban: dict[str, Any]
    config_override: dict[str, Any]
    cumulative_cost_usd: float
    cumulative_tokens: int
    interrupt_reason: str | None
