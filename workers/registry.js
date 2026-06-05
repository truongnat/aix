"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workers = exports.WORKER_IDS = exports.VALID_PROVIDER_SUPPORT = void 0;
exports.getWorkerById = getWorkerById;
exports.getNativeWorkersForProvider = getNativeWorkersForProvider;
const VALID_PROVIDER_SUPPORT = Object.freeze([
    "native",
    "adapter",
    "fallback",
    "unsupported"
]);
exports.VALID_PROVIDER_SUPPORT = VALID_PROVIDER_SUPPORT;
const WORKER_IDS = Object.freeze(["reviewer", "verifier", "gatekeeper", "fixer"]);
exports.WORKER_IDS = WORKER_IDS;
const workers = Object.freeze([
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
exports.workers = workers;
function getWorkerById(id) {
    return workers.find((worker) => worker.id === id) || null;
}
function getNativeWorkersForProvider(provider) {
    return workers.filter((worker) => worker.providerSupport[provider] === "native");
}
