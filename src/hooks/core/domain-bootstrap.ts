// Purpose: Detect whether domain bootstrap is needed on session start.
// Layer: infrastructure
// Depends on: nothing

import * as fs from "node:fs";
import * as path from "node:path";

export function readConfigDomains(repoRoot: string): string[] | null {
  const configPath = path.join(repoRoot, ".harness", "config.json");
  if (!fs.existsSync(configPath)) {
    return null;
  }
  try {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8")) as { domains?: unknown };
    return Array.isArray(config.domains) ? (config.domains as string[]) : null;
  } catch {
    return null;
  }
}

export function hasGeneratedDomainSkills(repoRoot: string): boolean {
  const skillsDir = path.join(repoRoot, ".harness", "skills");
  if (!fs.existsSync(skillsDir)) {
    return false;
  }
  try {
    const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
    return entries.some((entry) => entry.isDirectory());
  } catch {
    return false;
  }
}

export function needsDomainBootstrap(repoRoot: string): boolean {
  const domains = readConfigDomains(repoRoot);
  if (domains === null) {
    return false;
  }
  if (domains.length > 0) {
    return false;
  }
  return !hasGeneratedDomainSkills(repoRoot);
}

export function buildDomainBootstrapIntent(): string {
  return [
    "Domain bootstrap required: .harness/config.json has domains: [] and no generated domain skills exist.",
    "Before any other work, execute the harness-start protocol.",
    "1. Tell the user you are analyzing the codebase.",
    "2. Run domain analysis per prompt-templates/domain-analysis.md.",
    "3. Generate domain skills with: npx ai-engineering-harness domains --analysis-file <path>",
    "4. Report generated domains and files.",
    "Do not skip harness-start or domain bootstrap on this first session.",
  ].join(" ");
}

export function buildSessionStartIntent(repoRoot: string): string {
  const parts = [
    "Harness session start.",
    "Read .harness/STATE.md, .harness/GOAL.md, and .harness/PLAN.md before editing.",
  ];

  if (needsDomainBootstrap(repoRoot)) {
    parts.push(buildDomainBootstrapIntent());
    parts.push("Mandatory next command: harness-start (includes domain bootstrap).");
    return parts.join(" ");
  }

  parts.push(
    "If session state is unknown or this is a new chat, run harness-start before discuss, plan, run, verify, or ship."
  );
  return parts.join(" ");
}
