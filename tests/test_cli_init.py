"""Tests for `goal init` command behaviour."""

from __future__ import annotations

from pathlib import Path

import pytest
from typer.testing import CliRunner

from agentic_goal.cli import app


@pytest.fixture
def runner(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> CliRunner:
    monkeypatch.chdir(tmp_path)
    return CliRunner()


def test_init_creates_config_and_skills(tmp_path: Path, runner: CliRunner) -> None:
    result = runner.invoke(app, ["init"])
    assert result.exit_code == 0, result.output

    config = tmp_path / ".goal" / "config.yaml"
    skills = tmp_path / ".goal" / "skills"

    assert config.exists()
    assert skills.is_dir()

    # All 7 templates should be copied
    expected_skills = {
        "global.md",
        "architecture.md",
        "rules.md",
        "tasks.md",
        "ticket-planning.md",
        "coding-style.md",
        "review-rubric.md",
    }
    actual_skills = {p.name for p in skills.iterdir()}
    assert expected_skills.issubset(actual_skills)


def test_init_idempotent_without_force(tmp_path: Path, runner: CliRunner) -> None:
    runner.invoke(app, ["init"])

    config = tmp_path / ".goal" / "config.yaml"
    config.write_text("# user-edited\n")

    result = runner.invoke(app, ["init"])
    assert result.exit_code == 0
    # User edit must be preserved
    assert config.read_text() == "# user-edited\n"


def test_init_force_overwrites(tmp_path: Path, runner: CliRunner) -> None:
    runner.invoke(app, ["init"])
    config = tmp_path / ".goal" / "config.yaml"
    config.write_text("# user-edited\n")

    result = runner.invoke(app, ["init", "--force"])
    assert result.exit_code == 0
    # --force re-writes config from template
    assert config.read_text() != "# user-edited\n"
    assert "default_provider" in config.read_text()


def test_start_without_init_fails(tmp_path: Path, runner: CliRunner) -> None:
    result = runner.invoke(app, ["start", "build something"])
    assert result.exit_code == 1
    assert "Not initialised" in result.output or "not initialised" in result.output.lower()
