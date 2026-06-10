/* eslint-disable @typescript-eslint/no-require-imports */
import type { DomainId, ProjectAnalysisDomain, StackScanResult } from "./stack-detect.js";

// Use require for runtime to keep this file CJS-compatible when loaded directly
// (TypeScript types are stripped at runtime via --experimental-strip-types)
const fs: typeof import("node:fs") = require("node:fs");
const path: typeof import("node:path") = require("node:path");

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "__pycache__",
  ".turbo",
  "coverage",
  ".cache",
  "out",
  ".output",
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

function detectLanguagesFromExtensions(
  entries: Array<{ isFile(): boolean; name: string }>,
  state: ScanState
): void {
  for (const entry of entries) {
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

function scanDirectory(dirPath: string, targetAbs: string, state: ScanState, depth: number): void {
  if (depth > MAX_DEPTH) return;

  type DirentLike = { isDirectory(): boolean; isFile(): boolean; name: string };
  let entries: DirentLike[];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true }) as unknown as DirentLike[];
  } catch {
    return;
  }

  detectLanguagesFromExtensions(entries, state);

  for (const entry of entries) {
    const entryName = entry.name;
    const fullPath = path.join(dirPath, entryName);

    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entryName)) {
        scanDirectory(fullPath, targetAbs, state, depth + 1);
      }
      continue;
    }

    if (!entry.isFile()) continue;

    const rel = relPath(targetAbs, fullPath);

    if (entryName === "package.json") {
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
      // A package.json file implies at minimum JavaScript
      state.languages.add("javascript");
      if (deps.some((d) => d.includes("typescript") || d === "ts-node")) {
        state.languages.add("typescript");
      }
    }

    if (entryName === "tsconfig.json") {
      state.languages.add("typescript");
    }

    if (entryName === "pyproject.toml" || entryName === "requirements.txt") {
      const deps = parsePyDeps(fullPath);
      const depSet = new Set(deps);
      state.languages.add("python");
      for (const rule of PY_DEP_RULES) {
        if (depSet.has(rule.dep)) {
          addFramework(state, rule.framework, rule.domain, rule.confidence, rel);
        }
      }
    }

    if (entryName === "pubspec.yaml") {
      addFramework(state, "flutter", "mobile", 0.95, rel);
      state.languages.add("dart");
    }

    if (entryName === "go.mod") {
      addFramework(state, "go", "backend", 0.8, rel);
      state.languages.add("go");
    }

    if (entryName === "Cargo.toml") {
      addFramework(state, "rust", "backend", 0.8, rel);
      state.languages.add("rust");
    }

    if (
      entryName === "Dockerfile" ||
      entryName === "docker-compose.yml" ||
      entryName === "docker-compose.yaml"
    ) {
      addFramework(state, "docker", "devops", 0.8, rel);
    }

    if (entryName === "wrangler.toml") {
      addFramework(state, "cloudflare", "cloud", 0.9, rel);
    }

    if (entryName.endsWith(".tf")) {
      addFramework(state, "terraform", "cloud", 0.85, rel);
    }
  }

  // github actions detection (only at depth <= 2 to avoid deep scanning)
  if (depth <= 2) {
    const workflowsDir = path.join(dirPath, ".github", "workflows");
    try {
      if (fs.existsSync(workflowsDir) && fs.statSync(workflowsDir).isDirectory()) {
        const workflows = (fs.readdirSync(workflowsDir) as unknown as string[]).filter(
          (f) => f.endsWith(".yml") || f.endsWith(".yaml")
        );
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
    if (!existing) {
      domainMap.set(info.domain, { confidence: info.confidence, evidence: [`${fw} detected`] });
    } else {
      existing.evidence.push(`${fw} detected`);
      if (info.confidence > existing.confidence) existing.confidence = info.confidence;
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

module.exports = { stackScanner };
