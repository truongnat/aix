// Purpose: Resolve + read the shared harness core (.ai-harness/)
// Layer: domain
// Depends on: provider-adapter (types)

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import type { CoreSource, ProjectContext, ProviderScope } from "./provider-adapter";

/** Directory name of the shared harness core inside a project / home. */
export const CORE_DIR = ".ai-harness";

interface ResolveCoreOptions {
  scope: ProviderScope;
  targetRoot: string;
  packRoot: string;
}

/**
 * Resolve the core root for a given scope:
 * - project: <repo>/.ai-harness/ when present
 * - global:  ~/.ai-harness/ when present
 * - fallback: the published pack root (acts as the core source pre-install)
 *
 * NOTE (refactor.md §5): global core location is an open decision. Today we
 * prefer ~/.ai-harness/ then fall back to packRoot.
 */
export function resolveCoreRoot(options: ResolveCoreOptions): string {
  if (options.scope === "project") {
    const projectCore = path.join(options.targetRoot, CORE_DIR);
    if (fs.existsSync(projectCore)) {
      return projectCore;
    }
  } else {
    const homeCore = path.join(os.homedir(), CORE_DIR);
    if (fs.existsSync(homeCore)) {
      return homeCore;
    }
  }
  return options.packRoot;
}

/** Build a read-only CoreSource rooted at an absolute path. */
export function createCoreSource(root: string): CoreSource {
  return {
    root,
    resolve(relativePath: string): string | null {
      const abs = path.join(root, relativePath);
      return fs.existsSync(abs) ? abs : null;
    },
    has(relativePath: string): boolean {
      return fs.existsSync(path.join(root, relativePath));
    },
  };
}

/** Derive project context used to generate per-project provider surface. */
export function detectProjectContext(targetRoot: string, isGit: boolean): ProjectContext {
  return {
    isGit,
    title: path.basename(path.resolve(targetRoot)),
    // TODO (refactor.md step 5): wire stack-detect to populate stacks and
    // drive generated <title>.rules / project-extended skills.
    stacks: [],
  };
}
