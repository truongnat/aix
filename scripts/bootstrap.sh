#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

STRICT_OLLAMA="${ANTIGRAV_BOOTSTRAP_REQUIRE_OLLAMA:-0}"

log() {
  printf '[bootstrap] %s\n' "$*"
}

warn() {
  printf '[bootstrap][warn] %s\n' "$*" >&2
}

fail() {
  printf '[bootstrap][error] %s\n' "$*" >&2
  exit 1
}

require_cmd() {
  local cmd="$1"
  local help_message="$2"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    fail "$help_message"
  fi
}

log "Repository root: $ROOT_DIR"

require_cmd git "Missing 'git'. Install Git first."
require_cmd rustc "Missing 'rustc'. Install Rust via https://rustup.rs"
require_cmd cargo "Missing 'cargo'. Install Rust via https://rustup.rs"

if command -v ollama >/dev/null 2>&1; then
  if ollama list >/dev/null 2>&1; then
    log "Ollama detected and responsive."
  else
    if [[ "$STRICT_OLLAMA" == "1" ]]; then
      fail "Ollama CLI exists but daemon is unreachable. Start it with 'ollama serve'."
    fi
    warn "Ollama CLI exists but daemon is unreachable. Start it with 'ollama serve' before local llm_subagent runs."
  fi
else
  if [[ "$STRICT_OLLAMA" == "1" ]]; then
    fail "Ollama is required but not found. Install from https://ollama.com/download"
  fi
  warn "Ollama not found. This is okay only if you use OpenAI/Gemini providers."
fi

[[ -f Cargo.toml ]] || fail "Cargo.toml not found at repository root."
[[ -d .agents ]] || fail "Missing .agents directory."

for dir in workflows rules skills roles templates memory; do
  [[ -d ".agents/$dir" ]] || fail "Missing required directory: .agents/$dir"
done

if find .agents/workflows .agents/rules .agents/skills .agents/roles -type f \( -name '*.yml' -o -name '*.yaml' \) | grep -q .; then
  fail "YAML files detected under workflow/rule/skill/role packages. Convert all package definitions to Markdown."
fi

if ! find .agents/workflows -type f -name '*.md' | grep -q .; then
  fail "No workflow markdown files found under .agents/workflows"
fi

log "Running package integrity check (workflow/skills/rules/roles markdown)..."
cargo run --quiet -- workflow check

log "Bootstrap checks passed."
