"""OOXML ZIP inventory and unsupported-part detection."""

from __future__ import annotations

import zipfile
from pathlib import Path

from .coverage import CoverageItem

# Parts that are outside the v1 supported-lossless subset for all OOXML formats.
GLOBAL_UNSUPPORTED_SUFFIXES = (
    ".bin",  # often vbaProject / oleObject
)
GLOBAL_UNSUPPORTED_NAME_FRAGMENTS = (
    "vbaproject",
    "oleobject",
    "embeddings/",
    "activex",
    "ink",
    "digitalsignature",
    "origin.sigs",
    "_xmlsignatures",
)

XLSX_SUPPORTED_PREFIXES = (
    "[content_types].xml",
    "_rels/",
    "xl/workbook.xml",
    "xl/_rels/",
    "xl/worksheets/",
    "xl/sharedstrings.xml",
    "xl/styles.xml",
    "xl/theme/",
    "xl/charts/",
    "xl/drawings/",
    "docprops/",
)

DOCX_SUPPORTED_PREFIXES = (
    "[content_types].xml",
    "_rels/",
    "word/document.xml",
    "word/_rels/",
    "word/styles.xml",
    "word/styleswitheffects.xml",
    "word/numbering.xml",
    "word/settings.xml",
    "word/websettings.xml",
    "word/fonttable.xml",
    "word/theme/",
    "word/media/",
    "word/header",
    "word/footer",
    "word/footnotes.xml",
    "word/endnotes.xml",
    "customxml/",
    "docprops/",
)

PPTX_SUPPORTED_PREFIXES = (
    "[content_types].xml",
    "_rels/",
    "ppt/presentation.xml",
    "ppt/_rels/",
    "ppt/slides/",
    "ppt/slidelayouts/",
    "ppt/slidemasters/",
    "ppt/theme/",
    "ppt/media/",
    "ppt/notesslides/",
    "ppt/charts/",
    "ppt/presprops.xml",
    "ppt/viewprops.xml",
    "ppt/tablestyles.xml",
    "ppt/printersettings/",
    "docprops/",
)


def list_zip_names(path: Path) -> list[str]:
    with zipfile.ZipFile(path, "r") as zf:
        return sorted(n for n in zf.namelist() if not n.endswith("/"))


def _is_supported(name: str, prefixes: tuple[str, ...]) -> bool:
    lower = name.lower()
    if any(frag.lower() in lower for frag in GLOBAL_UNSUPPORTED_NAME_FRAGMENTS):
        return False
    if lower.endswith(GLOBAL_UNSUPPORTED_SUFFIXES):
        # charts sometimes embed sk-xlsx; still flagged separately by caller
        if "vbaproject" in lower or "oleobject" in lower or "/embeddings/" in lower:
            return False
    return any(lower.startswith(p.lower()) or lower == p.lower() for p in prefixes)


def inventory_ooxml(
    path: Path,
    format_name: str,
    prefixes: tuple[str, ...],
    *,
    mark_status: str = "detected",
) -> list[CoverageItem]:
    items: list[CoverageItem] = []
    try:
        names = list_zip_names(path)
    except zipfile.BadZipFile as exc:
        raise ValueError(f"Not a valid {format_name} ZIP/OOXML package: {exc}") from exc

    for name in names:
        lower = name.lower()
        if any(frag.lower() in lower for frag in GLOBAL_UNSUPPORTED_NAME_FRAGMENTS) or (
            lower.endswith(".bin") and ("vba" in lower or "ole" in lower or "active" in lower)
        ):
            items.append(
                CoverageItem(
                    path=name,
                    kind="ooxml-part",
                    status="unsupported",
                    detail="macro/OLE/ActiveX/signature/customXml outside v1 subset",
                )
            )
            continue
        if _is_supported(name, prefixes):
            items.append(
                CoverageItem(
                    path=name,
                    kind="ooxml-part",
                    status=mark_status,  # type: ignore[arg-type]
                    detail=f"{format_name} package part",
                )
            )
        else:
            items.append(
                CoverageItem(
                    path=name,
                    kind="ooxml-part",
                    status="unsupported",
                    detail="part outside declared v1 supported subset",
                )
            )
    return items
