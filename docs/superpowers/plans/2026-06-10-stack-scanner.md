# Stack Scanner + Stack-Aware Config Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an automated file-tree scanner that detects frameworks/languages from manifests, stores results in `config.json`, and exposes a standalone `scan` CLI command — eliminating the need for the AI to manually read files during domain bootstrap.

**Architecture:** A new `lib/stack-scanner.ts` walks the project tree (max depth 4), reads manifest files (`package.json`, `pyproject.toml`, `go.mod`, etc.), and returns a `StackScanResult` with `frameworks`, `languages`, `evidence`, and inferred `domains`. The `domains` command is updated to auto-scan when no `--analysis-file` is provided, and to write the `stack` field to `config.json`. A new `scan` command exposes the scanner output as JSON to stdout.

**Tech Stack:** TypeScript, Node.js `fs`/`path` (no new dependencies), existing `lib/stack-detect.ts` types, existing test runner (`node --test`).

**Spec:** `docs/superpowers/specs/2026-06-10-stack-scanner-design.md`

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `lib/stack-scanner.ts` | File-tree walker + framework detection + domain inference |
| Create | `lib/cli-commands/scan.ts` | `scan` CLI command handler |
| Modify | `lib/stack-detect.ts` | Add `mergeStackSignals()` function |
| Modify | `lib/domain-skill-generation.ts` | Accept `stackMeta`, write `stack` field to `config.json` |
| Modify | `lib/cli-commands/domains.ts` | Auto-scan fallback + pass meta |
| Modify | `lib/cli-main.ts` | Register `scan` command |
| Modify | `lib/cli-args.ts` | Add `"scan"` to COMMANDS set |
| Modify | `prompt-templates/domain-analysis.md` | Add scan step to Action Loop |
| Create | `test/stack-scanner.test.ts` | Unit tests for scanner |
| Create | `test/cli-commands/scan.test.ts` | Integration test for scan command |
| Modify | `test/backend/install-orchestrator.test.ts` | Assert `stack` field in config |

---

## Task 1: Define `StackScanResult` type and add to `lib/stack-detect.ts`

**Files:**
- Modify: `lib/stack-detect.ts`

- [ ] **Step 1: Add types to `lib/stack-detect.ts`** after the existing `ProjectAnalysisInput` interface (line ~34):

```typescript
interface StackScanResult {
  languages: string[];
  frameworks: string[];
  evidence: Record<string, string[]>;
  notes: string | null;
  domains: ProjectAnalysisDomain[];
}
```

- [ ] **Step 2: Add `mergeStackSignals` function** before the `export` block at the bottom of `lib/stack-detect.ts`:

```typescript
function mergeStackSignals(
  ai: ProjectAnalysisInput,
  scan: StackScanResult
): ProjectAnalysisInput {
  // AI domains win when present; scanner fills gaps
  const aiDomains = Array.isArray(ai.domains) && (ai.domains as unknown[]).length > 0
    ? ai.domains
    : scan.domains.map((d) => ({ id: d.id, confidence: d.confidence, evidence: d.evidence }));

  const aiFrameworks = Array.isArray(ai.frameworks) && (ai.frameworks as unknown[]).length > 0
    ? ai.frameworks
    : scan.frameworks;

  const aiLanguages = Array.isArray(ai.languages) && (ai.languages as unknown[]).length > 0
    ? ai.languages
    : scan.languages;

  const aiNotes = typeof ai.notes === "string" && (ai.notes as string).trim()
    ? ai.notes
    : scan.notes;

  return {
    domains: aiDomains,
    frameworks: aiFrameworks,
    languages: aiLanguages,
    notes: aiNotes,
  };
}
```

- [ ] **Step 3: Export the new type and function** — add to the existing export block at the bottom of `lib/stack-detect.ts`:

```typescript
export { DOMAIN_LABELS, isKnownDomainId, mergeStackSignals, normalizeDomainSelection, parseProjectAnalysis };
export type {
  DomainId,
  ParsedProjectAnalysis,
  ProjectAnalysisDomain,
  ProjectAnalysisInput,
  ProjectAnalysisMeta,
  StackScanResult,
};
```

- [ ] **Step 4: Compile to verify no type errors**

```
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```
git add lib/stack-detect.ts
git commit -m "feat: add StackScanResult type and mergeStackSignals to stack-detect"
```

---

## Task 2: Implement `lib/stack-scanner.ts`

**Files:**
- Create: `lib/stack-scanner.ts`
- Create: `test/stack-scanner.test.ts`

- [ ] **Step 1: Write failing tests** — create `test/stack-scanner.test.ts`:

```typescript
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { stackScanner } from "../../lib/stack-scanner.js";

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "stack-scanner-"));
}

test("detects nextjs from package.json dependencies", () => {
  const dir = tmpDir();
  fs.writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({ dependencies: { next: "14.0.0", react: "18.0.0" } })
  );
  const result = stackScanner(dir);
  assert.ok(result.frameworks.includes("nextjs"));
  assert.ok(result.languages.includes("typescript") || result.languages.includes("javascript"));
  assert.ok(result.evidence["nextjs"]?.some((p) => p.includes("package.json")));
  assert.ok(result.domains.some((d) => d.id === "frontend"));
});

test("detects fastapi from pyproject.toml", () => {
  const dir = tmpDir();
  fs.writeFileSync(
    path.join(dir, "pyproject.toml"),
    '[tool.poetry.dependencies]\nfastapi = "^0.100.0"\n'
  );
  const result = stackScanner(dir);
  assert.ok(result.frameworks.includes("fastapi"));
  assert.ok(result.languages.includes("python"));
  assert.ok(result.domains.some((d) => d.id === "backend"));
});

test("detects flutter from pubspec.yaml", () => {
  const dir = tmpDir();
  fs.writeFileSync(path.join(dir, "pubspec.yaml"), "name: my_app\nflutter:\n  uses-material-design: true\n");
  const result = stackScanner(dir);
  assert.ok(result.frameworks.includes("flutter"));
  assert.ok(result.languages.includes("dart"));
  assert.ok(result.domains.some((d) => d.id === "mobile"));
});

test("detects devops signals from Dockerfile and github actions", () => {
  const dir = tmpDir();
  fs.writeFileSync(path.join(dir, "Dockerfile"), "FROM node:20\n");
  fs.mkdirSync(path.join(dir, ".github", "workflows"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".github", "workflows", "ci.yml"), "on: push\n");
  const result = stackScanner(dir);
  assert.ok(result.domains.some((d) => d.id === "devops"));
  assert.ok(result.evidence["github-actions"]?.length > 0 || result.evidence["docker"]?.length > 0);
});

test("scans nested subdirectories up to depth 4", () => {
  const dir = tmpDir();
  const nested = path.join(dir, "apps", "web");
  fs.mkdirSync(nested, { recursive: true });
  fs.writeFileSync(
    path.join(nested, "package.json"),
    JSON.stringify({ dependencies: { next: "14.0.0" } })
  );
  const result = stackScanner(dir);
  assert.ok(result.frameworks.includes("nextjs"));
  assert.ok(result.evidence["nextjs"]?.some((p) => p.includes("apps")));
});

test("skips node_modules and .git directories", () => {
  const dir = tmpDir();
  const nm = path.join(dir, "node_modules", "some-pkg");
  fs.mkdirSync(nm, { recursive: true });
  fs.writeFileSync(path.join(nm, "package.json"), JSON.stringify({ dependencies: { next: "14.0.0" } }));
  const result = stackScanner(dir);
  assert.ok(!result.frameworks.includes("nextjs"), "should not detect nextjs inside node_modules");
});

test("returns empty result for empty directory", () => {
  const dir = tmpDir();
  const result = stackScanner(dir);
  assert.deepEqual(result.frameworks, []);
  assert.deepEqual(result.domains, []);
});
```

- [ ] **Step 2: Run tests to verify they fail**

```
node --test test/stack-scanner.test.ts 2>&1 | head -20
```
Expected: import error (module not found).

- [ ] **Step 3: Create `lib/stack-scanner.ts`**:

```typescript
import fs from "node:fs";
import path from "node:path";
import type { DomainId, ProjectAnalysisDomain, StackScanResult } from "./stack-detect.js";

const SKIP_DIRS = new Set([
  "node_modules", ".git", "dist", "build", ".next", "__pycache__",
  ".turbo", "coverage", ".cache", "out", ".output",
]);

const MAX_DEPTH = 4;

interface FrameworkRule {
  framework: string;
  domain: DomainId;
  confidence: number;
}

function parsePackageJsonDeps(filePath: string): string[] {
  try {
    const pkg = JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<string, unknown>;
    const deps = {
      ...(pkg.dependencies as Record<string, string> | undefined),
      ...(pkg.devDependencies as Record<string, string> | undefined),
      ...(pkg.peerDependencies as Record<string, string> | undefined),
    };
    return Object.keys(deps);
  } catch {
    return [];
  }
}

function parsePyDeps(filePath: string): string[] {
  try {
    const content = fs.readFileSync(filePath, "utf8").toLowerCase();
    const names: string[] = [];
    for (const match of content.matchAll(/^\s*([a-z][a-z0-9_-]*)\s*[=<>!]/gm)) {
      names.push(match[1].trim());
    }
    return names;
  } catch {
    return [];
  }
}

const PACKAGE_JSON_RULES: Array<{ dep: string } & FrameworkRule> = [
  { dep: "next", framework: "nextjs", domain: "frontend", confidence: 0.95 },
  { dep: "react", framework: "react", domain: "frontend", confidence: 0.8 },
  { dep: "vue", framework: "vue", domain: "frontend", confidence: 0.9 },
  { dep: "@angular/core", framework: "angular", domain: "frontend", confidence: 0.95 },
  { dep: "svelte", framework: "svelte", domain: "frontend", confidence: 0.9 },
  { dep: "react-native", framework: "react-native", domain: "mobile", confidence: 0.95 },
  { dep: "expo", framework: "expo", domain: "mobile", confidence: 0.9 },
  { dep: "express", framework: "express", domain: "backend", confidence: 0.8 },
  { dep: "fastify", framework: "fastify", domain: "backend", confidence: 0.85 },
  { dep: "@nestjs/core", framework: "nestjs", domain: "backend", confidence: 0.95 },
  { dep: "hono", framework: "hono", domain: "backend", confidence: 0.85 },
];

const PY_DEP_RULES: Array<{ dep: string } & FrameworkRule> = [
  { dep: "fastapi", framework: "fastapi", domain: "backend", confidence: 0.95 },
  { dep: "django", framework: "django", domain: "backend", confidence: 0.95 },
  { dep: "flask", framework: "flask", domain: "backend", confidence: 0.9 },
  { dep: "torch", framework: "pytorch", domain: "data-ai", confidence: 0.9 },
  { dep: "tensorflow", framework: "tensorflow", domain: "data-ai", confidence: 0.9 },
  { dep: "langchain", framework: "langchain", domain: "data-ai", confidence: 0.85 },
  { dep: "pandas", framework: "pandas", domain: "data-ai", confidence: 0.7 },
];

interface ScanState {
  frameworks: Map<string, { domain: DomainId; confidence: number; evidence: string[] }>;
  languages: Set<string>;
}

function relPath(targetAbs: string, filePath: string): string {
  return path.relative(targetAbs, filePath).replace(/\\/g, "/");
}

function detectLanguagesFromExtensions(dirPath: string, state: ScanState): void {
  try {
    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (ext === ".ts" || ext === ".tsx") state.languages.add("typescript");
      else if (ext === ".js" || ext === ".jsx") state.languages.add("javascript");
      else if (ext === ".py") state.languages.add("python");
      else if (ext === ".go") state.languages.add("go");
      else if (ext === ".rs") state.languages.add("rust");
      else if (ext === ".dart") state.languages.add("dart");
      else if (ext === ".java") state.languages.add("java");
    }
  } catch {
    // best-effort
  }
}

function addFramework(
  state: ScanState,
  framework: string,
  domain: DomainId,
  confidence: number,
  evidencePath: string
): void {
  const existing = state.frameworks.get(framework);
  if (existing) {
    existing.evidence.push(evidencePath);
    if (confidence > existing.confidence) existing.confidence = confidence;
  } else {
    state.frameworks.set(framework, { domain, confidence, evidence: [evidencePath] });
  }
}

function scanDirectory(
  dirPath: string,
  targetAbs: string,
  state: ScanState,
  depth: number
): void {
  if (depth > MAX_DEPTH) return;

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return;
  }

  detectLanguagesFromExtensions(dirPath, state);

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        scanDirectory(fullPath, targetAbs, state, depth + 1);
      }
      continue;
    }

    if (!entry.isFile()) continue;

    const rel = relPath(targetAbs, fullPath);

    if (entry.name === "package.json") {
      const deps = parsePackageJsonDeps(fullPath);
      const depSet = new Set(deps);
      // nextjs takes priority over react
      const hasNext = depSet.has("next");
      for (const rule of PACKAGE_JSON_RULES) {
        if (rule.dep === "react" && hasNext) continue; // nextjs covers react
        if (depSet.has(rule.dep)) {
          addFramework(state, rule.framework, rule.domain, rule.confidence, rel);
        }
      }
      if (deps.some((d) => d.includes("typescript") || d === "ts-node")) {
        state.languages.add("typescript");
      }
    }

    if (entry.name === "tsconfig.json") {
      state.languages.add("typescript");
    }

    if (entry.name === "pyproject.toml" || entry.name === "requirements.txt") {
      const deps = parsePyDeps(fullPath);
      const depSet = new Set(deps);
      state.languages.add("python");
      for (const rule of PY_DEP_RULES) {
        if (depSet.has(rule.dep)) {
          addFramework(state, rule.framework, rule.domain, rule.confidence, rel);
        }
      }
    }

    if (entry.name === "pubspec.yaml") {
      addFramework(state, "flutter", "mobile", 0.95, rel);
      state.languages.add("dart");
    }

    if (entry.name === "go.mod") {
      addFramework(state, "go", "backend", 0.8, rel);
      state.languages.add("go");
    }

    if (entry.name === "Cargo.toml") {
      addFramework(state, "rust", "backend", 0.8, rel);
      state.languages.add("rust");
    }

    if (entry.name === "Dockerfile" || entry.name === "docker-compose.yml" || entry.name === "docker-compose.yaml") {
      addFramework(state, "docker", "devops", 0.8, rel);
    }

    if (entry.name === "wrangler.toml") {
      addFramework(state, "cloudflare", "cloud", 0.9, rel);
    }

    if (entry.name.endsWith(".tf")) {
      addFramework(state, "terraform", "cloud", 0.85, rel);
    }
  }

  // github actions detection (only at depth ≤ 2 to avoid deep scanning)
  if (depth <= 2) {
    const workflowsDir = path.join(dirPath, ".github", "workflows");
    try {
      if (fs.existsSync(workflowsDir) && fs.statSync(workflowsDir).isDirectory()) {
        const workflows = fs.readdirSync(workflowsDir).filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));
        if (workflows.length > 0) {
          const rel = relPath(targetAbs, path.join(workflowsDir, workflows[0]));
          addFramework(state, "github-actions", "devops", 0.9, rel);
        }
      }
    } catch {
      // best-effort
    }
  }
}

function buildDomainList(
  frameworks: Map<string, { domain: DomainId; confidence: number; evidence: string[] }>
): ProjectAnalysisDomain[] {
  const domainMap = new Map<DomainId, { confidence: number; evidence: string[] }>();
  for (const [fw, info] of frameworks) {
    const existing = domainMap.get(info.domain);
    if (!existing || info.confidence > existing.confidence) {
      domainMap.set(info.domain, {
        confidence: Math.max(existing?.confidence ?? 0, info.confidence),
        evidence: [...(existing?.evidence ?? []), `${fw} detected`],
      });
    }
  }
  return Array.from(domainMap.entries())
    .map(([id, { confidence, evidence }]) => ({ id, confidence, evidence }))
    .sort((a, b) => b.confidence - a.confidence);
}

function inferNotes(frameworks: string[], languages: string[]): string | null {
  const parts: string[] = [];
  if (frameworks.length > 0) parts.push(`frameworks: ${frameworks.join(", ")}`);
  if (languages.length > 0) parts.push(`languages: ${languages.join(", ")}`);
  return parts.length > 0 ? parts.join("; ") : null;
}

function stackScanner(targetAbs: string): StackScanResult {
  const state: ScanState = {
    frameworks: new Map(),
    languages: new Set(),
  };

  scanDirectory(targetAbs, targetAbs, state, 0);

  const frameworks = Array.from(state.frameworks.keys());
  const languages = Array.from(state.languages);
  const evidence: Record<string, string[]> = {};
  for (const [fw, info] of state.frameworks) {
    evidence[fw] = info.evidence;
  }

  return {
    frameworks,
    languages,
    evidence,
    notes: inferNotes(frameworks, languages),
    domains: buildDomainList(state.frameworks),
  };
}

export { stackScanner };
export type { StackScanResult };
```

- [ ] **Step 4: Run tests**

```
node --test test/stack-scanner.test.ts 2>&1
```
Expected: all 7 tests pass.

- [ ] **Step 5: Compile**

```
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 6: Commit**

```
git add lib/stack-scanner.ts lib/stack-detect.ts test/stack-scanner.test.ts
git commit -m "feat: add stack-scanner with framework detection and domain inference"
```

---

## Task 3: Add `scan` CLI command

**Files:**
- Create: `lib/cli-commands/scan.ts`
- Create: `test/cli-commands/scan.test.ts`
- Modify: `lib/cli-main.ts`
- Modify: `lib/cli-args.ts`

- [ ] **Step 1: Write failing test** — create `test/cli-commands/scan.test.ts`:

```typescript
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "scan-cmd-"));
}

test("scan command outputs valid JSON with frameworks and domains", () => {
  const dir = tmpDir();
  fs.writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({ dependencies: { next: "14.0.0" } })
  );
  const output = execSync(`node bin/aih.js scan --target "${dir}"`, { encoding: "utf8" });
  const result = JSON.parse(output.trim()) as Record<string, unknown>;
  assert.ok(Array.isArray(result.frameworks), "frameworks should be array");
  assert.ok(Array.isArray(result.domains), "domains should be array");
  assert.ok(Array.isArray(result.languages), "languages should be array");
  assert.ok("evidence" in result, "evidence should be present");
  assert.ok((result.frameworks as string[]).includes("nextjs"));
});

test("scan command exits 1 for missing target", () => {
  assert.throws(
    () => execSync("node bin/aih.js scan --target /nonexistent/path/xyz", { encoding: "utf8" }),
    /exited with code 1/
  );
});
```

- [ ] **Step 2: Run tests to verify they fail**

```
node --test test/cli-commands/scan.test.ts 2>&1 | head -10
```
Expected: error (unknown command `scan`).

- [ ] **Step 3: Create `lib/cli-commands/scan.ts`**:

```typescript
import fs from "node:fs";
import type { ParseOptions } from "../cli-args.js";
import { resolveTargetAbs } from "../cli-command-helpers.js";
import { stackScanner } from "../stack-scanner.js";

async function runScanCommand(_packRoot: string, options: ParseOptions): Promise<number> {
  const targetAbs = resolveTargetAbs(options.target);
  if (!fs.existsSync(targetAbs)) {
    throw new Error(`Target directory does not exist: ${targetAbs}`);
  }

  const result = stackScanner(targetAbs);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  return 0;
}

export { runScanCommand };
```

- [ ] **Step 4: Add `"scan"` to COMMANDS set** in `lib/cli-args.ts`:

```typescript
const COMMANDS = new Set([
  "install",
  "status",
  "doctor",
  "update",
  "uninstall",
  "help",
  "eval",
  "insights",
  "domains",
  "scan",
]);
```

- [ ] **Step 5: Register `scan` in `lib/cli-main.ts`** — add import and case:

Add import after the `runDomainsCommand` import:
```typescript
import { runScanCommand } from "./cli-commands/scan.js";
```

Add case to the switch statement after `"domains"`:
```typescript
case "scan":
  return await runScanCommand(packRoot, options);
```

- [ ] **Step 6: Build and run tests**

```
npm run build 2>&1 | tail -5
node --test test/cli-commands/scan.test.ts 2>&1
```
Expected: both tests pass.

- [ ] **Step 7: Commit**

```
git add lib/cli-commands/scan.ts lib/cli-args.ts lib/cli-main.ts test/cli-commands/scan.test.ts
git commit -m "feat: add scan CLI command"
```

---

## Task 4: Update `domains` command to auto-scan and persist stack metadata

**Files:**
- Modify: `lib/cli-commands/domains.ts`
- Modify: `lib/domain-skill-generation.ts`

- [ ] **Step 1: Update `writeDomainSkillSurface` signature** in `lib/domain-skill-generation.ts`.

Find the `writeDomainSkillSurface` function signature (near line 1200) and update:
```typescript
// Before:
function writeDomainSkillSurface(
  packRoot: string,
  targetAbs: string,
  selectedDomains: string[],
  options: WriteOptions
): WriteResult {

// After:
function writeDomainSkillSurface(
  packRoot: string,
  targetAbs: string,
  selectedDomains: string[],
  options: WriteOptions,
  stackMeta?: { languages: string[]; frameworks: string[]; evidence: Record<string, string[]>; notes: string | null } | null
): WriteResult {
```

- [ ] **Step 2: Pass `stackMeta` to `updateConfigWithDomains`** — in the same function, update the call:

```typescript
// Before:
const configAction = updateConfigWithDomains(packRoot, targetAbs, normalized, options);

// After:
const configAction = updateConfigWithDomains(packRoot, targetAbs, normalized, options, stackMeta ?? null);
```

- [ ] **Step 3: Update `updateConfigWithDomains`** to write the `stack` field (find the function near line 1021):

```typescript
function updateConfigWithDomains(
  packRoot: string,
  targetAbs: string,
  selectedDomains: DomainId[],
  options: WriteOptions,
  stackMeta?: { languages: string[]; frameworks: string[]; evidence: Record<string, string[]>; notes: string | null } | null
): "created" | "overwritten" | "skipped" {
  const templatePath = path.join(packRoot, "templates", "harness-config.json");
  const template = readJsonFile(templatePath);
  const targetPath = path.join(targetAbs, ".harness", "config.json");
  const existing = readJsonFile(targetPath);
  const merged = deepMerge(template, existing);
  merged.domains = [...selectedDomains];
  if (stackMeta) {
    merged.stack = {
      languages: stackMeta.languages,
      frameworks: stackMeta.frameworks,
      evidence: stackMeta.evidence,
      notes: stackMeta.notes,
    };
  }
  const serialized = `${JSON.stringify(merged, null, 2)}\n`;

  const exists = fs.existsSync(targetPath);
  if (exists && !options.force) {
    if (fs.readFileSync(targetPath, "utf8") === serialized) {
      return "skipped";
    }
  }

  if (!options.dryRun) {
    ensureDir(path.dirname(targetPath), false);
    fs.writeFileSync(targetPath, serialized, "utf8");
  }
  return exists ? "overwritten" : "created";
}
```

- [ ] **Step 4: Update `lib/cli-commands/domains.ts`** to auto-scan and pass meta:

```typescript
import fs from "node:fs";
import path from "node:path";

import type { ParseOptions } from "../cli-args.js";
import { resolveTargetAbs } from "../cli-command-helpers.js";
import { parseProjectAnalysis, mergeStackSignals } from "../stack-detect.js";
import { stackScanner } from "../stack-scanner.js";
import { writeDomainSkillSurface } from "../domain-skill-generation.js";

function readAnalysisInput(options: ParseOptions): string | null {
  if (options.analysisFile) {
    const resolved = path.isAbsolute(options.analysisFile)
      ? options.analysisFile
      : path.resolve(process.cwd(), options.analysisFile);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Domain analysis file does not exist: ${resolved}`);
    }
    return fs.readFileSync(resolved, "utf8");
  }

  if (!process.stdin.isTTY) {
    const input = fs.readFileSync(0, "utf8");
    if (input.trim()) return input;
  }

  return null;
}

function printWriteResult(
  selectedDomains: string[],
  result: { created: string[]; overwritten: string[]; skipped: string[] }
): void {
  const lines: string[] = [];
  lines.push(
    `Domain skills generated for: ${selectedDomains.length ? selectedDomains.join(", ") : "(none)"}`
  );
  lines.push("");

  const sections = [
    ["Created", result.created],
    ["Overwritten", result.overwritten],
    ["Skipped", result.skipped],
  ] as const;

  for (const [label, paths] of sections) {
    lines.push(`${label} (${paths.length})`);
    if (paths.length === 0) {
      lines.push("  (none)");
    } else {
      for (const p of paths) {
        lines.push(`  - ${p}`);
      }
    }
    lines.push("");
  }

  process.stdout.write(`${lines.join("\n").trimEnd()}\n`);
}

async function runDomainsCommand(packRoot: string, options: ParseOptions): Promise<number> {
  const targetAbs = resolveTargetAbs(options.target);
  if (!fs.existsSync(targetAbs)) {
    throw new Error(`Target directory does not exist: ${targetAbs}`);
  }

  // Always run scanner for evidence/metadata
  const scan = stackScanner(targetAbs);

  const analysisText = readAnalysisInput(options);

  let domains: string[];
  let stackMeta = scan;

  if (analysisText) {
    // AI-provided analysis: merge with scanner (AI wins on domains)
    const aiAnalysis = parseProjectAnalysis(analysisText);
    const merged = mergeStackSignals(
      { domains: aiAnalysis.meta.domains, frameworks: aiAnalysis.meta.frameworks, languages: aiAnalysis.meta.languages, notes: aiAnalysis.meta.notes },
      scan
    );
    const mergedParsed = parseProjectAnalysis(JSON.stringify(merged));
    domains = mergedParsed.domains;
    stackMeta = {
      ...scan,
      frameworks: mergedParsed.meta.frameworks,
      languages: mergedParsed.meta.languages,
      notes: mergedParsed.meta.notes,
    };
  } else {
    // No AI analysis: use scanner domains directly
    domains = scan.domains.map((d) => d.id);
  }

  const result = writeDomainSkillSurface(packRoot, targetAbs, domains, {
    packRoot,
    targetAbs,
    dryRun: options.dryRun,
    force: options.force,
  }, stackMeta);

  printWriteResult(domains, result);
  return 0;
}

export { runDomainsCommand };
```

- [ ] **Step 5: Build and run full test suite**

```
npm run build 2>&1 | tail -5
node --test test/stack-scanner.test.ts test/cli-commands/scan.test.ts test/hooks/codex-hook-router.test.js 2>&1
```
Expected: all tests pass.

- [ ] **Step 6: Commit**

```
git add lib/cli-commands/domains.ts lib/domain-skill-generation.ts
git commit -m "feat: domains command auto-scans and writes stack metadata to config.json"
```

---

## Task 5: Update domain-analysis prompt template and verify e2e

**Files:**
- Modify: `prompt-templates/domain-analysis.md`
- Modify: `.ai-harness/prompt-templates/domain-analysis.md`

- [ ] **Step 1: Update `prompt-templates/domain-analysis.md`** — replace the Action Loop section:

```markdown
## Action Loop

1. Run `npx ai-engineering-harness scan --target .` and capture the JSON output.
2. Use the scan output as base context. It provides automated evidence from manifests.
3. Validate and refine the domain selection — override domains where your analysis disagrees.
4. Save the final JSON to a file (e.g., `.harness/domain-analysis.json`).
5. Run `npx ai-engineering-harness domains --analysis-file .harness/domain-analysis.json`.
```

- [ ] **Step 2: Sync `.ai-harness/` copy** — copy the updated file:

```
copy "prompt-templates\domain-analysis.md" ".ai-harness\prompt-templates\domain-analysis.md"
```

- [ ] **Step 3: Verify e2e manually** — run against this repo:

```
node bin/aih.js scan --target .
```
Expected: JSON output with frameworks and domains detected from this repo's own `package.json`.

- [ ] **Step 4: Run full test suite**

```
node --test test/stack-scanner.test.ts test/cli-commands/scan.test.ts test/hooks/codex-hook-router.test.js 2>&1
```
Expected: all tests pass.

- [ ] **Step 5: Build dist**

```
npm run build 2>&1 | tail -3
```

- [ ] **Step 6: Commit**

```
git add prompt-templates/domain-analysis.md .ai-harness/prompt-templates/domain-analysis.md
git commit -m "docs: update domain-analysis prompt to use scan command as first step"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Automated file-tree scanner (`lib/stack-scanner.ts`, Task 2)
- ✅ Max depth 4, skip node_modules/.git (Task 2 implementation)
- ✅ All manifest types: package.json, pyproject.toml, pubspec.yaml, go.mod, Cargo.toml, Dockerfile, .github/workflows (Task 2)
- ✅ Evidence map stored in config.json (Task 4 `updateConfigWithDomains`)
- ✅ `stack.languages`, `stack.frameworks`, `stack.notes` in config.json (Task 4)
- ✅ `scan` standalone CLI command (Task 3)
- ✅ `domains` auto-scans when no `--analysis-file` (Task 4)
- ✅ AI domains win in merge, scanner provides evidence (Task 1 `mergeStackSignals`)
- ✅ `prompt-templates/domain-analysis.md` updated (Task 5)
- ✅ Tests for scanner, scan command (Tasks 2, 3)

**Type consistency check:**
- `StackScanResult` defined in Task 1 (`lib/stack-detect.ts`), used in Tasks 2, 4
- `stackScanner()` returns `StackScanResult`, matches usage in Task 3 (`scan.ts`) and Task 4 (`domains.ts`)
- `writeDomainSkillSurface` 5th param type matches what Task 4 passes
- `mergeStackSignals(ai: ProjectAnalysisInput, scan: StackScanResult)` — Task 4 passes `{ domains, frameworks, languages, notes }` which satisfies `ProjectAnalysisInput` ✅

**Placeholder scan:** No TBD, no "implement later", all code blocks complete. ✅
