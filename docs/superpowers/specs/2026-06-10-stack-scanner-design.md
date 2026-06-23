# Stack Scanner + Stack-Aware Config Design

**Date:** 2026-06-10
**Status:** Approved
**Scope:** `lib/stack-scanner.ts`, `lib/cli-commands/scan.ts`, changes to `domains` command and `config.json` schema

---

## Problem

Three gaps in the current domain analysis pipeline:

1. **No automated file scanner.** Framework detection relies entirely on the AI agent manually reading files. In a monorepo with multiple subfolders the agent may miss subdirectories, producing incomplete domain selection.

2. **`languages`, `frameworks`, `notes` are discarded after parsing.** `parseProjectAnalysis()` returns `meta` but `runDomainsCommand` only passes `analysis.domains` to `writeDomainSkillSurface`. The detected stack never reaches `config.json`, so future agent sessions have no metadata about what the repo uses.

3. **Generated skills are generic templates.** `DOMAIN_DEFINITIONS` is static. `renderDomainSkillMarkdown` receives no framework info. A Next.js 14 project and an Angular project both get identical `frontend/SKILL.md` with no stack-specific guidance.

---

## Decisions

| Question | Decision | Rationale |
|---|---|---|
| Stack-aware skill content | AI-generated overlay (not hard-coded templates) | No template maintenance burden; agent reads `config.json` and self-customizes at runtime |
| Monorepo handling | Aggregate + evidence map | One `config.json` with `evidence: { "nextjs": ["apps/web/next.config.js"] }` gives agent location context without per-folder configs |
| Scanner trigger | Both: standalone `scan` command + auto-fallback in `domains` | Agent can inspect scan output before committing; one-shot flow also supported |

---

## Architecture

### New: `lib/stack-scanner.ts`

File-tree walker. Max depth 4. Skips `node_modules`, `.git`, `dist`, `build`, `.next`, `__pycache__`.

**Output type:**
```ts
interface StackScanResult {
  languages: string[];
  frameworks: string[];
  evidence: Record<string, string[]>; // framework → file paths where detected
  notes: string | null;
  domains: ProjectAnalysisDomain[];   // inferred from stack signals
}
```

**Detection rules:**

| Signal file | Detected framework | Inferred domain |
|---|---|---|
| `package.json` dep `next` | `nextjs` | frontend |
| `package.json` dep `react` (no `next`) | `react` | frontend |
| `package.json` dep `vue` | `vue` | frontend |
| `package.json` dep `@angular/core` | `angular` | frontend |
| `package.json` dep `svelte` | `svelte` | frontend |
| `package.json` dep `react-native` | `react-native` | mobile |
| `package.json` dep `expo` | `expo` | mobile |
| `package.json` dep `express` | `express` | backend |
| `package.json` dep `fastify` | `fastify` | backend |
| `package.json` dep `@nestjs/core` | `nestjs` | backend |
| `pyproject.toml` / `requirements.txt` dep `fastapi` | `fastapi` | backend |
| `pyproject.toml` / `requirements.txt` dep `django` | `django` | backend |
| `pyproject.toml` / `requirements.txt` dep `flask` | `flask` | backend |
| `pyproject.toml` / `requirements.txt` dep `torch` | `pytorch` | data-ai |
| `pyproject.toml` / `requirements.txt` dep `langchain` | `langchain` | data-ai |
| `pyproject.toml` / `requirements.txt` dep `pandas` | `pandas` | data-ai |
| `pubspec.yaml` exists | `flutter` | mobile |
| `go.mod` exists | `go` | backend |
| `Cargo.toml` exists | `rust` | backend |
| `Dockerfile` / `docker-compose.yml` exists | — | devops |
| `.github/workflows/*.yml` exists | `github-actions` | devops |
| `*.tf` files exist | `terraform` | cloud |
| `wrangler.toml` exists | `cloudflare` | cloud |

**Language detection** (from file extensions in first 2 levels):
- `.ts` / `.tsx` / `tsconfig.json` → `typescript`
- `.js` / `.jsx` → `javascript`
- `.py` → `python`
- `.go` → `go`
- `.rs` → `rust`
- `.dart` → `dart`
- `.java` / `pom.xml` → `java`

Confidence for inferred domains defaults to `0.8` for manifest evidence, `0.6` for config-file-only evidence.

---

### Modified: `config.json` schema

New `stack` field alongside existing `domains`:

```json
{
  "domains": ["frontend", "backend"],
  "stack": {
    "languages": ["typescript", "python"],
    "frameworks": ["nextjs", "fastapi"],
    "evidence": {
      "nextjs": ["apps/web/next.config.js", "apps/web/package.json"],
      "fastapi": ["apps/api/pyproject.toml"]
    },
    "notes": "monorepo: web + api"
  }
}
```

Written by `updateConfigWithDomains()` in `domain-skill-generation.ts`. Existing `config.json` files without `stack` field continue to work — field is optional at read time.

---

### New: `lib/cli-commands/scan.ts`

```
npx ai-engineering-harness scan [--target <path>] [--dry-run]
```

Runs `stackScanner(targetAbs)`, prints `StackScanResult` as JSON to stdout. Agent or user can inspect before passing to `domains`.

Output is a valid `ProjectAnalysisInput` JSON — directly consumable by `domains --analysis-file`.

---

### Modified: `lib/cli-commands/domains.ts`

Two new behaviors:

1. **Auto-scan fallback:** When called without `--analysis-file` and no stdin, run scanner automatically. Use scan result as the analysis input.

2. **Merge when both present:** When `--analysis-file` is given, also run scanner for evidence. Merge: AI-provided `domains` win; scanner `evidence` + `frameworks` + `languages` are added to fill gaps.

```
# Flow 1: AI-provided (existing, unchanged behavior)
npx ai-engineering-harness domains --analysis-file ai.json

# Flow 2: auto-scan (new)
npx ai-engineering-harness domains --target .

# Flow 3: scan first, then AI augment (new recommended agent flow)
npx ai-engineering-harness scan --target . > scan.json
# agent reads scan.json, refines domains, saves as analysis.json
npx ai-engineering-harness domains --analysis-file analysis.json
```

---

### Modified: `lib/stack-detect.ts`

Add `mergeStackSignals(ai: ProjectAnalysisInput, scan: StackScanResult): ProjectAnalysisInput`:
- AI `domains` override scan `domains` when AI confidence is explicit
- scan `evidence`, `frameworks`, `languages` fill in missing fields
- `notes` from AI takes precedence; scanner notes appended if AI notes absent

---

### Modified: `lib/domain-skill-generation.ts`

`writeDomainSkillSurface` accepts optional `stackMeta: StackScanResult | null`. Passes it to `updateConfigWithDomains` which writes the `stack` field. Generated `SKILL.md` files remain generic — agent reads `config.json` at runtime and self-customizes.

---

### Modified: `prompt-templates/domain-analysis.md`

Add as first step in Action Loop:

> Run `npx ai-engineering-harness scan --target .` and use the JSON output as base context. The scan provides automated evidence from file manifests. Your task is to validate and refine the domain selection, not re-scan manually.

---

## Data Flow

```
scan --target .
  └─ stackScanner(targetAbs, maxDepth=4)
       └─ walk tree, read manifests
       └─ return StackScanResult
  └─ print JSON to stdout

domains --target . (no --analysis-file)
  └─ stackScanner(targetAbs)
  └─ inferDomainsFromScan(scan)
  └─ writeDomainSkillSurface(domains, stackMeta)
       └─ updateConfigWithDomains()   → writes domains + stack
       └─ writeGeneratedDomainSkill() → SKILL.md (generic, unchanged)
       └─ writeGeneratedDomainRules()

domains --analysis-file ai.json
  └─ parseProjectAnalysis(aiJson)
  └─ stackScanner(targetAbs)
  └─ mergeStackSignals(ai, scan)
  └─ writeDomainSkillSurface(mergedDomains, mergedMeta)
```

---

## Files Changed

| File | Change |
|---|---|
| `lib/stack-scanner.ts` | **New** |
| `lib/cli-commands/scan.ts` | **New** |
| `lib/cli-commands/domains.ts` | **Edit** — auto-scan + pass meta |
| `lib/domain-skill-generation.ts` | **Edit** — accept + write stack meta |
| `lib/stack-detect.ts` | **Edit** — add `mergeStackSignals` |
| `prompt-templates/domain-analysis.md` | **Edit** — add scan step |
| `bin/aih.js` (or CLI entry) | **Edit** — register `scan` command |
| `test/stack-scanner.test.ts` | **New** |
| `test/cli-commands/scan.test.ts` | **New** |
| `test/backend/install-orchestrator.test.ts` | **Edit** — assert `stack` field |

---

## Out of Scope

- Per-subfolder config (rejected: aggregate + evidence map is sufficient)
- Hard-coded framework templates in SKILL.md (rejected: AI overlay approach chosen)
- Publishing scan results to remote (local only)
- Automatic re-scan on file change (manual trigger only)
