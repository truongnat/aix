// Purpose: Bridge to install infrastructure modules.
// Layer: infrastructure

/* eslint-disable @typescript-eslint/no-require-imports */

export const legacyDomainSkillGeneration = require("../../../features/domains/index.js") as {
  writeDomainSkillSurface: (...args: unknown[]) => unknown;
};

export const legacyCommandInstallation = require("./catalog/command-installation.js") as {
  installProviderInteraction: (...args: unknown[]) => void;
};

export const legacyCliProviders = require("../../../cli/providers.js") as {
  isRuntimeNative: (runtime: string) => boolean;
  RUNTIME_NATIVE_PROVIDER_IDS: readonly string[];
};

export const legacyProviderDetection = require("./provider-detection.js") as {
  isGitRepo: (target: string) => boolean;
};

export const legacyFileOperations = require("./file-operations.js") as {
  ensureDirectory: (...args: unknown[]) => void;
  logAction: (...args: unknown[]) => void;
};

interface CatalogInstallEntry {
  action: string;
  relativePath: string;
}

export const legacyRuntimeCommandCatalog = require("./runtime-command-catalog.js") as {
  installProviderCommandSurface: (...args: unknown[]) => CatalogInstallEntry[];
  installRuntimeCommandCatalog: (...args: unknown[]) => CatalogInstallEntry[];
  readInstalledCommandSurface: (targetAbs: string) => { installedProviders?: string[] } | null;
};

export const legacyWorkerClaudeAdapter = require("../../../workers/claude-adapter.js") as {
  installClaudeWorkers: (...args: unknown[]) => CatalogInstallEntry[];
};

export const legacyCodexRuleGeneration = require("./codex-rule-generation.js") as {
  renderCodexRuleSet: (...args: unknown[]) => string;
};

export const legacyProviderRuleRenderer = require("./provider-rule-renderer.js") as {
  renderClaudeProjectMd: (...args: unknown[]) => string;
  renderCodexAgentsMd: (...args: unknown[]) => string;
  renderCursorActivationMdc: (...args: unknown[]) => string;
  renderCursorCommandsMdc: (...args: unknown[]) => string;
  renderCursorGuardrailsMdc: (...args: unknown[]) => string;
  renderGeminiMd: (...args: unknown[]) => string;
};

interface WorkerEntry {
  id: string;
  role: string;
  mode: string;
  writeAccess: string;
  definitionPath: string;
  providerSupport: Record<string, string>;
}

export const legacyWorkerRegistry = require("../../../workers/registry.js") as {
  workers: readonly WorkerEntry[];
};
