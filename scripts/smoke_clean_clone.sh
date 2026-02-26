#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$(mktemp -d /tmp/agentic-sdlc-smoke-XXXXXX)"
CLONE_DIR="$TMP_DIR/repo"

log() {
  printf '[smoke-clone] %s\n' "$*"
}

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

log "Cloning repository into temp workspace: $CLONE_DIR"
git clone --quiet "$ROOT_DIR" "$CLONE_DIR"

log "Overlaying tracked working tree files into clone..."
untracked_files="$(
  cd "$ROOT_DIR"
  git ls-files --others --exclude-standard -- .agents src scripts docs README.md CHANGELOG.md Cargo.toml Cargo.lock || true
)"
if [[ -n "$untracked_files" ]]; then
  printf '[smoke-clone][warn] Untracked files are excluded from smoke clone run:\n%s\n' "$untracked_files" >&2
fi
while IFS= read -r -d '' rel_path; do
  src="$ROOT_DIR/$rel_path"
  dst="$CLONE_DIR/$rel_path"
  if [[ -f "$src" || -L "$src" ]]; then
    mkdir -p "$(dirname "$dst")"
    cp -p "$src" "$dst"
  else
    rm -f "$dst"
  fi
done < <(
  cd "$ROOT_DIR"
  git ls-files -z
)

cd "$CLONE_DIR"

log "Bootstrapping package via CLI setup..."
cargo run --quiet -- workflow setup --json >/dev/null

log "Running doctor checks..."
cargo run --quiet -- workflow doctor --json >/dev/null

log "Running package check..."
cargo run --quiet -- workflow check --json >/dev/null

log "Running sample workflow from clean clone..."
cargo run --quiet -- --workflow valid_flow.md >/dev/null

log "Clean clone smoke test passed."
