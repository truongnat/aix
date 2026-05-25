"""LangGraph graph construction with interrupt handling."""

from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any

from langgraph.checkpoint.sqlite import SqliteSaver  # type: ignore[import-not-found]
from langgraph.graph import END, StateGraph

from agentic_goal.graph import AgentState
from agentic_goal.nodes import (
    plan_approval_node,
    plan_node,
    rules_approval_node,
    rules_node,
    tasks_approval_node,
    tasks_node,
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

    # Entry point
    graph.set_entry_point("plan")

    # Edges: plan -> plan_approval -> rules -> rules_approval -> tasks -> tasks_approval -> END
    graph.add_edge("plan", "plan_approval")
    graph.add_edge("plan_approval", "rules")
    graph.add_edge("rules", "rules_approval")
    graph.add_edge("rules_approval", "tasks")
    graph.add_edge("tasks", "tasks_approval")
    graph.add_edge("tasks_approval", END)

    return graph.compile(checkpointer=checkpointer)


def get_checkpointer(goal_dir: Path) -> SqliteSaver:
    """Create a SqliteSaver for the given goal."""
    db_path = goal_dir / "state.db"
    conn = sqlite3.connect(str(db_path), check_same_thread=False)
    return SqliteSaver(conn)
