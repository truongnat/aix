"""CLI entry point — Typer app with subcommands."""

import uuid
from pathlib import Path
from typing import Any

import typer
from rich import print as rprint

from agentic_goal.config import load_config, validate_config
from agentic_goal.events import EventBus, JsonlSink, MarkdownSink, TerminalSink
from agentic_goal.graph_builder import build_graph, get_checkpointer

app = typer.Typer(help="Agentic SDLC CLI: /goal -> plan -> rules -> tasks -> execute")


@app.command()
def start(
    idea: str = typer.Argument(..., help="Goal idea / requirement"),
    verbose: int = typer.Option(0, "--verbose", "-v", count=True, help="Verbosity (-v, -vv, -vvv)"),
    model_override: list[str] = typer.Option(  # noqa: B008
        None,
        "--model-override",
        default_factory=list,
        help="Override model per role, e.g. coder=gpt-4",
    ),
    no_color: bool = typer.Option(False, "--no-color"),
    json_output: bool = typer.Option(False, "--json"),
) -> None:
    """Start a new goal pipeline from an idea."""
    cfg = load_config()
    validate_config(cfg, strict=True)

    goal_id = f"g_{uuid.uuid4().hex[:12]}"
    goal_dir = Path(".goal") / goal_id
    goal_dir.mkdir(parents=True, exist_ok=True)

    rprint(f"[bold green]Goal:[/bold green] {idea}")
    rprint(f"[dim]Goal ID:[/dim] {goal_id}")
    rprint(f"[dim]Workspace:[/dim] {goal_dir}")

    # Set up event bus with 3 sinks
    event_bus = EventBus(goal_id)
    event_bus.add_sink(TerminalSink(verbose=verbose))
    event_bus.add_sink(JsonlSink(goal_dir / "events.jsonl"))
    event_bus.add_sink(MarkdownSink(goal_dir / "transcript.md"))

    # Build graph with checkpointer
    checkpointer = get_checkpointer(goal_dir)
    graph = build_graph(checkpointer=checkpointer)

    # Initial state
    initial_state: dict[str, Any] = {
        "goal_id": goal_id,
        "idea": idea,
        "phase": "planning",
        "messages": [],
        "plan": "",
        "rules": "",
        "tasks": [],
        "current_ticket_id": None,
        "kanban": {},
        "config_override": {},
        "cumulative_cost_usd": 0.0,
        "cumulative_tokens": 0,
        "interrupt_reason": None,
        "event_bus": event_bus,
    }

    # Run graph through plan -> rules -> tasks
    config = {"configurable": {"thread_id": goal_id}}
    final_state = graph.invoke(initial_state, config)

    # Save artifacts
    (goal_dir / "plan.md").write_text(final_state["plan"], encoding="utf-8")
    (goal_dir / "rules.md").write_text(final_state["rules"], encoding="utf-8")
    if final_state["tasks"]:
        (goal_dir / "tasks.md").write_text(final_state["tasks"][0]["raw"], encoding="utf-8")

    rprint("[bold green]✓[/bold green] Plan, rules, and tasks generated.")
    rprint(f"[dim]Artifacts saved to:[/dim] {goal_dir}/")
    raise typer.Exit(0)


@app.command("continue")
def continue_cmd(
    goal_id: str = typer.Option("", "--id", help="Goal ID to resume (default: latest)"),
    verbose: int = typer.Option(0, "--verbose", "-v", count=True),
) -> None:
    """Resume the most recent (or specified) goal from checkpoint."""
    cfg = load_config()
    validate_config(cfg, strict=True)

    # Find goal directory
    goal_dir: Path
    if goal_id:
        goal_dir = Path(".goal") / goal_id
        if not goal_dir.exists():
            rprint(f"[bold red]Goal not found:[/bold red] {goal_id}")
            raise typer.Exit(1)
    else:
        # Find latest goal
        goals_dir = Path(".goal")
        if not goals_dir.exists():
            rprint("[bold red]No goals found.[/bold red]")
            raise typer.Exit(1)
        goal_dirs = sorted(goals_dir.iterdir(), key=lambda p: p.stat().st_mtime, reverse=True)
        if not goal_dirs:
            rprint("[bold red]No goals found.[/bold red]")
            raise typer.Exit(1)
        goal_dir = goal_dirs[0]
        goal_id = goal_dir.name

    rprint(f"[bold yellow]Resuming goal:[/bold yellow] {goal_id}")
    rprint(f"[dim]Workspace:[/dim] {goal_dir}")

    # Set up event bus with 3 sinks
    event_bus = EventBus(goal_id)
    event_bus.add_sink(TerminalSink(verbose=verbose))
    event_bus.add_sink(JsonlSink(goal_dir / "events.jsonl"))
    event_bus.add_sink(MarkdownSink(goal_dir / "transcript.md"))

    # Build graph with checkpointer
    checkpointer = get_checkpointer(goal_dir)
    graph = build_graph(checkpointer=checkpointer)

    # Load checkpointed state
    config = {"configurable": {"thread_id": goal_id}}
    checkpoint = checkpointer.get(config)
    if not checkpoint:
        rprint("[bold red]No checkpoint found for this goal.[/bold red]")
        raise typer.Exit(1)

    # Get state from checkpoint
    state = checkpoint.get("channel_values", {})
    state["event_bus"] = event_bus

    # Run resume analyzer to determine next step
    from agentic_goal.nodes import resume_analyzer_node

    state = resume_analyzer_node(state)

    # Continue execution
    final_state = graph.invoke(state, config)

    # Save artifacts
    (goal_dir / "plan.md").write_text(final_state["plan"], encoding="utf-8")
    (goal_dir / "rules.md").write_text(final_state["rules"], encoding="utf-8")
    if final_state["tasks"]:
        (goal_dir / "tasks.md").write_text(final_state["tasks"][0]["raw"], encoding="utf-8")

    rprint("[bold green]✓[/bold green] Goal execution continued.")
    rprint(f"[dim]Artifacts saved to:[/dim] {goal_dir}/")
    raise typer.Exit(0)


@app.command()
def status(
    watch: bool = typer.Option(False, "--watch", help="Live update mode"),
    goal_id: str = typer.Option("", "--id", help="Goal ID"),
) -> None:
    """Show kanban + current phase."""
    rprint("[bold cyan]Status:[/bold cyan]")
    raise typer.Exit(0)


@app.command()
def list_goals() -> None:
    """List all goals."""
    rprint("[bold cyan]Goals:[/bold cyan]")
    raise typer.Exit(0)


@app.command()
def logs(
    goal_id: str = typer.Option("", "--id"),
    follow: bool = typer.Option(False, "--follow"),
    phase: str = typer.Option("", "--phase"),
    ticket: str = typer.Option("", "--ticket"),
    role: str = typer.Option("", "--role"),
) -> None:
    """View agent transcript / event log."""
    rprint("[bold cyan]Logs:[/bold cyan]")
    raise typer.Exit(0)


# ---- config subcommand group ----
config_app = typer.Typer(help="Manage model & provider configuration")


@config_app.command("show")
def config_show() -> None:
    """Display effective configuration and its sources."""
    cfg = load_config()
    rprint(cfg)


@config_app.command("set")
def config_set(
    role: str = typer.Argument(..., help="Role name (planner, coder, reviewer, ...)"),
    model: str = typer.Argument(..., help="Model string, e.g. anthropic/claude-opus-4"),
    provider: str = typer.Option("", "--provider"),
) -> None:
    """Set model for a role in user global config."""
    rprint(f"Set {role} -> {model}")


@config_app.command("unset")
def config_unset(role: str = typer.Argument(...)) -> None:
    """Unset a role override (revert to default)."""
    rprint(f"Unset {role}")


@config_app.command("models")
def config_models() -> None:
    """List known models, providers and pricing."""
    rprint("[bold cyan]Model registry[/bold cyan]")


@config_app.command("validate")
def config_validate() -> None:
    """Validate current config (reviewer != coder, keys present, etc)."""
    cfg = load_config()
    validate_config(cfg, strict=True)
    rprint("[bold green]Config is valid.[/bold green]")


@config_app.command("edit")
def config_edit() -> None:
    """Open global config in $EDITOR."""
    rprint("[bold yellow]Opening editor...[/bold yellow]")


app.add_typer(config_app, name="config")

if __name__ == "__main__":
    app()
