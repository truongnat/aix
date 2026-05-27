"""Tests for config loading and merging."""

from pathlib import Path

import pytest

from agentic_goal.config import (
    apply_ollama_fallback,
    load_config,
    validate_config,
)


def test_load_config_defaults() -> None:
    cfg = load_config(
        goal_config_path=Path("/nonexistent"),
        global_config_path=Path("/nonexistent"),
    )
    assert "planner" in cfg.roles
    assert "coder" in cfg.roles
    assert "reviewer" in cfg.roles
    assert cfg.default_provider in ("anthropic", "openrouter", "openai", "ollama")


def test_load_config_project_overrides_global(tmp_path: Path) -> None:
    global_cfg = tmp_path / "global.yaml"
    global_cfg.write_text(
        "default_provider: anthropic\nroles:\n  planner:\n    model: anthropic/claude-opus-4\n"
    )

    project_cfg = tmp_path / "project.yaml"
    project_cfg.write_text(
        "default_provider: openrouter\n"
        "roles:\n"
        "  planner:\n"
        "    model: openrouter/anthropic/claude-haiku\n"
    )

    cfg = load_config(
        goal_config_path=project_cfg,
        global_config_path=global_cfg,
    )
    assert cfg.default_provider == "openrouter"
    assert cfg.roles["planner"].model == "openrouter/anthropic/claude-haiku"


def test_load_config_global_only(tmp_path: Path) -> None:
    global_cfg = tmp_path / "global.yaml"
    global_cfg.write_text("default_provider: openai\n")

    cfg = load_config(goal_config_path=Path("/nonexistent"), global_config_path=global_cfg)
    assert cfg.default_provider == "openai"


def test_load_config_partial_role_override(tmp_path: Path) -> None:
    project_cfg = tmp_path / "project.yaml"
    project_cfg.write_text("roles:\n  planner:\n    temperature: 0.9\n")

    cfg = load_config(goal_config_path=project_cfg, global_config_path=Path("/nonexistent"))
    assert cfg.roles["planner"].temperature == 0.9
    assert cfg.roles["planner"].model != ""  # model preserved from defaults


def test_apply_ollama_fallback_skips_when_openrouter_key_set(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("OPENROUTER_API_KEY", "sk-or-test-key")
    cfg = load_config(
        goal_config_path=Path("/nonexistent"),
        global_config_path=Path("/nonexistent"),
    )
    cfg.default_provider = "openrouter"
    result = apply_ollama_fallback(cfg)
    assert result == {}
    # No role should have been changed to ollama
    for role in cfg.roles.values():
        assert not role.model.startswith("ollama/")


def test_validate_config_openrouter_no_per_role_key_error(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("OPENROUTER_API_KEY", "sk-or-test-key")
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    cfg = load_config(
        goal_config_path=Path("/nonexistent"),
        global_config_path=Path("/nonexistent"),
    )
    cfg.default_provider = "openrouter"
    # Should NOT raise even though ANTHROPIC_API_KEY is missing
    validate_config(cfg, strict=True)


def test_validate_config_missing_key_strict(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """When no API keys and no Ollama, validate_config strict raises for missing key.
    We bypass ollama fallback by patching _ollama_list_models to return empty
    and _prompt_ollama_pull to return False so no fallback happens.
    """
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.setattr("agentic_goal.config._ollama_list_models", lambda *a, **kw: [])
    monkeypatch.setattr("agentic_goal.config._prompt_ollama_pull", lambda *a, **kw: False)

    project_cfg = tmp_path / "project.yaml"
    project_cfg.write_text("default_provider: anthropic\n")
    cfg = load_config(goal_config_path=project_cfg, global_config_path=Path("/nonexistent"))

    with pytest.raises(ValueError, match="Missing API key"):
        validate_config(cfg, strict=True)
