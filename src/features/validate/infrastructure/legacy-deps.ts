// Purpose: Bridge to legacy lib modules until later migration phases.
// Layer: infrastructure
// Depends on: dist/lib and dist/workers at runtime

/* eslint-disable @typescript-eslint/no-require-imports */

interface DomainDefinition {
  id: string;
}

type ProviderSupportLevel = "native" | "adapter" | "fallback" | "unsupported";

interface WorkerDefinition {
  id: string;
  role: string;
  mode: string;
  writeAccess: "none" | "write";
  canDispatch: boolean;
  requiredInputs: string[];
  resultSchema: string;
  providerSupport: Record<string, ProviderSupportLevel>;
  definitionPath: string;
}

export const legacyRuntimeCommandCatalog = require("../../../lib/runtime-command-catalog.js") as {
  fileReferencesActivation: (content: string) => boolean;
};

export const legacyWorkerRegistry = require("../../../workers/registry.js") as {
  workers: readonly WorkerDefinition[];
  VALID_PROVIDER_SUPPORT: readonly ProviderSupportLevel[];
  WORKER_IDS: readonly string[];
};

export const legacyWorkerClaudeAdapter = require("../../../lib/worker-claude-adapter.js") as {
  assertClaudeWorkerSurface: (baseDir: string, failures: string[]) => void;
};

export const legacyDomainSkillGeneration = require("../../../lib/domain-skill-generation.js") as {
  listDomainDefinitions: () => DomainDefinition[];
};

export const legacyProviderRuleRenderer = require("../../../lib/provider-rule-renderer.js") as {
  assertRepositoryProviderRules: (baseDir: string, failures: string[]) => void;
};
