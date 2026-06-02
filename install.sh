#!/bin/sh
# ai-engineering-harness remote installer — runtime/scope selection + .harness init + manual fallback
set -eu

REPO="truongnat/ai-engineering-harness"
TARGET="."
REF="main"
DRY_RUN=0
FORCE=0
RUNTIME=""
SCOPE=""
INIT_HARNESS=0
YES=0

usage() {
  cat <<'EOF'
ai-engineering-harness installer

Usage:
  install.sh [options]

Options:
  --target <path>       Target repository (default: current directory)
  --runtime <name>      claude | codex | cursor | gemini | opencode | generic | all | manual
  --scope <name>        global | project (required for non-manual non-interactive)
  --init-harness        Scaffold project-local .harness/ profile files
  --legacy-root         Alias for --runtime manual (root copy fallback)
  --dry-run             Show plan or preview without writing
  --force               Overwrite existing .harness/ files (and manual fallback files)
  --ref <git-ref>       GitHub ref to install (branch or tag, default: main)
  --yes                 Skip interactive confirmation
  --help                Show this help

Runtime-native install: claude, codex, cursor, windsurf, gemini, opencode, generic, all. Manual = legacy root copy.
Project .harness/ init works with --scope project --init-harness (or interactive confirm).

Examples:
  install.sh --runtime claude --scope project --init-harness --dry-run --yes
  install.sh --runtime manual --target . --init-harness --dry-run
  install.sh --legacy-root --target ../my-project

Remote one-line install (non-interactive; defaults to manual fallback with warning):
  curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh
EOF
}

fail() {
  printf 'ai-engineering-harness installer: error: %s\n' "$1" >&2
  exit 1
}

is_interactive() {
  [ -t 0 ] && [ -t 1 ]
}

validate_runtime() {
  case "$1" in
    claude|codex|cursor|windsurf|gemini|opencode|generic|all|manual) return 0 ;;
    *) return 1 ;;
  esac
}

validate_scope() {
  case "$1" in
    global|project) return 0 ;;
    *) return 1 ;;
  esac
}

runtime_label() {
  case "$1" in
    claude) printf '%s' 'Claude Code' ;;
    codex) printf '%s' 'Codex CLI' ;;
    cursor|windsurf) printf '%s' 'Cursor / Windsurf' ;;
    gemini) printf '%s' 'Gemini CLI' ;;
    opencode) printf '%s' 'OpenCode' ;;
    generic) printf '%s' 'Generic AGENTS.md bootstrap' ;;
    all) printf '%s' 'All supported runtimes' ;;
    manual) printf '%s' 'Manual fallback (root copy via install.js)' ;;
    *) printf '%s' "$1" ;;
  esac
}

pick_runtime_interactive() {
  printf '%s\n' '' 'AI Engineering Harness Installer' '' 'Choose agent runtime:'
  printf '%s\n' \
    '  1) Claude Code' \
    '  2) Codex CLI' \
    '  3) Cursor' \
    '  4) Gemini CLI' \
    '  5) OpenCode' \
    '  6) Generic AGENTS.md bootstrap' \
    '  7) All supported' \
    '  8) Manual fallback / root copy'
  while true; do
    printf '%s' 'Select runtime [1-8]: '
    read -r choice || fail 'could not read runtime selection'
    case "$choice" in
      1) RUNTIME=claude; break ;;
      2) RUNTIME=codex; break ;;
      3) RUNTIME=cursor; break ;;
      4) RUNTIME=gemini; break ;;
      5) RUNTIME=opencode; break ;;
      6) RUNTIME=generic; break ;;
      7) RUNTIME=all; break ;;
      8) RUNTIME=manual; break ;;
      *) printf '%s\n' '  Invalid choice. Enter 1-8.' ;;
    esac
  done
}

pick_scope_interactive() {
  printf '%s\n' '' 'Install scope:'
  printf '%s\n' \
    '  1) Global — runtime-level install; no .harness/ by default' \
    '  2) Project — repo-level install; may init .harness/'
  while true; do
    printf '%s' 'Select scope [1-2]: '
    read -r choice || fail 'could not read scope selection'
    case "$choice" in
      1) SCOPE=global; break ;;
      2) SCOPE=project; break ;;
      *) printf '%s\n' '  Invalid choice. Enter 1-2.' ;;
    esac
  done
}

maybe_prompt_init_harness() {
  if [ "$INIT_HARNESS" -eq 1 ]; then
    return 0
  fi
  if ! is_interactive; then
    return 0
  fi
  if [ "$SCOPE" = project ] || [ "$RUNTIME" = manual ]; then
    printf '%s' 'Initialize project .harness/ in target? [y/N]: '
    read -r ans || fail 'could not read .harness init choice'
    case "$ans" in
      y|Y|yes|Yes|YES) INIT_HARNESS=1 ;;
    esac
  fi
}

print_harness_init_plan() {
  if [ "$INIT_HARNESS" -ne 1 ]; then
    return 0
  fi
  printf '%s\n' \
    '  - Initialize project-local .harness/ (minimal structural skeletons)' \
    "  - Target: ${TARGET_ABS}/.harness/" \
    '  - Files: HARNESS.md, TEAM.md, SKILLS.md, WORKFLOW.md, GATES.md, MEMORY.md, goals/.gitkeep' \
    '  - Optional: AGENTS.md at repo root if missing (for profile validation)' \
    '  - Fill profile content after init; run validate.js --target <repo> --profile-only'
}

print_install_plan() {
  printf '%s\n' '' '--- Install plan ---'
  printf '  runtime:       %s (%s)\n' "$RUNTIME" "$(runtime_label "$RUNTIME")"
  if [ "$RUNTIME" = manual ]; then
    if [ -n "$SCOPE" ]; then
      printf '  scope:         %s\n' "$SCOPE"
    else
      printf '  scope:         (manual fallback; scope optional)\n'
    fi
  else
    printf '  scope:         %s\n' "$SCOPE"
  fi
  printf '  target:        %s\n' "$TARGET_ABS"
  printf '  ref:           %s\n' "$REF"
  printf '  init-harness:  %s\n' "$([ "$INIT_HARNESS" -eq 1 ] && printf yes || printf no)"
  printf '  dry-run:       %s\n' "$([ "$DRY_RUN" -eq 1 ] && printf yes || printf no)"
  printf '  force:         %s\n' "$([ "$FORCE" -eq 1 ] && printf yes || printf no)"
  printf '%s\n' '' 'What will happen:'
  if [ "$SCOPE" = global ]; then
    printf '%s\n' '  - No project-local .harness/ state will be created'
  fi
  print_harness_init_plan
  if [ "$RUNTIME" = manual ]; then
    printf '%s\n' \
      '  - Download pack archive from GitHub' \
      '  - Run install.js legacy root-copy fallback into target' \
      '  - Root copy is fallback only, not the recommended final plugin UX'
    if [ "$INIT_HARNESS" -eq 1 ]; then
      printf '%s\n' '  - After manual copy, scaffold .harness/ if not already present (respect --force)'
    fi
  else
    printf '%s\n' \
      "  - Install runtime-native integration for '$RUNTIME' (scope: $SCOPE)" \
      '  - Writes only runtime paths (.cursor/rules, .opencode/plugins, .claude/, AGENTS.md, …)' \
      '  - Does not copy commands/, skills/, workflows/ to product repo root' \
      '  - Use --runtime manual for legacy full root copy'
  fi
  printf '%s\n' '---'
}

confirm_plan() {
  if [ "$YES" -eq 1 ]; then
    return 0
  fi
  if ! is_interactive; then
    return 0
  fi
  printf '%s' 'Proceed? [y/N]: '
  read -r ans || fail 'could not read confirmation'
  case "$ans" in
    y|Y|yes|Yes|YES) return 0 ;;
    *) printf '%s\n' 'Aborted.'; exit 0 ;;
  esac
}

write_target_file() {
  rel="$1"
  content="$2"
  dest="${TARGET_ABS}/${rel}"
  dest_dir=$(dirname "$dest")

  if [ -f "$dest" ]; then
    if [ "$FORCE" -eq 1 ]; then
      if [ "$DRY_RUN" -eq 1 ]; then
        printf 'WOULD OVERWRITE %s\n' "$rel"
      else
        mkdir -p "$dest_dir"
        printf '%s' "$content" >"$dest"
        printf 'OVERWRITE %s\n' "$rel"
      fi
    else
      if [ "$DRY_RUN" -eq 1 ]; then
        printf 'WOULD SKIP %s\n' "$rel"
      else
        printf 'SKIP %s\n' "$rel"
      fi
    fi
    return 0
  fi

  if [ "$DRY_RUN" -eq 1 ]; then
    printf 'WOULD CREATE %s\n' "$rel"
  else
    mkdir -p "$dest_dir"
    printf '%s' "$content" >"$dest"
    printf 'CREATE %s\n' "$rel"
  fi
}

harness_skeleton_harness_md() {
  cat <<'EOF'
# Harness Profile

> Do not include credentials, tokens, customer data, or private business data.

## Purpose

(TODO: describe this repository harness operating model.)

## Current Status

- Status: draft
- Last updated:
- Owner:

## Scope

(TODO)

## Operating Model

(TODO)

## Assumptions

(TODO)

## Unknowns

(TODO)

## Human Review

(TODO)
EOF
}

harness_skeleton_team_md() {
  cat <<'EOF'
# Team Profile

## Purpose

(TODO)

## Current Status

(TODO)

## Selected Pattern

(TODO)

## Roles

(TODO)

## Handoff Rules

(TODO)

## Escalation Rules

(TODO)

## Human Review

(TODO)
EOF
}

harness_skeleton_skills_md() {
  cat <<'EOF'
# Skills Profile

## Purpose

(TODO)

## Current Status

(TODO)

## Selected Core Skills

(TODO)

## Selected Skill Packs

(TODO)

## Excluded Skills Or Packs

(TODO)

## Human Review

(TODO)
EOF
}

harness_skeleton_workflow_md() {
  cat <<'EOF'
# Workflow Profile

## Purpose

(TODO)

## Current Status

(TODO)

## Selected Workflow

(TODO)

## Command Sequence

(TODO)

## Execution Rules

(TODO)

## Human Review

(TODO)
EOF
}

harness_skeleton_gates_md() {
  cat <<'EOF'
# Quality Gates

## Purpose

(TODO)

## Current Status

(TODO)

## Quality Gates

(TODO)

## Evidence Requirements

(TODO)

## Stop Conditions

(TODO)

## Human Review

(TODO)
EOF
}

harness_skeleton_memory_md() {
  cat <<'EOF'
# Memory Profile

## Purpose

(TODO)

## Current Status

(TODO)

## Recall Before Planning

(TODO)

## Remember After Shipping

(TODO)

## Memory Types

(TODO)

## Forbidden Content

(TODO)

## Human Review

(TODO)
EOF
}

harness_skeleton_agents_md() {
  cat <<'EOF'
# AGENTS.md

Minimal project agent contract. Extend with team rules and harness workflow references.

Read `.harness/` profile artifacts before starting work.
EOF
}

init_harness_profile() {
  printf '%s\n' '' '--- .harness/ init ---'
  write_target_file '.harness/HARNESS.md' "$(harness_skeleton_harness_md)"
  write_target_file '.harness/TEAM.md' "$(harness_skeleton_team_md)"
  write_target_file '.harness/SKILLS.md' "$(harness_skeleton_skills_md)"
  write_target_file '.harness/WORKFLOW.md' "$(harness_skeleton_workflow_md)"
  write_target_file '.harness/GATES.md' "$(harness_skeleton_gates_md)"
  write_target_file '.harness/MEMORY.md' "$(harness_skeleton_memory_md)"
  write_target_file '.harness/goals/.gitkeep' ''
  if [ ! -f "${TARGET_ABS}/AGENTS.md" ]; then
    write_target_file 'AGENTS.md' "$(harness_skeleton_agents_md)"
  elif [ "$DRY_RUN" -eq 1 ]; then
    printf 'WOULD SKIP AGENTS.md\n'
  else
    printf 'SKIP AGENTS.md\n'
  fi
  printf '%s\n' '--- .harness/ init complete ---'
}

PACK_ROOT=""
INSTALL_TMPDIR=""

download_pack_root() {
  if [ -n "$PACK_ROOT" ] && [ -f "${PACK_ROOT}/install-runtime.js" ]; then
    return 0
  fi

  _script_dir=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
  if [ -f "${_script_dir}/install-runtime.js" ] && [ -f "${_script_dir}/runtime/README.md" ]; then
    PACK_ROOT=$_script_dir
    return 0
  fi

  ARCHIVE_URL="https://github.com/${REPO}/archive/${REF}.tar.gz"
  printf '%s\n' "Downloading pack: $ARCHIVE_URL"

  command -v tar >/dev/null 2>&1 || fail "tar is required but was not found on PATH"

  if command -v curl >/dev/null 2>&1; then
    _download="curl"
  elif command -v wget >/dev/null 2>&1; then
    _download="wget"
  else
    fail "curl or wget is required to download the pack archive"
  fi

  INSTALL_TMPDIR=$(mktemp -d 2>/dev/null || mktemp -d -t ai-harness-install)
  cleanup_install_tmp() {
    rm -rf "$INSTALL_TMPDIR"
  }
  trap cleanup_install_tmp EXIT INT HUP TERM

  _archive="${INSTALL_TMPDIR}/pack.tar.gz"
  if [ "$_download" = "curl" ]; then
    curl -fsSL "$ARCHIVE_URL" -o "$_archive" || fail "failed to download archive from $ARCHIVE_URL"
  else
    wget -q -O "$_archive" "$ARCHIVE_URL" || fail "failed to download archive from $ARCHIVE_URL"
  fi

  _extract="${INSTALL_TMPDIR}/extract"
  mkdir -p "$_extract"
  tar -xzf "$_archive" -C "$_extract" || fail "failed to extract archive"

  PACK_ROOT=""
  for candidate in "$_extract"/*; do
    if [ -f "${candidate}/install-runtime.js" ]; then
      PACK_ROOT=$candidate
      break
    fi
  done

  [ -n "$PACK_ROOT" ] || fail "could not find install-runtime.js in downloaded archive"
}

run_runtime_native_install() {
  command -v node >/dev/null 2>&1 || fail "node is required but was not found on PATH"
  download_pack_root

  set -- node "$PACK_ROOT/install-runtime.js" \
    --pack-root "$PACK_ROOT" \
    --runtime "$RUNTIME" \
    --scope "$SCOPE" \
    --target "$TARGET_ABS"
  if [ "$DRY_RUN" -eq 1 ]; then
    set -- "$@" --dry-run
  fi
  if [ "$FORCE" -eq 1 ]; then
    set -- "$@" --force
  fi

  "$@"
}

run_manual_install() {
  download_pack_root

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
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --target)
      [ "$#" -ge 2 ] || fail "missing value for --target"
      TARGET="$2"
      shift 2
      ;;
    --runtime)
      [ "$#" -ge 2 ] || fail "missing value for --runtime"
      RUNTIME="$2"
      shift 2
      ;;
    --scope)
      [ "$#" -ge 2 ] || fail "missing value for --scope"
      SCOPE="$2"
      shift 2
      ;;
    --init-harness)
      INIT_HARNESS=1
      shift
      ;;
    --legacy-root)
      RUNTIME=manual
      shift
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
    --yes)
      YES=1
      shift
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

if [ -n "$RUNTIME" ] && ! validate_runtime "$RUNTIME"; then
  fail "invalid --runtime: $RUNTIME (try claude, codex, cursor, gemini, opencode, generic, all, manual)"
fi

if [ -n "$SCOPE" ] && ! validate_scope "$SCOPE"; then
  fail "invalid --scope: $SCOPE (try global or project)"
fi

if [ -z "$RUNTIME" ]; then
  if is_interactive; then
    pick_runtime_interactive
  else
    RUNTIME=manual
    printf '%s\n' \
      'ai-engineering-harness installer: warning: no --runtime; defaulting to manual (root copy) fallback.' \
      '  This is not the final runtime-native plugin UX. Pass --runtime explicitly when ready.' >&2
  fi
fi

if [ "$RUNTIME" != manual ]; then
  if [ -z "$SCOPE" ]; then
    if is_interactive; then
      pick_scope_interactive
    else
      fail "missing --scope for runtime '$RUNTIME' (required: global or project)"
    fi
  fi
fi

if [ "$SCOPE" = global ] && [ "$INIT_HARNESS" -eq 1 ]; then
  fail 'Global install cannot create shared .harness state. Run project install inside each repo.'
fi

# Resolve target to absolute path before any install work
if [ -d "$TARGET" ]; then
  TARGET_ABS=$(cd "$TARGET" && pwd)
elif [ "$DRY_RUN" -eq 1 ] && [ ! -e "$TARGET" ]; then
  TARGET_PARENT=$(dirname "$TARGET")
  TARGET_NAME=$(basename "$TARGET")
  [ -d "$TARGET_PARENT" ] || fail "target parent directory does not exist: $TARGET_PARENT"
  TARGET_ABS=$(cd "$TARGET_PARENT" && pwd)/$TARGET_NAME
else
  fail "target directory does not exist: $TARGET"
fi

maybe_prompt_init_harness

printf '%s\n' 'ai-engineering-harness installer'
print_install_plan
confirm_plan

if [ "$INIT_HARNESS" -eq 1 ] && [ "$RUNTIME" != manual ]; then
  if [ "$SCOPE" = global ]; then
    fail 'Global install cannot create shared .harness state. Run project install inside each repo.'
  fi
  init_harness_profile
fi

if [ "$RUNTIME" != manual ]; then
  if [ -z "$SCOPE" ] && [ "$RUNTIME" != all ]; then
    fail "missing --scope for runtime '$RUNTIME'"
  fi
  if [ "$RUNTIME" = all ] && [ -z "$SCOPE" ]; then
    SCOPE=project
  fi
  printf '%s\n' '' '--- Runtime-native install ---'
  run_runtime_native_install
  if [ "$DRY_RUN" -eq 1 ]; then
    printf '%s\n' '' "Dry-run complete for runtime '$RUNTIME'."
    exit 0
  fi
  printf '%s\n' '' "Runtime '$RUNTIME' install finished."
  exit 0
fi

run_manual_install

if [ "$INIT_HARNESS" -eq 1 ] && [ "$RUNTIME" = manual ]; then
  init_harness_profile
fi
