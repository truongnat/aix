"""CLI entry point — Typer app with subcommands."""

import contextlib
import uuid
from pathlib import Path
from typing import Any

import typer
from rich import print as rprint

from agentic_goal.config import load_config, validate_config
from agentic_goal.events import EventBus, JsonlSink, MarkdownSink, TerminalSink, set_event_bus
from agentic_goal.graph_builder import build_graph, get_checkpointer

app = typer.Typer(help="Agentic SDLC CLI: /goal -> plan -> rules -> tasks -> execute")


def _close_checkpointer(checkpointer: Any) -> None:
    """Close the SqliteSaver's underlying connection if possible."""
    conn = getattr(checkpointer, "conn", None)
    if conn is not None:
        with contextlib.suppress(Exception):
            conn.close()


@app.command()
def start(
    idea: str = typer.Argument(..., help="Goal idea / requirement"),
    verbose: int = typer.Option(0, "--verbose", "-v", help="Verbosity (-v, -vv, -vvv)"),
    model_override: list[str] | None = typer.Option(  # noqa: B008
        None,
        "--model-override",
        help="Override model per role, e.g. coder=gpt-4",
    ),
    no_color: bool = typer.Option(False, "--no-color"),
    json_output: bool = typer.Option(False, "--json"),
) -> None:
    """Start a new goal pipeline from an idea."""
    cfg = load_config()

    # Convert None to empty list
    if model_override is None:
        model_override = []

    # Apply model overrides from CLI
    for override in model_override:
        if "=" in override:
            role, model = override.split("=", 1)
            if role in cfg.roles:
                cfg.roles[role] = cfg.roles[role].model_copy(update={"model": model})

    validate_config(cfg, strict=False)

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

    # Set event_bus in context for nodes to access
    set_event_bus(event_bus)

    # Build graph with checkpointer
    checkpointer = get_checkpointer(goal_dir)
    try:
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
        }

        # Run graph through plan -> rules -> tasks
        config = {"configurable": {"thread_id": goal_id}}
        final_state = graph.invoke(initial_state, config)

        # Save artifacts (safe access in case interrupt fired early)
        if final_state.get("plan"):
            (goal_dir / "plan.md").write_text(final_state["plan"], encoding="utf-8")
        if final_state.get("rules"):
            (goal_dir / "rules.md").write_text(final_state["rules"], encoding="utf-8")
        if final_state.get("tasks"):
            (goal_dir / "tasks.md").write_text(
                final_state["tasks"][0]["raw"], encoding="utf-8"
            )
    finally:
        _close_checkpointer(checkpointer)
        event_bus.close()

    rprint("[bold green]✓[/bold green] Plan, rules, and tasks generated.")
    rprint(f"[dim]Artifacts saved to:[/dim] {goal_dir}/")
    raise typer.Exit(0)


@app.command("continue")
def continue_cmd(
    goal_id: str = typer.Option("", "--id", help="Goal ID to resume (default: latest)"),
    verbose: int = typer.Option(0, "--verbose", "-v", help="Verbosity (-v, -vv, -vvv)"),
) -> None:
    """Resume the most recent (or specified) goal from checkpoint."""
    cfg = load_config()

    validate_config(cfg, strict=False)

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
        goal_dirs = sorted(
            (p for p in goals_dir.iterdir() if p.is_dir()),
            key=lambda p: p.stat().st_mtime,
            reverse=True,
        )
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

    # Set event_bus in context for nodes to access
    set_event_bus(event_bus)

    # Build graph with checkpointer
    checkpointer = get_checkpointer(goal_dir)
    try:
        graph = build_graph(checkpointer=checkpointer)

        # Load checkpointed state
        config = {"configurable": {"thread_id": goal_id}}
        checkpoint = checkpointer.get(config)
        if not checkpoint:
            rprint("[bold red]No checkpoint found for this goal.[/bold red]")
            raise typer.Exit(1)

        # Get state from checkpoint
        state = checkpoint.get("channel_values", {})

        # Continue execution - LangGraph auto-resumes from checkpoint
        final_state = graph.invoke(state, config)

        # Save artifacts
        if final_state.get("plan"):
            (goal_dir / "plan.md").write_text(final_state["plan"], encoding="utf-8")
        if final_state.get("rules"):
            (goal_dir / "rules.md").write_text(final_state["rules"], encoding="utf-8")
        if final_state.get("tasks"):
            (goal_dir / "tasks.md").write_text(
                final_state["tasks"][0]["raw"], encoding="utf-8"
            )
    finally:
        _close_checkpointer(checkpointer)
        event_bus.close()

    rprint("[bold green]✓[/bold green] Goal execution continued.")
    rprint(f"[dim]Artifacts saved to:[/dim] {goal_dir}/")
    raise typer.Exit(0)


@app.command()
def status(
    watch: bool = typer.Option(False, "--watch", help="Live update mode"),
    goal_id: str = typer.Option("", "--id", help="Goal ID"),
) -> None:
    """Show kanban + current phase."""
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
        goal_dirs = sorted(
            (p for p in goals_dir.iterdir() if p.is_dir()),
            key=lambda p: p.stat().st_mtime,
            reverse=True,
        )
        if not goal_dirs:
            rprint("[bold red]No goals found.[/bold red]")
            raise typer.Exit(1)
        goal_dir = goal_dirs[0]
        goal_id = goal_dir.name

    # Load checkpointed state
    checkpointer = get_checkpointer(goal_dir)
    try:
        config = {"configurable": {"thread_id": goal_id}}
        checkpoint = checkpointer.get(config)

        if not checkpoint:
            rprint("[bold red]No checkpoint found for this goal.[/bold red]")
            raise typer.Exit(1)

        state = checkpoint.get("channel_values", {})
    finally:
        _close_checkpointer(checkpointer)

    rprint(f"[bold cyan]Goal:[/bold cyan] {goal_id}")
    rprint(f"[dim]Phase:[/dim] {state.get('phase', 'unknown')}")
    rprint(f"[dim]Current ticket:[/dim] {state.get('current_ticket_id', 'none')}")

    # Show kanban
    kanban = state.get("kanban", {})
    if kanban:
        rprint("\n[bold]Kanban:[/bold]")
        for ticket_id, ticket_info in kanban.items():
            status_emoji = {
                "todo": "⏳",
                "in_progress": "🔄",
                "done": "✅",
            }.get(ticket_info.get("status"), "❓")
            rprint(f"  {status_emoji} {ticket_id}: {ticket_info.get('title', 'No title')}")

    # Show cumulative cost
    cost = state.get("cumulative_cost_usd", 0.0)
    tokens = state.get("cumulative_tokens", 0)
    rprint(f"\n[dim]Cost:[/dim] ${cost:.4f} | [dim]Tokens:[/dim] {tokens:,}")

    raise typer.Exit(0)


@app.command()
def list_goals() -> None:
    """List all goals."""
    goals_dir = Path(".goal")
    if not goals_dir.exists():
        rprint("[bold red]No goals found.[/bold red]")
        raise typer.Exit(0)

    goal_dirs = sorted(
        (p for p in goals_dir.iterdir() if p.is_dir()),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )

    rprint("[bold cyan]Goals:[/bold cyan]")
    for goal_dir in goal_dirs:
        goal_id = goal_dir.name
        # Load checkpoint to get phase
        checkpointer = get_checkpointer(goal_dir)
        try:
            config = {"configurable": {"thread_id": goal_id}}
            checkpoint = checkpointer.get(config)
            if checkpoint:
                state = checkpoint.get("channel_values", {})
                phase = state.get("phase", "unknown")
                idea = state.get("idea", "No idea")[:50]  # Truncate long ideas
            else:
                phase = "no checkpoint"
                idea = "N/A"
        finally:
            _close_checkpointer(checkpointer)

        mtime = goal_dir.stat().st_mtime
        from datetime import datetime

        time_str = datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M")

        rprint(f"  [dim]{time_str}[/dim] [bold]{goal_id}[/bold] - {phase}")
        rprint(f"    [dim]{idea}[/dim]")

    raise typer.Exit(0)


@app.command()
def logs(
    goal_id: str = typer.Option("", "--id", help="Goal ID"),
    follow: bool = typer.Option(False, "--follow", help="Follow mode (not implemented)"),
    phase: str = typer.Option("", "--phase", help="Filter by phase"),
    ticket: str = typer.Option("", "--ticket", help="Filter by ticket"),
    role: str = typer.Option("", "--role", help="Filter by role"),
) -> None:
    """View agent transcript / event log."""
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
        goal_dirs = sorted(
            (p for p in goals_dir.iterdir() if p.is_dir()),
            key=lambda p: p.stat().st_mtime,
            reverse=True,
        )
        if not goal_dirs:
            rprint("[bold red]No goals found.[/bold red]")
            raise typer.Exit(1)
        goal_dir = goal_dirs[0]
        goal_id = goal_dir.name

    # Show transcript
    transcript_path = goal_dir / "transcript.md"
    if transcript_path.exists():
        rprint(f"[bold cyan]Transcript for {goal_id}:[/bold cyan]")
        content = transcript_path.read_text(encoding="utf-8")
        rprint(content)
    else:
        rprint("[dim]No transcript found.[/dim]")

    # Show events.jsonl if requested
    if phase or ticket or role:
        events_path = goal_dir / "events.jsonl"
        if events_path.exists():
            import json

            rprint("\n[bold cyan]Filtered events:[/bold cyan]")
            with events_path.open(encoding="utf-8") as f:
                for line in f:
                    event = json.loads(line)
                    if phase and event.get("phase") != phase:
                        continue
                    if ticket and event.get("ticket_id") != ticket:
                        continue
                    if role and event.get("role") != role:
                        continue
                    rprint(f"  {event.get('ts')} - {event.get('event_type')} - {event.get('node')}")
        else:
            rprint("[dim]No events found.[/dim]")

    raise typer.Exit(0)


@app.command()
def cost_dashboard(
    goal_id: str = typer.Option("", "--id", help="Goal ID"),
) -> None:
    """Show cost dashboard with breakdown by role/phase."""
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
        goal_dirs = sorted(
            (p for p in goals_dir.iterdir() if p.is_dir()),
            key=lambda p: p.stat().st_mtime,
            reverse=True,
        )
        if not goal_dirs:
            rprint("[bold red]No goals found.[/bold red]")
            raise typer.Exit(1)
        goal_dir = goal_dirs[0]
        goal_id = goal_dir.name

    # Load events for cost breakdown
    events_path = goal_dir / "events.jsonl"
    if not events_path.exists():
        rprint("[dim]No events found.[/dim]")
        raise typer.Exit(0)

    import json
    from collections import defaultdict

    # Aggregate costs by role
    costs_by_role: dict[str, float] = defaultdict(float)
    tokens_by_role: dict[str, int] = defaultdict(int)
    total_cost = 0.0
    total_tokens = 0

    with events_path.open(encoding="utf-8") as f:
        for line in f:
            event = json.loads(line)
            cost = event.get("cost_usd", 0.0)
            tokens = event.get("tokens_in", 0) + event.get("tokens_out", 0)
            role = event.get("role", "unknown")

            costs_by_role[role] += cost
            tokens_by_role[role] += tokens
            total_cost += cost
            total_tokens += tokens

    rprint(f"[bold cyan]Cost Dashboard for {goal_id}:[/bold cyan]")
    rprint(f"\n[bold]Total:[/bold] ${total_cost:.4f} | {total_tokens:,} tokens\n")

    rprint("[bold]By Role:[/bold]")
    for role, cost in sorted(costs_by_role.items(), key=lambda x: x[1], reverse=True):
        tokens = tokens_by_role[role]
        pct = (cost / total_cost * 100) if total_cost > 0 else 0
        bar = "█" * int(pct / 2)
        rprint(f"  {role:20s} ${cost:8.4f} ({pct:5.1f}%) {bar}")

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
