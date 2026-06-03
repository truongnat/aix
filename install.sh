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
INSTALL_CACHE=0
NO_INSTALL_CACHE=0
YES=0
VERB=install
VISIBILITY=""
IGNORE_STRATEGY=auto
EFFECTIVE_IGNORE_STRATEGY=none
UNINSTALL_REMOVE_CACHE=0
UNINSTALL_REMOVE_STATE=0

HARNES_IGNORE_BLOCK_START='# ai-engineering-harness start'
HARNES_IGNORE_BLOCK_END='# ai-engineering-harness end'

usage() {
  cat <<'EOF'
ai-engineering-harness installer

Usage:
  install.sh [install] [options]
  install.sh install [options]
  install.sh uninstall [options]

Options:
  --target <path>       Target repository (default: current directory)
  --runtime <name>      claude | codex | cursor | gemini | opencode | generic | all | manual
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
  --legacy-root         Alias for --runtime manual (root copy fallback)
  --dry-run             Show plan or preview without writing
  --force               Overwrite existing .harness/ files; runtime/manual may overwrite their files
  --ref <git-ref>       GitHub ref to install (branch or tag, default: main)
  --yes                 Skip interactive confirmation
  --help                Show this help

Git hygiene (v0.9.2): project + --visibility private writes .git/info/exclude (not .gitignore).
Project + --visibility shared leaves generated files visible in git status.

Examples:
  install.sh install --runtime cursor --scope project --visibility private --init-harness --yes
  install.sh uninstall --runtime cursor --scope project --yes
  install.sh uninstall --runtime cursor --scope project --remove-cache --remove-state --yes
  install.sh --runtime claude --scope project --init-harness --dry-run --yes
  install.sh --runtime manual --target . --init-harness --dry-run

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
    claude|codex|cursor|gemini|opencode|generic|all|manual) return 0 ;;
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

is_git_repo() {
  [ -d "${TARGET_ABS}/.git" ] || [ -f "${TARGET_ABS}/.git" ]
}

git_info_exclude_path() {
  printf '%s' "${TARGET_ABS}/.git/info/exclude"
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
      ;;
    claude)
      printf '%s\n' '.claude/CLAUDE.md' '.claude/settings.json'
      ;;
    gemini)
      printf '%s\n' '.gemini/extensions/ai-engineering-harness/'
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
        '.claude/CLAUDE.md' \
        '.claude/settings.json' \
        '.gemini/extensions/ai-engineering-harness/' \
        '.opencode/plugins/ai-engineering-harness.js' \
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
      ;;
    claude)
      printf '%s\n' '.claude/CLAUDE.md' '.claude/settings.json'
      ;;
    gemini)
      printf '%s\n' '.gemini/extensions/ai-engineering-harness/'
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
        '.claude/CLAUDE.md' \
        '.claude/settings.json' \
        '.gemini/extensions/ai-engineering-harness/' \
        '.opencode/plugins/ai-engineering-harness.js' \
        'AGENTS.md'
      ;;
    *)
      ;;
  esac
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
  if [ "$FORCE" -eq 1 ]; then
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
      '  - Writes only runtime paths (.cursor/rules, .opencode/plugins, .claude/, AGENTS.md, …)' \
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

init_harness_profile() {
  printf '%s\n' '' '--- .harness/ init ---'
  write_target_file '.harness/HARNESS.md' "$(harness_skeleton_harness_md)"
  write_target_file '.harness/TEAM.md' "$(harness_skeleton_team_md)"
  write_target_file '.harness/SKILLS.md' "$(harness_skeleton_skills_md)"
  write_target_file '.harness/WORKFLOW.md' "$(harness_skeleton_workflow_md)"
  write_target_file '.harness/GATES.md' "$(harness_skeleton_gates_md)"
  write_target_file '.harness/MEMORY.md' "$(harness_skeleton_memory_md)"
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
    install|uninstall|update|help)
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
  update)
    fail "update is not implemented in v0.9.2 Step 3"
    ;;
  uninstall|install)
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
