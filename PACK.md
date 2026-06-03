# Capability Pack Manifest

## Pack Name

ai-engineering-harness

## Pack Version

v0.11.0

## Pack Type

plugin-like markdown capability pack (npm package + shell fallbacks)

## Purpose

Help AI coding agents consume engineering discipline inside target repositories through commands, skills, workflows, patterns, templates, harness profiles, and structural validation—without treating the source pack repository as the product work tree.

## Primary Consumption (v0.11.x)

```bash
npx ai-engineering-harness install
```

Interactive wizard: user selects provider(s), install mode, confirms plan. Detection **recommends** only; no silent auto-install.

## Installed Model (project)

```txt
npx CLI (bin/aih.js)     user-facing wizard
        ↓
aih.sh                   lifecycle backend (bundled in npm package)
        ↓
provider entrypoint      e.g. .cursor/rules/ai-engineering-harness.mdc
.ai-harness/             capability cache
.harness/                project state
.git/info/exclude        private project installs (not .gitignore)
```

## Fallback / Compatibility

- `aih.sh` — shell lifecycle dispatcher (fallback, CI, local dev)
- `install.sh` — wrapper around `aih.sh`
- `aih.ps1` — experimental Windows bootstrap (still requires `sh`)
- `install.js` + `--runtime manual` — legacy root copy only

## Included Surface

- `AGENTS.md`, `commands/`, `skills/`, `workflows/`, `patterns/`, `templates/`
- `bin/aih.js`, `lib/cli-*.js`, `aih.sh`, `install.sh`, `aih.ps1`
- `install-cache.js`, `install-runtime.js`, `install.js`, `validate.js`
- selected `docs/` (see npm `files` in `package.json`)

npm tarball **excludes** `test/`, `examples/`, and local dogfood dirs.

## Consumption Modes

- **Primary:** `npx ai-engineering-harness install` (interactive wizard)
- **Shell fallback:** `aih.sh` project/global runtime-native install
- **Compatibility:** `install.sh` wrapper; `aih.ps1` Windows bootstrap (experimental)
- **Legacy:** `install.js` / `--runtime manual` root copy only
- **Maintainers:** clone source repo; `node validate.js`; `npm test`
- **Future:** native JS backend (planned); Antigravity (researched, not implemented)

## Runtime Compatibility

Documented guidance for Claude Code (primary), Cursor (secondary), Codex, Gemini CLI (experimental), generic AGENTS.md. OpenCode removed from active scope in v0.11.0.

**Stable runtime support: No** (experimental per provider).

Antigravity: planned, not implemented.

## Validation Commands

Source pack:

```bash
node validate.js
npm test
node bin/aih.js --help
```

Target profile:

```bash
node validate.js --target test/fixtures/valid-target-profile --profile-only
```

## Safety Boundaries

- Do not treat the source pack repository as the product work tree
- Do not commit secrets, tokens, or customer data into harness artifacts
- Do not edit target `.gitignore` by default (private installs use `.git/info/exclude`)
- Do not claim stable runtime support until explicitly released

## Non-Goals

- Stable per-runtime support (still **No** for v0.10.x)
- Antigravity install paths (planned only)
- npm publish automation from CI (manual publish per [npm-publish.md](docs/npm-publish.md))
- Semantic validation, secret scanning, or heavy runtime adapters in the pack core
- Shipping `test/` or `examples/` in the npm registry tarball

## Stable Runtime Support

**No** — experimental installs only; see [docs/v0.10.0-release-notes.md](docs/v0.10.0-release-notes.md).
