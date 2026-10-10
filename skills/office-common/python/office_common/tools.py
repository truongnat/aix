"""Optional external tool detection (LibreOffice, Tesseract, Poppler)."""

from __future__ import annotations

import shutil
from dataclasses import dataclass


@dataclass(frozen=True)
class ToolStatus:
    name: str
    available: bool
    binary: str | None
    detail: str


def _which(candidates: list[str]) -> str | None:
    for name in candidates:
        path = shutil.which(name)
        if path:
            return path
    return None


def optional_tool_status() -> list[ToolStatus]:
    tools = [
        ("libreoffice", ["soffice", "libreoffice"], "Formula recalculation / optional conversion"),
        ("tesseract", ["tesseract"], "OCR for scanned PDFs"),
        ("poppler", ["pdftoppm", "pdftotext"], "PDF rasterization / text utilities"),
    ]
    out: list[ToolStatus] = []
    for name, bins, detail in tools:
        found = _which(bins)
        out.append(
            ToolStatus(
                name=name,
                available=found is not None,
                binary=found,
                detail=detail if found else f"{detail} (not installed; check skipped)",
            )
        )
    return out
