# Clean Architecture TypeScript Migration — Design Spec

**Date:** 2026-06-11  
**Status:** Approved — Phase 1 shipped (2026-06-11); Phase 2 insights CLI shipped (2026-06-11); Phase 3 validate shipped (2026-06-11); Phase 4 install/update/uninstall shipped (2026-06-11); Phase 5 eval shipped (2026-06-11); Phase 6 scan + domains shipped (2026-06-11); Phase 7 CLI router shipped (2026-06-11); Phase 8 hooks shipped (2026-06-11)  
**Scope:** Migrate all Node-side code (CLI, server, hooks) to TypeScript under clean architecture. Release artifact is `dist/`.

---

## 1. Goals

| Goal | Detail |
|------|--------|
| Full TypeScript | CLI, telemetry server, hooks, and all Node runtime code |
| Clean architecture | Feature-first layers: domain → application → infrastructure → presentation |
| Simple & debuggable | Small files, step-by-step migration, user reviews each phase before next |
| Release = `dist/` | npm publish ships compiled JS from `dist/`, not `src/` |
| No behavior change | Migration is structural; existing CLI contracts and tests stay green |

## 2. Non-goals

- Rewriting markdown harness content (`commands/`, `skills/`, `workflows/`)
- Adding frameworks (Express, NestJS, etc.)
- Migrating tests to TypeScript in phase 1 (optional later)
- Big-bang single PR for entire codebase
- Changing telemetry HTTP API or payload schema

---

## 3. Architecture — Folder structure (Section 1)

```text
src/
├── shared/
│   ├── kernel/              # Shared helpers (add only when 3+ features need them)
│   └── types/               # Cross-feature types only
│
├── features/
│   └── <feature-name>/
│       ├── domain/          # Pure rules, entities, validation (no Node I/O)
│       ├── application/     # Use cases — orchestration only
│       ├── infrastructure/  # fs, http, git, external adapters
│       └── presentation/    # HTTP handlers, CLI handlers, response mapping
│
├── cli/
│   ├── main.ts              # Phase 7: unified argv router
│   ├── args.ts
│   ├── ui/
│   └── commands/
│
├── server/
│   └── telemetry-main.ts    # Phase 1: telemetry HTTP entry
│
└── hooks/
    ├── core/
    └── shared/

dist/                          # npm publish output
├── cli/
├── server/
├── features/
└── hooks/
```

### Layer dependency rules

| Layer | May import | Must NOT |
|-------|------------|----------|
| `domain` | `shared` types only | `node:http`, `node:fs`, CLI argv |
| `application` | `domain`, `shared` | HTTP details, file paths |
| `infrastructure` | `domain`, `application`, `shared` | CLI parsing |
| `presentation` | all layers above | Inline business rules |

### Comment convention

Every file starts with a 3-line header:

```ts
// Purpose: <one sentence>
// Layer: domain | application | infrastructure | presentation
// Depends on: <files or "nothing">
```

Functions get one-line JSDoc only when the name is not self-explanatory.

---

## 4. Phase 1 — Telemetry server (Section 2)

Migrate `lib/insights/telemetry-server.ts` (~230 lines) into `src/features/telemetry/` with no behavior change.

### 4.1 File map

```text
src/features/telemetry/
├── domain/
│   ├── telemetry-payload.ts    # TelemetryExportPayload + validateTelemetryPayload()
│   └── constants.ts              # SCHEMA_ID, DEFAULT_MAX_STORAGE_BYTES
├── application/
│   ├── ingest-telemetry.ts       # validate → write → IngestResult
│   └── health-check.ts           # return { ok: true }
├── infrastructure/
│   ├── file-storage.ts           # appendNdjsonLine(), size limit check
│   ├── http-body-reader.ts       # readRequestBody(maxBytes)
│   └── server-config.ts          # parse argv/env → ServerConfig
├── presentation/
│   ├── routes.ts                 # URL/method dispatch
│   ├── json-response.ts          # status + JSON body helper
│   └── create-server.ts          # createTelemetryServer()
└── index.ts                      # public barrel exports

src/server/telemetry-main.ts      # entry: config, listen, SIGINT/SIGTERM
```

### 4.2 Data flow

```text
telemetry-main.ts
  → presentation/create-server.ts
    → presentation/routes.ts
      → application/health-check.ts          (GET /health)
      → application/ingest-telemetry.ts      (POST /api/telemetry)
          → domain/telemetry-payload.ts
          → infrastructure/file-storage.ts
      → infrastructure/http-body-reader.ts
      → presentation/json-response.ts
```

### 4.3 HTTP contract (unchanged)

| Route | Method | Status | Response |
|-------|--------|--------|----------|
| `/health` | GET | 200 | `{ ok: true }` |
| `/api/telemetry` | POST | 202 | validate + append NDJSON |
| invalid payload | POST | 422 | `{ ok: false, error: "Invalid telemetry export payload" }` |
| body too large | POST | 413 | `{ ok: false, error: "Request body too large" }` |
| storage full | POST | 507 | `{ ok: false, error: "Telemetry storage limit exceeded ..." }` |
| unknown path | * | 404 | `{ ok: false, error: "Not found" }` |
| wrong method | * | 405 | `{ ok: false, error: "Method not allowed" }` |

Config: `--port`, `--host`, `--storage-dir`, `--route` and env vars `HARNESS_TELEMETRY_*`.

### 4.4 Backward compatibility shim

Until user approves removal:

```text
dist/lib/insights/telemetry-server.js  → re-exports dist/features/telemetry/
bin/telemetry-server.js                → require("../dist/server/telemetry.js")
```

Existing tests in `test/insights/telemetry-server.test.js` must pass without modification.

### 4.5 Phase 1 implementation steps

| Step | Deliverable | Verification |
|------|-------------|--------------|
| 1 | `tsconfig.src.json` + `src/` scaffold | `npm run build:src` clean |
| 2 | `domain/` + tests | `node --test test/features/telemetry/domain/` |
| 3 | `infrastructure/file-storage.ts` + tests | write + 50MB cap |
| 4 | `application/ingest-telemetry.ts` + tests | use case without HTTP |
| 5 | `presentation/routes.ts` + tests | port handler tests |
| 6 | `create-server.ts` + `telemetry-main.ts` | `npm run telemetry:server` starts |
| 7 | Shim + full test suite | `npm test` green |
| 8 | Remove shim | user explicit approval only |

---

## 5. Migration roadmap — Phases 2–9 (Section 3)

```text
Phase 1  Telemetry server          ← start here
Phase 2  Insights CLI
Phase 3  Validate
Phase 4  Install / Update / Uninstall
Phase 5  Eval
Phase 6  Scan + Domains
Phase 7  CLI main router
Phase 8  Hooks
Phase 9  Cleanup lib/ + bin/
```

**Rule:** each phase adds `src/features/<name>/`, keeps `dist/lib/` shim until user approves removal, full `npm test` green before next phase.

### Phase 2 — Insights CLI

**From:** `lib/insights/` (summarize, export, event-reader, remote-upload, eval-recommendations, eval-regression)

```text
src/features/insights/
├── domain/           # Event types, export schema, aggregation
├── application/      # SummarizeEvents, ExportTelemetry, RecommendEvals
├── infrastructure/   # events.jsonl reader, config.json, HTTP upload
└── presentation/     # insights CLI handler
```

**Debug:** `aih insights`, `aih insights --json`, `aih insights --export`

### Phase 3 — Validate

**From:** `lib/validate/`, `bin/validate.js`

```text
src/features/validate/
├── domain/           # Contract rules, check definitions
├── application/      # RunValidationSuite
├── infrastructure/   # filesystem reader, pack root resolver
└── presentation/     # validate CLI + API
```

**Debug:** `npm run validate`

### Phase 4 — Install / Update / Uninstall

**From:** `lib/cli-commands/install|update|uninstall.ts`, `lib/backend/*`, `lib/install-runtime.ts`, `lib/install-cache.ts`

```text
src/features/install/
src/features/update/
src/features/uninstall/
src/shared/install-kernel/    # git-hygiene, file-ops, provider detection
```

**Debug:** `aih install --dry-run`, then real install on temp dir

### Phase 5 — Eval

**From:** `lib/evals/`, `lib/cli-commands/eval.ts`

```text
src/features/eval/
├── domain/           # Task manifest, rubric, scoring
├── application/      # RunEval, ReportEval
├── infrastructure/   # fixture loader, artifact writer, live-runner
└── presentation/     # eval list | run | report
```

**Debug:** `aih eval run sample-bugfix --yes`

### Phase 6 — Scan + Domains

**From:** `lib/stack-scanner.ts`, `lib/stack-detect.ts`, `lib/domain-skill-generation.ts`

```text
src/features/scan/
src/features/domains/
src/shared/stack-detect/
```

**Debug:** `aih scan`, `aih domains --analysis-file ...`

### Phase 7 — CLI main router

```text
src/cli/main.ts       # argv → dispatch
src/cli/args.ts
src/cli/ui/
src/cli/commands/*.ts
```

**dist:** `dist/cli/main.js` replaces `bin/aih.js` wrapper

### Phase 8 — Hooks

**From:** `hooks/core/*.js` (11 scripts)

```text
src/hooks/core/*.ts
src/hooks/shared/util.ts
```

**dist:** `dist/hooks/core/*.js` — install copies compiled hooks to target repos  
**Constraint:** plain Node CJS output, no bundler required in target repos  
**Debug:** one hook at a time, starting with `guard-phase.ts`

### Phase 9 — Cleanup

Remove when all phases done and user approves:

- `lib/**/*.ts`
- `bin/*.js` thin wrappers
- `dist/lib/` shims
- dual tsconfig (`tsconfig.lib.json`)

**Final bin:**

```json
"bin": {
  "aih": "dist/cli/main.js",
  "ai-engineering-harness": "dist/cli/main.js"
}
```

---

## 6. Build, test, release (Section 4)

### 6.1 TypeScript config (during migration)

```text
tsconfig.src.json     # src/ → dist/        (new)
tsconfig.build.json   # lib/ → dist/lib/    (existing, until phase 9)
```

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.test.ts"]
}
```

Phase 9: single `tsconfig.build.json` for `src/` only.

### 6.2 Build scripts

```json
{
  "build": "npm run build:src && npm run build:legacy",
  "build:src": "tsc -p tsconfig.src.json",
  "build:legacy": "tsc -p tsconfig.build.json",
  "build:watch": "tsc -p tsconfig.src.json --watch",
  "prepack": "npm run build",
  "telemetry:server": "node dist/server/telemetry.js"
}
```

### 6.3 Test strategy

- Keep `node:test` — no new test framework
- Tests stay JavaScript, import from `dist/`
- Mirror structure: `test/features/telemetry/domain/`, etc.

| Layer | Test approach |
|-------|---------------|
| domain | Pure unit, no mocks |
| application | Mock infrastructure |
| infrastructure | Temp dirs, real fs |
| presentation | Mock req/res |
| entry (main) | Manual smoke only |

**Per-step commands:**

```bash
npm run build:src
node --test test/features/telemetry/
npm test
```

### 6.4 Error handling convention

```text
domain         → boolean validators or domain-specific errors
application    → result objects { ok, statusCode, error? } for expected failures
presentation   → map results to HTTP status + JSON
infrastructure → throw only on unexpected I/O failures
```

No shared `Result<T,E>` wrapper until 3+ features need it.

### 6.5 Publish surface

`package.json` `"files"` includes `dist/`. Source `src/` is not published.

Phase 1 adds `telemetry:server` script. Phase 9 moves `bin` to `dist/cli/main.js`.

### 6.6 Phase completion checklist

1. `npm run build` — zero errors
2. `node --test` / `npm test` — all pass
3. User manual smoke test
4. User reviews diff, requests refactors
5. Shim removed only on explicit user approval

---

## 7. Explicit exclusions

- No Express / NestJS / Fastify for telemetry
- No monorepo tooling
- No excessive barrel files (one `index.ts` per feature max)
- No unrelated refactoring during migration phases
- No `shared/kernel/result.ts` in phase 1 (YAGNI)

---

## 8. Success criteria

| Criteria | Measure |
|----------|---------|
| TypeScript coverage | All Node runtime code under `src/` by phase 9 |
| Test parity | `npm test` green after every phase step |
| Behavior parity | Telemetry routes, status codes, storage format unchanged |
| Debuggability | User can run and inspect each layer independently |
| Release | `npm pack` contains working `dist/` binaries |

---

## 9. Next step

After user reviews and approves this spec:

→ Invoke **writing-plans** skill to create the Phase 1 step-by-step implementation plan.

Do **not** start implementation until the implementation plan is approved.
