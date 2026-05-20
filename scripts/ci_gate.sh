#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

log() {
  printf '[ci-gate] %s\n' "$*"
}

fail() {
  printf '[ci-gate][error] %s\n' "$*" >&2
  exit 1
}

log "Running bootstrap checks (non-strict Ollama mode)..."
AGENTIC_SDLC_BOOTSTRAP_REQUIRE_OLLAMA=0 ./scripts/bootstrap.sh

log "Checking formatting..."
cargo fmt --all --check

log "Running tests..."
cargo test --quiet

log "Running clippy with -D warnings..."
cargo clippy --all-targets -- -D warnings

log "Running clean clone smoke test..."
./scripts/smoke_clean_clone.sh

log "Verifying package check has zero warnings..."
# We use || true because we want to capture JSON even if there are errors.
# Compilation errors or other system errors will still go to stderr.
check_output="$(cargo run --quiet -- workflow check --json || true)"

if [[ -z "$check_output" ]]; then
  fail "workflow check failed to produce output (check for compilation errors above)"
fi

if ! echo "$check_output" | jq . >/dev/null 2>&1; then
  fail "workflow check produced invalid JSON: $check_output"
fi

errors_count="$(echo "$check_output" | jq '.errors | length')"
warnings_count="$(echo "$check_output" | jq '.warnings | length')"

log "Package Check: errors=$errors_count warnings=$warnings_count"

if [[ "$errors_count" != "0" ]]; then
  echo "$check_output" | jq -r '.errors[] | "\(.path): \(.message)"' | while read -r err; do
    printf '[ci-gate][error] %s\n' "$err" >&2
  done
  fail "workflow check reported $errors_count error(s)"
fi

if [[ "$warnings_count" != "0" ]]; then
  echo "$check_output" | jq -r '.warnings[] | "\(.path): \(.message)"' | while read -r warn; do
    printf '[ci-gate][warn] %s\n' "$warn" >&2
  done
  fail "workflow check reported $warnings_count warning(s)"
fi

log "Running strict skill quality gate..."
quality_output="$(cargo run --quiet -- workflow quality-skills --strict --json || true)"

if [[ -z "$quality_output" ]]; then
  fail "quality-skills failed to produce output"
fi

if ! echo "$quality_output" | jq . >/dev/null 2>&1; then
  fail "quality-skills produced invalid JSON: $quality_output"
fi

q_errors="$(echo "$quality_output" | jq '.errors')"
q_warnings="$(echo "$quality_output" | jq '.warnings')"

log "Skill Quality: errors=$q_errors warnings=$q_warnings"

if [[ "$q_errors" != "0" ]] || [[ "$q_warnings" != "0" ]]; then
  echo "$quality_output" | jq -r '.entries[] | select(.findings | length > 0) | .path as $path | .findings[] | "[\(.level)] \($path): \(.message)"' | while read -r finding; do
    printf '[ci-gate][quality] %s\n' "$finding" >&2
  done
  fail "skill quality check failed (strict=true)"
fi

log "Rebuilding catalog + lock artifacts..."
if ! cargo run --quiet -- workflow build-catalog --json; then
  fail "build-catalog failed"
fi


log "CI gate passed."
