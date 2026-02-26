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
ANTIGRAV_BOOTSTRAP_REQUIRE_OLLAMA=0 ./scripts/bootstrap.sh

log "Checking formatting..."
cargo fmt --all --check

log "Running tests..."
cargo test --quiet

log "Running clippy with -D warnings..."
cargo clippy --all-targets -- -D warnings

log "Running clean clone smoke test..."
./scripts/smoke_clean_clone.sh

log "Verifying package check has zero warnings..."
summary_line="$(cargo run --quiet -- workflow check | head -n 1)"
printf '[ci-gate] %s\n' "$summary_line"

errors_count="$(printf '%s' "$summary_line" | sed -E 's/.*errors=([0-9]+).*/\1/')"
warnings_count="$(printf '%s' "$summary_line" | sed -E 's/.*warnings=([0-9]+).*/\1/')"

if [[ "$errors_count" != "0" ]]; then
  fail "workflow check reported errors=$errors_count"
fi
if [[ "$warnings_count" != "0" ]]; then
  fail "workflow check reported warnings=$warnings_count"
fi

log "CI gate passed."
