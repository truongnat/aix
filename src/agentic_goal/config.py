"""Configuration system: layered resolution, validation, model registry."""

from __future__ import annotations

import os
import subprocess
from pathlib import Path
from typing import Any

import yaml
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

APP_NAME = "agentic-goal"
DEFAULT_CONFIG_DIR = Path.home() / ".config" / APP_NAME
DEFAULT_CONFIG_PATH = DEFAULT_CONFIG_DIR / "config.yaml"


class ProviderConfig(BaseModel):
    api_key_env: str = "OPENROUTER_API_KEY"
    base_url: str | None = None


class RoleConfig(BaseModel):
    model: str
    temperature: float = 0.2
    max_tokens: int | None = None
    tools_enabled: list[str] | None = None


class BudgetConfig(BaseModel):
    per_goal_usd: float = 5.0
    per_ticket_usd: float = 0.5
    warn_at_pct: float = 80.0
    hard_stop: bool = True


class Config(BaseModel):
    default_provider: str = "openrouter"
    providers: dict[str, ProviderConfig] = Field(default_factory=dict)
    roles: dict[str, RoleConfig] = Field(default_factory=dict)
    budgets: BudgetConfig = Field(default_factory=BudgetConfig)


class EnvSettings(BaseSettings):
    """.env overrides — GOAL_MODEL_<ROLE>=model string."""

    model_config = SettingsConfigDict(
        env_prefix="GOAL_MODEL_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Dynamically any GOAL_MODEL_* becomes a key here; we reflect in load_config.


def _default_roles() -> dict[str, RoleConfig]:
    return {
        "planner": RoleConfig(model="anthropic/claude-opus-4", temperature=0.2, max_tokens=8000),
        "rules_advisor": RoleConfig(model="anthropic/claude-opus-4"),
        "task_decomposer": RoleConfig(model="anthropic/claude-sonnet-4"),
        "ticket_planner": RoleConfig(model="openai/gpt-4.1-mini"),
        "coder": RoleConfig(
            model="openai/gpt-4.1-mini",
            temperature=0.1,
            tools_enabled=["read_file", "write_file", "run_shell", "git"],
        ),
        "reviewer": RoleConfig(model="anthropic/claude-opus-4", temperature=0.0),
    }


def _default_providers() -> dict[str, ProviderConfig]:
    return {
        "openrouter": ProviderConfig(api_key_env="OPENROUTER_API_KEY", base_url="https://openrouter.ai/api/v1"),
        "anthropic": ProviderConfig(api_key_env="ANTHROPIC_API_KEY"),
        "openai": ProviderConfig(api_key_env="OPENAI_API_KEY"),
        "ollama": ProviderConfig(api_key_env="OLLAMA_NO_KEY_NEEDED", base_url="http://localhost:11434"),
    }


def load_config(
    goal_config_path: Path | None = None,
    global_config_path: Path | None = None,
) -> Config:
    """Layered config: defaults <- global yaml <- goal yaml <- .env <- cli overrides."""
    defaults = Config(
        providers=_default_providers(),
        roles=_default_roles(),
    )

    # Layer 1: global yaml
    gpath = global_config_path or DEFAULT_CONFIG_PATH
    if gpath.exists():
        with gpath.open() as f:
            data = yaml.safe_load(f) or {}
        defaults = _merge_into(defaults, data)

    # Layer 2: goal-local yaml
    if goal_config_path and goal_config_path.exists():
        with goal_config_path.open() as f:
            data = yaml.safe_load(f) or {}
        defaults = _merge_into(defaults, data)

    # Layer 3: .env variables GOAL_MODEL_* (simple string override)
    for key in os.environ:
        if key.startswith("GOAL_MODEL_"):
            role = key[len("GOAL_MODEL_") :].lower()
            if role in defaults.roles:
                defaults.roles[role].model = os.environ[key]

    # Auto-apply Ollama fallback for missing API keys
    apply_ollama_fallback(defaults)

    return defaults


def _merge_into(cfg: Config, data: dict[str, Any]) -> Config:
    """Shallow merge of yaml dict into existing Config."""
    # Providers
    for name, p in data.get("providers", {}).items():
        cfg.providers[name] = ProviderConfig(**p)
    # Roles
    for name, r in data.get("roles", {}).items():
        if name in cfg.roles:
            # Merge with existing to allow partial overrides
            merged = {**cfg.roles[name].model_dump(), **r}
            cfg.roles[name] = RoleConfig(**merged)
        else:
            cfg.roles[name] = RoleConfig(**r)
    # Budgets
    if "budgets" in data:
        cfg.budgets = BudgetConfig(**data["budgets"])
    if "default_provider" in data:
        cfg.default_provider = data["default_provider"]
    return cfg


def _ollama_list_models(base_url: str = "http://localhost:11434") -> list[str]:
    """List available Ollama models, filtering out embedding-only models."""
    try:
        import json
        import urllib.request

        req = urllib.request.Request(f"{base_url}/api/tags", method="GET")
        with urllib.request.urlopen(req, timeout=2) as response:
            data = json.loads(response.read())
            models = [m["name"] for m in data.get("models", [])]
            # Filter out embedding-only models (can't generate chat)
            embedding_patterns = ["embed", "bge-", "nomic-"]
            return [
                m for m in models if not any(pattern in m.lower() for pattern in embedding_patterns)
            ]
    except Exception:
        return []


def _pick_ollama_model(role_name: str, available: list[str]) -> str | None:
    """Pick best Ollama model for a role from available models.

    Strategy:
      1. Role-specific preferences (coder -> coder models).
      2. Prefer larger param sizes for complex reasoning roles.
      3. De-prioritize known weak/tiny models (phi3-mini, phi4-mini, gemma:2b).
      4. Fall back to any non-tiny model, then to anything.
    """
    if not available:
        return None

    # Models known to be too weak for these structured agent tasks.
    # Used only as last resort.
    weak_patterns = ("phi3-mini", "phi4-mini", "gemma:2b", "tinyllama", "qwen2:0.5b")

    def is_weak(m: str) -> bool:
        ml = m.lower()
        return any(p in ml for p in weak_patterns)

    strong = [m for m in available if not is_weak(m)]

    # Role-specific preferences
    if role_name == "coder":
        for pattern in ("qwen2.5-coder", "deepseek-coder", "codellama"):
            for model in strong:
                if pattern in model.lower():
                    return model
    if role_name in ("planner", "rules_advisor", "reviewer"):
        # Prefer larger param sizes
        for size in ("70b", "34b", "13b", "8b"):
            for prefix in ("llama3", "qwen2.5", "qwen2", "mistral"):
                for model in strong:
                    ml = model.lower()
                    if size in ml and prefix in ml:
                        return model

    # Generic preference: any reasonable-size strong model
    for prefix in ("llama3", "qwen2.5", "qwen2", "mistral", "gemma"):
        for model in strong:
            if prefix in model.lower():
                return model

    # Any strong model
    if strong:
        return strong[0]

    # Last resort: a weak model is better than nothing
    return available[0]


def _prompt_ollama_pull(recommended: list[str]) -> bool:
    """Prompt user to pull recommended Ollama models."""
    import sys

    from rich import print as rprint
    from rich.panel import Panel

    # Skip prompt in non-TTY environments (CI, Docker, piped input)
    if not sys.stdin.isatty():
        return False

    rprint(
        Panel(
            "[yellow]No suitable Ollama models found locally.[/yellow]\n\n"
            "Recommended pulls:\n"
            + "\n".join(f"  - {m}" for m in recommended)
            + "\n\n[cyan]Pull recommended models now? [Y/n][/cyan]",
            title="Ollama Setup",
        )
    )
    response = input().strip().lower()
    if response not in ("", "y", "yes"):
        return False

    pulled: list[str] = []
    for model in recommended:
        rprint(f"[dim]Pulling {model}...[/dim]")
        try:
            subprocess.run(["ollama", "pull", model], check=True, timeout=1800)  # 30 min timeout
            pulled.append(model)
        except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
            rprint(f"[red]Failed to pull {model} (ollama not found, error, or timeout)[/red]")
    return len(pulled) > 0


def apply_ollama_fallback(cfg: Config) -> dict[str, str]:
    """Apply Ollama fallback for roles with missing API keys.

    Returns dict of role -> new model for roles that fell back.
    """
    available = _ollama_list_models()
    if not available:
        # Prompt to pull recommended models
        recommended = ["llama3.1:8b", "qwen2.5-coder:7b"]
        if not _prompt_ollama_pull(recommended):
            return {}
        available = _ollama_list_models()

    # Warn if only weak/tiny models are available
    weak_patterns = ("phi3-mini", "phi4-mini", "gemma:2b", "tinyllama", "qwen2:0.5b")
    if available and all(
        any(p in m.lower() for p in weak_patterns) for m in available
    ):
        from rich import print as rprint
        from rich.panel import Panel

        rprint(
            Panel(
                "[yellow]Only small/weak Ollama models found locally.[/yellow]\n\n"
                "These models often produce gibberish or fail tool-calling for "
                "structured SDLC tasks. Recommended pulls:\n"
                "  - llama3.1:8b\n"
                "  - qwen2.5:7b\n"
                "  - qwen2.5-coder:7b (for the coder role)\n\n"
                "Run: [bold]ollama pull llama3.1:8b[/bold]",
                title="⚠ Weak Ollama models",
            )
        )

    fallbacks: dict[str, str] = {}
    for role_name, role_cfg in cfg.roles.items():
        # Resolve provider
        provider_hint = (
            role_cfg.model.split("/")[0] if "/" in role_cfg.model else cfg.default_provider
        )
        provider = cfg.providers.get(provider_hint) or cfg.providers.get(cfg.default_provider)
        if not provider:
            continue

        # Check if API key is missing (ollama sentinel is always "present")
        if provider.api_key_env == "OLLAMA_NO_KEY_NEEDED":
            continue  # Already using Ollama

        key = os.environ.get(provider.api_key_env)
        if key:
            continue  # Key present, no fallback

        # Key missing - pick Ollama model
        ollama_model = _pick_ollama_model(role_name, available)
        if ollama_model:
            cfg.roles[role_name] = role_cfg.model_copy(update={"model": f"ollama/{ollama_model}"})
            fallbacks[role_name] = cfg.roles[role_name].model

    return fallbacks


def validate_config(cfg: Config, strict: bool = False) -> None:
    """Validate config. Raises ValueError on fatal issues."""
    reviewer = cfg.roles.get("reviewer")
    coder = cfg.roles.get("coder")
    if reviewer and coder and reviewer.model == coder.model:
        # Allow same model if both are Ollama (fallback scenario)
        both_ollama = reviewer.model.startswith("ollama/") and coder.model.startswith(
            "ollama/"
        )
        if both_ollama:
            from rich import print as rprint

            rprint(
                f"[yellow]Warning: reviewer and coder using same Ollama model ({reviewer.model}). "
                "Review quality may be degraded.[/yellow]"
            )
        else:
            raise ValueError(
                f"reviewer.model ({reviewer.model}) must differ from coder.model ({coder.model})"
            )

    for role_name, role in cfg.roles.items():
        # Resolve provider from model string (e.g. "anthropic/claude-opus-4")
        provider_hint = role.model.split("/")[0] if "/" in role.model else cfg.default_provider
        provider = cfg.providers.get(provider_hint) or cfg.providers.get(cfg.default_provider)
        if not provider:
            raise ValueError(f"No provider config for role '{role_name}' (hint: {provider_hint})")
        # Skip API key check for Ollama (uses sentinel env var)
        if provider.api_key_env == "OLLAMA_NO_KEY_NEEDED":
            continue
        api_key = os.environ.get(provider.api_key_env)
        if strict and not api_key:
            raise ValueError(
                f"Missing API key env var '{provider.api_key_env}' for provider '{provider_hint}'"
            )
