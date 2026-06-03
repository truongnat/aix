"use strict";

/** Active provider scope (v0.11.0): Claude, Cursor, Codex, Gemini — OpenCode removed. */

const PROVIDERS = Object.freeze([
  {
    id: "claude",
    label: "Claude Code",
    description: "Primary — plugin + project commands",
    implemented: true,
    priority: "primary"
  },
  {
    id: "cursor",
    label: "Cursor",
    description: "Secondary — plugin packaging + rules fallback",
    implemented: true,
    priority: "secondary"
  },
  {
    id: "codex",
    label: "Codex",
    description: "Experimental — .codex-plugin/ + AGENTS.md fallback",
    implemented: true,
    priority: "experimental",
    installMode: "plugin-packaging-plus-project-fallback",
    nativeSlashCommands: false,
    pluginManifest: ".codex-plugin/plugin.json"
  },
  {
    id: "gemini",
    label: "Gemini",
    description: "Experimental — gemini extension context",
    implemented: true,
    priority: "experimental"
  },
  {
    id: "generic",
    label: "Generic AGENTS.md",
    description: "Generic agent bootstrap (fallback)",
    implemented: true,
    priority: "fallback"
  },
  {
    id: "manual",
    label: "Manual fallback",
    description: "Legacy root-copy fallback",
    implemented: true,
    priority: "fallback"
  },
  {
    id: "antigravity",
    label: "Antigravity",
    description: "Planned, not implemented",
    implemented: false
  }
]);

const RUNTIME_NATIVE_IDS = new Set(
  PROVIDERS.filter((p) => p.implemented && p.id !== "manual" && p.id !== "antigravity").map((p) => p.id)
);

const ACTIVE_PROVIDER_IDS = Object.freeze(["claude", "cursor", "codex", "gemini"]);

function getProvider(id) {
  return PROVIDERS.find((p) => p.id === id);
}

function isRuntimeNative(id) {
  return RUNTIME_NATIVE_IDS.has(id);
}

function providerPriorityLabel(provider) {
  if (provider.priority === "primary") {
    return "primary recommended";
  }
  if (provider.priority === "secondary") {
    return "secondary";
  }
  if (provider.priority === "experimental") {
    return "experimental";
  }
  return "";
}

module.exports = {
  PROVIDERS,
  RUNTIME_NATIVE_IDS,
  ACTIVE_PROVIDER_IDS,
  getProvider,
  isRuntimeNative,
  providerPriorityLabel
};
