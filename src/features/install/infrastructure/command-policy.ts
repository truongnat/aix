// Purpose: Load + merge the common command-policy rules (core) with provider extensions
// Layer: infrastructure
// Depends on: rules/core/command-policy.json + rules/providers/<id>/command-policy.json
//
// Type-1 "command rules" (shell command policy) as core data, mirroring the
// type-2 markdown rules in rules/core/*.md. Both are core and both extend per
// provider. See refactor.md.

import fs from "node:fs";
import path from "node:path";

export interface CommandRuleSpec {
  decision: "allow" | "prompt" | "forbidden";
  prefixes: string[];
  justification: string;
}

interface CommandPolicyFile {
  rules?: CommandRuleSpec[];
}

function readPolicyFile(filePath: string): CommandRuleSpec[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as CommandPolicyFile;
  return Array.isArray(parsed.rules) ? parsed.rules : [];
}

/** Absolute path of the common (core) command-policy file. */
export function coreCommandPolicyPath(packRoot: string): string {
  return path.join(packRoot, "rules", "core", "command-policy.json");
}

/**
 * Common command rules from the shared core (rules/core/command-policy.json).
 *
 * This is provider-agnostic data. Each provider adapter renders it into its own
 * format/language at install time (e.g. codex -> prefix_rule(...) DSL). There is
 * no static rules/providers/ overlay — project-specific additions are meant to
 * be detected at install (see TODO below), not hand-written per provider.
 */
export function loadCommandPolicy(packRoot: string): CommandRuleSpec[] {
  return readPolicyFile(coreCommandPolicyPath(packRoot));
  // TODO(detect): append project-derived command rules built from ProjectContext
  // (stack detection) at install time.
}
