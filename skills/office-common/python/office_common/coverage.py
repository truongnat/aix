"""Strict supported-lossless coverage manifests."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Iterable, Literal

Status = Literal["detected", "preserved", "transformed", "unsupported", "skipped"]


@dataclass(frozen=True, order=True)
class CoverageItem:
    path: str
    kind: str
    status: Status
    detail: str = ""


@dataclass
class CoverageManifest:
    format: str
    operation: str
    source: str | None
    output: str | None
    items: list[CoverageItem] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)

    def add(
        self,
        path: str,
        kind: str,
        status: Status,
        detail: str = "",
    ) -> None:
        self.items.append(CoverageItem(path=path, kind=kind, status=status, detail=detail))

    def extend(self, items: Iterable[CoverageItem]) -> None:
        self.items.extend(items)

    @property
    def detected_count(self) -> int:
        # Every item is part of the inventory; "detected" is reserved for
        # inventory-only inspect passes. For write ops, countable items are all
        # non-skipped statuses that represent data units.
        return len([i for i in self.items if i.status != "skipped"])

    @property
    def preserved_count(self) -> int:
        return len([i for i in self.items if i.status in {"preserved", "transformed"}])

    @property
    def unsupported(self) -> list[CoverageItem]:
        return [i for i in self.items if i.status == "unsupported"]

    @property
    def skipped(self) -> list[CoverageItem]:
        return [i for i in self.items if i.status == "skipped"]

    @property
    def coverage_ratio(self) -> float:
        countable = [i for i in self.items if i.status != "skipped"]
        if not countable:
            return 1.0
        ok = [i for i in countable if i.status in {"preserved", "transformed", "detected"}]
        # For create/edit/validate write paths, "detected" alone is not enough.
        if self.operation in {"create", "edit", "validate"}:
            ok = [i for i in countable if i.status in {"preserved", "transformed"}]
            # validate of already-supported file may mark preserved after check
        return round(len(ok) / len(countable), 6)

    def require_full_coverage(self) -> None:
        bad = self.unsupported
        if bad:
            lines = "; ".join(f"{i.path} ({i.kind}: {i.detail or i.status})" for i in bad[:20])
            raise CoverageError(
                f"Supported-lossless coverage failed: {len(bad)} unsupported item(s): {lines}"
            )
        if self.operation in {"create", "edit"} and self.coverage_ratio < 1.0:
            raise CoverageError(
                f"coverage_ratio={self.coverage_ratio} < 1.0; refusing to publish output"
            )

    def to_dict(self) -> dict[str, Any]:
        items = sorted(self.items, key=lambda i: (i.path, i.kind, i.status, i.detail))
        return {
            "format": self.format,
            "operation": self.operation,
            "source": self.source,
            "output": self.output,
            "coverage_ratio": self.coverage_ratio,
            "counts": {
                "total": len(items),
                "detected": len([i for i in items if i.status == "detected"]),
                "preserved": len([i for i in items if i.status == "preserved"]),
                "transformed": len([i for i in items if i.status == "transformed"]),
                "unsupported": len([i for i in items if i.status == "unsupported"]),
                "skipped": len([i for i in items if i.status == "skipped"]),
            },
            "items": [asdict(i) for i in items],
            "notes": list(self.notes),
        }

    def write_json(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(self.to_dict(), indent=2, sort_keys=True) + "\n", encoding="utf-8")


class CoverageError(RuntimeError):
    """Raised when supported-lossless coverage cannot be proven."""
