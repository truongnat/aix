#!/usr/bin/env python3
"""DOCX inspect / create / edit / validate with supported-lossless coverage."""

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
from office_common.ooxml import DOCX_SUPPORTED_PREFIXES, inventory_ooxml  # noqa: E402
from office_common.tools import optional_tool_status  # noqa: E402


def _require_sk-docx():
    try:
        import sk-docx  # noqa: F401
    except ImportError as exc:
        raise SystemExit(
            "Missing python-docx. Run this skill's scripts/setup.py, then invoke "
            "cli.py with the Python executable in this skill's .venv."
        ) from exc


def semantic_model(path: Path) -> dict[str, Any]:
    _require_sk-docx()
    from sk-docx import Document

    doc = Document(path)
    paragraphs = [{"text": p.text, "style": p.style.name if p.style else None} for p in doc.paragraphs]
    tables = []
    for t_idx, table in enumerate(doc.tables):
        rows = [[cell.text for cell in row.cells] for row in table.rows]
        tables.append({"index": t_idx, "rows": rows})
    core = {
        "title": doc.core_properties.title,
        "author": doc.core_properties.author,
        "subject": doc.core_properties.subject,
    }
    return {"paragraphs": paragraphs, "tables": tables, "properties": core}


def inspect_sk-docx(path: Path, operation: str = "inspect") -> CoverageManifest:
    manifest = CoverageManifest(format="sk-docx", operation=operation, source=str(path), output=None)
    status = "detected" if operation == "inspect" else "preserved"
    manifest.extend(inventory_ooxml(path, "sk-docx", DOCX_SUPPORTED_PREFIXES, mark_status=status))
    model = semantic_model(path)
    for idx, para in enumerate(model["paragraphs"]):
        manifest.add(f"paragraph:{idx}", "paragraph", status, para["text"][:120])
    for table in model["tables"]:
        manifest.add(f"table:{table['index']}", "table", status, f"rows={len(table['rows'])}")
        for r_idx, row in enumerate(table["rows"]):
            for c_idx, text in enumerate(row):
                manifest.add(
                    f"table:{table['index']}/r{r_idx}c{c_idx}",
                    "table-cell",
                    status,
                    text[:120],
                )
    for tool in optional_tool_status():
        if not tool.available:
            manifest.add(f"tool:{tool.name}", "optional-check", "skipped", tool.detail)
    manifest.notes.append(f"semantic_fingerprint={semantic_fingerprint(model)}")
    return manifest


def create_sk-docx(spec: dict[str, Any], output: Path) -> CoverageManifest:
    _require_sk-docx()
    from sk-docx import Document

    def writer(tmp: Path) -> None:
        doc = Document()
        for para in spec.get("paragraphs") or []:
            if isinstance(para, str):
                doc.add_paragraph(para)
            else:
                p = doc.add_paragraph(para.get("text") or "")
                style = para.get("style")
                if style:
                    p.style = style
        for table_spec in spec.get("tables") or []:
            rows = table_spec.get("rows") or []
            if not rows:
                continue
            table = doc.add_table(rows=len(rows), cols=len(rows[0]))
            for r_idx, row in enumerate(rows):
                for c_idx, text in enumerate(row):
                    table.rows[r_idx].cells[c_idx].text = str(text)
        props = spec.get("properties") or {}
        if props.get("title"):
            doc.core_properties.title = props["title"]
        if props.get("author"):
            doc.core_properties.author = props["author"]
        doc.save(tmp)

    def validator(tmp: Path) -> None:
        post = inspect_sk-docx(tmp, operation="validate")
        if post.unsupported:
            raise CoverageError("created sk-docx contains unsupported parts")
        model = semantic_model(tmp)
        expected_paras = [
            p if isinstance(p, str) else (p.get("text") or "") for p in (spec.get("paragraphs") or [])
        ]
        actual = [p["text"] for p in model["paragraphs"] if p["text"] or True]
        # Document() may insert an empty default paragraph; compare non-empty sequence containment
        expected_nonempty = [p for p in expected_paras if p != ""]
        actual_nonempty = [p for p in actual if p != ""]
        if expected_nonempty != actual_nonempty[: len(expected_nonempty)] and expected_nonempty != actual_nonempty:
            # allow leading empty paragraph from python-docx
            if actual_nonempty != expected_nonempty:
                raise CoverageError(
                    f"paragraph mismatch: expected {expected_nonempty!r} got {actual_nonempty!r}"
                )

    atomic_publish(output, writer, validator)
    final = inspect_sk-docx(output, operation="create")
    remapped = CoverageManifest(
        format="sk-docx", operation="create", source=None, output=str(output), notes=final.notes
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


def edit_sk-docx(path: Path, edits: dict[str, Any], output: Path) -> CoverageManifest:
    _require_sk-docx()
    from sk-docx import Document

    pre = inspect_sk-docx(path, operation="edit")
    pre.require_full_coverage()

    def writer(tmp: Path) -> None:
        doc = Document(path)
        for replacement in edits.get("replace_paragraphs") or []:
            idx = replacement["index"]
            doc.paragraphs[idx].text = replacement["text"]
        doc.save(tmp)

    def validator(tmp: Path) -> None:
        post = inspect_sk-docx(tmp, operation="validate")
        post.require_full_coverage()
        model = semantic_model(tmp)
        for replacement in edits.get("replace_paragraphs") or []:
            if model["paragraphs"][replacement["index"]]["text"] != replacement["text"]:
                raise CoverageError(f"paragraph {replacement['index']} not updated")

    atomic_publish(output, writer, validator)
    final = inspect_sk-docx(output, operation="edit")
    remapped = CoverageManifest(
        format="sk-docx", operation="edit", source=str(path), output=str(output), notes=final.notes
    )
    for item in final.items:
        remapped.add(
            item.path,
            item.kind,
            "preserved" if item.status == "detected" else item.status,
            item.detail,
        )
    for replacement in edits.get("replace_paragraphs") or []:
        remapped.add(
            f"paragraph:{replacement['index']}",
            "paragraph",
            "transformed",
            replacement["text"][:120],
        )
    remapped.require_full_coverage()
    return remapped


def validate_sk-docx(path: Path) -> CoverageManifest:
    manifest = inspect_sk-docx(path, operation="validate")
    remapped = CoverageManifest(
        format="sk-docx", operation="validate", source=str(path), output=None, notes=manifest.notes
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
    parser = argparse.ArgumentParser(description="DOCX supported-lossless office skill CLI")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("inspect")
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

    p = sub.add_parser("validate")
    p.add_argument("input", type=Path)
    p.add_argument("--manifest", type=Path)

    args = parser.parse_args(argv)
    try:
        if args.cmd == "inspect":
            manifest = inspect_sk-docx(args.input)
        elif args.cmd == "create":
            manifest = create_sk-docx(_load_json(args.spec), args.output)
        elif args.cmd == "edit":
            manifest = edit_sk-docx(args.input, _load_json(args.edits), args.output)
        else:
            manifest = validate_sk-docx(args.input)
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
