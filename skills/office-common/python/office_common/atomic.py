"""Atomic publish: write temp → validate → rename."""

from __future__ import annotations

import os
import sys
import tempfile
import time
from collections.abc import Callable
from pathlib import Path


def atomic_publish(
    destination: Path,
    writer: Callable[[Path], None],
    validator: Callable[[Path], None] | None = None,
) -> Path:
    """Write to a sibling temp file, validate, then replace destination.

    If validation fails, the destination is left untouched and the temp file
    is removed.
    """
    destination = destination.resolve()
    destination.parent.mkdir(parents=True, exist_ok=True)
    # Keep the real extension so format libraries (openpyxl, etc.) accept the path.
    fd, tmp_name = tempfile.mkstemp(
        prefix=f".{destination.stem}.",
        suffix=destination.suffix or ".bin",
        dir=str(destination.parent),
    )
    os.close(fd)
    tmp_path = Path(tmp_name)
    try:
        writer(tmp_path)
        if validator is not None:
            validator(tmp_path)
        for attempt in range(3):
            try:
                os.replace(tmp_path, destination)
                return destination
            except PermissionError:
                if attempt == 2 or sys.platform != "win32":
                    raise
                time.sleep(0.1 * (2 ** attempt))
    except Exception:
        if tmp_path.exists():
            tmp_path.unlink(missing_ok=True)
        raise
