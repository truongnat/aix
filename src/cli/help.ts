// Purpose: CLI help text rendering
// Layer: presentation
// Depends on: application, features, ui

function renderHelp(): string {
  return `ai-engineering-harness (experimental)

Primary:
  npx ai-engineering-harness install
  npx ai-engineering-harness status
  npx ai-engineering-harness doctor
  npx ai-engineering-harness update
  npx ai-engineering-harness uninstall

Eval:
  npx ai-engineering-harness eval list
  npx ai-engineering-harness eval run <task-or-suite>
  npx ai-engineering-harness eval report <run-id>
  npx ai-engineering-harness eval run <task-or-suite> --live-provider-command "<cmd>"

Scan:
  npx ai-engineering-harness scan
  npx ai-engineering-harness scan --target <path>

Domains:
  npx ai-engineering-harness domains --analysis-file ./domain-analysis.json
  npx ai-engineering-harness domains --target ./repo < analysis.json

Insights:
  npx ai-engineering-harness insights
  npx ai-engineering-harness insights --target <path> --json
  npx ai-engineering-harness insights --export
  npx ai-engineering-harness insights --recommend-evals
  npx ai-engineering-harness insights --recommend-evals --run-recommended-evals
  npx ai-engineering-harness insights --upload

Non-interactive:
  npx ai-engineering-harness install --provider cursor --yes
  npx ai-engineering-harness install --provider cursor,claude --yes --dry-run
  npx ai-engineering-harness eval run sample-bugfix --provider codex --yes
  npx ai-engineering-harness uninstall --provider cursor --yes
  npx ai-engineering-harness uninstall --all --yes

Options:
  --provider <id>     Provider(s), comma-separated
  --domains <ids>     Domain skill ids, comma-separated
  --analysis-file <path>  JSON output from the domain analysis agent
  --force             Overwrite generated domain skill files
  --runtime <id>      Deprecated alias for --provider
  --scope project|global
  --visibility private|shared
  --target <path>     Target directory (default: .)
  --dry-run           Preview without writing
  --yes               Skip confirmation prompts
  --verbose           Show raw backend output
  --json              Emit machine-readable JSON (insights)
  --export            Emit anonymized aggregate telemetry (opt-in sharing)
  --upload            Upload anonymized telemetry when remoteUpload is enabled
  --recommend-evals   Suggest eval tasks from local telemetry guard/tool signals
  --run-recommended-evals  Execute recommended eval tasks immediately
  --no-anonymize      Include raw paths in export payload (not recommended)
  --live-provider-command <cmd>  Run a live provider CLI/command for evals
  --no-llm-judge      Eval run without EVAL_JUDGE_ENDPOINT lookup
  --all               Uninstall: full cleanup (runtime + cache + state + exclude)

Active providers:
  claude, cursor, codex, gemini

Advanced fallback targets:
  generic, manual

Primary lifecycle commands run in-process on Node.js.`;
}

function printHelp(): void {
  console.log(renderHelp());
}

export { renderHelp, printHelp };
