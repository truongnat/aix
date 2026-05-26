"""Event bus: fan-out to terminal (Rich), events.jsonl, transcript.md."""

from __future__ import annotations

import contextvars
import json
from dataclasses import asdict, dataclass, field
from datetime import UTC, datetime
from enum import StrEnum
from pathlib import Path
from typing import Any, Protocol


class EventType(StrEnum):
    LLM_START = "llm_start"
    LLM_CHUNK = "llm_chunk"
    LLM_END = "llm_end"
    TOOL_CALL = "tool_call"
    TOOL_RESULT = "tool_result"
    FILE_WRITE = "file_write"
    GIT = "git"
    INTERRUPT = "interrupt"
    APPROVAL = "approval"
    ERROR = "error"
    SCORE = "score"


@dataclass
class Event:
    ts: str
    goal_id: str
    phase: str
    ticket_id: str | None
    node: str
    role: str
    model: str
    event_type: EventType
    data: dict[str, Any] = field(default_factory=dict)
    tokens_in: int = 0
    tokens_out: int = 0
    cost_usd: float = 0.0
    latency_ms: int = 0


class Sink(Protocol):
    def emit(self, event: Event) -> None: ...
    def close(self) -> None: ...


class JsonlSink:
    """Append events as newline-delimited JSON."""

    def __init__(self, path: Path) -> None:
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def emit(self, event: Event) -> None:
        with self.path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(asdict(event), default=str) + "\n")

    def close(self) -> None:
        pass


class MarkdownSink:
    """Append events as a chat-style Markdown transcript."""

    def __init__(self, path: Path) -> None:
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def emit(self, event: Event) -> None:
        line = self._format(event)
        with self.path.open("a", encoding="utf-8") as f:
            f.write(line + "\n\n")

    def _format(self, event: Event) -> str:
        ts = event.ts.split("T")[1].split(".")[0]
        header = f"**[{ts}]** `{event.node}` · `{event.role}` · `{event.model}`"
        if event.ticket_id:
            header += f" · ticket `{event.ticket_id}`"
        body = (
            f"\n> **{event.event_type.value}**: "
            f"{json.dumps(event.data, default=str, ensure_ascii=False)}"
        )
        if event.tokens_in or event.tokens_out:
            body += (
                f"\n> tokens: {event.tokens_in} in / {event.tokens_out} out | "
                f"cost: ${event.cost_usd:.6f} | latency: {event.latency_ms}ms"
            )
        return header + body

    def close(self) -> None:
        pass


class TerminalSink:
    """Print events to terminal with Rich formatting.

    Verbosity levels:
      0 (default): show step headers + LLM_END content panels (plan, rules,
                   tasks, ticket_plan, reviewer feedback) and tool calls.
      1 (-v):      also show tool results (truncated) and llm_start headers.
      2 (-vv):     also show full data JSON for each event.
    """

    def __init__(self, verbose: int = 0) -> None:
        self.verbose = verbose

    def emit(self, event: Event) -> None:  # noqa: C901
        from rich import print as rprint
        from rich.console import Console
        from rich.markdown import Markdown
        from rich.panel import Panel
        from rich.syntax import Syntax

        console = Console()
        ts = event.ts.split("T")[1].split(".")[0]
        et = event.event_type
        node_color = {
            "plan": "cyan",
            "rules": "cyan",
            "tasks": "cyan",
            "ticket_plan": "magenta",
            "coder": "yellow",
            "reviewer": "blue",
        }.get(event.node, "white")

        # ---------- LLM_START: concise header ----------
        if et == EventType.LLM_START:
            ticket = f" · ticket [bold]{event.ticket_id}[/bold]" if event.ticket_id else ""
            rprint(
                f"[dim][{ts}][/dim] [{node_color}]▶ {event.node}[/{node_color}] "
                f"· {event.role} · [dim]{event.model}[/dim]{ticket}"
            )
            if self.verbose >= 2 and event.data:
                rprint(f"  [dim]{json.dumps(event.data, default=str, ensure_ascii=False)}[/dim]")
            return

        # ---------- TOOL_CALL: show name + args ----------
        if et == EventType.TOOL_CALL:
            name = event.data.get("name", "?")
            args = event.data.get("args", {})
            args_str = json.dumps(args, default=str, ensure_ascii=False)
            if len(args_str) > 200:
                args_str = args_str[:200] + "…"
            rprint(f"  [dim cyan]→ tool[/dim cyan] [bold]{name}[/bold] [dim]{args_str}[/dim]")
            return

        # ---------- TOOL_RESULT: show truncated result ----------
        if et == EventType.TOOL_RESULT:
            name = event.data.get("name", "?")
            ok = event.data.get("ok", True)
            symbol = "[green]✓[/green]" if ok else "[red]✗[/red]"
            if not ok:
                err = event.data.get("error", "")
                rprint(f"    {symbol} {name} [red]{err}[/red]")
            elif self.verbose >= 1:
                result = str(event.data.get("result", ""))
                preview = result.replace("\n", " ⏎ ")
                if len(preview) > 160:
                    preview = preview[:160] + "…"
                rprint(f"    {symbol} {name} [dim]{preview}[/dim]")
            else:
                rprint(f"    {symbol} {name}")
            return

        # ---------- LLM_END: rich content panels ----------
        if et == EventType.LLM_END:
            ticket = f" · ticket [bold]{event.ticket_id}[/bold]" if event.ticket_id else ""
            usage = ""
            if event.tokens_in or event.tokens_out:
                usage = (
                    f" [dim]({event.tokens_in}→{event.tokens_out} tok"
                    f"{f', ${event.cost_usd:.4f}' if event.cost_usd else ''})[/dim]"
                )
            rprint(
                f"[dim][{ts}][/dim] [{node_color}]✓ {event.node}[/{node_color}] "
                f"· {event.role}{ticket}{usage}"
            )

            data = event.data or {}

            # Reviewer: show score + approval + feedback
            if event.node == "reviewer":
                score = data.get("score")
                approved = data.get("approved")
                feedback = data.get("feedback", "")
                badge = (
                    "[bold green]APPROVED[/bold green]"
                    if approved
                    else "[bold red]REJECTED[/bold red]"
                )
                score_str = f"[bold]{score}/10[/bold]" if score is not None else ""
                rprint(f"  {badge} · score {score_str}")
                if feedback:
                    console.print(
                        Panel(
                            Markdown(str(feedback)),
                            title="Review feedback",
                            border_style="blue",
                            padding=(0, 1),
                        )
                    )
                if self.verbose >= 1 and data.get("diff_preview"):
                    console.print(
                        Panel(
                            Syntax(
                                str(data["diff_preview"]),
                                "diff",
                                theme="ansi_dark",
                                line_numbers=False,
                            ),
                            title="Git diff (preview)",
                            border_style="dim",
                        )
                    )
                return

            # Plan / Rules / Tasks / Ticket plan / Coder summary: render content
            content = data.get("content")
            if content:
                title_map = {
                    "plan": "Plan",
                    "rules": "Rules / Questions",
                    "tasks": "Tasks (kanban)",
                    "ticket_plan": "Ticket plan",
                }
                title = title_map.get(event.node, event.node)
                console.print(
                    Panel(
                        Markdown(str(content)),
                        title=title,
                        border_style=node_color,
                        padding=(0, 1),
                    )
                )
                return

            # Coder LLM_END (no content key, just summary metadata)
            if event.node == "coder":
                msg_count = data.get("message_count")
                if msg_count is not None:
                    rprint(f"  [dim]coder finished · {msg_count} messages[/dim]")
                return

            if self.verbose >= 2 and data:
                rprint(f"  [dim]{json.dumps(data, default=str, ensure_ascii=False)}[/dim]")
            return

        # ---------- Other event types (errors, approvals, etc.) ----------
        rprint(f"[dim][{ts}][/dim] [{node_color}]{event.node}[/{node_color}] · {et.value}")
        if self.verbose >= 1 and event.data:
            rprint(f"  [dim]{json.dumps(event.data, default=str, ensure_ascii=False)}[/dim]")

    def close(self) -> None:
        pass


class EventBus:
    """Fan-out events to all registered sinks."""

    def __init__(self, goal_id: str) -> None:
        self.goal_id = goal_id
        self.sinks: list[Sink] = []

    def add_sink(self, sink: Sink) -> None:
        self.sinks.append(sink)

    def emit(
        self,
        *,
        phase: str,
        node: str,
        role: str,
        model: str,
        event_type: EventType,
        ticket_id: str | None = None,
        data: dict[str, Any] | None = None,
        tokens_in: int = 0,
        tokens_out: int = 0,
        cost_usd: float = 0.0,
        latency_ms: int = 0,
    ) -> None:
        event = Event(
            ts=datetime.now(UTC).isoformat(),
            goal_id=self.goal_id,
            phase=phase,
            ticket_id=ticket_id,
            node=node,
            role=role,
            model=model,
            event_type=event_type,
            data=data or {},
            tokens_in=tokens_in,
            tokens_out=tokens_out,
            cost_usd=cost_usd,
            latency_ms=latency_ms,
        )
        for sink in self.sinks:
            sink.emit(event)

    def close(self) -> None:
        for sink in self.sinks:
            sink.close()


# Context variable for event_bus - avoids serialization issues in checkpointed state
_event_bus_context: contextvars.ContextVar[EventBus | None] = contextvars.ContextVar(
    "event_bus", default=None
)


def get_event_bus() -> EventBus | None:
    """Get the current thread's event_bus from context."""
    return _event_bus_context.get()


def set_event_bus(event_bus: EventBus) -> None:
    """Set the event_bus for the current thread."""
    _event_bus_context.set(event_bus)
