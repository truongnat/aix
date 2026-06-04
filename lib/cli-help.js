"use strict";

function renderHelp() {
  return `ai-engineering-harness (experimental)

Primary:
  npx ai-engineering-harness install
  npx ai-engineering-harness status
  npx ai-engineering-harness doctor
  npx ai-engineering-harness update
  npx ai-engineering-harness uninstall

Non-interactive:
  npx ai-engineering-harness install --provider cursor --yes
  npx ai-engineering-harness install --provider cursor,claude --yes --dry-run
  npx ai-engineering-harness uninstall --provider cursor --yes
  npx ai-engineering-harness uninstall --all --yes

Options:
  --provider <id>     Provider(s), comma-separated
  --runtime <id>      Deprecated alias for --provider
  --scope project|global
  --visibility private|shared
  --target <path>     Target directory (default: .)
  --ref <git-ref>     Git ref for tarball/bootstrap (default: main)
  --dry-run           Preview without writing
  --yes               Skip confirmation prompts
  --verbose           Show raw shell backend output
  --all               Uninstall: full cleanup (runtime + cache + state + exclude)

Active providers:
  claude, cursor, codex, gemini

Advanced fallback targets:
  generic, manual

Shell backend fallback:
  sh aih.sh install --runtime cursor --scope project --visibility private --yes

Windows: Git Bash or WSL required for the bundled shell backend fallback.`;
}

function printHelp() {
  console.log(renderHelp());
}

module.exports = {
  renderHelp,
  printHelp,
};
