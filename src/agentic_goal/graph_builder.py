"""LangGraph graph construction with interrupt handling."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from langgraph.checkpoint.sqlite import SqliteSaver  # type: ignore[import-not-found]
from langgraph.graph import END, StateGraph  # type: ignore[attr-defined]

from agentic_goal.graph import AgentState
from agentic_goal.nodes import plan_node, rules_node, tasks_node


def build_graph() -> Any:
    """Build the main LangGraph with all phases."""
    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("plan", plan_node)
    graph.add_node("rules", rules_node)
    graph.add_node("tasks", tasks_node)

    # Entry point
    graph.set_entry_point("plan")

    # Edges: plan -> rules -> tasks -> END (for now, before execution loop)
    graph.add_edge("plan", "rules")
    graph.add_edge("rules", "tasks")
    graph.add_edge("tasks", END)

    return graph.compile()


def get_checkpointer(goal_id: str, goal_dir: Path) -> SqliteSaver:
    """Create a SqliteSaver for the given goal."""
    db_path = goal_dir / "state.db"
    return SqliteSaver.from_conn_string(str(db_path))
