"use strict";

const PROVIDERS = Object.freeze([
  { id: "cursor", label: "Cursor", description: "Cursor rules", implemented: true },
  { id: "claude", label: "Claude Code", description: "CLAUDE.md project instructions", implemented: true },
  { id: "codex", label: "Codex", description: "AGENTS.md bootstrap", implemented: true },
  { id: "gemini", label: "Gemini", description: "Gemini extension files", implemented: true },
  { id: "opencode", label: "OpenCode", description: "OpenCode plugin", implemented: true },
  { id: "generic", label: "Generic AGENTS.md", description: "Generic agent bootstrap", implemented: true },
  { id: "manual", label: "Manual fallback", description: "Legacy root-copy fallback", implemented: true },
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

function getProvider(id) {
  return PROVIDERS.find((p) => p.id === id);
}

function isRuntimeNative(id) {
  return RUNTIME_NATIVE_IDS.has(id);
}

module.exports = {
  PROVIDERS,
  RUNTIME_NATIVE_IDS,
  getProvider,
  isRuntimeNative
};
