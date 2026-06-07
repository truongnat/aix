# Capability Pack Manifest

## Pack Name

ai-engineering-harness

## Pack Version

v1.0.0

## Pack Type

plugin-like markdown capability pack (npm package + shell fallbacks)

## Purpose

Help AI coding agents consume engineering discipline inside target repositories through commands, skills, workflows, patterns, templates, harness profiles, and structural validation—without treating the source pack repository as the product work tree.

## Primary Consumption (v1.0.x)

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
- `bin/aih.js install` + `--runtime manual` — legacy root copy only

## Included Surface

- `AGENTS.md`, `commands/`, `skills/`, `workflows/`, `patterns/`, `templates/`
- `bin/aih.js`, `lib/cli-*.js`, `aih.sh`, `install.sh`, `aih.ps1`
- `dist/lib/install-cache.js`, `dist/lib/install-runtime.js`, `bin/validate.js`
- selected `docs/` (see npm `files` in `package.json`)

npm tarball **excludes** `test/`, `examples/`, and local dogfood dirs.

## Consumption Modes

- **Primary:** `npx ai-engineering-harness install` (interactive wizard)
- **Shell fallback:** `aih.sh` project/global runtime-native install
- **Compatibility:** `install.sh` wrapper; `aih.ps1` Windows bootstrap (experimental)
- **Legacy:** `bin/aih.js install` / `--runtime manual` root copy only
- **Maintainers:** clone source repo; `node bin/validate.js`; `npm test`
- **Future:** native JS backend (planned); Antigravity (researched, not implemented)

## Runtime Compatibility

| Provider | Status | Notes |
|---|---|---|
| Claude Code | Primary | Full integration: native commands, workers, hooks |
| Cursor | Secondary | Rules-based, no native commands |
| Codex | Experimental | AGENTS.md fallback, marketplace pending |
| Gemini CLI | Experimental | Extension model, manual install |
| Generic | Fallback | AGENTS.md only, works with any agent |
| OpenCode | Removed | Deprecated in v0.11.0 |
| Antigravity | Planned | Not yet implemented |

All providers support the core markdown operating model. Non-Claude providers use fallback adapters rather than native integrations.

## Validation Commands

Source pack:

```bash
node bin/validate.js
npm test
cd examples/dogfood-tiny-node-api && npm test
node bin/aih.js --help
```

Release notes: [docs/v1.0.0-release-notes.md](docs/v1.0.0-release-notes.md)

Target profile:

```bash
node bin/validate.js --target test/fixtures/valid-target-profile --profile-only
```

## Safety Boundaries

- Do not treat the source pack repository as the product work tree
- Do not commit secrets, tokens, or customer data into harness artifacts
- Do not edit target `.gitignore` by default (private installs use `.git/info/exclude`)
- Do not claim stable runtime support until explicitly released

## Non-Goals

- Per-runtime feature parity (Claude will always have deeper integration due to native capabilities)
- Antigravity install paths (planned only)
- npm publish automation from CI (manual publish per [npm-publish.md](docs/npm-publish.md))
- Semantic validation, secret scanning, or heavy runtime adapters in the pack core
- Shipping `test/` or `examples/` in the npm registry tarball
