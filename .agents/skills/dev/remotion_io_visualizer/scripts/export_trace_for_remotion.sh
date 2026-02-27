#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <instance_id> [output_dir]"
  exit 1
fi

INSTANCE_ID="$1"
OUT_DIR="${2:-docs/landing-astro/public/remotion-data}"
TRACE_OUT="${OUT_DIR}/${INSTANCE_ID}.trace.json"
PROPS_OUT="${OUT_DIR}/${INSTANCE_ID}.props.json"
STATE_IN=".agents/state/${INSTANCE_ID}.json"

mkdir -p "${OUT_DIR}"

# Export workflow trace in canonical runtime format.
cargo run -- workflow trace "${INSTANCE_ID}" --json > "${TRACE_OUT}"

if [[ ! -f "${STATE_IN}" ]]; then
  echo "State file not found: ${STATE_IN}"
  echo "Trace exported only: ${TRACE_OUT}"
  exit 0
fi

# Build a compact, Remotion-friendly payload from trace + state.
node -e '
const fs = require("fs");
const tracePath = process.argv[1];
const statePath = process.argv[2];
const outPath = process.argv[3];

const trace = JSON.parse(fs.readFileSync(tracePath, "utf8"));
const state = JSON.parse(fs.readFileSync(statePath, "utf8"));

const steps = (trace.step_order || []).map((step) => {
  const s = (trace.step_states || {})[step] || {};
  return {
    name: step,
    status: s.status || "unknown",
    duration_ms: s.duration_ms ?? null,
    failure_class: s.failure_class || null,
    provider: s.provider || null,
    model: s.model || null
  };
});

const pathExists = (p) => {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
};

const structureCandidates = [
  { title: "CLI Layer", path: "src/cli", purpose: "command parsing and runtime policy flags" },
  { title: "Workflow Engine", path: "src/engine/workflow_engine", purpose: "deterministic orchestration and state transitions" },
  { title: "Workflow Loader", path: "src/workflow", purpose: "markdown workflow parsing and validation" },
  { title: "Skill Runtime", path: "src/skill", purpose: "skill invocation and execution contracts" },
  { title: "Skill Registry", path: ".agents/skills", purpose: "domain skills and project capabilities" },
  { title: "Workflow Registry", path: ".agents/workflows", purpose: "reusable delivery flows by domain" }
];

const projectStructure = structureCandidates
  .filter((item) => pathExists(item.path))
  .map((item) => ({
    title: item.title,
    path: item.path,
    purpose: item.purpose
  }));

const cliCommands = [
  "cargo run -- --workflow valid_flow.md",
  "cargo run -- workflow doctor",
  "cargo run -- workflow setup",
  "cargo run -- workflow check",
  "cargo run -- workflow trace <instance_id> --timeline",
  "cargo run -- --workflow-id ai-engineering/feature --template ai-engineering/feature_prompt --task \"build eval pipeline\"",
  "cargo run -- --workflow-id cybersecurity/review --template cybersecurity/review_prompt --task \"review auth middleware\""
];

const useCases = [
  {
    title: "AI Engineering Feature Delivery",
    command: "cargo run -- --workflow-id ai-engineering/feature --template ai-engineering/feature_prompt --task \"build eval pipeline\"",
    outcome: "impact analysis, acceptance guard, and risk register before implementation"
  },
  {
    title: "Cybersecurity Review Gate",
    command: "cargo run -- --workflow-id cybersecurity/review --template cybersecurity/review_prompt --task \"review auth middleware\"",
    outcome: "correctness and vulnerability checks before release decisions"
  },
  {
    title: "Project Intelligence Upgrade",
    command: "cargo run -- --workflow-id dev/project-intelligence --template dev/project-intelligence_prompt --task \"recommend workflows and skills\"",
    outcome: "prioritized workflow/skill roadmap with quick wins and risk notes"
  }
];

const landingScreenshot = pathExists("docs/landing-astro/public/media/landing-page-output.png")
  ? "media/landing-page-output.png"
  : (pathExists("docs/landing-astro/public/media/workflow-io-still.png")
      ? "media/workflow-io-still.png"
      : null);

const payload = {
  generated_at: new Date().toISOString(),
  instance_id: trace.instance_id || null,
  workflow_id: trace.workflow_id || null,
  workflow_name: trace.workflow_name || null,
  status: trace.status || null,
  trace_id: trace.trace_id || null,
  created_at_ms: trace.created_at_ms || null,
  updated_at_ms: trace.updated_at_ms || null,
  input: {
    workflow_path: trace.workflow_path || null,
    current_step: trace.current_step ?? null,
    total_steps: (trace.step_order || []).length
  },
  execution: {
    completed_steps: trace.completed_steps || [],
    failed_steps: trace.failed_steps || [],
    steps
  },
  output: {
    last_error: trace.last_error || null,
    trace_events: trace.trace || []
  },
  showcase: {
    structure: projectStructure,
    cli_commands: cliCommands,
    use_cases: useCases,
    success_output: {
      title: "Landing page as final production artifact",
      artifact_path: "docs/landing-astro/dist/index.html",
      screenshot: landingScreenshot,
      note: "Input and runtime evidence are converted to a landing page with visible trust signals."
    }
  },
  state: {
    status: state.status || null,
    updated_at_ms: state.updated_at_ms || null
  }
};

fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
' "${TRACE_OUT}" "${STATE_IN}" "${PROPS_OUT}"

echo "Trace JSON: ${TRACE_OUT}"
echo "Remotion props JSON: ${PROPS_OUT}"
