"""Tools for coder agent: file operations, shell, git."""

from __future__ import annotations

import subprocess
from pathlib import Path

from langchain_core.tools import tool


@tool
def read_file(path: str) -> str:
    """Read the contents of a file."""
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"File not found: {path}")
    return p.read_text(encoding="utf-8")


@tool
def write_file(path: str, content: str) -> str:
    """Write content to a file, creating parent directories if needed."""
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")
    return f"Written to {path}"


@tool
def run_shell(command: str, cwd: str | None = None) -> str:
    """Run a shell command and return stdout/stderr."""
    # Default to goal directory if not specified
    if cwd is None:
        cwd = str(Path(".goal").absolute())
    result = subprocess.run(
        command,
        shell=True,
        cwd=cwd,
        capture_output=True,
        text=True,
        timeout=300,
    )
    output = result.stdout or ""
    if result.stderr:
        output += f"\nstderr: {result.stderr}"
    if result.returncode != 0:
        output += f"\nexit code: {result.returncode}"
    return output


@tool
def git_status() -> str:
    """Get git status of the current directory."""
    result = subprocess.run(
        ["git", "status", "--porcelain"],
        capture_output=True,
        text=True,
        timeout=30,
    )
    return result.stdout or "No changes"


@tool
def git_diff(path: str | None = None) -> str:
    """Get git diff for a file or all changes."""
    cmd = ["git", "diff"]
    if path:
        cmd.append(path)
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    return result.stdout or "No diff"


@tool
def git_commit(message: str) -> str:
    """Stage all changes and commit with message."""
    # Safety check: only allow commits in .goal directory
    cwd = Path.cwd()
    if not cwd.name.startswith("g_") or ".goal" not in str(cwd):
        return "Error: git_commit only allowed in goal sandbox (.goal/g_*)"

    subprocess.run(["git", "add", "."], capture_output=True, timeout=30)
    result = subprocess.run(
        ["git", "commit", "-m", message],
        capture_output=True,
        text=True,
        timeout=30,
    )
    if result.returncode == 0:
        return f"Committed: {message}"
    return f"Commit failed: {result.stderr}"


# Tool list for coder agent
CODER_TOOLS = [read_file, write_file, run_shell, git_status, git_diff, git_commit]
