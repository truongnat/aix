#!/usr/bin/env bash
# aix SessionStart hook: inject the using-aix entry-point skill into the agent's
# context so the agent knows it has aix, the methodology, and how to reach every
# other skill via the Skill tool. This is the whole dispatch mechanism — no engine.
set -euo pipefail

ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
SKILL="${ROOT}/content/skills/using-aix/SKILL.md"

# node is the project runtime and gives us safe JSON escaping across platforms.
node -e '
const fs = require("fs");
const path = process.argv[1];
let body = "";
try { body = fs.readFileSync(path, "utf8"); } catch { process.exit(0); }
const intro =
  "You have aix. The text below is your entry-point skill (using-aix): it explains " +
  "the default engineering methodology and how to reach every other aix skill via the " +
  "Skill tool (start with router-pro for broad requests, tool-discovery to find by " +
  "capability). Check for a relevant skill before any non-trivial task.\n\n";
process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: intro + body,
  },
}));
' "$SKILL"
