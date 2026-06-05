"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLAUDE_AGENT_TOOLS = void 0;
exports.assertClaudeWorkerSurface = assertClaudeWorkerSurface;
exports.installClaudeWorkers = installClaudeWorkers;
exports.renderClaudeAgentFile = renderClaudeAgentFile;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const registry_1 = require("../workers/registry");
const CLAUDE_AGENT_TOOLS = Object.freeze({
    none: "Read, Grep, Glob, Bash",
    write: "Read, Write, Edit, Grep, Glob, Bash",
});
exports.CLAUDE_AGENT_TOOLS = CLAUDE_AGENT_TOOLS;
function renderClaudeAgentFile(workerId, workerBody) {
    const worker = registry_1.workers.find((entry) => entry.id === workerId);
    if (!worker) {
        throw new Error(`Unknown worker: ${workerId}`);
    }
    const tools = worker.writeAccess === "write" ? CLAUDE_AGENT_TOOLS.write : CLAUDE_AGENT_TOOLS.none;
    const frontmatter = [
        "---",
        `name: harness-${worker.id}`,
        `description: Harness delegated ${worker.role} worker (${worker.mode}, writeAccess=${worker.writeAccess})`,
        `tools: ${tools}`,
        "model: inherit",
        "---",
        "",
    ].join("\n");
    return `${frontmatter}${workerBody.trim()}\n`;
}
function installClaudeWorkers(targetRoot, packRoot, options = {}) {
    const opts = { dryRun: false, force: false, ...options };
    const results = [];
    for (const worker of registry_1.workers) {
        if (worker.providerSupport.claude !== "native") {
            continue;
        }
        const sourcePath = node_path_1.default.join(packRoot, worker.definitionPath);
        if (!node_fs_1.default.existsSync(sourcePath)) {
            throw new Error(`Missing worker definition: ${worker.definitionPath}`);
        }
        const raw = node_fs_1.default.readFileSync(sourcePath, "utf8");
        const body = raw.replace(/^---[\s\S]*?---\s*/, "");
        const destRel = `.claude/agents/harness-${worker.id}.md`;
        const dest = node_path_1.default.join(targetRoot, destRel);
        const content = renderClaudeAgentFile(worker.id, body);
        const existed = node_fs_1.default.existsSync(dest);
        if (!opts.dryRun) {
            node_fs_1.default.mkdirSync(node_path_1.default.dirname(dest), { recursive: true });
            if (existed && !opts.force) {
                results.push({ action: "SKIP", relativePath: destRel });
                continue;
            }
            node_fs_1.default.writeFileSync(dest, content, "utf8");
        }
        results.push({
            action: opts.dryRun ? "WOULD CREATE" : existed && opts.force ? "OVERWRITE" : "CREATE",
            relativePath: destRel,
        });
    }
    return results;
}
function assertClaudeWorkerSurface(baseDir, failures) {
    for (const worker of registry_1.workers) {
        if (worker.providerSupport.claude !== "native") {
            continue;
        }
        const relativePath = `.claude/agents/harness-${worker.id}.md`;
        const fullPath = node_path_1.default.join(baseDir, relativePath);
        if (!node_fs_1.default.existsSync(fullPath)) {
            failures.push(`Missing Claude native worker surface: ${relativePath}`);
            continue;
        }
        const content = node_fs_1.default.readFileSync(fullPath, "utf8");
        if (!content.includes("### Agent Result")) {
            failures.push(`${relativePath} must include ### Agent Result envelope`);
        }
        if (!content.includes(`harness-${worker.id}`) && !content.includes(worker.id)) {
            failures.push(`${relativePath} must preserve canonical worker identity for ${worker.id}`);
        }
    }
}
