"""LangGraph graph construction with interrupt handling."""

from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any

from langgraph.checkpoint.sqlite import SqliteSaver  # type: ignore[import-not-found]
from langgraph.graph import END, StateGraph

from agentic_goal.graph import AgentState
from agentic_goal.nodes import (
    coder_node,
    pick_ticket_node,
    plan_approval_node,
    plan_node,
    resume_analyzer_node,
    reviewer_node,
    rules_approval_node,
    rules_node,
    tasks_approval_node,
    tasks_node,
    ticket_plan_node,
)


def build_graph(checkpointer: SqliteSaver | None = None) -> Any:
    """Build the main LangGraph with all phases."""
    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("plan", plan_node)
    graph.add_node("plan_approval", plan_approval_node)
    graph.add_node("rules", rules_node)
    graph.add_node("rules_approval", rules_approval_node)
    graph.add_node("tasks", tasks_node)
    graph.add_node("tasks_approval", tasks_approval_node)

    # Execution loop nodes
    graph.add_node("pick_ticket", pick_ticket_node)
    graph.add_node("ticket_plan", ticket_plan_node)
    graph.add_node("coder", coder_node)
    graph.add_node("reviewer", reviewer_node)

    # Resume node
    graph.add_node("resume_analyzer", resume_analyzer_node)

    # Entry point
    graph.set_entry_point("plan")

    # Edges: plan -> plan_approval -> rules -> rules_approval -> tasks -> tasks_approval
    graph.add_edge("plan", "plan_approval")
    graph.add_edge("plan_approval", "rules")
    graph.add_edge("rules", "rules_approval")
    graph.add_edge("rules_approval", "tasks")
    graph.add_edge("tasks", "tasks_approval")

    # After tasks approval, start execution loop
    graph.add_edge("tasks_approval", "pick_ticket")

    # Ticket execution loop: pick_ticket -> ticket_plan -> coder -> reviewer
    graph.add_edge("pick_ticket", "ticket_plan")
    graph.add_edge("ticket_plan", "coder")
    graph.add_edge("coder", "reviewer")

    # Conditional edge: if reviewer approves (score >= 9), go to pick_ticket, else back to coder
    def should_continue_review(state: AgentState) -> str:
        # If phase is "done", exit loop
        if state.get("phase") == "done":
            return END

        # Check if current ticket was marked as done
        ticket_id = state.get("current_ticket_id")
        kanban = state.get("kanban", {})
        if ticket_id and ticket_id in kanban:
            if kanban[ticket_id].get("status") == "done":
                return "pick_ticket"  # Move to next ticket
            else:
                return "coder"  # Retry implementation

        # Default: continue to pick_ticket
        return "pick_ticket"

    graph.add_conditional_edges(
        "reviewer",
        should_continue_review,
        {"pick_ticket": "pick_ticket", "coder": "coder", END: END},
    )

    return graph.compile(
        checkpointer=checkpointer,
        interrupt_before=["plan_approval", "rules_approval", "tasks_approval"],
    )


def get_checkpointer(goal_dir: Path) -> SqliteSaver:
    """Create a SqliteSaver for the given goal."""
    db_path = goal_dir / "state.db"
    conn = sqlite3.connect(str(db_path), check_same_thread=False)
    checkpointer = SqliteSaver(conn)
    # Note: caller should close checkpointer when done
    return checkpointer
