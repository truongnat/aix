import fs from "node:fs";
import path from "node:path";
import { workers, type WorkerId } from "../workers/registry";

interface InstallOptions {
  dryRun?: boolean;
  force?: boolean;
}

interface WriteResult {
  action: string;
  relativePath: string;
}

const CLAUDE_AGENT_TOOLS = Object.freeze({
  none: "Read, Grep, Glob, Bash",
  write: "Read, Write, Edit, Grep, Glob, Bash",
});

function renderClaudeAgentFile(workerId: WorkerId, workerBody: string): string {
  const worker = workers.find((entry) => entry.id === workerId);
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

function installClaudeWorkers(
  targetRoot: string,
  packRoot: string,
  options: InstallOptions = {}
): WriteResult[] {
  const opts = { dryRun: false, force: false, ...options };
  const results: WriteResult[] = [];
  for (const worker of workers) {
    if (worker.providerSupport.claude !== "native") {
      continue;
    }
    const sourcePath = path.join(packRoot, worker.definitionPath);
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Missing worker definition: ${worker.definitionPath}`);
    }
    const raw = fs.readFileSync(sourcePath, "utf8");
    const body = raw.replace(/^---[\s\S]*?---\s*/, "");
    const destRel = `.claude/agents/harness-${worker.id}.md`;
    const dest = path.join(targetRoot, destRel);
    const content = renderClaudeAgentFile(worker.id, body);
    const existed = fs.existsSync(dest);

    if (!opts.dryRun) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      if (existed && !opts.force) {
        results.push({ action: "SKIP", relativePath: destRel });
        continue;
      }
      fs.writeFileSync(dest, content, "utf8");
    }

    results.push({
      action: opts.dryRun ? "WOULD CREATE" : existed && opts.force ? "OVERWRITE" : "CREATE",
      relativePath: destRel,
    });
  }
  return results;
}

function assertClaudeWorkerSurface(baseDir: string, failures: string[]): void {
  for (const worker of workers) {
    if (worker.providerSupport.claude !== "native") {
      continue;
    }
    const relativePath = `.claude/agents/harness-${worker.id}.md`;
    const fullPath = path.join(baseDir, relativePath);
    if (!fs.existsSync(fullPath)) {
      failures.push(`Missing Claude native worker surface: ${relativePath}`);
      continue;
    }
    const content = fs.readFileSync(fullPath, "utf8");
    if (!content.includes("### Agent Result")) {
      failures.push(`${relativePath} must include ### Agent Result envelope`);
    }
    if (!content.includes(`harness-${worker.id}`) && !content.includes(worker.id)) {
      failures.push(`${relativePath} must preserve canonical worker identity for ${worker.id}`);
    }
  }
}

export {
  CLAUDE_AGENT_TOOLS,
  assertClaudeWorkerSurface,
  installClaudeWorkers,
  renderClaudeAgentFile,
};
export type { InstallOptions, WriteResult };
