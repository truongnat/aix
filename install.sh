#!/bin/sh
# ai-engineering-harness remote installer — bootstrap download + install.js
set -eu

REPO="truongnat/ai-engineering-harness"
TARGET="."
REF="main"
DRY_RUN=0
FORCE=0

usage() {
  cat <<'EOF'
ai-engineering-harness installer

Usage:
  install.sh [--target <path>] [--dry-run] [--force] [--ref <git-ref>] [--help]

Options:
  --target <path>   Target repository (default: current directory)
  --dry-run         Show what would be copied without writing
  --force           Overwrite existing files in the target
  --ref <git-ref>   GitHub ref to install (branch or tag, default: main)
  --help            Show this help

Examples:
  install.sh
  install.sh --target ../my-project --dry-run
  install.sh --ref v0.9.0 --target .

Remote one-line install:
  curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh
  curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh -s -- --target . --dry-run
EOF
}

fail() {
  printf 'ai-engineering-harness installer: error: %s\n' "$1" >&2
  exit 1
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --target)
      [ "$#" -ge 2 ] || fail "missing value for --target"
      TARGET="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --force)
      FORCE=1
      shift
      ;;
    --ref)
      [ "$#" -ge 2 ] || fail "missing value for --ref"
      REF="$2"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    --)
      shift
      break
      ;;
    -*)
      fail "unknown option: $1 (try --help)"
      ;;
    *)
      fail "unexpected argument: $1 (try --help)"
      ;;
  esac
done

command -v node >/dev/null 2>&1 || fail "node is required but was not found on PATH"
command -v tar >/dev/null 2>&1 || fail "tar is required but was not found on PATH"

if command -v curl >/dev/null 2>&1; then
  DOWNLOAD="curl"
elif command -v wget >/dev/null 2>&1; then
  DOWNLOAD="wget"
else
  fail "curl or wget is required to download the pack archive"
fi

# Resolve target to absolute path before changing directory for install.js
if [ -d "$TARGET" ]; then
  TARGET_ABS=$(cd "$TARGET" && pwd)
elif [ "$DRY_RUN" -eq 1 ] && [ ! -e "$TARGET" ]; then
  # install.js dry-run only needs a resolvable path for messaging; parent must exist
  TARGET_PARENT=$(dirname "$TARGET")
  TARGET_NAME=$(basename "$TARGET")
  [ -d "$TARGET_PARENT" ] || fail "target parent directory does not exist: $TARGET_PARENT"
  TARGET_ABS=$(cd "$TARGET_PARENT" && pwd)/$TARGET_NAME
else
  fail "target directory does not exist: $TARGET"
fi

ARCHIVE_URL="https://github.com/${REPO}/archive/${REF}.tar.gz"

printf '%s\n' "ai-engineering-harness installer"
printf '  ref:    %s\n' "$REF"
printf '  target: %s\n' "$TARGET_ABS"
printf '  source: %s\n' "$ARCHIVE_URL"

TMPDIR=$(mktemp -d 2>/dev/null || mktemp -d -t ai-harness-install)
cleanup() {
  rm -rf "$TMPDIR"
}
trap cleanup EXIT INT HUP TERM

ARCHIVE="${TMPDIR}/pack.tar.gz"

if [ "$DOWNLOAD" = "curl" ]; then
  curl -fsSL "$ARCHIVE_URL" -o "$ARCHIVE" || fail "failed to download archive from $ARCHIVE_URL"
else
  wget -q -O "$ARCHIVE" "$ARCHIVE_URL" || fail "failed to download archive from $ARCHIVE_URL"
fi

EXTRACT="${TMPDIR}/extract"
mkdir -p "$EXTRACT"
tar -xzf "$ARCHIVE" -C "$EXTRACT" || fail "failed to extract archive"

PACK_ROOT=""
for candidate in "$EXTRACT"/*; do
  if [ -f "${candidate}/install.js" ]; then
    PACK_ROOT=$candidate
    break
  fi
done

[ -n "$PACK_ROOT" ] || fail "could not find install.js in downloaded archive"

set -- --target "$TARGET_ABS"
if [ "$DRY_RUN" -eq 1 ]; then
  set -- "$@" --dry-run
fi
if [ "$FORCE" -eq 1 ]; then
  set -- "$@" --force
fi

(
  cd "$PACK_ROOT" || exit 1
  node install.js "$@"
)
