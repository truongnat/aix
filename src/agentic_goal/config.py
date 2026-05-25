"""Configuration system: layered resolution, validation, model registry."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import yaml
from pydantic import BaseModel, Field, model_validator
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

    @model_validator(mode="after")
    def check_reviewer_not_coder(self) -> Config:
        reviewer = self.roles.get("reviewer")
        coder = self.roles.get("coder")
        if reviewer and coder and reviewer.model == coder.model:
            raise ValueError(
                f"reviewer.model ({reviewer.model}) must differ from coder.model ({coder.model})"
            )
        return self


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
        "resume_analyzer": RoleConfig(model="anthropic/claude-sonnet-4"),
    }


def _default_providers() -> dict[str, ProviderConfig]:
    return {
        "openrouter": ProviderConfig(api_key_env="OPENROUTER_API_KEY", base_url="https://openrouter.ai/api/v1"),
        "anthropic": ProviderConfig(api_key_env="ANTHROPIC_API_KEY"),
        "openai": ProviderConfig(api_key_env="OPENAI_API_KEY"),
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


def validate_config(cfg: Config, strict: bool = False) -> None:
    """Validate config. Raises ValueError on fatal issues."""
    reviewer = cfg.roles.get("reviewer")
    coder = cfg.roles.get("coder")
    if reviewer and coder and reviewer.model == coder.model:
        raise ValueError(
            f"reviewer.model ({reviewer.model}) must differ from coder.model ({coder.model})"
        )

    for role_name, role in cfg.roles.items():
        # Resolve provider from model string (e.g. "anthropic/claude-opus-4")
        provider_hint = role.model.split("/")[0] if "/" in role.model else cfg.default_provider
        provider = cfg.providers.get(provider_hint) or cfg.providers.get(cfg.default_provider)
        if not provider:
            raise ValueError(f"No provider config for role '{role_name}' (hint: {provider_hint})")
        api_key = os.environ.get(provider.api_key_env)
        if strict and not api_key:
            raise ValueError(
                f"Missing API key env var '{provider.api_key_env}' for provider '{provider_hint}'"
            )
