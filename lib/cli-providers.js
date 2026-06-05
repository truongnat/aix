"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RUNTIME_NATIVE_IDS = exports.SUPPORTED_PROVIDER_IDS = exports.LEGACY_PROVIDER_IDS = exports.PLANNED_PROVIDERS = exports.FALLBACK_PROVIDER_IDS = exports.FALLBACK_TARGETS = exports.ACTIVE_PROVIDER_IDS = exports.ACTIVE_PROVIDERS = exports.PROVIDERS = void 0;
exports.getProvider = getProvider;
exports.isActiveProvider = isActiveProvider;
exports.isFallbackTarget = isFallbackTarget;
exports.isSupportedProvider = isSupportedProvider;
exports.isPlannedProvider = isPlannedProvider;
exports.isRuntimeNative = isRuntimeNative;
exports.providerPriorityLabel = providerPriorityLabel;
const ACTIVE_PROVIDERS = Object.freeze([
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
        description: "Secondary - plugin packaging + rules fallback",
        implemented: true,
        priority: "secondary",
    },
    {
        id: "codex",
        label: "Codex",
        description: "Experimental - .codex-plugin/ + AGENTS.md fallback",
        implemented: true,
        priority: "experimental",
        installMode: "plugin-packaging-plus-project-fallback",
        nativeSlashCommands: false,
        pluginManifest: ".codex-plugin/plugin.json",
    },
    {
        id: "gemini",
        label: "Gemini",
        description: "Experimental - gemini extension context",
        implemented: true,
        priority: "experimental",
    },
]);
exports.ACTIVE_PROVIDERS = ACTIVE_PROVIDERS;
const FALLBACK_TARGETS = Object.freeze([
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
        description: "Legacy root-copy fallback",
        implemented: true,
        priority: "fallback",
    },
]);
exports.FALLBACK_TARGETS = FALLBACK_TARGETS;
const PLANNED_PROVIDERS = Object.freeze([
    {
        id: "antigravity",
        label: "Antigravity",
        description: "Planned, not implemented",
        implemented: false,
        priority: "planned",
    },
]);
exports.PLANNED_PROVIDERS = PLANNED_PROVIDERS;
const LEGACY_PROVIDER_IDS = Object.freeze(["opencode"]);
exports.LEGACY_PROVIDER_IDS = LEGACY_PROVIDER_IDS;
const ACTIVE_PROVIDER_IDS = Object.freeze(ACTIVE_PROVIDERS.map((provider) => provider.id));
exports.ACTIVE_PROVIDER_IDS = ACTIVE_PROVIDER_IDS;
const FALLBACK_PROVIDER_IDS = Object.freeze(FALLBACK_TARGETS.map((provider) => provider.id));
exports.FALLBACK_PROVIDER_IDS = FALLBACK_PROVIDER_IDS;
const SUPPORTED_PROVIDER_IDS = Object.freeze([...ACTIVE_PROVIDER_IDS, ...FALLBACK_PROVIDER_IDS]);
exports.SUPPORTED_PROVIDER_IDS = SUPPORTED_PROVIDER_IDS;
const PROVIDERS = Object.freeze([...ACTIVE_PROVIDERS, ...FALLBACK_TARGETS, ...PLANNED_PROVIDERS]);
exports.PROVIDERS = PROVIDERS;
const RUNTIME_NATIVE_IDS = new Set([...ACTIVE_PROVIDER_IDS, "generic"]);
exports.RUNTIME_NATIVE_IDS = RUNTIME_NATIVE_IDS;
function getProvider(id) {
    return PROVIDERS.find((provider) => provider.id === id) || null;
}
function isActiveProvider(id) {
    return ACTIVE_PROVIDER_IDS.includes(id);
}
function isFallbackTarget(id) {
    return FALLBACK_PROVIDER_IDS.includes(id);
}
function isSupportedProvider(id) {
    return SUPPORTED_PROVIDER_IDS.includes(id);
}
function isPlannedProvider(id) {
    return PLANNED_PROVIDERS.some((provider) => provider.id === id);
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
