#!/usr/bin/env python3
"""PPTX inspect / create / edit / validate with supported-lossless coverage."""

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
from office_common.ooxml import PPTX_SUPPORTED_PREFIXES, inventory_ooxml  # noqa: E402
from office_common.tools import optional_tool_status  # noqa: E402


def _require_sk-pptx():
    try:
        import sk-pptx  # noqa: F401
    except ImportError as exc:
        raise SystemExit(
            "Missing python-pptx. Run this skill's scripts/setup.py, then invoke "
            "cli.py with the Python executable in this skill's .venv."
        ) from exc


def semantic_model(path: Path) -> dict[str, Any]:
    _require_sk-pptx()
    from sk-pptx import Presentation

    prs = Presentation(path)
    slides = []
    for s_idx, slide in enumerate(prs.slides):
        shapes = []
        for sh_idx, shape in enumerate(slide.shapes):
            text = shape.text if getattr(shape, "has_text_frame", False) else ""
            shapes.append(
                {
                    "index": sh_idx,
                    "name": shape.name,
                    "text": text,
                    "is_placeholder": shape.is_placeholder,
                }
            )
        slides.append({"index": s_idx, "shapes": shapes})
    return {
        "slide_width": int(prs.slide_width),
        "slide_height": int(prs.slide_height),
        "slides": slides,
    }


def inspect_sk-pptx(path: Path, operation: str = "inspect") -> CoverageManifest:
    manifest = CoverageManifest(format="sk-pptx", operation=operation, source=str(path), output=None)
    status = "detected" if operation == "inspect" else "preserved"
    manifest.extend(inventory_ooxml(path, "sk-pptx", PPTX_SUPPORTED_PREFIXES, mark_status=status))
    model = semantic_model(path)
    for slide in model["slides"]:
        manifest.add(f"slide:{slide['index']}", "slide", status)
        for shape in slide["shapes"]:
            manifest.add(
                f"slide:{slide['index']}/shape:{shape['index']}",
                "shape",
                status,
                (shape["text"] or shape["name"])[:120],
            )
    for tool in optional_tool_status():
        if not tool.available:
            manifest.add(f"tool:{tool.name}", "optional-check", "skipped", tool.detail)
    manifest.notes.append(f"semantic_fingerprint={semantic_fingerprint(model)}")
    return manifest


def create_sk-pptx(spec: dict[str, Any], output: Path) -> CoverageManifest:
    _require_sk-pptx()
    from sk-pptx import Presentation
    from sk-pptx.util import Inches

    def writer(tmp: Path) -> None:
        prs = Presentation()
        blank = prs.slide_layouts[6] if len(prs.slide_layouts) > 6 else prs.slide_layouts[0]
        for slide_spec in spec.get("slides") or [{"texts": ["Slide 1"]}]:
            slide = prs.slides.add_slide(blank)
            texts = slide_spec.get("texts") or []
            top = 1.0
            for text in texts:
                box = slide.shapes.add_textbox(Inches(1), Inches(top), Inches(8), Inches(1))
                box.text_frame.text = str(text)
                top += 1.2
        prs.save(tmp)

    def validator(tmp: Path) -> None:
        post = inspect_sk-pptx(tmp, operation="validate")
        if post.unsupported:
            raise CoverageError("created sk-pptx contains unsupported parts")
        model = semantic_model(tmp)
        expected = [s.get("texts") or [] for s in (spec.get("slides") or [{"texts": ["Slide 1"]}])]
        if len(model["slides"]) != len(expected):
            raise CoverageError(
                f"slide count mismatch: expected {len(expected)} got {len(model['slides'])}"
            )
        for s_idx, texts in enumerate(expected):
            actual_texts = [sh["text"] for sh in model["slides"][s_idx]["shapes"] if sh["text"]]
            if actual_texts != [str(t) for t in texts]:
                raise CoverageError(
                    f"slide {s_idx} text mismatch: expected {texts!r} got {actual_texts!r}"
                )

    atomic_publish(output, writer, validator)
    final = inspect_sk-pptx(output, operation="create")
    remapped = CoverageManifest(
        format="sk-pptx", operation="create", source=None, output=str(output), notes=final.notes
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


def edit_sk-pptx(path: Path, edits: dict[str, Any], output: Path) -> CoverageManifest:
    _require_sk-pptx()
    from sk-pptx import Presentation

    pre = inspect_sk-pptx(path, operation="edit")
    pre.require_full_coverage()

    def writer(tmp: Path) -> None:
        prs = Presentation(path)
        for change in edits.get("set_shape_text") or []:
            slide = prs.slides[change["slide"]]
            shape = slide.shapes[change["shape"]]
            if not shape.has_text_frame:
                raise CoverageError(f"shape {change['shape']} has no text frame")
            shape.text_frame.text = change["text"]
        prs.save(tmp)

    def validator(tmp: Path) -> None:
        post = inspect_sk-pptx(tmp, operation="validate")
        post.require_full_coverage()
        model = semantic_model(tmp)
        for change in edits.get("set_shape_text") or []:
            actual = model["slides"][change["slide"]]["shapes"][change["shape"]]["text"]
            if actual != change["text"]:
                raise CoverageError(f"shape text not updated: {actual!r}")

    atomic_publish(output, writer, validator)
    final = inspect_sk-pptx(output, operation="edit")
    remapped = CoverageManifest(
        format="sk-pptx", operation="edit", source=str(path), output=str(output), notes=final.notes
    )
    for item in final.items:
        remapped.add(
            item.path,
            item.kind,
            "preserved" if item.status == "detected" else item.status,
            item.detail,
        )
    for change in edits.get("set_shape_text") or []:
        remapped.add(
            f"slide:{change['slide']}/shape:{change['shape']}",
            "shape",
            "transformed",
            change["text"][:120],
        )
    remapped.require_full_coverage()
    return remapped


def validate_sk-pptx(path: Path) -> CoverageManifest:
    manifest = inspect_sk-pptx(path, operation="validate")
    remapped = CoverageManifest(
        format="sk-pptx", operation="validate", source=str(path), output=None, notes=manifest.notes
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
    parser = argparse.ArgumentParser(description="PPTX supported-lossless office skill CLI")
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
            manifest = inspect_sk-pptx(args.input)
        elif args.cmd == "create":
            manifest = create_sk-pptx(_load_json(args.spec), args.output)
        elif args.cmd == "edit":
            manifest = edit_sk-pptx(args.input, _load_json(args.edits), args.output)
        else:
            manifest = validate_sk-pptx(args.input)
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
