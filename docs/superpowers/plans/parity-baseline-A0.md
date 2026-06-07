# Parity Baseline A0 — Pre-Migration Evidence

**Date captured:** 2026-06-07
**Branch:** main
**Commit at capture:** `4bc04f6` (chore(build): untrack compiled lib/workers .js, add prepack build, expand policy tests)
**Purpose:** Reference baseline for behavioral parity verification before and after the shell-to-TypeScript migration. Every `/tmp/parity-*-before.txt` file produced here must be diffed against the equivalent post-migration outputs to confirm no regressions.

---

## (a) /tmp files created

| File | What it captures |
|------|-----------------|
| `/tmp/parity-before.txt` | Full output of `node --test test/run-tests.js` — all unit/integration test results before any migration work |
| `/tmp/parity-install-before.txt` | Tree of a freshly-initialised temp git repo after `install --provider claude` + `install --provider cursor`, plus the full contents of `.git/info/exclude` |
| `/tmp/parity-status-before.txt` | Output of `status --target <temp-repo>` immediately after both providers installed |
| `/tmp/parity-doctor-before.txt` | Output of `doctor --target <temp-repo>` immediately after both providers installed |
| `/tmp/parity-uninstall-before.txt` | Output of `uninstall --provider claude --yes --target <temp-repo>` |

**Note:** `/tmp` is ephemeral. The full content of the most significant files is reproduced verbatim in sections (c) and (d) below so the committed document is self-contained.

---

## (b) Test result summary (Step 2)

Command: `node --test test/run-tests.js 2>&1 | tee /tmp/parity-before.txt`

```
ℹ tests 47
ℹ suites 11
ℹ pass 47
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 14301.628834
```

**Result: 47/47 PASS, 0 FAIL.**

Suites passing:
- Validation API (6 tests)
- Tool Discovery & Routing (4 tests)
- Session Memory & Documentation (5 tests)
- Workflow Command Documentation (6 tests)
- Installation & Packaging (4 tests)
- Delegated Workers (5 tests)
- Provider Rules & Adapters (5 tests)
- Provider Command Support (1 test)
- Hooks & Skills Layer (4 tests)
- Daily Dev Report Layer (3 tests)
- Session Start Protocol (4 tests)

---

## (c) Install tree and exclude block

Contents of `/tmp/parity-install-before.txt` (captured after `install --provider claude` then `install --provider cursor` on a fresh `mktemp -d` git repo, before any uninstall):

```
=== tree ===
.
.git
.harness
.harness/DECISIONS.md
.harness/GATES.md
.harness/HARNESS.md
.harness/HAZARDS.md
.harness/INDEX.md
.harness/MEMORY.md
.harness/SKILLS.md
.harness/TEAM.md
.harness/WORKFLOW.md
.harness/goals
.harness/goals/.gitkeep
=== exclude ===
# git ls-files --others --exclude-from=.git/info/exclude
# Lines that start with '#' are comments.
# For a project mostly in C, the following would be a good set of
# exclude patterns (uncomment them if you want to use them):
# *.[oa]
# *~

# ai-engineering-harness start
.cursor/rules/ai-engineering-harness.mdc
.cursor/rules/ai-engineering-harness-commands.mdc
.ai-harness/
# ai-engineering-harness end
```

### Anomaly recorded (pre-existing, not introduced by this task)

The install CLI plan output announces creation of `.ai-harness/`, `.claude/CLAUDE.md`, `.claude/settings.json`, `.claude/commands/`, and `.cursor/rules/` files. However, the actual disk state after install shows **only `.harness/` is created**. The `.ai-harness/` capability cache and runtime-native provider files (`.claude/`, `.cursor/`) are **not written to disk**.

This is confirmed by direct invocation of `aih.sh` as well — the `--- Capability cache (.ai-harness/) ---` and `--- Runtime-native install ---` sections in `aih.sh` output produce no files. The exclude block IS written correctly, and `.harness/` IS initialised on the first claude install.

This gap is the **pre-migration baseline truth**: the install command's UX plan diverges from actual file output. Post-migration must reproduce exactly this behaviour (not the announced plan).

---

## (d) Status and doctor output

### `status` output (`/tmp/parity-status-before.txt`)

```

ai-engineering-harness status

Target
  /var/folders/bh/lc9yszwj2vg5gpqn_8g5n60h0000gn/T/tmp.deZVG3Qq4g

Project
  Git repo: yes
  .ai-harness: no
  .harness: yes
  Exclude block: yes
  Runtime commands: no
  Command namespace: harness

Providers
  Detected: none
```

### `doctor` output (`/tmp/parity-doctor-before.txt`)

```

ai-engineering-harness doctor

Checks
  ✓ node available
  ✓ target is a Git repo
  ✗ .ai-harness missing
  ✓ .harness exists
  ✗ no runtime entrypoint detected
  ✓ .git/info/exclude harness block exists
  ✗ .ai-harness/runtime-commands missing
  ✗ .ai-harness/activation.md missing
  ! .harness/PLAN.md missing Approval Status block or status field
  ! .harness/VERIFY.md missing
  ✓ typed memory artifacts present
```

### `uninstall --provider claude` output (`/tmp/parity-uninstall-before.txt`)

```

Will change
  + claude provider entrypoint(s)
  + keep .ai-harness/
  + keep .harness/
Uninstalling…

Uninstalled.
```

---

## Summary of anomalies

1. **Install disk-output gap:** The plan UI announces `.ai-harness/`, `.claude/`, `.cursor/` creation, but none of these are written. Only `.harness/` and `.git/info/exclude` updates occur. This is consistent between `node bin/aih.js` and `sh aih.sh` direct invocation — it is the actual pre-migration behaviour.

2. **Status reports `.ai-harness: no` after install:** Consistent with anomaly 1 — because `.ai-harness/` is never created.

3. **Doctor reports 4 failures + 2 warnings after install:** `✗ .ai-harness missing`, `✗ no runtime entrypoint detected`, `✗ .ai-harness/runtime-commands missing`, `✗ .ai-harness/activation.md missing` — all consistent with anomaly 1.

4. **Uninstall says `keep .ai-harness/`** even though `.ai-harness/` does not exist — minor UX inconsistency, pre-existing.

These anomalies are documented here as baseline facts. Post-migration validation must confirm identical behaviour.
