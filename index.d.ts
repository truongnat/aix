/**
 * ai-engineering-harness TypeScript type definitions
 *
 * The package root exposes shared types only. Runtime entrypoints are available
 * through explicit subpath exports such as `ai-engineering-harness/cli-main`.
 *
 * @see https://github.com/truongnat/ai-engineering-harness
 */

declare module "ai-engineering-harness" {
  /**
   * Provider-specific command support information.
   */
  export interface ProviderCommandSupport {
    id: string;
    name: string;
    native: boolean;
    fallback: boolean;
    invocation?: string;
  }

  /**
   * Options for harness installation.
   */
  export interface InstallOptions {
    dryRun?: boolean;
    force?: boolean;
    target?: string;
    runtime?: string;
    scope?: string;
    initHarness?: boolean;
    installCache?: boolean;
  }

  /**
   * Installation result for a single file.
   */
  export interface InstallResult {
    action: string;
    relativePath: string;
    reason: string;
  }

  /**
   * Validation result for pack contracts.
   */
  export interface ValidationResult {
    passed: boolean;
    errors: ValidationError[];
    summary: {
      filesChecked: number;
      testsPassed: number;
      testsFailed: number;
    };
  }

  /**
   * Individual validation error.
   */
  export interface ValidationError {
    file: string;
    message: string;
    severity: "error" | "warning";
  }
}

declare module "ai-engineering-harness/cli-main" {
  export function main(argv: string[], moduleFilename: string): Promise<number>;
  export function printHelp(): void;
  export const SOURCE_URL: string;
}

declare module "ai-engineering-harness/file-operations" {
  export function ensureDirectory(dirPath: string, dryRun?: boolean): void;
  export function writeFileWithDryRun(
    filePath: string,
    content: string,
    options?: { dryRun?: boolean; force?: boolean },
    logFn?: (message: string) => void
  ): void;
  export function logAction(action: string, relativePath: string): void;
}

declare module "ai-engineering-harness/validate" {
  export function main(): void;
  export function countCheckedContracts(): number;
  export function validateHarnessRepository(baseDir: string): string[];
  export function validateRepository(baseDir: string): string[];
  export function validateRuntimeCommandSurface(baseDir: string): string[];
  export function validateTargetGoal(
    baseDir: string,
    goalId: string,
    runtime?: string | null
  ): string[];
  export function validateTargetHarnessProfile(
    baseDir: string,
    runtime?: string | null
  ): string[];
  export function validateTargetProfile(baseDir: string, runtime?: string | null): string[];
}
