"""Tests for sandboxed coder tools."""

from __future__ import annotations

from pathlib import Path

import pytest

from agentic_goal.tools import (
    SandboxViolation,
    _check_command_safe,
    _resolve_inside_sandbox,
    read_file,
    write_file,
)


@pytest.fixture
def sandbox(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    """Use tmp_path as the CWD-based sandbox root."""
    monkeypatch.chdir(tmp_path)
    return tmp_path


# ---- _resolve_inside_sandbox ----

def test_resolve_relative_path_ok(sandbox: Path) -> None:
    p = _resolve_inside_sandbox("foo/bar.txt", sandbox)
    assert p == (sandbox / "foo" / "bar.txt").resolve()


def test_resolve_blocks_parent_traversal(sandbox: Path) -> None:
    with pytest.raises(SandboxViolation):
        _resolve_inside_sandbox("../../../etc/passwd", sandbox)


def test_resolve_blocks_absolute_outside(sandbox: Path) -> None:
    with pytest.raises(SandboxViolation):
        _resolve_inside_sandbox("/etc/passwd", sandbox)


def test_resolve_allows_absolute_inside(sandbox: Path) -> None:
    inside = sandbox / "x.txt"
    p = _resolve_inside_sandbox(str(inside), sandbox)
    assert p == inside.resolve()


# ---- _check_command_safe ----

def test_check_command_safe_allows_normal() -> None:
    _check_command_safe("npm install", denylist=["rm -rf /", "sudo "])
    _check_command_safe("pytest -v", denylist=["rm -rf /", "sudo "])


def test_check_command_safe_blocks_rm_rf_root() -> None:
    with pytest.raises(SandboxViolation):
        _check_command_safe("rm -rf /", denylist=["rm -rf /"])


def test_check_command_safe_blocks_sudo() -> None:
    with pytest.raises(SandboxViolation):
        _check_command_safe("sudo apt install foo", denylist=["sudo "])


def test_check_command_safe_case_insensitive() -> None:
    with pytest.raises(SandboxViolation):
        _check_command_safe("SUDO rm /etc/passwd", denylist=["sudo "])


def test_check_command_safe_empty_denylist_allows_anything() -> None:
    _check_command_safe("rm -rf /", denylist=[])


# ---- read_file / write_file ----

def test_write_and_read_file_inside_sandbox(sandbox: Path) -> None:
    result = write_file.invoke({"path": "src/hello.txt", "content": "hi"})
    assert "Written to" in result
    assert (sandbox / "src" / "hello.txt").read_text() == "hi"

    content = read_file.invoke({"path": "src/hello.txt"})
    assert content == "hi"


def test_write_file_blocks_path_traversal(sandbox: Path) -> None:
    with pytest.raises(SandboxViolation):
        write_file.invoke({"path": "../../evil.txt", "content": "x"})


def test_read_file_blocks_absolute_outside(sandbox: Path) -> None:
    with pytest.raises(SandboxViolation):
        read_file.invoke({"path": "/etc/passwd"})


def test_read_file_missing_raises(sandbox: Path) -> None:
    with pytest.raises(FileNotFoundError):
        read_file.invoke({"path": "nonexistent.txt"})
