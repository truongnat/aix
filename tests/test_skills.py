"""Tests for the skills loader."""

from pathlib import Path

import pytest

import agentic_goal.nodes as nodes_module
from agentic_goal.nodes import load_skills


@pytest.fixture(autouse=True)
def patch_skills_dir(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    skills_dir = tmp_path / "skills"
    skills_dir.mkdir()
    monkeypatch.setattr(nodes_module, "_SKILLS_DIR", skills_dir)
    return skills_dir


def test_no_skills_returns_empty(patch_skills_dir: Path) -> None:
    assert load_skills("planner") == ""
    assert load_skills("coder") == ""


def test_global_only(patch_skills_dir: Path) -> None:
    (patch_skills_dir / "global.md").write_text("Use Python 3.11+")
    result = load_skills("planner")
    assert "Global project context" in result
    assert "Use Python 3.11+" in result


def test_role_specific_only(patch_skills_dir: Path) -> None:
    (patch_skills_dir / "coding-style.md").write_text("Use ruff for linting")
    result = load_skills("coder")
    assert "Role-specific context (coder)" in result
    assert "Use ruff for linting" in result


def test_global_and_role_combined(patch_skills_dir: Path) -> None:
    (patch_skills_dir / "global.md").write_text("Global rule")
    (patch_skills_dir / "coding-style.md").write_text("Coder rule")
    result = load_skills("coder")
    assert "Global rule" in result
    assert "Coder rule" in result
    assert result.index("Global rule") < result.index("Coder rule")


def test_empty_global_file_ignored(patch_skills_dir: Path) -> None:
    (patch_skills_dir / "global.md").write_text("   \n  ")
    result = load_skills("planner")
    assert result == ""


def test_unknown_role_uses_global_only(patch_skills_dir: Path) -> None:
    (patch_skills_dir / "global.md").write_text("Global rule")
    result = load_skills("unknown_role")
    assert "Global rule" in result
    assert "Role-specific" not in result


def test_reviewer_skill_file(patch_skills_dir: Path) -> None:
    (patch_skills_dir / "review-rubric.md").write_text("Score >= 9 required")
    result = load_skills("reviewer")
    assert "Score >= 9 required" in result


def test_result_starts_with_separator(patch_skills_dir: Path) -> None:
    (patch_skills_dir / "global.md").write_text("Something")
    result = load_skills("planner")
    assert result.startswith("\n\n---\n\n")


def test_extra_skill_files_discovered(patch_skills_dir: Path) -> None:
    (patch_skills_dir / "global.md").write_text("Global rule")
    (patch_skills_dir / "coding-style.md").write_text("Main style")
    (patch_skills_dir / "coder-frontend.md").write_text("React hooks rule")
    (patch_skills_dir / "coder-testing.md").write_text("Pytest rule")
    result = load_skills("coder")
    assert "Global rule" in result
    assert "Main style" in result
    assert "React hooks rule" in result
    assert "Pytest rule" in result
    assert result.index("Main style") < result.index("React hooks rule")


def test_extra_skills_deduplicated_with_primary(patch_skills_dir: Path) -> None:
    # If a glob matches the primary file, it should not be duplicated
    (patch_skills_dir / "coding-style.md").write_text("Main style")
    (patch_skills_dir / "coder-extra.md").write_text("Extra rule")
    result = load_skills("coder")
    assert result.count("Main style") == 1
    assert "Extra rule" in result


def test_unknown_role_no_extra_globs(patch_skills_dir: Path) -> None:
    (patch_skills_dir / "global.md").write_text("Global rule")
    result = load_skills("unknown_role")
    assert "Global rule" in result
    assert "Role-specific" not in result
    assert "Extra skill" not in result


def test_contextual_skills_match_by_frontmatter_tags(patch_skills_dir: Path) -> None:
    (patch_skills_dir / "coding-style.md").write_text("Main style")
    (patch_skills_dir / "auth.md").write_text(
        "---\ntags: [auth, jwt, security]\n---\n\n# Auth Patterns\nUse JWT tokens"
    )
    result = load_skills("coder", context="Implement JWT authentication")
    assert "Main style" in result
    assert "Auth Patterns" in result
    assert "Use JWT tokens" in result


def test_contextual_skills_no_match_ignored(patch_skills_dir: Path) -> None:
    (patch_skills_dir / "coding-style.md").write_text("Main style")
    (patch_skills_dir / "auth.md").write_text(
        "---\ntags: [auth, jwt]\n---\n\n# Auth\nJWT"
    )
    result = load_skills("coder", context="Build a todo list app")
    assert "Main style" in result
    assert "Auth" not in result
    assert "JWT" not in result


def test_contextual_skills_deduped_with_pattern(patch_skills_dir: Path) -> None:
    (patch_skills_dir / "coding-style.md").write_text("Main style")
    (patch_skills_dir / "coder-frontend.md").write_text(
        "---\ntags: [react, frontend]\n---\n\n# Frontend"
    )
    result = load_skills("coder", context="Build React frontend")
    # coder-frontend.md matches both pattern AND context → not duplicated
    assert result.count("# Frontend") == 1
