"use strict";

function renderHelp() {
  return `ai-engineering-harness (experimental)

Primary:
  npx ai-engineering-harness init
  npx ai-engineering-harness install
  npx ai-engineering-harness status
  npx ai-engineering-harness doctor
  npx ai-engineering-harness update
  npx ai-engineering-harness uninstall

Eval:
  npx ai-engineering-harness eval list
  npx ai-engineering-harness eval run <task-or-suite>
  npx ai-engineering-harness eval report <run-id>

Insights:
  npx ai-engineering-harness insights
  npx ai-engineering-harness insights --target <path> --json
  npx ai-engineering-harness insights --export
  npx ai-engineering-harness insights --recommend-evals
  npx ai-engineering-harness insights --upload

Init (quickstart):
  npx ai-engineering-harness init
  npx ai-engineering-harness init --provider cursor --yes
  npx ai-engineering-harness init --skip-demo-eval

Non-interactive:
  npx ai-engineering-harness install --provider cursor --yes
  npx ai-engineering-harness install --provider cursor,claude --yes --dry-run
  npx ai-engineering-harness eval run sample-bugfix --provider codex --yes
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
  --json              Emit machine-readable JSON (insights)
  --export            Emit anonymized aggregate telemetry (opt-in sharing)
  --upload            Upload anonymized telemetry when remoteUpload is enabled
  --recommend-evals   Suggest eval tasks from local telemetry guard/tool signals
  --no-anonymize      Include raw paths in export payload (not recommended)
  --skip-demo-eval    Init without running the sample-bugfix demo eval
  --no-llm-judge      Eval run without EVAL_JUDGE_ENDPOINT lookup
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
