"""Smoke tests for graph_builder."""

from agentic_goal.graph_builder import build_graph


def test_build_graph_compiles() -> None:
    graph = build_graph(checkpointer=None)
    assert graph is not None


def test_build_graph_has_expected_nodes() -> None:
    graph = build_graph(checkpointer=None)
    # Compiled graph exposes nodes via .nodes
    nodes = set(graph.nodes.keys())
    expected = {
        "plan", "plan_approval",
        "rules", "rules_approval",
        "tasks", "tasks_approval",
        "pick_ticket", "ticket_plan", "coder", "reviewer",
    }
    assert expected.issubset(nodes), f"missing: {expected - nodes}"


def test_build_graph_has_interrupts() -> None:
    """The compiled graph must pause before approval nodes."""
    graph = build_graph(checkpointer=None)
    # interrupt_before is stored on the compiled graph config
    interrupts = set(graph.interrupt_before_nodes)
    assert "plan_approval" in interrupts
    assert "rules_approval" in interrupts
    assert "tasks_approval" in interrupts
