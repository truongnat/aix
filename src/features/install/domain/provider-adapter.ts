// Purpose: Provider-adapter contract + core-source/project-context types
// Layer: domain
// Depends on: nothing
//
// See refactor.md (# PLAN: Provider-adapter refactor) for the target design.
// Each provider (codex/claude/cursor/gemini) owns an adapter that consumes the
// shared harness core (.ai-harness/) and emits provider-specific surface into
// the right scope (global $HOME/.<provider>/ or project <repo>/.<provider>/).

export type ProviderScope = "global" | "project";

/** Project signals used to generate provider rules/skills per running project. */
export interface ProjectContext {
  isGit: boolean;
  /** Title derived from the project (e.g. repo dir name) -> <title>.rules. */
  title: string;
  /** Detected stacks (wired from stack-detect). Drives generated surface. */
  stacks: string[];
}

/** Read-only view over the shared harness core (the `.ai-harness/` tree). */
export interface CoreSource {
  /** Absolute root of the resolved core (project .ai-harness/ or pack fallback). */
  root: string;
  /** Absolute path for a core-relative subpath, or null when it does not exist. */
  resolve(relativePath: string): string | null;
  /** True when the core-relative subpath exists. */
  has(relativePath: string): boolean;
}

export interface AdapterContext {
  /** Shared harness core reader. */
  core: CoreSource;
  /** Published pack root (fallback source + bootstrap payloads). */
  packRoot: string;
  scope: ProviderScope;
  /** Repo root for project installs. */
  targetRoot: string;
  /** Home dir for global installs. */
  homeRoot: string;
  project: ProjectContext;
  dryRun: boolean;
  force: boolean;
}

export interface AdapterResult {
  provider: string;
  ok: boolean;
  messages: string[];
}

/** One adapter per provider. install() maps core -> provider surface. */
export interface ProviderAdapter {
  id: string;
  install(ctx: AdapterContext): AdapterResult;
  // update(ctx) / uninstall(ctx) -> follow-up phases (see refactor.md step 4).
}
