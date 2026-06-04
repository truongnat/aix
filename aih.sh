#!/bin/sh
# ai-engineering-harness lifecycle dispatcher — runtime/scope selection + .harness init + manual fallback
set -eu

REPO="truongnat/ai-engineering-harness"
TARGET="."
REF="main"
DRY_RUN=0
FORCE=0
RUNTIME=""
SCOPE=""
INIT_HARNESS=0
INSTALL_CACHE=0
NO_INSTALL_CACHE=0
YES=0
VERB=install
VISIBILITY=""
IGNORE_STRATEGY=auto
EFFECTIVE_IGNORE_STRATEGY=none
UNINSTALL_REMOVE_CACHE=0
UNINSTALL_REMOVE_STATE=0
FULL_UNINSTALL=0

HARNES_IGNORE_BLOCK_START='# ai-engineering-harness start'
HARNES_IGNORE_BLOCK_END='# ai-engineering-harness end'

usage() {
  cat <<'EOF'
ai-engineering-harness installer

Usage:
  aih.sh [install] [options]
  aih.sh install [options]
  aih.sh uninstall [options]
  aih.sh update [options]
  aih.sh status [options]
  aih.sh doctor [options]

Recommended:
  sh aih.sh install
  sh aih.sh update
  sh aih.sh uninstall
  sh aih.sh status
  sh aih.sh doctor

Options:
  --target <path>       Target repository (default: current directory)
  --runtime <name>      claude | codex | cursor | gemini | generic | all | manual
  --scope <name>        global | project (required for non-manual non-interactive)
  --visibility <name>   private | shared (project scope; private uses .git/info/exclude)
  --ignore-strategy <name>  info-exclude | none | auto (private project; default auto → info-exclude)
  --init-harness        Scaffold project-local .harness/ profile files
  --install-cache       Install capability pack under .ai-harness/ (project scope)
  --no-install-cache    Skip .ai-harness/ cache (project runtime-native default installs cache)
  --remove-cache        Uninstall: remove .ai-harness/
  --keep-cache          Uninstall: keep .ai-harness/ (default)
  --remove-state        Uninstall: remove .harness/
  --keep-state          Uninstall: keep .harness/ (default)
  --all                 Uninstall: remove runtime entrypoints + .ai-harness/ + .harness/
  --legacy-root         Alias for --runtime manual (root copy fallback)
  --dry-run             Show plan or preview without writing
  --force               Overwrite existing .harness/ files; runtime/manual may overwrite their files
  --ref <git-ref>       GitHub ref to install (branch or tag, default: main)
  --yes                 Skip interactive confirmation
  --help                Show this help

Git hygiene (v0.9.2): project + --visibility private writes .git/info/exclude (not .gitignore).
Project + --visibility shared leaves generated files visible in git status.

Examples:
  aih.sh install
  aih.sh update
  aih.sh uninstall
  aih.sh uninstall --all
  aih.sh status
  aih.sh doctor

Advanced examples:
  aih.sh install --runtime cursor --scope project --visibility private --init-harness --yes
  aih.sh uninstall --runtime cursor --scope project --remove-cache --remove-state --yes
  aih.sh update --runtime cursor --scope project --ref v0.9.2 --yes
  aih.sh --runtime claude --scope project --init-harness --dry-run --yes
  aih.sh --runtime manual --target . --init-harness --dry-run

Remote one-line install:
  curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/aih.sh | sh -s -- install

Legacy compatibility:
  install.sh remains available as a compatibility wrapper around aih.sh
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
    claude|codex|cursor|gemini|generic|all|manual) return 0 ;;
    opencode)
      case "${VERB:-}" in
        uninstall|update) return 0 ;;
        *) return 1 ;;
      esac
      ;;
    *) return 1 ;;
  esac
}

validate_scope() {
  case "$1" in
    global|project) return 0 ;;
    *) return 1 ;;
  esac
}

validate_visibility() {
  case "$1" in
    private|shared) return 0 ;;
    *) return 1 ;;
  esac
}

validate_ignore_strategy() {
  case "$1" in
    info-exclude|none|auto|gitignore) return 0 ;;
    *) return 1 ;;
  esac
}

runtime_list_count() {
  _list="$1"
  if [ -z "$_list" ]; then
    printf '0'
    return 0
  fi
  printf '%s\n' "$_list" | awk 'NF { count += 1 } END { print count + 0 }'
}

detect_runtimes_from_target() {
  _tmp=$(mktemp "${TMPDIR:-/tmp}/harness-detect-runtimes.XXXXXX")

  if [ -f "${TARGET_ABS}/.cursor/rules/ai-engineering-harness.mdc" ]; then
    printf '%s\n' 'cursor' >> "$_tmp"
  fi
  if [ -f "${TARGET_ABS}/.claude/CLAUDE.md" ]; then
    printf '%s\n' 'claude' >> "$_tmp"
  fi
  if [ -f "${TARGET_ABS}/.gemini/extensions/ai-engineering-harness/GEMINI.md" ]; then
    printf '%s\n' 'gemini' >> "$_tmp"
  fi
  if [ -f "${TARGET_ABS}/.opencode/plugins/ai-engineering-harness.js" ]; then
    printf '%s\n' 'opencode' >> "$_tmp"
  fi
  if [ -f "${TARGET_ABS}/AGENTS.md" ] && file_contains_harness_marker "${TARGET_ABS}/AGENTS.md"; then
    printf '%s\n' 'generic' >> "$_tmp"
  fi

  awk '!seen[$0]++' "$_tmp"
  rm -f "$_tmp"
}

detect_available_provider() {
  _tmp=$(mktemp "${TMPDIR:-/tmp}/harness-detect-provider.XXXXXX")

  if [ -d "${TARGET_ABS}/.cursor" ]; then
    printf '%s\n' 'cursor' >> "$_tmp"
  fi
  if [ -d "${TARGET_ABS}/.claude" ]; then
    printf '%s\n' 'claude' >> "$_tmp"
  fi
  if [ -d "${TARGET_ABS}/.gemini" ]; then
    printf '%s\n' 'gemini' >> "$_tmp"
  fi
  if [ -d "${TARGET_ABS}/.opencode" ]; then
    printf '%s\n' 'opencode' >> "$_tmp"
  fi
  if [ -f "${TARGET_ABS}/AGENTS.md" ] && file_contains_harness_marker "${TARGET_ABS}/AGENTS.md"; then
    printf '%s\n' 'generic' >> "$_tmp"
  fi

  awk '!seen[$0]++' "$_tmp"
  rm -f "$_tmp"
}

is_git_repo() {
  [ -d "${TARGET_ABS}/.git" ] || [ -f "${TARGET_ABS}/.git" ]
}

git_info_exclude_path() {
  printf '%s' "${TARGET_ABS}/.git/info/exclude"
}

has_harness_exclude_block() {
  _exclude_file=$(git_info_exclude_path)
  [ -f "$_exclude_file" ] && grep -qxF "$HARNES_IGNORE_BLOCK_START" "$_exclude_file" 2>/dev/null
}

harness_provider_command_paths() {
  _rt="$1"
  case "$_rt" in
    cursor)
      printf '%s\n' '.cursor/rules/ai-engineering-harness-commands.mdc'
      ;;
    claude)
      printf '%s\n' '.claude/commands/'
      ;;
    gemini)
      printf '%s\n' '.gemini/extensions/ai-engineering-harness/commands/'
      ;;
    *)
      ;;
  esac
}

harness_ignore_paths_for_runtime() {
  _rt="$1"
  _init="$2"

  if [ "$_init" -eq 1 ]; then
    printf '%s\n' '.harness/'
  fi

  case "$_rt" in
    cursor)
      printf '%s\n' '.cursor/rules/ai-engineering-harness.mdc'
      harness_provider_command_paths cursor
      ;;
    claude)
      printf '%s\n' '.claude/CLAUDE.md' '.claude/settings.json'
      harness_provider_command_paths claude
      ;;
    gemini)
      printf '%s\n' '.gemini/extensions/ai-engineering-harness/'
      harness_provider_command_paths gemini
      ;;
    opencode)
      printf '%s\n' '.opencode/plugins/ai-engineering-harness.js'
      ;;
    codex|generic|manual)
      printf '%s\n' 'AGENTS.md'
      ;;
    all)
      printf '%s\n' \
        '.cursor/rules/ai-engineering-harness.mdc' \
        '.cursor/rules/ai-engineering-harness-commands.mdc' \
        '.claude/CLAUDE.md' \
        '.claude/settings.json' \
        '.claude/commands/' \
        '.gemini/extensions/ai-engineering-harness/' \
        'AGENTS.md'
      ;;
    *)
      ;;
  esac
}

collect_ignore_paths() {
  {
    harness_ignore_paths_for_runtime "$RUNTIME" "$INIT_HARNESS"
    if [ "$INSTALL_CACHE" -eq 1 ]; then
      printf '%s\n' '.ai-harness/'
    fi
  } | awk '!seen[$0]++'
}

runtime_paths_for_uninstall() {
  _rt="$1"
  case "$_rt" in
    cursor)
      printf '%s\n' '.cursor/rules/ai-engineering-harness.mdc'
      harness_provider_command_paths cursor
      ;;
    claude)
      printf '%s\n' '.claude/CLAUDE.md' '.claude/settings.json'
      harness_provider_command_paths claude
      ;;
    gemini)
      printf '%s\n' '.gemini/extensions/ai-engineering-harness/'
      harness_provider_command_paths gemini
      ;;
    opencode)
      printf '%s\n' '.opencode/plugins/ai-engineering-harness.js'
      ;;
    codex|generic|manual)
      printf '%s\n' 'AGENTS.md'
      ;;
    all)
      printf '%s\n' \
        '.cursor/rules/ai-engineering-harness.mdc' \
        '.cursor/rules/ai-engineering-harness-commands.mdc' \
        '.claude/CLAUDE.md' \
        '.claude/settings.json' \
        '.claude/commands/' \
        '.gemini/extensions/ai-engineering-harness/' \
        'AGENTS.md'
      ;;
    *)
      ;;
  esac
}

runtime_references_cache() {
  _rt="$1"
  case "$_rt" in
    cursor)
      [ -f "${TARGET_ABS}/.cursor/rules/ai-engineering-harness.mdc" ] && grep -q '\.ai-harness/' "${TARGET_ABS}/.cursor/rules/ai-engineering-harness.mdc" 2>/dev/null
      ;;
    claude)
      [ -f "${TARGET_ABS}/.claude/CLAUDE.md" ] && grep -q '\.ai-harness/' "${TARGET_ABS}/.claude/CLAUDE.md" 2>/dev/null
      ;;
    gemini)
      [ -f "${TARGET_ABS}/.gemini/extensions/ai-engineering-harness/GEMINI.md" ] && grep -q '\.ai-harness/' "${TARGET_ABS}/.gemini/extensions/ai-engineering-harness/GEMINI.md" 2>/dev/null
      ;;
    opencode)
      [ -f "${TARGET_ABS}/.opencode/plugins/ai-engineering-harness.js" ] && grep -q '\.ai-harness/' "${TARGET_ABS}/.opencode/plugins/ai-engineering-harness.js" 2>/dev/null
      ;;
    generic|codex|manual)
      [ -f "${TARGET_ABS}/AGENTS.md" ] && grep -q '\.ai-harness/' "${TARGET_ABS}/AGENTS.md" 2>/dev/null
      ;;
    *)
      return 1
      ;;
  esac
}

doctor_plan_status() {
  _plan_file="${TARGET_ABS}/.harness/PLAN.md"
  if [ ! -f "$_plan_file" ]; then
    printf '%s' 'missing'
    return 0
  fi

  awk '
    BEGIN { in_block = 0 }
    /^## Approval Status/ { in_block = 1; next }
    /^## / && in_block == 1 { exit }
    in_block == 1 && $0 ~ /^status:/ {
      sub(/^status:[[:space:]]*/, "", $0)
      print tolower($0)
      exit
    }
  ' "$_plan_file"
}

doctor_verify_has_concrete_tests() {
  _verify_file="${TARGET_ABS}/.harness/VERIFY.md"
  [ -f "$_verify_file" ] || return 1
  grep -Eq '^\|[[:space:]]*`[^`]+`' "$_verify_file"
}

doctor_verify_has_concrete_evidence() {
  _verify_file="${TARGET_ABS}/.harness/VERIFY.md"
  [ -f "$_verify_file" ] || return 1
  grep -Eq '^- (Commands executed|Files inspected|Output summary|Link, log, or snippet):[[:space:]]*[^[:space:]].+' "$_verify_file"
}

doctor_verify_status() {
  _verify_file="${TARGET_ABS}/.harness/VERIFY.md"
  if [ ! -f "$_verify_file" ]; then
    printf '%s' 'missing'
    return 0
  fi

  awk '
    /^[[:space:]]*status:[[:space:]]*/ {
      sub(/^[[:space:]]*status:[[:space:]]*/, "", $0)
      print tolower($0)
      exit
    }
  ' "$_verify_file"
}

workflow_phase_line() {
  _label="$1"
  _state="$2"
  case "$_state" in
    ready)
      _icon='✅'
      _text='ready'
      ;;
    approved)
      _icon='✅'
      _text='approved'
      ;;
    passed)
      _icon='✅'
      _text='passed'
      ;;
    draft)
      _icon='⚠️'
      _text='draft'
      ;;
    required)
      _icon='⛔'
      _text='required'
      ;;
    blocked)
      _icon='⛔'
      _text='blocked'
      ;;
    failed)
      _icon='⛔'
      _text='failed'
      ;;
    missing)
      _icon='⚠️'
      _text='missing'
      ;;
    partial)
      _icon='⚠️'
      _text='partial'
      ;;
    *)
      _icon='⚠️'
      _text="$_state"
      ;;
  esac
  printf '  %-12s %s %s\n' "$_label" "$_icon" "$_text"
}

print_workflow_summary() {
  _goal_state='missing'
  _plan_phase='missing'
  _approval_state='required'
  _run_state='blocked'
  _verify_phase='blocked'
  _ship_state='blocked'
  _remember_state='blocked'
  _next_command='harness-start'
  _blocking_reason='GOAL.md is missing.'

  if [ -f "${TARGET_ABS}/.harness/GOAL.md" ]; then
    _goal_state='ready'
    _next_command='harness-plan'
    _blocking_reason='PLAN.md is missing.'
  fi

  _plan_status=$(doctor_plan_status)
  case "${_plan_status:-missing}" in
    approved)
      _plan_phase='approved'
      _approval_state='ready'
      _run_state='ready'
      _next_command='harness-verify'
      _blocking_reason='VERIFY.md evidence is missing or incomplete.'
      ;;
    draft)
      _plan_phase='draft'
      _approval_state='required'
      _next_command='harness-plan'
      _blocking_reason='PLAN.md is not approved.'
      ;;
    blocked)
      _plan_phase='blocked'
      _approval_state='required'
      _next_command='harness-plan'
      _blocking_reason='PLAN.md is blocked.'
      ;;
    missing|'')
      _plan_phase='missing'
      ;;
    *)
      _plan_phase='draft'
      _approval_state='required'
      _next_command='harness-plan'
      _blocking_reason="PLAN.md approval status is ${_plan_status}."
      ;;
  esac

  _verify_status=$(doctor_verify_status)
  if [ "$_run_state" = 'ready' ]; then
    case "${_verify_status:-missing}" in
      passed)
        if doctor_verify_has_concrete_tests && doctor_verify_has_concrete_evidence; then
          _verify_phase='passed'
          _ship_state='ready'
          _next_command='harness-ship'
          _blocking_reason='No blocker recorded. Shipping summary is the next step.'
        else
          _verify_phase='blocked'
          _next_command='harness-verify'
          _blocking_reason='VERIFY.md evidence is missing or incomplete.'
        fi
        ;;
      failed)
        _verify_phase='failed'
        _ship_state='blocked'
        _next_command='harness-verify'
        _blocking_reason='VERIFY.md records failed checks.'
        ;;
      blocked)
        _verify_phase='blocked'
        _ship_state='blocked'
        _next_command='harness-verify'
        _blocking_reason='VERIFY.md is blocked pending more input or evidence.'
        ;;
      partial)
        _verify_phase='partial'
        _ship_state='blocked'
        _next_command='harness-verify'
        _blocking_reason='VERIFY.md is partial and cannot support shipping yet.'
        ;;
      pending)
        _verify_phase='blocked'
        _ship_state='blocked'
        _next_command='harness-verify'
        _blocking_reason='VERIFY.md is pending and verification evidence is not complete.'
        ;;
      missing|'')
        _verify_phase='blocked'
        _ship_state='blocked'
        _next_command='harness-verify'
        _blocking_reason='VERIFY.md evidence is missing or incomplete.'
        ;;
      *)
        _verify_phase='blocked'
        _ship_state='blocked'
        _next_command='harness-verify'
        _blocking_reason="VERIFY.md status is ${_verify_status}."
        ;;
    esac
  fi

  printf '%s\n' ''
  printf '%s\n' 'Harness workflow'
  printf '%s\n' ''
  workflow_phase_line 'Goal' "$_goal_state"
  workflow_phase_line 'Plan' "$_plan_phase"
  workflow_phase_line 'Approval' "$_approval_state"
  workflow_phase_line 'Run' "$_run_state"
  workflow_phase_line 'Verify' "$_verify_phase"
  workflow_phase_line 'Ship' "$_ship_state"
  workflow_phase_line 'Remember' "$_remember_state"
  printf '%s\n' ''
  printf '%s\n' 'Next allowed command:'
  printf '  %s\n' "$_next_command"
  printf '%s\n' ''
  printf '%s\n' 'Blocking reason:'
  printf '  %s\n' "$_blocking_reason"
}

build_exclude_block_content() {
  _paths_file="$1"
  _out="$2"
  {
    printf '%s\n' "$HARNES_IGNORE_BLOCK_START"
    while IFS= read -r _line; do
      [ -n "$_line" ] && printf '%s\n' "$_line"
    done < "$_paths_file"
    printf '%s\n' "$HARNES_IGNORE_BLOCK_END"
  } > "$_out"
}

append_or_update_info_exclude_block() {
  _exclude_file=$(git_info_exclude_path)
  _paths_file=$(mktemp "${TMPDIR:-/tmp}/harness-ignore-paths.XXXXXX")
  _block_file=$(mktemp "${TMPDIR:-/tmp}/harness-ignore-block.XXXXXX")
  collect_ignore_paths > "$_paths_file"
  build_exclude_block_content "$_paths_file" "$_block_file"

  if [ "$DRY_RUN" -eq 1 ]; then
    printf 'WOULD UPDATE .git/info/exclude\n'
    while IFS= read -r _p; do
      [ -n "$_p" ] && printf '  ignore: %s\n' "$_p"
    done < "$_paths_file"
    rm -f "$_paths_file" "$_block_file"
    return 0
  fi

  mkdir -p "${TARGET_ABS}/.git/info"
  if [ ! -f "$_exclude_file" ]; then
    cat "$_block_file" > "$_exclude_file"
    printf 'UPDATE .git/info/exclude\n'
  elif ! grep -qxF "$HARNES_IGNORE_BLOCK_START" "$_exclude_file" 2>/dev/null; then
    printf '\n' >> "$_exclude_file"
    cat "$_block_file" >> "$_exclude_file"
    printf 'UPDATE .git/info/exclude\n'
  else
    awk -v blockfile="$_block_file" '
      BEGIN {
        while ((getline line < blockfile) > 0) {
          block = block line "\n"
        }
        close(blockfile)
      }
      $0 == "# ai-engineering-harness start" { skip = 1; printf "%s", block; next }
      $0 == "# ai-engineering-harness end" { skip = 0; next }
      skip == 0 { print }
    ' "$_exclude_file" > "${_exclude_file}.tmp"
    mv "${_exclude_file}.tmp" "$_exclude_file"
    printf 'UPDATE .git/info/exclude\n'
  fi

  rm -f "$_paths_file" "$_block_file"
}

remove_info_exclude_block() {
  _exclude_file=$(git_info_exclude_path)

  if [ ! -f "$_exclude_file" ] || ! grep -qxF "$HARNES_IGNORE_BLOCK_START" "$_exclude_file" 2>/dev/null; then
    if [ "$DRY_RUN" -eq 1 ]; then
      printf 'SKIP .git/info/exclude\n'
    else
      printf 'SKIP .git/info/exclude\n'
    fi
    return 0
  fi

  if [ "$DRY_RUN" -eq 1 ]; then
    printf 'WOULD UPDATE .git/info/exclude\n'
    return 0
  fi

  awk '
    $0 == "# ai-engineering-harness start" { skip = 1; next }
    $0 == "# ai-engineering-harness end" { skip = 0; next }
    skip == 0 { print }
  ' "$_exclude_file" > "${_exclude_file}.tmp"
  mv "${_exclude_file}.tmp" "$_exclude_file"
  printf 'UPDATE .git/info/exclude\n'
}

print_manual_ignore_instructions() {
  printf '%s\n' \
    'ai-engineering-harness installer: not a Git repository (or no .git/info/exclude).' \
    '  Generated files may appear as untracked. To ignore locally, add to .git/info/exclude:' \
    '  # ai-engineering-harness start'
  collect_ignore_paths | while IFS= read -r _p; do
    [ -n "$_p" ] && printf '  %s\n' "$_p"
  done
  printf '%s\n' '  # ai-engineering-harness end'
}

apply_private_ignore() {
  if [ "$SCOPE" != project ] || [ "$VISIBILITY" != private ]; then
    return 0
  fi
  if [ "$EFFECTIVE_IGNORE_STRATEGY" != info-exclude ]; then
    return 0
  fi

  if ! is_git_repo; then
    print_manual_ignore_instructions >&2
    return 0
  fi

  printf '%s\n' '' '--- Git exclude (private) ---'
  append_or_update_info_exclude_block
  printf '%s\n' '--- Git exclude complete ---' ''
}

file_contains_harness_marker() {
  _path="$1"
  [ -f "$_path" ] || return 1
  grep -q 'ai-engineering-harness' "$_path" 2>/dev/null
}

remove_file_if_harness_owned() {
  _rel="$1"
  _ownership="${2:-always}"
  _path="${TARGET_ABS}/${_rel}"

  if [ ! -e "$_path" ]; then
    if [ "$DRY_RUN" -eq 1 ]; then
      printf 'SKIP %s\n' "$_rel"
    else
      printf 'SKIP %s\n' "$_rel"
    fi
    return 0
  fi

  case "$_ownership" in
    marker)
      if ! file_contains_harness_marker "$_path"; then
        printf 'SKIP %s (not clearly harness-owned)\n' "$_rel"
        return 0
      fi
      ;;
    claude-settings)
      printf 'SKIP %s (not clearly harness-owned)\n' "$_rel"
      return 0
      ;;
    always)
      ;;
    *)
      ;;
  esac

  if [ "$DRY_RUN" -eq 1 ]; then
    printf 'WOULD REMOVE %s\n' "$_rel"
    return 0
  fi

  if [ -d "$_path" ]; then
    rm -rf "$_path"
  else
    rm -f "$_path"
  fi
  printf 'REMOVE %s\n' "$_rel"
}

remove_dir_if_requested() {
  _rel="$1"
  _should_remove="$2"
  _path="${TARGET_ABS}/${_rel}"

  if [ "$_should_remove" -ne 1 ]; then
    if [ "$DRY_RUN" -eq 1 ]; then
      printf 'WOULD KEEP %s\n' "$_rel"
    else
      printf 'KEEP %s\n' "$_rel"
    fi
    return 0
  fi

  if [ ! -e "$_path" ]; then
    if [ "$DRY_RUN" -eq 1 ]; then
      printf 'SKIP %s\n' "$_rel"
    else
      printf 'SKIP %s\n' "$_rel"
    fi
    return 0
  fi

  if [ "$DRY_RUN" -eq 1 ]; then
    printf 'WOULD REMOVE %s\n' "$_rel"
    return 0
  fi

  rm -rf "$_path"
  printf 'REMOVE %s\n' "$_rel"
}

pick_visibility_interactive() {
  printf '%s\n' '' 'Harness files in this repo:'
  printf '%s\n' \
    '  1) Private to this checkout — add rules to .git/info/exclude (not committed)' \
    '  2) Shared with team — leave files visible in git status for commit'
  while true; do
    printf '%s' 'Select visibility [1-2]: '
    read -r choice || fail 'could not read visibility selection'
    case "$choice" in
      1) VISIBILITY=private; break ;;
      2) VISIBILITY=shared; break ;;
      *) printf '%s\n' '  Invalid choice. Enter 1-2.' ;;
    esac
  done
}

resolve_install_cache_settings() {
  if [ "$RUNTIME" = manual ] || [ "$SCOPE" = global ]; then
    INSTALL_CACHE=0
    return 0
  fi

  if [ "$NO_INSTALL_CACHE" -eq 1 ]; then
    INSTALL_CACHE=0
    return 0
  fi

  if [ "$INSTALL_CACHE" -eq 1 ]; then
    return 0
  fi

  # All project runtime-native installs need capability source (every provider).
  if [ "$SCOPE" = project ]; then
    INSTALL_CACHE=1
  fi
}

run_capability_cache_install() {
  _use_force="${1:-0}"
  if [ "$INSTALL_CACHE" -ne 1 ]; then
    return 0
  fi
  if [ "$SCOPE" != project ]; then
    return 0
  fi

  command -v node >/dev/null 2>&1 || fail "node is required but was not found on PATH"
  download_pack_root

  printf '%s\n' '' '--- Capability cache (.ai-harness/) ---'

  set -- node "$PACK_ROOT/install-cache.js" \
    --pack-root "$PACK_ROOT" \
    --target "$TARGET_ABS"
  if [ "$DRY_RUN" -eq 1 ]; then
    set -- "$@" --dry-run
  fi
  if [ "$FORCE" -eq 1 ] || [ "$_use_force" -eq 1 ]; then
    set -- "$@" --force
  fi

  "$@"
  printf '%s\n' '--- Capability cache complete ---' ''
}

resolve_git_hygiene_settings() {
  if [ "$IGNORE_STRATEGY" = gitignore ]; then
    fail '.gitignore editing is not implemented in v0.9.2 Step 1; use info-exclude or none'
  fi

  if [ "$SCOPE" = global ] || [ -z "$SCOPE" ]; then
    EFFECTIVE_IGNORE_STRATEGY=none
    return 0
  fi

  if [ -z "$VISIBILITY" ]; then
    if is_interactive; then
      pick_visibility_interactive
    else
      VISIBILITY=shared
      printf '%s\n' \
        'ai-engineering-harness installer: warning: no --visibility; defaulting to shared.' \
        '  Generated files may appear in git status. Use --visibility private for .git/info/exclude.' >&2
    fi
  fi

  if ! validate_visibility "$VISIBILITY"; then
    fail "invalid --visibility: $VISIBILITY (try private or shared)"
  fi

  if [ "$VISIBILITY" = shared ]; then
    EFFECTIVE_IGNORE_STRATEGY=none
    return 0
  fi

  case "$IGNORE_STRATEGY" in
    auto|'')
      EFFECTIVE_IGNORE_STRATEGY=info-exclude
      ;;
    info-exclude|none)
      EFFECTIVE_IGNORE_STRATEGY=$IGNORE_STRATEGY
      ;;
    *)
      fail "invalid --ignore-strategy: $IGNORE_STRATEGY (try info-exclude, none, or auto)"
      ;;
  esac
}

runtime_label() {
  case "$1" in
    claude) printf '%s' 'Claude Code' ;;
    codex) printf '%s' 'Codex CLI' ;;
    cursor) printf '%s' 'Cursor' ;;
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
    '  1) Claude Code (primary)' \
    '  2) Cursor' \
    '  3) Codex CLI (experimental)' \
    '  4) Gemini CLI (experimental)' \
    '  5) Generic AGENTS.md bootstrap' \
    '  6) All supported' \
    '  7) Manual fallback / root copy'
  while true; do
    printf '%s' 'Select runtime [1-7]: '
    read -r choice || fail 'could not read runtime selection'
    case "$choice" in
      1) RUNTIME=claude; break ;;
      2) RUNTIME=cursor; break ;;
      3) RUNTIME=codex; break ;;
      4) RUNTIME=gemini; break ;;
      5) RUNTIME=generic; break ;;
      6) RUNTIME=all; break ;;
      7) RUNTIME=manual; break ;;
      *) printf '%s\n' '  Invalid choice. Enter 1-7.' ;;
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

select_runtime_from_list() {
  _list="$1"
  _context="$2"
  _count=$(runtime_list_count "$_list")

  if [ "$_count" -eq 0 ]; then
    return 1
  fi

  if [ "$_count" -eq 1 ]; then
    RUNTIME=$(printf '%s\n' "$_list" | awk 'NF { print; exit }')
    return 0
  fi

  if is_interactive; then
    printf '%s\n' "Detected multiple runtimes for ${_context}:"
    printf '%s\n' "$_list" | awk 'NF { printf "  - %s\n", $0 }'
    printf '%s' 'Use all detected runtimes? [Y/n]: '
    read -r _ans || fail 'could not read runtime selection'
    case "$_ans" in
      n|N|no|No|NO)
        fail "multiple runtimes detected for ${_context}; rerun with --runtime"
        ;;
      *)
        RUNTIME=all
        return 0
        ;;
    esac
  fi

  RUNTIME=all
  return 0
}

apply_install_defaults() {
  if [ -z "$SCOPE" ]; then
    SCOPE=project
  fi

  if [ -z "$RUNTIME" ]; then
    _providers=$(detect_available_provider)
    if ! select_runtime_from_list "$_providers" install; then
      if is_interactive; then
        pick_runtime_interactive
      else
        fail "could not detect provider for install; pass --runtime explicitly (e.g. claude, cursor, codex, gemini, generic)"
      fi
    fi
  fi

  if [ "$SCOPE" = project ] && [ -z "$VISIBILITY" ]; then
    VISIBILITY=private
  fi

  if [ "$SCOPE" = project ] && [ "$VISIBILITY" = private ] && { [ -z "$IGNORE_STRATEGY" ] || [ "$IGNORE_STRATEGY" = auto ]; }; then
    IGNORE_STRATEGY=info-exclude
  fi

  if [ "$SCOPE" = project ] && [ "$INIT_HARNESS" -eq 0 ] && [ ! -d "${TARGET_ABS}/.harness" ]; then
    INIT_HARNESS=1
  fi
}

apply_update_defaults() {
  if [ -z "$SCOPE" ]; then
    SCOPE=project
  fi

  if [ -z "$RUNTIME" ]; then
    _runtimes=$(detect_runtimes_from_target)
    if ! select_runtime_from_list "$_runtimes" update; then
      fail "could not detect installed runtime for update; pass --runtime explicitly"
    fi
  fi
}

apply_uninstall_defaults() {
  if [ "$FULL_UNINSTALL" -eq 1 ]; then
    RUNTIME=all
    UNINSTALL_REMOVE_CACHE=1
    UNINSTALL_REMOVE_STATE=1
  fi

  if [ -z "$SCOPE" ]; then
    SCOPE=project
  fi

  if [ -z "$RUNTIME" ]; then
    _runtimes=$(detect_runtimes_from_target)
    if ! select_runtime_from_list "$_runtimes" uninstall; then
      fail "could not detect installed runtime for uninstall; pass --runtime explicitly"
    fi
  fi
}

maybe_prompt_init_harness() {
  if [ "$VERB" != install ]; then
    return 0
  fi
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
    '  - Files: HARNESS.md, TEAM.md, SKILLS.md, WORKFLOW.md, GATES.md, MEMORY.md, DECISIONS.md, HAZARDS.md, INDEX.md, goals/.gitkeep' \
    '  - Does not create runtime bootstrap files (e.g. AGENTS.md); runtime or manual fallback owns those' \
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
  if [ "$SCOPE" = project ] && [ "$RUNTIME" != manual ]; then
    printf '  install-cache: %s\n' "$([ "$INSTALL_CACHE" -eq 1 ] && printf yes || printf no)"
  fi
  if [ "$SCOPE" = project ]; then
    if [ -n "$VISIBILITY" ]; then
      printf '  visibility:    %s\n' "$VISIBILITY"
    else
      printf '  visibility:    (not set)\n'
    fi
    printf '  ignore:        %s\n' "$EFFECTIVE_IGNORE_STRATEGY"
    if [ "$VISIBILITY" = private ] && [ "$EFFECTIVE_IGNORE_STRATEGY" = info-exclude ]; then
      if is_git_repo; then
        printf '  exclude file:  %s\n' "$(git_info_exclude_path)"
      else
        printf '  exclude file:  (none — not a Git repo; manual instructions only)\n'
      fi
    fi
  fi
  printf '  dry-run:       %s\n' "$([ "$DRY_RUN" -eq 1 ] && printf yes || printf no)"
  printf '  force:         %s\n' "$([ "$FORCE" -eq 1 ] && printf yes || printf no)"
  printf '%s\n' '' 'What will happen:'
  if [ "$SCOPE" = project ] && [ "$INSTALL_CACHE" -eq 1 ]; then
    printf '%s\n' '  - Install capability pack under .ai-harness/ (commands, skills, workflows, …)'
  fi
  if [ "$SCOPE" = project ] && [ "$VISIBILITY" = private ] && [ "$EFFECTIVE_IGNORE_STRATEGY" = info-exclude ]; then
    if is_git_repo; then
      printf '%s\n' '  - Update .git/info/exclude with harness paths (private/local; not committed)'
    else
      printf '%s\n' '  - Print manual .git/info/exclude instructions (target is not a Git repo)'
    fi
  fi
  if [ "$SCOPE" = project ] && [ "$VISIBILITY" = shared ]; then
    printf '%s\n' '  - Generated files remain visible in git status (team-shared)'
  fi
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
      '  - Writes only runtime paths (.cursor/rules, .claude/, AGENTS.md, …)' \
      '  - Does not copy commands/, skills/, workflows/ to product repo root' \
      '  - Use --runtime manual for legacy full root copy'
  fi
  printf '%s\n' '---'
}

print_uninstall_plan() {
  printf '%s\n' '' '--- Uninstall plan ---'
  printf '  runtime:       %s (%s)\n' "$RUNTIME" "$(runtime_label "$RUNTIME")"
  printf '  scope:         %s\n' "$SCOPE"
  printf '  target:        %s\n' "$TARGET_ABS"
  printf '  remove-cache:  %s\n' "$([ "$UNINSTALL_REMOVE_CACHE" -eq 1 ] && printf yes || printf no)"
  printf '  remove-state:  %s\n' "$([ "$UNINSTALL_REMOVE_STATE" -eq 1 ] && printf yes || printf no)"
  printf '  dry-run:       %s\n' "$([ "$DRY_RUN" -eq 1 ] && printf yes || printf no)"
  printf '%s\n' '' 'What will happen:'
  printf '%s\n' "  - Remove runtime entrypoint paths for '$RUNTIME' when clearly harness-owned"
  printf '%s\n' "  - $([ "$UNINSTALL_REMOVE_CACHE" -eq 1 ] && printf 'Remove' || printf 'Keep') .ai-harness/"
  printf '%s\n' "  - $([ "$UNINSTALL_REMOVE_STATE" -eq 1 ] && printf 'Remove' || printf 'Keep') .harness/"
  if is_git_repo; then
    printf '%s\n' '  - Remove ai-engineering-harness block from .git/info/exclude when present'
  else
    printf '%s\n' '  - No .git/info/exclude cleanup (target is not a Git repo)'
  fi
  printf '%s\n' '  - Does not edit .gitignore'
  printf '%s\n' '  - Does not remove opencode.json'
  printf '%s\n' '---'
}

resolve_update_git_hygiene_settings() {
  INSTALL_CACHE=1

  if [ -z "$VISIBILITY" ]; then
    EFFECTIVE_IGNORE_STRATEGY=none
    return 0
  fi

  resolve_git_hygiene_settings
}

print_update_plan() {
  printf '%s\n' '' '--- Update plan ---'
  printf '  runtime:       %s (%s)\n' "$RUNTIME" "$(runtime_label "$RUNTIME")"
  printf '  scope:         %s\n' "$SCOPE"
  printf '  target:        %s\n' "$TARGET_ABS"
  printf '  ref:           %s\n' "$REF"
  if [ -n "$VISIBILITY" ]; then
    printf '  visibility:    %s\n' "$VISIBILITY"
    printf '  ignore:        %s\n' "$EFFECTIVE_IGNORE_STRATEGY"
  else
    printf '  visibility:    (unchanged)\n'
  fi
  printf '  dry-run:       %s\n' "$([ "$DRY_RUN" -eq 1 ] && printf yes || printf no)"
  printf '%s\n' '' 'What will happen:'
  printf '%s\n' '  - Refresh .ai-harness/ capability cache with overwrite semantics'
  printf '%s\n' "  - Refresh runtime entrypoints for '$RUNTIME' with overwrite semantics"
  printf '%s\n' '  - Preserve .harness/ project state'
  if [ -n "$VISIBILITY" ] && [ "$VISIBILITY" = private ] && [ "$EFFECTIVE_IGNORE_STRATEGY" = info-exclude ]; then
    if is_git_repo; then
      printf '%s\n' '  - Refresh .git/info/exclude harness block for private mode'
    else
      printf '%s\n' '  - Print manual .git/info/exclude instructions (target is not a Git repo)'
    fi
  else
    printf '%s\n' '  - Does not change ignore settings unless --visibility private is passed'
  fi
  printf '%s\n' '  - Does not update .harness/'
  printf '%s\n' '---'
}

run_uninstall() {
  if [ "$SCOPE" = global ]; then
    if [ "$DRY_RUN" -eq 1 ]; then
      printf '%s\n' '' '--- Uninstall ---'
      printf '%s\n' 'Global uninstall is planned but not implemented in this step.'
      return 0
    fi
    fail 'Global uninstall is planned but not implemented in this step.'
  fi

  printf '%s\n' '' '--- Uninstall ---'
  runtime_paths_for_uninstall "$RUNTIME" | while IFS= read -r _rel; do
    [ -n "$_rel" ] || continue
    case "$_rel" in
      AGENTS.md)
        remove_file_if_harness_owned "$_rel" marker
        ;;
      .claude/settings.json)
        remove_file_if_harness_owned "$_rel" claude-settings
        ;;
      *)
        remove_file_if_harness_owned "$_rel" always
        ;;
    esac
  done

  remove_dir_if_requested '.ai-harness' "$UNINSTALL_REMOVE_CACHE"
  remove_dir_if_requested '.harness' "$UNINSTALL_REMOVE_STATE"

  if is_git_repo; then
    remove_info_exclude_block
  else
    printf '%s\n' 'SKIP .git/info/exclude'
  fi

  printf '%s\n' '--- Uninstall complete ---'
}

run_update() {
  if [ "$RUNTIME" = manual ]; then
    fail 'Manual fallback update is not supported. Re-run install instead.'
  fi

  if [ "$SCOPE" = global ]; then
    if [ "$DRY_RUN" -eq 1 ]; then
      printf '%s\n' '' '--- Update ---'
      printf '%s\n' 'Global update is planned but not implemented in this step.'
      return 0
    fi
    fail 'Global update is planned but not implemented in this step.'
  fi

  if [ -n "$VISIBILITY" ] && [ "$VISIBILITY" = private ] && [ "$EFFECTIVE_IGNORE_STRATEGY" = info-exclude ]; then
    apply_private_ignore
  fi

  run_capability_cache_install 1
  printf '%s\n' '' '--- Runtime-native update ---'
  run_runtime_native_install 1
}

print_status() {
  _detected=$(detect_runtimes_from_target)
  _runtime_display=$(printf '%s\n' "$_detected" | awk 'NF { print }' | paste -sd ',' -)
  if [ -z "$_runtime_display" ]; then
    _runtime_display='none'
  fi

  if is_git_repo; then
    _git_repo=yes
  else
    _git_repo=no
  fi

  if has_harness_exclude_block; then
    _exclude_block=yes
  else
    _exclude_block=no
  fi

  printf '%s\n' 'ai-engineering-harness status'
  printf '  target:                %s\n' "$TARGET_ABS"
  printf '  git repo:              %s\n' "$_git_repo"
  printf '  detected runtimes:     %s\n' "$_runtime_display"
  printf '  .ai-harness exists:    %s\n' "$([ -d "${TARGET_ABS}/.ai-harness" ] && printf yes || printf no)"
  printf '  .harness exists:       %s\n' "$([ -d "${TARGET_ABS}/.harness" ] && printf yes || printf no)"
  printf '  exclude block exists:  %s\n' "$_exclude_block"
  printf '  command namespace:     harness\n'
  if [ -d "${TARGET_ABS}/.ai-harness/runtime-commands" ]; then
    printf '  runtime-commands:      yes\n'
  else
    printf '  runtime-commands:      no\n'
  fi
  if [ -f "${TARGET_ABS}/.ai-harness/manifest.json" ]; then
    printf '  manifest.json:         yes\n'
  else
    printf '  manifest.json:         no\n'
  fi
  _provider_cmds=no
  if [ -f "${TARGET_ABS}/.claude/commands/harness-plan.md" ] \
    || [ -f "${TARGET_ABS}/.opencode/commands/harness-plan.md" ] \
    || [ -f "${TARGET_ABS}/.cursor/rules/ai-engineering-harness-commands.mdc" ]; then
    _provider_cmds=yes
  fi
  printf '  provider commands:     %s\n' "$_provider_cmds"
  if [ -d "${TARGET_ABS}/.harness" ]; then
    print_workflow_summary
  fi
  _harness_root=$(cd "$(dirname "$0")" && pwd)
  if command -v node >/dev/null 2>&1 && [ -f "${_harness_root}/lib/command-surface-report.js" ]; then
    node "${_harness_root}/lib/command-surface-report.js" status "${TARGET_ABS}" 2>/dev/null || true
  fi
}

run_doctor() {
  _fail=0
  _detected=$(detect_runtimes_from_target)
  _count=$(runtime_list_count "$_detected")

  printf '%s\n' 'ai-engineering-harness doctor'

  if command -v node >/dev/null 2>&1; then
    printf '%s\n' 'PASS node available'
  else
    printf '%s\n' 'FAIL node missing'
    _fail=1
  fi

  if is_git_repo; then
    printf '%s\n' 'PASS target is a Git repo'
  else
    printf '%s\n' 'FAIL target is not a Git repo — run git init or run inside a cloned repository'
    _fail=1
  fi

  if [ -d "${TARGET_ABS}/.ai-harness" ]; then
    printf '%s\n' 'PASS .ai-harness exists'
  else
    printf '%s\n' 'FAIL .ai-harness missing'
    _fail=1
  fi

  if [ -d "${TARGET_ABS}/.harness" ]; then
    printf '%s\n' 'PASS .harness exists'
  else
    printf '%s\n' 'FAIL .harness missing'
    _fail=1
  fi

  if [ "$_count" -eq 0 ]; then
    printf '%s\n' 'FAIL no runtime entrypoint detected'
    _fail=1
  else
    printf '%s\n' 'PASS runtime entrypoint detected'
    _doctor_tmp=$(mktemp "${TMPDIR:-/tmp}/harness-doctor-runtimes.XXXXXX")
    printf '%s\n' "$_detected" > "$_doctor_tmp"
    while IFS= read -r _rt; do
      [ -n "$_rt" ] || continue
      if runtime_references_cache "$_rt"; then
        printf 'PASS %s entrypoint references .ai-harness/\n' "$_rt"
      else
        printf 'FAIL %s entrypoint does not reference .ai-harness/\n' "$_rt"
        _fail=1
      fi
    done < "$_doctor_tmp"
    rm -f "$_doctor_tmp"
  fi

  if has_harness_exclude_block; then
    printf '%s\n' 'PASS .git/info/exclude harness block exists'
  else
    printf '%s\n' 'WARN .git/info/exclude harness block missing'
  fi

  if [ -d "${TARGET_ABS}/.ai-harness/runtime-commands" ]; then
    printf '%s\n' 'PASS .ai-harness/runtime-commands exists'
  else
    printf '%s\n' 'FAIL .ai-harness/runtime-commands missing'
    _fail=1
  fi

  if [ -f "${TARGET_ABS}/.ai-harness/activation.md" ]; then
    printf '%s\n' 'PASS .ai-harness/activation.md exists'
  else
    printf '%s\n' 'FAIL .ai-harness/activation.md missing'
    _fail=1
  fi

  if [ -f "${TARGET_ABS}/.ai-harness/runtime-commands/harness-plan.md" ]; then
    if grep -q '.ai-harness/activation.md' "${TARGET_ABS}/.ai-harness/runtime-commands/harness-plan.md" 2>/dev/null \
      && grep -q '.ai-harness/commands/harness-plan.md' "${TARGET_ABS}/.ai-harness/runtime-commands/harness-plan.md" 2>/dev/null; then
      printf '%s\n' 'PASS harness-plan local catalog references activation and source command'
    else
      printf '%s\n' 'FAIL harness-plan local catalog incomplete'
      _fail=1
    fi
  fi

  if [ -d "${TARGET_ABS}/.harness" ]; then
    print_workflow_summary

    _plan_status=$(doctor_plan_status)
    case "${_plan_status:-missing}" in
      approved)
        printf '%s\n' 'PASS .harness/PLAN.md approval status approved'
        ;;
      draft|blocked)
        printf 'WARN .harness/PLAN.md approval status is %s\n' "$_plan_status"
        ;;
      missing|'')
        printf '%s\n' 'WARN .harness/PLAN.md missing Approval Status block or status field'
        ;;
      *)
        printf 'WARN .harness/PLAN.md approval status is %s\n' "$_plan_status"
        ;;
    esac

    _verify_status=$(doctor_verify_status)
    case "${_verify_status:-missing}" in
      passed|failed|blocked|partial)
        if doctor_verify_has_concrete_tests && doctor_verify_has_concrete_evidence; then
          printf '%s\n' 'PASS .harness/VERIFY.md contains verification evidence'
        else
          printf '%s\n' 'FAIL .harness/VERIFY.md claims completed verification without concrete evidence'
          _fail=1
        fi
        ;;
      pending)
        if doctor_verify_has_concrete_tests || doctor_verify_has_concrete_evidence; then
          printf '%s\n' 'WARN .harness/VERIFY.md status is pending despite recorded evidence'
        else
          printf '%s\n' 'WARN .harness/VERIFY.md status is pending and verification evidence is not recorded yet'
        fi
        ;;
      missing|'')
        if [ -f "${TARGET_ABS}/.harness/VERIFY.md" ]; then
          printf '%s\n' 'FAIL .harness/VERIFY.md status missing or invalid'
          _fail=1
        else
          printf '%s\n' 'WARN .harness/VERIFY.md missing'
        fi
        ;;
      *)
        printf 'FAIL .harness/VERIFY.md status is %s and is not recognized\n' "$_verify_status"
        _fail=1
        ;;
    esac

    _missing_typed_memory=''
    for _memory_artifact in DECISIONS.md HAZARDS.md INDEX.md; do
      if [ ! -f "${TARGET_ABS}/.harness/${_memory_artifact}" ]; then
        if [ -n "$_missing_typed_memory" ]; then
          _missing_typed_memory="${_missing_typed_memory}, ${_memory_artifact}"
        else
          _missing_typed_memory="${_memory_artifact}"
        fi
      fi
    done
    if [ -n "$_missing_typed_memory" ]; then
      printf 'WARN typed memory artifacts missing: %s\n' "$_missing_typed_memory"
    else
      printf '%s\n' 'PASS typed memory artifacts present'
    fi
  fi

  _harness_root=$(cd "$(dirname "$0")" && pwd)
  if command -v node >/dev/null 2>&1 && [ -f "${_harness_root}/lib/command-surface-report.js" ]; then
    _rt_args=""
    _doctor_rt_tmp=$(mktemp "${TMPDIR:-/tmp}/harness-doc-rt.XXXXXX")
    printf '%s\n' "$_detected" | awk 'NF { print }' > "$_doctor_rt_tmp"
    while IFS= read -r _rt; do
      [ -n "$_rt" ] || continue
      _rt_args="${_rt_args} ${_rt}"
    done < "$_doctor_rt_tmp"
    rm -f "$_doctor_rt_tmp"
    # shellcheck disable=SC2086
    node "${_harness_root}/lib/command-surface-report.js" doctor "${TARGET_ABS}" ${_rt_args} 2>/dev/null \
      | while IFS= read -r _line; do
        case "$_line" in
          FAIL*) _fail=1 ;;
        esac
        printf '%s\n' "$_line"
      done || true
  fi

  if [ "$_fail" -ne 0 ]; then
    return 1
  fi
  return 0
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

harness_skeleton_decisions_md() {
  cat <<'EOF'
# Decisions

> Store durable, project-level decisions here. Do not include credentials, tokens, customer data, or private business data.

## How To Use This Artifact

- Record only decisions that future planning, implementation, or verification work should recall.
- Prefer one entry per decision.
- Link related hazards, verification expectations, or follow-up work when relevant.

## Entry Template

### DECISION-000

- Date:
- Status: proposed | accepted | superseded
- Area:
- Decision:
- Why this decision exists:
- What changes if revisited:
- Related hazards:
- Verification impact:
- Follow-up:
EOF
}

harness_skeleton_hazards_md() {
  cat <<'EOF'
# Hazards

> Store durable, project-level hazards here. Do not include credentials, tokens, customer data, or private business data.

## How To Use This Artifact

- Put recurring failure modes, fragile integrations, and regression-prone areas here.
- Keep entries specific enough to change planning or verification behavior.
- Prefer confirmed hazards over vague worries.

## Entry Template

### HAZARD-000

- Date:
- Severity: low | medium | high
- Area:
- Trigger:
- Failure mode:
- Early warning signs:
- Mitigation:
- Verification focus:
- Related decisions:
- Notes:
EOF
}

harness_skeleton_index_md() {
  cat <<'EOF'
# Memory Index

> Index reusable project memory here. Do not include credentials, tokens, customer data, or private business data.

## How To Use This Artifact

- Capture reusable commands, verification recipes, and lookup pointers that future work can apply safely.
- Use this file as the first stop for repeatable checks before re-deriving commands from scratch.
- Link out to DECISIONS.md, HAZARDS.md, goal artifacts, or repo docs when that is more durable than copying content.

## Reusable Commands

| Name | Command | When To Use | Notes |
| --- | --- | --- | --- |
|  |  |  |  |

## Verification Recipes

| Area | Check | Evidence To Capture | Notes |
| --- | --- | --- | --- |
|  |  |  |  |

## Useful References

| Topic | Artifact Or Doc | Why It Matters |
| --- | --- | --- |
|  |  |  |
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
  write_target_file '.harness/DECISIONS.md' "$(harness_skeleton_decisions_md)"
  write_target_file '.harness/HAZARDS.md' "$(harness_skeleton_hazards_md)"
  write_target_file '.harness/INDEX.md' "$(harness_skeleton_index_md)"
  write_target_file '.harness/goals/.gitkeep' ''
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
  _use_force="${1:-0}"
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
  if [ "$FORCE" -eq 1 ] || [ "$_use_force" -eq 1 ]; then
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
    install|uninstall|update|status|doctor|help)
      VERB="$1"
      shift
      ;;
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
    --install-cache)
      INSTALL_CACHE=1
      shift
      ;;
    --no-install-cache)
      NO_INSTALL_CACHE=1
      shift
      ;;
    --remove-cache)
      UNINSTALL_REMOVE_CACHE=1
      shift
      ;;
    --keep-cache)
      UNINSTALL_REMOVE_CACHE=0
      shift
      ;;
    --remove-state)
      UNINSTALL_REMOVE_STATE=1
      shift
      ;;
    --keep-state)
      UNINSTALL_REMOVE_STATE=0
      shift
      ;;
    --all)
      FULL_UNINSTALL=1
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
    --visibility)
      [ "$#" -ge 2 ] || fail "missing value for --visibility"
      VISIBILITY="$2"
      shift 2
      ;;
    --ignore-strategy)
      [ "$#" -ge 2 ] || fail "missing value for --ignore-strategy"
      IGNORE_STRATEGY="$2"
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

case "$VERB" in
  help)
    usage
    exit 0
    ;;
  uninstall|install|update|status|doctor)
    ;;
  *)
    fail "unknown command: $VERB (try install, --help)"
    ;;
esac

if [ -n "$IGNORE_STRATEGY" ] && ! validate_ignore_strategy "$IGNORE_STRATEGY"; then
  fail "invalid --ignore-strategy: $IGNORE_STRATEGY (try info-exclude, none, or auto)"
fi

if [ -n "$VISIBILITY" ] && ! validate_visibility "$VISIBILITY"; then
  fail "invalid --visibility: $VISIBILITY (try private or shared)"
fi

if [ -n "$RUNTIME" ] && ! validate_runtime "$RUNTIME"; then
  fail "invalid --runtime: $RUNTIME (try claude, codex, cursor, gemini, generic, all, manual; opencode removed v0.11)"
fi

if [ -n "$SCOPE" ] && ! validate_scope "$SCOPE"; then
  fail "invalid --scope: $SCOPE (try global or project)"
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

case "$VERB" in
  install)
    apply_install_defaults
    ;;
  update)
    apply_update_defaults
    ;;
  uninstall)
    apply_uninstall_defaults
    ;;
  status|doctor)
    if [ -z "$SCOPE" ]; then
      SCOPE=project
    fi
    if [ -z "$RUNTIME" ]; then
      _runtimes=$(detect_runtimes_from_target)
      select_runtime_from_list "$_runtimes" "$VERB" >/dev/null 2>&1 || true
    fi
    ;;
esac

if [ "$SCOPE" = global ] && [ "$INIT_HARNESS" -eq 1 ]; then
  fail 'Global install cannot create shared .harness state. Run project install inside each repo.'
fi

maybe_prompt_init_harness
printf '%s\n' 'ai-engineering-harness installer'

if [ "$VERB" = status ]; then
  print_status
  exit 0
fi

if [ "$VERB" = doctor ]; then
  run_doctor
  exit $?
fi

if [ "$VERB" = uninstall ]; then
  if [ "$INIT_HARNESS" -eq 1 ]; then
    fail '--init-harness is only valid for install'
  fi
  if [ "$INSTALL_CACHE" -eq 1 ] || [ "$NO_INSTALL_CACHE" -eq 1 ]; then
    fail '--install-cache and --no-install-cache are only valid for install'
  fi
  print_uninstall_plan
  confirm_plan
  run_uninstall
  if [ "$DRY_RUN" -eq 1 ]; then
    printf '%s\n' '' "Dry-run complete for uninstall '$RUNTIME'."
  else
    printf '%s\n' '' "Runtime '$RUNTIME' uninstall finished."
  fi
  exit 0
fi

if [ "$VERB" = update ]; then
  if [ "$FULL_UNINSTALL" -eq 1 ]; then
    fail '--all is only valid for uninstall'
  fi
  if [ "$INIT_HARNESS" -eq 1 ]; then
    fail '--init-harness is only valid for install'
  fi
  if [ "$UNINSTALL_REMOVE_CACHE" -eq 1 ] || [ "$UNINSTALL_REMOVE_STATE" -eq 1 ]; then
    fail '--remove-cache and --remove-state are only valid for uninstall'
  fi
  if [ "$NO_INSTALL_CACHE" -eq 1 ]; then
    fail '--no-install-cache is not supported for update'
  fi
  resolve_update_git_hygiene_settings
  print_update_plan
  confirm_plan
  run_update
  if [ "$DRY_RUN" -eq 1 ]; then
    printf '%s\n' '' "Dry-run complete for update '$RUNTIME'."
  else
    printf '%s\n' '' "Runtime '$RUNTIME' update finished."
  fi
  exit 0
fi

if [ "$VERB" = install ] && [ "$FULL_UNINSTALL" -eq 1 ]; then
  fail '--all is only valid for uninstall'
fi

resolve_git_hygiene_settings
resolve_install_cache_settings

print_install_plan
confirm_plan

apply_private_ignore
run_capability_cache_install

if [ "$RUNTIME" != manual ]; then
  if [ -z "$SCOPE" ] && [ "$RUNTIME" != all ]; then
    fail "missing --scope for runtime '$RUNTIME'"
  fi
  if [ "$RUNTIME" = all ] && [ -z "$SCOPE" ]; then
    SCOPE=project
  fi
  if [ "$INIT_HARNESS" -eq 1 ]; then
    if [ "$SCOPE" = global ]; then
      fail 'Global install cannot create shared .harness state. Run project install inside each repo.'
    fi
    init_harness_profile
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

if [ "$INIT_HARNESS" -eq 1 ]; then
  init_harness_profile
fi
