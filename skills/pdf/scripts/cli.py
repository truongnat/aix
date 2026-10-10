#!/usr/bin/env python3
"""PDF inspect / create / edit / validate with supported-lossless coverage."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

_SKILLS_ROOT = Path(__file__).resolve().parents[2]
_COMMON = _SKILLS_ROOT / "sk-office-common" / "python"
if not (_COMMON / "office_common").is_dir():
    raise SystemExit(f"sk-office-common not found at {_COMMON}")
sys.path.insert(0, str(_COMMON))

from office_common.atomic import atomic_publish  # noqa: E402
from office_common.coverage import CoverageError, CoverageManifest  # noqa: E402
from office_common.fingerprint import semantic_fingerprint  # noqa: E402
from office_common.tools import optional_tool_status  # noqa: E402


def _require_sk-pdf_libs():
    missing = []
    for name in ("pypdf", "pdfplumber", "reportlab"):
        try:
            __import__(name)
        except ImportError:
            missing.append(name)
    if missing:
        raise SystemExit(
            "Missing dependencies: "
            + ", ".join(missing)
            + ". Run this skill's scripts/setup.py, then invoke cli.py with the "
            + "Python executable in this skill's .venv."
        )


def inventory_sk-pdf(path: Path, status: str) -> tuple[CoverageManifest, dict[str, Any]]:
    _require_sk-pdf_libs()
    from pypdf import PdfReader
    import pdfplumber

    manifest = CoverageManifest(format="sk-pdf", operation="inspect", source=str(path), output=None)
    reader = PdfReader(str(path))

    if reader.is_encrypted:
        manifest.add("trailer/Encrypt", "encryption", "unsupported", "encrypted PDF outside v1 subset")

    # Digital signatures / AcroForm XFA are unsupported in v1 writes
    root = reader.trailer.get("/Root", {})
    try:
        root_obj = root.get_object() if hasattr(root, "get_object") else root
    except Exception:  # noqa: BLE001
        root_obj = {}
    if hasattr(root_obj, "get") and root_obj.get("/AcroForm"):
        acro = root_obj.get("/AcroForm")
        try:
            acro_obj = acro.get_object() if hasattr(acro, "get_object") else acro
        except Exception:  # noqa: BLE001
            acro_obj = {}
        if hasattr(acro_obj, "get") and acro_obj.get("/XFA"):
            manifest.add("AcroForm/XFA", "form", "unsupported", "XFA forms outside v1 subset")

    pages_text: list[str] = []
    with pdfplumber.open(path) as sk-pdf:
        for idx, page in enumerate(sk-pdf.pages):
            text = page.extract_text() or ""
            pages_text.append(text)
            manifest.add(f"page:{idx}", "page", status, f"chars={len(text)}")
            manifest.add(f"page:{idx}/text", "page-text", status, text[:120])
            tables = page.extract_tables() or []
            for t_idx, table in enumerate(tables):
                manifest.add(f"page:{idx}/table:{t_idx}", "table", status, f"rows={len(table)}")

    meta = reader.metadata or {}
    meta_dict = {
        "title": getattr(meta, "title", None) if meta else None,
        "author": getattr(meta, "author", None) if meta else None,
        "page_count": len(reader.pages),
        "pages_text": pages_text,
    }
    for key in ("title", "author"):
        if meta_dict.get(key):
            manifest.add(f"meta/{key}", "metadata", status, str(meta_dict[key]))

    for tool in optional_tool_status():
        if tool.name in {"tesseract", "poppler"} and not tool.available:
            manifest.add(f"tool:{tool.name}", "optional-check", "skipped", tool.detail)

    manifest.notes.append(f"semantic_fingerprint={semantic_fingerprint(meta_dict)}")
    return manifest, meta_dict


def inspect_sk-pdf(path: Path, operation: str = "inspect") -> CoverageManifest:
    status = "detected" if operation == "inspect" else "preserved"
    manifest, _ = inventory_sk-pdf(path, status)
    manifest.operation = operation
    return manifest


def create_sk-pdf(spec: dict[str, Any], output: Path) -> CoverageManifest:
    _require_sk-pdf_libs()
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas

    def writer(tmp: Path) -> None:
        c = canvas.Canvas(str(tmp), pagesize=letter)
        pages = spec.get("pages") or [{"text": "Page 1"}]
        for page in pages:
            text = page.get("text") if isinstance(page, dict) else str(page)
            c.drawString(72, 720, str(text))
            title = (spec.get("properties") or {}).get("title")
            author = (spec.get("properties") or {}).get("author")
            if title:
                c.setTitle(title)
            if author:
                c.setAuthor(author)
            c.showPage()
        c.save()

    def validator(tmp: Path) -> None:
        post = inspect_sk-pdf(tmp, operation="validate")
        if post.unsupported:
            raise CoverageError("created sk-pdf contains unsupported structures")
        _, model = inventory_sk-pdf(tmp, "preserved")
        expected = []
        for page in spec.get("pages") or [{"text": "Page 1"}]:
            expected.append(page.get("text") if isinstance(page, dict) else str(page))
        actual = [t.strip() for t in model["pages_text"]]
        if len(actual) != len(expected):
            raise CoverageError(f"page count mismatch: expected {len(expected)} got {len(actual)}")
        for idx, text in enumerate(expected):
            if str(text) not in actual[idx]:
                raise CoverageError(f"page {idx} missing text {text!r} in {actual[idx]!r}")

    atomic_publish(output, writer, validator)
    final = inspect_sk-pdf(output, operation="create")
    remapped = CoverageManifest(
        format="sk-pdf", operation="create", source=None, output=str(output), notes=final.notes
    )
    for item in final.items:
        remapped.add(
            item.path,
            item.kind,
            "preserved" if item.status == "detected" else item.status,
            item.detail,
        )
    remapped.require_full_coverage()
    return remapped


def edit_sk-pdf(path: Path, edits: dict[str, Any], output: Path) -> CoverageManifest:
    _require_sk-pdf_libs()
    from pypdf import PdfReader, PdfWriter

    pre = inspect_sk-pdf(path, operation="edit")
    pre.require_full_coverage()

    def writer(tmp: Path) -> None:
        reader = PdfReader(str(path))
        writer_sk-pdf = PdfWriter()
        order = edits.get("page_order") or list(range(len(reader.pages)))
        for idx in order:
            writer_sk-pdf.add_page(reader.pages[idx])
        meta = edits.get("properties") or {}
        md: dict[str, str] = {}
        if meta.get("title"):
            md["/Title"] = meta["title"]
        if meta.get("author"):
            md["/Author"] = meta["author"]
        if md:
            writer_sk-pdf.add_metadata(md)
        with tmp.open("wb") as fh:
            writer_sk-pdf.write(fh)

    def validator(tmp: Path) -> None:
        post = inspect_sk-pdf(tmp, operation="validate")
        post.require_full_coverage()
        reader = PdfReader(str(tmp))
        order = edits.get("page_order") or list(range(len(PdfReader(str(path)).pages)))
        if len(reader.pages) != len(order):
            raise CoverageError("page_order length mismatch after edit")

    atomic_publish(output, writer, validator)
    final = inspect_sk-pdf(output, operation="edit")
    remapped = CoverageManifest(
        format="sk-pdf", operation="edit", source=str(path), output=str(output), notes=final.notes
    )
    for item in final.items:
        remapped.add(
            item.path,
            item.kind,
            "preserved" if item.status == "detected" else item.status,
            item.detail,
        )
    if edits.get("page_order"):
        remapped.add("pages/order", "page-order", "transformed", str(edits["page_order"]))
    remapped.require_full_coverage()
    return remapped


def validate_sk-pdf(path: Path) -> CoverageManifest:
    manifest = inspect_sk-pdf(path, operation="validate")
    remapped = CoverageManifest(
        format="sk-pdf", operation="validate", source=str(path), output=None, notes=manifest.notes
    )
    for item in manifest.items:
        remapped.add(
            item.path,
            item.kind,
            "preserved" if item.status == "detected" else item.status,
            item.detail,
        )
    remapped.require_full_coverage()
    return remapped


def _load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="PDF supported-lossless office skill CLI")
    sub = parser.add_subparsers(dest="cmd", required=True)

    for name in ("inspect", "validate"):
        p = sub.add_parser(name)
        p.add_argument("input", type=Path)
        p.add_argument("--manifest", type=Path)

    p = sub.add_parser("create")
    p.add_argument("spec", type=Path)
    p.add_argument("output", type=Path)
    p.add_argument("--manifest", type=Path)

    p = sub.add_parser("edit")
    p.add_argument("input", type=Path)
    p.add_argument("edits", type=Path)
    p.add_argument("output", type=Path)
    p.add_argument("--manifest", type=Path)

    args = parser.parse_args(argv)
    try:
        if args.cmd == "inspect":
            manifest = inspect_sk-pdf(args.input)
        elif args.cmd == "create":
            manifest = create_sk-pdf(_load_json(args.spec), args.output)
        elif args.cmd == "edit":
            manifest = edit_sk-pdf(args.input, _load_json(args.edits), args.output)
        else:
            manifest = validate_sk-pdf(args.input)
        if args.manifest:
            manifest.write_json(args.manifest)
        print(json.dumps(manifest.to_dict(), indent=2, sort_keys=True))
        return 0
    except CoverageError as exc:
        print(f"COVERAGE_ERROR: {exc}", file=sys.stderr)
        return 2
    except Exception as exc:  # noqa: BLE001
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
