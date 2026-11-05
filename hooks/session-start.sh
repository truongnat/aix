#!/usr/bin/env bash
# aix SessionStart hook: inject the using-aix entry-point skill into the agent's
# context so the agent knows it has aix, the methodology, and how to reach every
# other skill via the Skill tool. This is the whole dispatch mechanism — no engine.
set -euo pipefail

ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
SKILL="${ROOT}/skills/methodology/using-aix/SKILL.md"

# node is the project runtime and gives us safe JSON escaping across platforms.
node -e '
const fs = require("fs");
const path = process.argv[1];
let body = "";
try { body = fs.readFileSync(path, "utf8"); } catch { process.exit(0); }
const intro =
  "You have aix. The text below is your entry-point skill (using-aix): it explains " +
  "the default engineering methodology and how to reach every other aix skill via the " +
  "Skill tool (start with router-pro for broad requests, tool-discovery-skill to find by " +
  "capability). Check for a relevant skill before any non-trivial task.\n" +
  "Important: spine artifacts (DISCUSSION.md, PLAN.md, REVIEW.md, VERIFY.md, REMEMBER.md) " +
  "must be written under `.aix/sessions/<session-id>/` — never `.planning/` (GSD is a different harness). " +
  "Pick a kebab-case session-id from the task; reuse an existing session folder when resuming.\n" +
  "Memory defaults to plain Markdown in `.aix/runtime/memory/`; use native host file tools. " +
  "Search local memory before work. The optional KB service requires separate, explicit setup; " +
  "this hook only injects context and never starts services or creates credentials.\n\n";
process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: intro + body,
  },
}));
' "$SKILL"
