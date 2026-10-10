#!/usr/bin/env python3
"""Create this skill's private virtual environment and install dependencies."""

from __future__ import annotations

import subprocess
import sys
import venv
from pathlib import Path


def main() -> int:
    if sys.version_info < (3, 11):
        raise SystemExit("Python 3.11+ is required.")
    skill_root = Path(__file__).resolve().parents[1]
    env_dir = skill_root / ".venv"
    venv.EnvBuilder(with_pip=True).create(env_dir)
    python = env_dir / ("Scripts/python.exe" if sys.platform == "win32" else "bin/python")
    subprocess.run(
        [
            str(python),
            "-m",
            "pip",
            "install",
            "--disable-pip-version-check",
            "-r",
            str(skill_root / "requirements.txt"),
        ],
        check=True,
    )
    print(python)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
