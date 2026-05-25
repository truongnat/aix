"""Event bus: fan-out to terminal (Rich), events.jsonl, transcript.md."""

from __future__ import annotations

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
    """Print events to terminal with Rich formatting."""

    def __init__(self, verbose: int = 0) -> None:
        self.verbose = verbose

    def emit(self, event: Event) -> None:
        from rich import print as rprint

        ts = event.ts.split("T")[1].split(".")[0]
        node_color = "cyan" if event.node in ("plan", "rules", "tasks") else "yellow"
        rprint(f"[dim][{ts}][/dim] [{node_color}]{event.node}[/{node_color}] · {event.role}")
        if self.verbose >= 1:
            rprint(f"  [dim]{event.event_type.value}[/dim]")
        if self.verbose >= 2 and event.data:
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
