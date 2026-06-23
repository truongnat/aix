#!/usr/bin/env node
// Purpose: Archive a session skill and write a DISPOSAL.md record.
// Layer: infrastructure
// Depends on: ../shared/util

import * as fs from "node:fs";
import * as path from "node:path";
import {
  emitResult,
  exitFromResult,
  parseCliArgs,
  printHelp,
  resolveSessionDir,
  writeMarkdownArtifact,
} from "../shared/util";

const SPEC = {
  session: { required: true },
  skill: { required: true },
  reason: { required: true },
  "promote-candidate": { required: false },
};

export function archiveSessionSkill(options: {
  session: string;
  skill: string;
  reason: string;
  "promote-candidate"?: string;
}): { ok: boolean; status: string; skill: string; disposal: string } {
  const sessionDir = resolveSessionDir(options.session);
  const skillDir = path.join(sessionDir, "skills", options.skill);
  const skillFile = path.join(skillDir, "SKILL.md");
  if (!fs.existsSync(skillFile)) {
    throw new Error(`Session skill not found: ${options.skill}`);
  }

  const disposalPath = path.join(skillDir, "DISPOSAL.md");
  writeMarkdownArtifact(disposalPath, [
    "# Skill Disposal",
    "## Skill",
    "",
    `id: ${options.skill}`,
    "## Final Status",
    "",
    "status: archived",
    "## Reason",
    "",
    options.reason,
    "## Reuse Decision",
    "",
    `promote_candidate: ${String(options["promote-candidate"] || "false").toLowerCase()}`,
    "## Archived At",
    "",
    new Date().toISOString().slice(0, 10),
  ]);

  let skillContent = fs.readFileSync(skillFile, "utf8");
  if (/^status:\s/m.test(skillContent)) {
    skillContent = skillContent.replace(/^status:\s.*$/m, "status: archived");
  } else {
    skillContent = skillContent.replace(/^---\n([\s\S]*?)---\n/, (_match, body: string) => {
      return `---\n${body.trim()}\nstatus: archived\n---\n`;
    });
  }
  fs.writeFileSync(skillFile, skillContent, "utf8");

  return {
    ok: true,
    status: "archived",
    skill: options.skill,
    disposal: path.relative(process.cwd(), disposalPath).replace(/\\/g, "/"),
  };
}

function main(): void {
  try {
    const options = parseCliArgs(process.argv.slice(2), SPEC);
    if (options.help) {
      printHelp("archive-session-skill.js", [
        "Usage:",
        "  node hooks/core/archive-session-skill.js --session <path> --skill <id> --reason \"Session complete\" [--promote-candidate false] [--json]",
        "",
        "Dispose means archive/deactivate, not delete.",
      ]);
      return;
    }
    const result = archiveSessionSkill(options as unknown as Parameters<typeof archiveSessionSkill>[0]);
    emitResult(result, options.json as boolean);
    exitFromResult({ ok: true });
  } catch (error) {
    emitResult(
      { ok: false, reason: (error as Error).message },
      process.argv.includes("--json")
    );
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
