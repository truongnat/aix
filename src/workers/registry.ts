type ProviderSupportMode = "native" | "adapter" | "fallback" | "unsupported";
type WorkerProvider = "claude" | "cursor" | "codex" | "generic";
type WorkerId = "explorer" | "reviewer" | "verifier" | "gatekeeper" | "fixer";

interface WorkerDefinition {
  id: WorkerId;
  role: string;
  mode: string;
  writeAccess: "none" | "write";
  canDispatch: boolean;
  requiredInputs: string[];
  resultSchema: string;
  providerSupport: Record<WorkerProvider, ProviderSupportMode>;
  definitionPath: string;
}

const VALID_PROVIDER_SUPPORT = Object.freeze([
  "native",
  "adapter",
  "fallback",
  "unsupported"
] as const);

const WORKER_IDS = Object.freeze(
  ["explorer", "reviewer", "verifier", "gatekeeper", "fixer"] as const
);

const workers: readonly WorkerDefinition[] = Object.freeze([
  {
    id: "explorer",
    role: "explore",
    mode: "one-shot",
    writeAccess: "none",
    canDispatch: false,
    requiredInputs: ["goal", "scope", "entrypoints", "context_budget"],
    resultSchema: "agent-result-v1",
    providerSupport: {
      claude: "native",
      cursor: "adapter",
      codex: "adapter",
      generic: "fallback"
    },
    definitionPath: "workers/explorer.md"
  },
  {
    id: "reviewer",
    role: "review",
    mode: "one-shot",
    writeAccess: "none",
    canDispatch: false,
    requiredInputs: ["goal", "plan", "changed_files", "verification_status"],
    resultSchema: "agent-result-v1",
    providerSupport: {
      claude: "native",
      cursor: "adapter",
      codex: "adapter",
      generic: "fallback"
    },
    definitionPath: "workers/reviewer.md"
  },
  {
    id: "verifier",
    role: "verify",
    mode: "one-shot",
    writeAccess: "none",
    canDispatch: false,
    requiredInputs: ["goal", "plan", "verification_commands", "changed_files"],
    resultSchema: "agent-result-v1",
    providerSupport: {
      claude: "native",
      cursor: "adapter",
      codex: "adapter",
      generic: "fallback"
    },
    definitionPath: "workers/verifier.md"
  },
  {
    id: "gatekeeper",
    role: "gate",
    mode: "one-shot",
    writeAccess: "none",
    canDispatch: false,
    requiredInputs: ["goal", "verify_artifact", "review_artifact", "ship_blockers"],
    resultSchema: "agent-result-v1",
    providerSupport: {
      claude: "native",
      cursor: "adapter",
      codex: "adapter",
      generic: "fallback"
    },
    definitionPath: "workers/gatekeeper.md"
  },
  {
    id: "fixer",
    role: "fix",
    mode: "one-shot",
    writeAccess: "write",
    canDispatch: false,
    requiredInputs: ["goal", "plan", "issue_description", "changed_files"],
    resultSchema: "agent-result-v1",
    providerSupport: {
      claude: "native",
      cursor: "adapter",
      codex: "adapter",
      generic: "fallback"
    },
    definitionPath: "workers/fixer.md"
  }
]);

function getWorkerById(id: WorkerId): WorkerDefinition | null {
  return workers.find((worker) => worker.id === id) || null;
}

function getNativeWorkersForProvider(provider: WorkerProvider): WorkerDefinition[] {
  return workers.filter((worker) => worker.providerSupport[provider] === "native");
}

export {
  VALID_PROVIDER_SUPPORT,
  WORKER_IDS,
  workers,
  getWorkerById,
  getNativeWorkersForProvider
};
export type { ProviderSupportMode, WorkerProvider, WorkerId, WorkerDefinition };
