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


def _resolve_sandbox_cwd(cwd: str | None) -> Path:
    """Resolve cwd, defaulting to .goal/. All shell/git ops run here."""
    if cwd is None:
        return Path(".goal").absolute()
    p = Path(cwd).absolute()
    # Ensure path is within .goal/ sandbox
    goal_root = Path(".goal").absolute()
    try:
        p.relative_to(goal_root)
    except ValueError:
        # Not inside sandbox, fall back to sandbox root
        return goal_root
    return p


@tool
def run_shell(command: str, cwd: str | None = None) -> str:
    """Run a shell command inside the .goal/ sandbox and return stdout/stderr."""
    sandbox_cwd = _resolve_sandbox_cwd(cwd)
    sandbox_cwd.mkdir(parents=True, exist_ok=True)
    result = subprocess.run(
        command,
        shell=True,
        cwd=str(sandbox_cwd),
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
def git_status(cwd: str | None = None) -> str:
    """Get git status inside the goal sandbox."""
    sandbox_cwd = _resolve_sandbox_cwd(cwd)
    result = subprocess.run(
        ["git", "status", "--porcelain"],
        cwd=str(sandbox_cwd),
        capture_output=True,
        text=True,
        timeout=30,
    )
    return result.stdout or "No changes"


@tool
def git_diff(path: str | None = None, cwd: str | None = None) -> str:
    """Get git diff inside the goal sandbox."""
    sandbox_cwd = _resolve_sandbox_cwd(cwd)
    cmd = ["git", "diff"]
    if path:
        cmd.append(path)
    result = subprocess.run(
        cmd, cwd=str(sandbox_cwd), capture_output=True, text=True, timeout=30
    )
    return result.stdout or "No diff"


@tool
def git_commit(message: str, cwd: str | None = None) -> str:
    """Stage all changes and commit inside the goal sandbox."""
    sandbox_cwd = _resolve_sandbox_cwd(cwd)
    if not sandbox_cwd.exists():
        return f"Error: sandbox cwd does not exist: {sandbox_cwd}"

    subprocess.run(
        ["git", "add", "."], cwd=str(sandbox_cwd), capture_output=True, timeout=30
    )
    result = subprocess.run(
        ["git", "commit", "-m", message],
        cwd=str(sandbox_cwd),
        capture_output=True,
        text=True,
        timeout=30,
    )
    if result.returncode == 0:
        return f"Committed: {message}"
    return f"Commit failed: {result.stderr}"


# Tool list for coder agent
CODER_TOOLS = [read_file, write_file, run_shell, git_status, git_diff, git_commit]
