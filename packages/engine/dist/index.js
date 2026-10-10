// src/graph.ts
import { mkdir as mkdir6, appendFile } from "fs/promises";
import { join as join6 } from "path";
import { StateGraph, Annotation, END, START } from "@langchain/langgraph";

// src/file-checkpointer.ts
import { mkdir, readFile, readdir, rm, writeFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { BaseCheckpointSaver, copyCheckpoint, getCheckpointId } from "@langchain/langgraph-checkpoint";
var DEFAULT_NS = "__default__";
function nsDir(root, threadId, checkpointNs) {
  const ns = checkpointNs || DEFAULT_NS;
  return join(root, threadId, "checkpoints", ns);
}
function checkpointPath(root, threadId, checkpointNs, checkpointId) {
  return join(nsDir(root, threadId, checkpointNs), `${checkpointId}.ckpt.json`);
}
function writesPath(root, threadId, checkpointNs, checkpointId) {
  return join(nsDir(root, threadId, checkpointNs), `${checkpointId}.writes.json`);
}
var FileCheckpointer = class extends BaseCheckpointSaver {
  #root;
  constructor(root) {
    super();
    this.#root = root ?? join(process.cwd(), ".aix", "sessions");
  }
  async getTuple(config) {
    const threadId = config.configurable?.thread_id;
    const checkpointNs = config.configurable?.checkpoint_ns ?? "";
    const checkpointId = getCheckpointId(config);
    if (typeof threadId !== "string") return void 0;
    const dir = nsDir(this.#root, threadId, checkpointNs);
    if (checkpointId) {
      return this.#loadCheckpoint(dir, threadId, checkpointNs, checkpointId, config);
    }
    try {
      const files = await readdir(dir);
      const ids = files.filter((f) => f.endsWith(".ckpt.json")).map((f) => f.replace(/\.ckpt\.json$/, "")).sort((a, b) => b.localeCompare(a));
      const latest = ids[0];
      if (!latest) return void 0;
      return this.#loadCheckpoint(dir, threadId, checkpointNs, latest, config);
    } catch {
      return void 0;
    }
  }
  async *#listGenerator(dir, threadId, checkpointNs, beforeCheckpointId, limit, filter) {
    let count = 0;
    try {
      const files = await readdir(dir);
      const ids = files.filter((f) => f.endsWith(".ckpt.json")).map((f) => f.replace(/\.ckpt\.json$/, "")).sort((a, b) => b.localeCompare(a));
      for (const id of ids) {
        if (beforeCheckpointId && id >= beforeCheckpointId) continue;
        const tuple = await this.#loadCheckpoint(
          dir,
          threadId,
          checkpointNs,
          id,
          { configurable: { thread_id: threadId, checkpoint_ns: checkpointNs, checkpoint_id: id } }
        );
        if (!tuple) continue;
        if (filter && tuple.metadata) {
          const meta = tuple.metadata;
          if (!Object.entries(filter).every(([k, v]) => meta[k] === v)) continue;
        }
        yield tuple;
        count++;
        if (limit !== void 0 && count >= limit) break;
      }
    } catch {
    }
  }
  list(config, options) {
    const threadId = config.configurable?.thread_id;
    const checkpointNs = config.configurable?.checkpoint_ns ?? "";
    const beforeCheckpointId = options?.before?.configurable?.checkpoint_id;
    if (typeof threadId !== "string") {
      return (async function* () {
      })();
    }
    const dir = nsDir(this.#root, threadId, checkpointNs);
    return this.#listGenerator(dir, threadId, checkpointNs, beforeCheckpointId, options?.limit, options?.filter);
  }
  async put(config, checkpoint, metadata) {
    const threadId = config.configurable?.thread_id;
    const checkpointNs = config.configurable?.checkpoint_ns ?? "";
    const preparedCheckpoint = copyCheckpoint(checkpoint);
    if (typeof threadId !== "string") {
      throw new Error("Failed to put checkpoint: thread_id is required");
    }
    const dir = nsDir(this.#root, threadId, checkpointNs);
    await mkdir(dir, { recursive: true });
    const [[, serializedCheckpoint], [, serializedMetadata]] = await Promise.all([
      this.serde.dumpsTyped(preparedCheckpoint),
      this.serde.dumpsTyped(metadata)
    ]);
    const ckptFile = checkpointPath(this.#root, threadId, checkpointNs, checkpoint.id);
    const parentCheckpointId = config.configurable?.checkpoint_id;
    await writeFile(ckptFile, JSON.stringify({
      checkpoint: Array.from(serializedCheckpoint),
      metadata: Array.from(serializedMetadata),
      parentCheckpointId
    }), "utf-8");
    return {
      configurable: {
        thread_id: threadId,
        checkpoint_ns: checkpointNs,
        checkpoint_id: checkpoint.id
      }
    };
  }
  async putWrites(config, writes, taskId) {
    const threadId = config.configurable?.thread_id;
    const checkpointNs = config.configurable?.checkpoint_ns ?? "";
    const checkpointId = config.configurable?.checkpoint_id;
    if (typeof threadId !== "string") {
      throw new Error("Failed to put writes: thread_id is required");
    }
    if (typeof checkpointId !== "string") {
      throw new Error("Failed to put writes: checkpoint_id is required");
    }
    const dir = nsDir(this.#root, threadId, checkpointNs);
    await mkdir(dir, { recursive: true });
    const writesFile = writesPath(this.#root, threadId, checkpointNs, checkpointId);
    let existing = [];
    if (existsSync(writesFile)) {
      try {
        const raw = await readFile(writesFile, "utf-8");
        existing = JSON.parse(raw);
      } catch {
        existing = [];
      }
    }
    for (const [channel, value] of writes) {
      const [, serialized] = await this.serde.dumpsTyped(value);
      existing.push([taskId, channel, Array.from(serialized)]);
    }
    await writeFile(writesFile, JSON.stringify(existing), "utf-8");
  }
  async deleteThread(threadId) {
    const dir = join(this.#root, threadId);
    if (existsSync(dir)) {
      await rm(dir, { recursive: true, force: true });
    }
  }
  async #loadCheckpoint(_dir, threadId, checkpointNs, checkpointId, _config) {
    const ckptFile = checkpointPath(this.#root, threadId, checkpointNs, checkpointId);
    if (!existsSync(ckptFile)) return void 0;
    try {
      const raw = await readFile(ckptFile, "utf-8");
      const { checkpoint: ckptBytes, metadata: metaBytes, parentCheckpointId } = JSON.parse(raw);
      const checkpoint = await this.serde.loadsTyped(
        "json",
        new Uint8Array(ckptBytes)
      );
      const metadata = await this.serde.loadsTyped(
        "json",
        new Uint8Array(metaBytes)
      );
      const writesFile = writesPath(this.#root, threadId, checkpointNs, checkpointId);
      let pendingWrites = void 0;
      if (existsSync(writesFile)) {
        try {
          const writesRaw = await readFile(writesFile, "utf-8");
          const storedWrites = JSON.parse(writesRaw);
          pendingWrites = await Promise.all(
            storedWrites.map(async ([tid, ch, val]) => {
              const value = await this.serde.loadsTyped("json", new Uint8Array(val));
              return [tid, ch, value];
            })
          );
        } catch {
          pendingWrites = [];
        }
      }
      const tuple = {
        config: {
          configurable: {
            thread_id: threadId,
            checkpoint_ns: checkpointNs,
            checkpoint_id: checkpointId
          }
        },
        checkpoint,
        metadata
      };
      if (pendingWrites !== void 0) {
        tuple.pendingWrites = pendingWrites;
      }
      if (typeof parentCheckpointId === "string") {
        tuple.parentConfig = {
          configurable: {
            thread_id: threadId,
            checkpoint_ns: checkpointNs,
            checkpoint_id: parentCheckpointId
          }
        };
      }
      return tuple;
    } catch {
      return void 0;
    }
  }
};

// src/nodes/discuss.ts
import { mkdir as mkdir3, rename, writeFile as writeFile3 } from "fs/promises";
import { existsSync as existsSync3 } from "fs";
import { join as join3 } from "path";
import { createBudgetTracker as createBudgetTracker2 } from "@x/core";
import { SkillRegistry } from "@x/registry";
import { createProvider } from "@x/providers";

// src/session-store.ts
import { mkdir as mkdir2, readdir as readdir2, readFile as readFile2, writeFile as writeFile2 } from "fs/promises";
import { join as join2 } from "path";
import { existsSync as existsSync2 } from "fs";
var SESSIONS_ROOT = join2(process.cwd(), ".aix", "sessions");
function sessionDir(sessionId) {
  return join2(SESSIONS_ROOT, sessionId);
}
function sessionArtifactPath(sessionId, name) {
  return join2(sessionDir(sessionId), name);
}
function sessionArchiveDir(sessionId) {
  return join2(sessionDir(sessionId), "archive");
}
function sessionGeneratedDir(sessionId) {
  return join2(sessionDir(sessionId), "generated");
}
function sessionStatePath(sessionId) {
  return join2(sessionDir(sessionId), "state.json");
}
var SessionStore = class {
  #root;
  constructor(root) {
    this.#root = root ?? SESSIONS_ROOT;
  }
  async save(state) {
    const id = state.session.id;
    const dir = join2(this.#root, id);
    await mkdir2(dir, { recursive: true });
    const path = join2(dir, "state.json");
    await writeFile2(path, JSON.stringify(state, null, 2), "utf-8");
    return id;
  }
  async load(id) {
    const path = join2(this.#root, id, "state.json");
    if (!existsSync2(path)) return void 0;
    const raw = await readFile2(path, "utf-8");
    return JSON.parse(raw);
  }
  async list() {
    try {
      const entries = await readdir2(this.#root);
      const dirs = [];
      for (const entry of entries) {
        const statePath = join2(this.#root, entry, "state.json");
        if (existsSync2(statePath)) dirs.push(entry);
      }
      return dirs.sort();
    } catch {
      return [];
    }
  }
};

// src/budget-guard.ts
import { createBudgetTracker } from "@x/core";
function checkBudget(state) {
  const tracker = createBudgetTracker();
  return tracker.checkBeforeCall(state.session);
}
function formatBudgetWarnings(warnings) {
  return warnings.map((w) => {
    const icon = w.recoverable ? "\u26A0" : "\u2716";
    return `  ${icon} [${w.code}] ${w.message}`;
  }).join("\n");
}

// src/nodes/discuss.ts
var SKILLS_ROOT = process.env.AIX_CONTENT_ROOT ?? process.cwd();
async function discussNode(state) {
  if (state.discussion) return state;
  const provider = createProvider();
  const registry = await SkillRegistry.load(SKILLS_ROOT);
  const discussSkill = registry.get("discussing-pro");
  const skillBodies = [];
  if (discussSkill) skillBodies.push(discussSkill.body);
  const system = `You are an expert engineering analyst helping clarify goals and explore solutions.

${skillBodies.join("\n\n---\n\n")}

Respond with valid JSON in this exact format:
{
  "goal": "clarified goal in concrete engineering terms",
  "constraints": ["constraint 1", "constraint 2"],
  "options": [
    {
      "name": "Option A",
      "value": 8,
      "effortFit": 7,
      "risk": 6,
      "fit": 9
    }
  ],
  "recommendation": "Name of the recommended option",
  "rationale": "Detailed justification referencing constraints, utility, security, and compliance. Explain why alternatives were bypassed."
}

Keep analysis thorough but concise.`;
  const user = `Task: ${state.session.task}`;
  const budgetCheck = checkBudget(state);
  if (!budgetCheck.ok) {
    const critical = budgetCheck.warnings.filter((w) => !w.recoverable);
    if (critical.length > 0) {
      throw new Error(`Budget check failed:
${formatBudgetWarnings(critical)}`);
    }
    console.warn(`[budget] Warnings before discuss:
${formatBudgetWarnings(budgetCheck.warnings)}`);
  }
  const response = await provider.call({ system, user, temperature: 0.3 });
  let discussion;
  try {
    const parsed = JSON.parse(response.content);
    discussion = {
      goal: parsed.goal ?? state.session.task,
      constraints: Array.isArray(parsed.constraints) ? parsed.constraints : [],
      options: Array.isArray(parsed.options) ? parsed.options.map((o) => ({
        name: String(o.name ?? ""),
        value: Number(o.value ?? 0),
        effortFit: Number(o.effortFit ?? 0),
        risk: Number(o.risk ?? 0),
        fit: Number(o.fit ?? 0)
      })) : [],
      recommendation: parsed.recommendation ?? "",
      rationale: parsed.rationale ?? response.content.slice(0, 500)
    };
  } catch {
    discussion = {
      goal: state.session.task,
      constraints: [],
      options: [],
      recommendation: "",
      rationale: response.content.slice(0, 500)
    };
  }
  await writeDiscussionArtifact(state.session.id, discussion);
  const tracker = createBudgetTracker2();
  const session = tracker.addUsage(state.session, response.usd, response.tokens);
  return { ...state, session, discussion };
}
async function writeDiscussionArtifact(sessionId, discussion) {
  const artifactPath = sessionArtifactPath(sessionId, "DISCUSSION.md");
  let archiveRef = "";
  if (existsSync3(artifactPath)) {
    const ts = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "").slice(0, 15);
    const archiveDir = sessionArchiveDir(sessionId);
    await mkdir3(archiveDir, { recursive: true });
    const archivePath = join3(archiveDir, `DISCUSSION.${ts}.md`);
    await rename(artifactPath, archivePath);
    archiveRef = `> Previous version archived at: \`${archivePath}\`

`;
  }
  const optionsTable = discussion.options.map(
    (o) => `| ${o.name} | ${o.value} | ${o.effortFit} | ${o.risk} | ${o.fit} | ${o.value + o.effortFit + o.fit - o.risk} |`
  ).join("\n");
  const artifact = `${archiveRef}# Discussion

## Goal
${discussion.goal}

## Constraints
${discussion.constraints.map((c) => `- ${c}`).join("\n")}

## Options Compared
| Option | Value | Effort Fit | Risk | Fit | Total |
|--------|-------|------------|------|-----|-------|
${optionsTable}

## Recommendation
**${discussion.recommendation}**

### Rationale
${discussion.rationale}
`;
  await mkdir3(sessionArtifactPath(sessionId, ""), { recursive: true });
  await writeFile3(artifactPath, artifact, "utf-8");
}

// src/nodes/plan.ts
import { mkdir as mkdir4, rename as rename2, writeFile as writeFile4 } from "fs/promises";
import { existsSync as existsSync4 } from "fs";
import { join as join4 } from "path";
import { createBudgetTracker as createBudgetTracker3 } from "@x/core";
import { SkillRegistry as SkillRegistry2 } from "@x/registry";
import { createProvider as createProvider2 } from "@x/providers";
var SKILLS_ROOT2 = process.env.AIX_CONTENT_ROOT ?? process.cwd();
async function planNode(state) {
  if (state.plan) return state;
  const provider = createProvider2();
  const registry = await SkillRegistry2.load(SKILLS_ROOT2);
  const planSkill = registry.get("planning-pro");
  const skillBodies = [];
  if (planSkill) skillBodies.push(planSkill.body);
  const goal = state.discussion?.goal ?? state.session.task;
  const constraints = state.discussion?.constraints ?? [];
  const recommendation = state.discussion?.recommendation ?? "";
  const system = `You are an expert engineering planner creating concrete implementation plans.

${skillBodies.join("\n\n")}

Respond with valid JSON in this exact format:
{
  "goal": "${goal}",
  "scope": "in scope / out of scope",
  "constraints": ["constraint 1"],
  "assumptions": ["assumption 1"],
  "affectedFiles": ["src/file1.ts"],
  "tasks": [
    {
      "title": "Task title",
      "description": "What to do",
      "dependencies": ["task-1"],
      "acceptanceCriteria": ["condition 1"],
      "files": ["src/file1.ts"]
    }
  ],
  "verificationStrategy": "how to verify",
  "rollbackStrategy": "how to revert",
  "risks": ["risk 1"]
}

Each task must be concrete, independently verifiable, and have explicit dependencies.`;
  const constraintText = constraints.length > 0 ? `
Constraints:
${constraints.map((c) => `- ${c}`).join("\n")}` : "";
  const recoText = recommendation ? `
Recommended approach: ${recommendation}` : "";
  const user = `Goal: ${goal}${constraintText}${recoText}

Task: ${state.session.task}`;
  const budgetCheck = checkBudget(state);
  if (!budgetCheck.ok) {
    const critical = budgetCheck.warnings.filter((w) => !w.recoverable);
    if (critical.length > 0) {
      throw new Error(`Budget check failed:
${formatBudgetWarnings(critical)}`);
    }
    console.warn(`[budget] Warnings before plan:
${formatBudgetWarnings(budgetCheck.warnings)}`);
  }
  const response = await provider.call({ system, user, temperature: 0.3 });
  let planData;
  let tasks = [];
  try {
    planData = JSON.parse(response.content);
    tasks = Array.isArray(planData.tasks) ? planData.tasks : [];
  } catch {
    planData = {};
  }
  const steps = tasks.length > 0 ? tasks.map((t) => String(t.title ?? t.description ?? "")) : [state.session.task];
  const plan = {
    goal: typeof planData.goal === "string" ? planData.goal : goal,
    steps
  };
  await writePlanArtifact(state.session.id, planData, tasks);
  const tracker = createBudgetTracker3();
  const session = tracker.addUsage(state.session, response.usd, response.tokens);
  return { ...state, session, plan };
}
async function writePlanArtifact(sessionId, planData, tasks) {
  const artifactPath = sessionArtifactPath(sessionId, "PLAN.md");
  let archiveRef = "";
  if (existsSync4(artifactPath)) {
    const ts = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "").slice(0, 15);
    const archiveDir = sessionArchiveDir(sessionId);
    await mkdir4(archiveDir, { recursive: true });
    const archivePath = join4(archiveDir, `PLAN.${ts}.md`);
    await rename2(artifactPath, archivePath);
    archiveRef = `> Previous version archived at: \`${archivePath}\`

`;
  }
  const scope = typeof planData.scope === "string" ? `

## Scope
${planData.scope}` : "";
  const constraints = Array.isArray(planData.constraints) ? `

## Constraints & Assumptions
${planData.constraints.map((c) => `- ${String(c)}`).join("\n")}` : "";
  const affectedFiles = Array.isArray(planData.affectedFiles) ? `

## Affected Files
${planData.affectedFiles.map((f) => `- ${String(f)}`).join("\n")}` : "";
  const tasksBlock = tasks.length > 0 ? `

## Tasks
${tasks.map((t, i) => {
    const deps = Array.isArray(t.dependencies) && t.dependencies.length > 0 ? `
   - Dependencies: ${t.dependencies.join(", ")}` : "";
    const ac = Array.isArray(t.acceptanceCriteria) && t.acceptanceCriteria.length > 0 ? `
   - Acceptance Criteria:
${t.acceptanceCriteria.map((a) => `     - ${String(a)}`).join("\n")}` : "";
    const files = Array.isArray(t.files) && t.files.length > 0 ? `
   - Files: ${t.files.join(", ")}` : "";
    return `${i + 1}. ${t.title ?? t.description ?? ""}${deps}${ac}${files}`;
  }).join("\n")}` : "";
  const verification = typeof planData.verificationStrategy === "string" ? `

## Verification Strategy
${planData.verificationStrategy}` : "";
  const rollback = typeof planData.rollbackStrategy === "string" ? `

## Rollback Strategy
${planData.rollbackStrategy}` : "";
  const risks = Array.isArray(planData.risks) ? `

## Risks & Open Questions
${planData.risks.map((r) => `- ${String(r)}`).join("\n")}` : "";
  const artifact = `${archiveRef}# Plan
${scope}
${constraints}
${affectedFiles}
${tasksBlock}
${verification}
${rollback}
${risks}
`;
  await mkdir4(sessionArtifactPath(sessionId, ""), { recursive: true });
  await writeFile4(artifactPath, artifact, "utf-8");
}

// src/nodes/rules.ts
import { SkillRegistry as SkillRegistry3 } from "@x/registry";
async function rulesNode(state) {
  let rules = [];
  try {
    const contentRoot = process.env.AIX_CONTENT_ROOT ?? process.cwd();
    const registry = await SkillRegistry3.load(contentRoot);
    const coderSkills = registry.byRole("coder");
    const reviewerSkills = registry.byRole("reviewer");
    rules = [
      ...coderSkills.map((s) => `${s.id}: ${s.frontmatter.description}`),
      ...reviewerSkills.map((s) => `${s.id}: ${s.frontmatter.description}`)
    ];
  } catch {
    rules = ["default-coder-rule: Follow best practices", "default-reviewer-rule: Check for correctness"];
  }
  return { ...state, rules };
}

// src/nodes/tasks.ts
async function tasksNode(state) {
  const steps = state.plan?.steps ?? [state.session.task];
  const tasks = steps.map((step, i) => ({
    id: `task-${i + 1}`,
    description: step,
    status: "pending"
  }));
  return { ...state, tasks };
}

// src/nodes/pick.ts
async function pickNode(state) {
  const pending = state.tasks.find((t) => t.status === "pending");
  if (!pending) return state;
  const current = { ...pending, status: "in-progress", assignedRole: "coder" };
  const tasks = state.tasks.map(
    (t) => t.id === pending.id ? current : t
  );
  return { ...state, tasks, current };
}

// src/nodes/ticket-plan.ts
async function ticketPlanNode(state) {
  if (!state.current) return state;
  const task = state.current;
  const plan = {
    ticketId: `ticket-${task.id}`,
    description: task.description,
    files: inferFiles(task.description, state.plan?.goal ?? ""),
    acceptanceCriteria: inferCriteria(task.description)
  };
  const plans = [...state.ticketPlans ?? [], plan];
  return { ...state, ticketPlans: plans };
}
function inferFiles(description, goal) {
  const combined = `${goal} ${description}`.toLowerCase();
  const candidates = [];
  if (combined.includes("api") || combined.includes("route")) {
    candidates.push("src/routes/solution.ts");
  }
  if (combined.includes("component") || combined.includes("ui") || combined.includes("react")) {
    candidates.push("src/components/Solution.tsx");
  }
  if (combined.includes("function") || combined.includes("util") || combined.includes("helper")) {
    candidates.push("src/utils/solution.ts");
  }
  if (combined.includes("config") || combined.includes("setup")) {
    candidates.push("config/solution.json");
  }
  if (combined.includes("test") || combined.includes("spec") || combined.includes("unit")) {
    candidates.push("src/__tests__/solution.test.ts");
  }
  if (combined.includes("hook") || combined.includes("use")) {
    candidates.push("src/hooks/useSolution.ts");
  }
  if (combined.includes("style") || combined.includes("css") || combined.includes("theme")) {
    candidates.push("src/styles/solution.css");
  }
  if (candidates.length === 0) {
    candidates.push("src/lib/solution.ts");
  }
  return candidates;
}
function inferCriteria(description) {
  const base = [
    `[${description}] produces the expected output`,
    `Edge cases are handled gracefully`,
    `No regressions in existing behaviour`
  ];
  const lower = description.toLowerCase();
  if (lower.includes("api") || lower.includes("endpoint")) {
    base.push("Returns valid HTTP status codes");
    base.push("Request validation rejects malformed input");
  }
  if (lower.includes("ui") || lower.includes("component") || lower.includes("render")) {
    base.push("Renders correctly on 320px\u20131920px viewports");
    base.push("All interactive states work (hover, focus, active)");
  }
  if (lower.includes("data") || lower.includes("database") || lower.includes("store")) {
    base.push("Data is persisted atomically");
    base.push("Read-after-write consistency holds");
  }
  return base;
}

// src/nodes/coder.ts
import { mkdir as mkdir5, writeFile as writeFile5 } from "fs/promises";
import { join as join5, dirname } from "path";
import { createBudgetTracker as createBudgetTracker4 } from "@x/core";
import { createProvider as createProvider3 } from "@x/providers";
async function coderNode(state) {
  if (!state.current) return state;
  const provider = createProvider3();
  const system = buildSystemPrompt(state);
  const user = buildUserPrompt(state.current, state);
  const budgetCheck = checkBudget(state);
  if (!budgetCheck.ok) {
    const critical = budgetCheck.warnings.filter((w) => !w.recoverable);
    if (critical.length > 0) {
      throw new Error(`Budget check failed:
${formatBudgetWarnings(critical)}`);
    }
    console.warn(`[budget] Warnings before coder:
${formatBudgetWarnings(budgetCheck.warnings)}`);
  }
  const response = await provider.call({ system, user });
  const output = response.content;
  const tracker = createBudgetTracker4();
  const session = tracker.addUsage(state.session, response.usd, response.tokens);
  const target = resolveTarget(state.current, state);
  const written = await writeOutput(session.id, target, output);
  const tasks = state.tasks.map(
    (t) => t.id === state.current.id ? { ...t, status: "done", output, assignedRole: "coder" } : t
  );
  return {
    ...state,
    session,
    tasks,
    current: { ...state.current, status: "done", output, assignedRole: "coder" },
    coderOutput: output,
    writtenFiles: written
    // only the new file(s); graph reducer accumulates
  };
}
function resolveTarget(current, state) {
  const ticket = state.ticketPlans?.find((t) => t.description === current.description);
  return ticket?.files[0] ?? `task-${current.id}.ts`;
}
async function writeOutput(sessionId, relPath, content) {
  const safe = relPath.replace(/^(\.\.[/\\])+/, "").replace(/^[/\\]+/, "").replace(/\.\.[/\\]/g, "");
  const dest = join5(sessionGeneratedDir(sessionId), safe);
  await mkdir5(dirname(dest), { recursive: true });
  await writeFile5(dest, content, "utf-8");
  return [dest.replace(/\\/g, "/")];
}
function buildSystemPrompt(state) {
  const rules = state.rules?.length ? state.rules.join("\n") : "Follow TypeScript best practices. Write clean, idiomatic code.";
  return `You are an expert TypeScript engineer implementing a solution.

Rules:
${rules}

Generate production-ready code. Include exports, types, and documentation.`;
}
function buildUserPrompt(current, state) {
  const parts = [`Task: ${current.description}`];
  if (state.plan?.goal) {
    parts.push(`
Goal: ${state.plan.goal}`);
  }
  const ticket = state.ticketPlans?.find((t) => t.description === current.description);
  if (ticket) {
    parts.push(`
Files to modify:
${ticket.files.map((f) => `  - ${f}`).join("\n")}`);
    parts.push(`
Acceptance criteria:
${ticket.acceptanceCriteria.map((c) => `  - [ ] ${c}`).join("\n")}`);
  }
  return parts.join("\n");
}

// src/nodes/reviewer.ts
import { scoreOutput } from "@x/evals";
async function reviewerNode(state) {
  if (!state.current?.output) {
    return { ...state, reviewScore: 0 };
  }
  const output = state.current.output;
  const description = state.current.description;
  try {
    const scores = scoreOutput(output, description);
    const values = scores.map((s) => s.score / s.max * 10);
    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const reviewScore = Math.round(avg * 10) / 10;
    return { ...state, reviewScore };
  } catch {
    return { ...state, reviewScore: 5 };
  }
}

// src/guards.ts
import { checkShell } from "@x/policy";
import { ConsoleHitlChannel } from "@x/hitl";
var hitl = new ConsoleHitlChannel();
function checkReviewerIsNotCoder(state) {
  if (!state.current?.assignedRole) return true;
  return state.current.assignedRole !== "reviewer";
}
function checkHardStop(state) {
  const budget = state.session.budget;
  return budget.usdSpent >= budget.usdLimit;
}
function checkShellDenylist(command) {
  const result = checkShell(command);
  return result.ok;
}
function checkPlanShellDenylist(plans) {
  if (!plans) return true;
  for (const plan of plans) {
    for (const cmd of plan.files) {
      if (!checkShell(cmd).ok) return false;
    }
  }
  return true;
}
async function shouldInterrupt(phase, state) {
  if (state.session.mode === "autonomous") return false;
  const interruptPhases = ["discuss", "plan", "ticket-plan", "coder"];
  if (!interruptPhases.includes(phase)) return false;
  const response = await hitl.ask({
    question: `Intervention required before "${phase}" phase. Proceed?`,
    tier: 0,
    options: [
      { id: "proceed", label: "Proceed", summary: `Continue with ${phase}` },
      { id: "cancel", label: "Cancel", summary: "Stop execution" }
    ]
  });
  return response.chosen === "cancel";
}

// src/graph.ts
var MAX_ATTEMPTS = 3;
var PASS_THRESHOLD = 9;
var GraphAnnotation = Annotation.Root({
  session: Annotation(),
  discussion: Annotation(),
  plan: Annotation(),
  rules: Annotation(),
  tasks: Annotation({
    reducer: (_, v) => v,
    default: () => []
  }),
  current: Annotation(),
  reviewScore: Annotation(),
  attempts: Annotation({
    reducer: (_, v) => v,
    default: () => 0
  }),
  ticketPlans: Annotation(),
  coderOutput: Annotation(),
  writtenFiles: Annotation({
    reducer: (a, b) => [.../* @__PURE__ */ new Set([...a, ...b])],
    default: () => []
  }),
  _interrupted: Annotation({
    reducer: (_, v) => v,
    default: () => false
  })
});
function toEngineState(gs) {
  const { _interrupted: _i, ...rest } = gs;
  return rest;
}
function nodeLabel(nodeId) {
  return nodeId.replace(/Step$/, "");
}
async function appendLog(sessionId, entry) {
  try {
    const logDir = join6(process.cwd(), ".aix", "sessions", sessionId);
    await mkdir6(logDir, { recursive: true });
    const line = JSON.stringify({ ts: (/* @__PURE__ */ new Date()).toISOString(), ...entry }) + "\n";
    await appendFile(join6(logDir, "checkpoint.log"), line, "utf-8");
  } catch {
  }
}
function buildGraph(preHook, postHook) {
  async function lgDiscussNode(state) {
    await preHook(state, "discussStep");
    const start = Date.now();
    const next = await discussNode(toEngineState(state));
    const duration = Date.now() - start;
    const justDiscussed = next.discussion !== void 0 && state.discussion === void 0;
    const interrupted = justDiscussed ? await shouldInterrupt("discuss", next) : false;
    const result = { ...next, _interrupted: interrupted };
    await postHook({ ...state, ...result }, "discussStep", duration);
    return result;
  }
  async function lgPlanNode(state) {
    await preHook(state, "planStep");
    const start = Date.now();
    const next = await planNode(toEngineState(state));
    const duration = Date.now() - start;
    const justPlanned = next.plan !== void 0 && state.plan === void 0;
    const interrupted = justPlanned ? await shouldInterrupt("plan", next) : false;
    const result = { ...next, _interrupted: interrupted };
    await postHook({ ...state, ...result }, "planStep", duration);
    return result;
  }
  async function lgRulesNode(state) {
    await preHook(state, "rulesStep");
    const start = Date.now();
    const result = await rulesNode(toEngineState(state));
    const duration = Date.now() - start;
    await postHook({ ...state, ...result }, "rulesStep", duration);
    return result;
  }
  async function lgTasksNode(state) {
    await preHook(state, "tasksStep");
    const start = Date.now();
    const result = await tasksNode(toEngineState(state));
    const duration = Date.now() - start;
    await postHook({ ...state, ...result }, "tasksStep", duration);
    return result;
  }
  async function lgLoopStartNode(state) {
    await preHook(state, "loopStart");
    const start = Date.now();
    const result = { _interrupted: false };
    const duration = Date.now() - start;
    await postHook({ ...state, ...result }, "loopStart", duration);
    return result;
  }
  async function lgPickNode(state) {
    await preHook(state, "pick");
    const start = Date.now();
    const result = await pickNode(toEngineState(state));
    const duration = Date.now() - start;
    await postHook({ ...state, ...result }, "pick", duration);
    return result;
  }
  async function lgTicketPlanNode(state) {
    await preHook(state, "ticketPlan");
    const start = Date.now();
    const next = await ticketPlanNode(toEngineState(state));
    const duration = Date.now() - start;
    if (!checkPlanShellDenylist(next.ticketPlans)) {
      const result2 = { ...next, _interrupted: true };
      await postHook({ ...state, ...result2 }, "ticketPlan", duration);
      return result2;
    }
    const interrupted = await shouldInterrupt("ticket-plan", next);
    const result = { ...next, _interrupted: interrupted };
    await postHook({ ...state, ...result }, "ticketPlan", duration);
    return result;
  }
  async function lgCoderNode(state) {
    await preHook(state, "coder");
    const start = Date.now();
    const result = await coderNode(toEngineState(state));
    const duration = Date.now() - start;
    await postHook({ ...state, ...result }, "coder", duration);
    return result;
  }
  async function lgReviewerNode(state) {
    await preHook(state, "reviewer");
    const start = Date.now();
    let next = await reviewerNode(toEngineState(state));
    const duration = Date.now() - start;
    if (!checkReviewerIsNotCoder(next)) {
      next = { ...next, reviewScore: 0 };
    }
    const result = { ...next, attempts: next.attempts + 1 };
    await postHook({ ...state, ...result }, "reviewer", duration);
    return result;
  }
  const checkpointer = new FileCheckpointer();
  return new StateGraph(GraphAnnotation).addNode("discussStep", lgDiscussNode).addNode("planStep", lgPlanNode).addNode("rulesStep", lgRulesNode).addNode("tasksStep", lgTasksNode).addNode("loopStart", lgLoopStartNode).addNode("pick", lgPickNode).addNode("ticketPlan", lgTicketPlanNode).addNode("coder", lgCoderNode).addNode("reviewer", lgReviewerNode).addEdge(START, "discussStep").addConditionalEdges("discussStep", (state) => state._interrupted ? END : "planStep").addConditionalEdges("planStep", (state) => state._interrupted ? END : "rulesStep").addEdge("rulesStep", "tasksStep").addEdge("tasksStep", "loopStart").addConditionalEdges("loopStart", (state) => checkHardStop(toEngineState(state)) ? END : "pick").addConditionalEdges("pick", (state) => state.current ? "ticketPlan" : END).addConditionalEdges("ticketPlan", (state) => state._interrupted ? END : "coder").addEdge("coder", "reviewer").addConditionalEdges("reviewer", (state) => {
    const score = state.reviewScore ?? 0;
    if (score >= PASS_THRESHOLD || state.attempts >= MAX_ATTEMPTS) return END;
    if (!state.tasks.some((t) => t.status === "pending")) return END;
    return "loopStart";
  }).compile({ checkpointer });
}
var EngineGraph = class {
  #store;
  #graph;
  constructor(store) {
    this.#store = store ?? new SessionStore();
    this.#graph = buildGraph(
      async (state, id) => {
        const engineState = toEngineState(state);
        const budgetCheck = checkBudget(engineState);
        if (!budgetCheck.ok) {
          const critical = budgetCheck.warnings.filter((w) => !w.recoverable);
          if (critical.length > 0) {
            const msg = `Budget check failed before ${id}:
${formatBudgetWarnings(critical)}`;
            await appendLog(engineState.session.id, { event: "budget_fail", node: id, message: msg });
            throw new Error(msg);
          }
        }
      },
      async (state, id, durationMs) => {
        const engineState = toEngineState(state);
        await appendLog(engineState.session.id, {
          event: "node_complete",
          node: nodeLabel(id),
          phase: engineState.session.phase,
          durationMs,
          tokens: engineState.session.budget.tokensInPhase,
          usdSpent: engineState.session.budget.usdSpent
        });
        await this.#store.save(engineState);
      }
    );
  }
  async run(initial) {
    await appendLog(initial.session.id, { event: "run_start", task: initial.session.task });
    const start = Date.now();
    const result = await this.#graph.invoke(
      { ...initial, _interrupted: false },
      { configurable: { thread_id: initial.session.id } }
    );
    const duration = Date.now() - start;
    const engineResult = toEngineState(result);
    await this.#store.save(engineResult);
    await appendLog(initial.session.id, {
      event: "run_end",
      durationMs: duration,
      score: engineResult.reviewScore,
      attempts: engineResult.attempts,
      filesWritten: engineResult.writtenFiles?.length ?? 0
    });
    return engineResult;
  }
  async resume(state) {
    await appendLog(state.session.id, { event: "resume_start" });
    const start = Date.now();
    const result = await this.#graph.invoke(
      null,
      { configurable: { thread_id: state.session.id } }
    );
    const duration = Date.now() - start;
    const engineResult = toEngineState(result);
    await this.#store.save(engineResult);
    await appendLog(state.session.id, {
      event: "resume_end",
      durationMs: duration,
      score: engineResult.reviewScore,
      attempts: engineResult.attempts
    });
    return engineResult;
  }
};

// src/state.ts
function createInitialEngineState(session) {
  return {
    session,
    tasks: [],
    attempts: 0
  };
}
export {
  EngineGraph,
  FileCheckpointer,
  SESSIONS_ROOT,
  SessionStore,
  checkBudget,
  checkHardStop,
  checkPlanShellDenylist,
  checkReviewerIsNotCoder,
  checkShellDenylist,
  coderNode,
  createInitialEngineState,
  discussNode,
  formatBudgetWarnings,
  pickNode,
  planNode,
  reviewerNode,
  rulesNode,
  sessionArchiveDir,
  sessionArtifactPath,
  sessionDir,
  sessionGeneratedDir,
  sessionStatePath,
  shouldInterrupt,
  tasksNode,
  ticketPlanNode
};
//# sourceMappingURL=index.js.map