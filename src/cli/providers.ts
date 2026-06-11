// Purpose: Provider registry for install UX
// Layer: domain
// Depends on: nothing

type ProviderPriority = "primary" | "secondary" | "experimental" | "fallback" | "planned";

interface ProviderDescriptor {
  id: string;
  label: string;
  description: string;
  implemented: boolean;
  priority: ProviderPriority;
  installMode?: string;
  nativeSlashCommands?: boolean;
  pluginManifest?: string;
}

const ACTIVE_PROVIDERS: readonly ProviderDescriptor[] = Object.freeze([
  {
    id: "claude",
    label: "Claude Code",
    description: "Primary - plugin + project commands",
    implemented: true,
    priority: "primary",
  },
  {
    id: "cursor",
    label: "Cursor",
    description: "Secondary - native command files + rules",
    implemented: true,
    priority: "secondary",
  },
  {
    id: "codex",
    label: "Codex",
    description: "Experimental - plugin packaging + AGENTS.md + .agents/skills fallback",
    implemented: true,
    priority: "experimental",
    installMode: "plugin-packaging-plus-project-fallback",
    nativeSlashCommands: false,
    pluginManifest: ".codex-plugin/plugin.json",
  },
  {
    id: "gemini",
    label: "Gemini",
    description: "Experimental - extension packaging + context",
    implemented: true,
    priority: "experimental",
  },
]);

const FALLBACK_TARGETS: readonly ProviderDescriptor[] = Object.freeze([
  {
    id: "generic",
    label: "Generic AGENTS.md",
    description: "Generic agent bootstrap fallback",
    implemented: true,
    priority: "fallback",
  },
  {
    id: "manual",
    label: "Manual fallback",
    description: "Project-local AGENTS.md fallback without runtime-native extras",
    implemented: true,
    priority: "fallback",
  },
]);

const PLANNED_PROVIDERS: readonly ProviderDescriptor[] = Object.freeze([
  {
    id: "antigravity",
    label: "Antigravity",
    description: "Planned, not implemented",
    implemented: false,
    priority: "planned",
  },
]);

const LEGACY_PROVIDER_IDS = Object.freeze(["opencode"]);
const ACTIVE_PROVIDER_IDS = Object.freeze(ACTIVE_PROVIDERS.map((provider) => provider.id));
const FALLBACK_PROVIDER_IDS = Object.freeze(FALLBACK_TARGETS.map((provider) => provider.id));
const SUPPORTED_PROVIDER_IDS = Object.freeze([...ACTIVE_PROVIDER_IDS, ...FALLBACK_PROVIDER_IDS]);
const PROVIDERS = Object.freeze([...ACTIVE_PROVIDERS, ...FALLBACK_TARGETS, ...PLANNED_PROVIDERS]);

const RUNTIME_NATIVE_PROVIDER_IDS = Object.freeze([...ACTIVE_PROVIDER_IDS, "generic"]);
const RUNTIME_NATIVE_IDS = new Set(RUNTIME_NATIVE_PROVIDER_IDS);

function getProvider(id: string): ProviderDescriptor | null {
  return PROVIDERS.find((provider) => provider.id === id) || null;
}

function isActiveProvider(id: string): boolean {
  return ACTIVE_PROVIDER_IDS.includes(id);
}

function isFallbackTarget(id: string): boolean {
  return FALLBACK_PROVIDER_IDS.includes(id);
}

function isSupportedProvider(id: string): boolean {
  return SUPPORTED_PROVIDER_IDS.includes(id);
}

function isPlannedProvider(id: string): boolean {
  return PLANNED_PROVIDERS.some((provider) => provider.id === id);
}

function isRuntimeNative(id: string): boolean {
  return RUNTIME_NATIVE_IDS.has(id);
}

function providerPriorityLabel(provider: ProviderDescriptor): string {
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

export {
  PROVIDERS,
  ACTIVE_PROVIDERS,
  ACTIVE_PROVIDER_IDS,
  FALLBACK_TARGETS,
  FALLBACK_PROVIDER_IDS,
  PLANNED_PROVIDERS,
  LEGACY_PROVIDER_IDS,
  SUPPORTED_PROVIDER_IDS,
  RUNTIME_NATIVE_PROVIDER_IDS,
  RUNTIME_NATIVE_IDS,
  getProvider,
  isActiveProvider,
  isFallbackTarget,
  isSupportedProvider,
  isPlannedProvider,
  isRuntimeNative,
  providerPriorityLabel,
};
export type { ProviderPriority, ProviderDescriptor };
