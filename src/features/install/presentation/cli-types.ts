// Purpose: CLI types shared by install presentation.
// Layer: presentation
// Depends on: src/cli/args for ParseOptions

import type { ParseOptions } from "../../../cli/args";

export type { ParseOptions };
export type PlanProviderId = "claude" | "cursor" | "codex" | "gemini" | "generic" | "manual";

export interface ProviderDescriptor {
  id: string;
  label: string;
  description: string;
  implemented: boolean;
  priority: string;
  installMode?: string;
  nativeSlashCommands?: boolean;
  pluginManifest?: string;
}

export interface InstallPlan {
  willInstall: string[];
  willNotModify: string[];
  mode: string;
  isGit: boolean;
  providers: PlanProviderId[];
}

export interface ProviderBinaryProbe {
  providerId: string;
  commands: string[];
  commandUsed: string | null;
  installed: boolean;
  version: string | null;
  output: string;
}

export type ProviderBinaryMap = Record<string, ProviderBinaryProbe>;

export interface BackendSpawnResult {
  status: number | null;
  combined: string;
}

export interface UiFacade {
  useInteractiveUi: (options: ParseOptions) => boolean;
  runWithSpinner: <T extends { status?: number }>(
    message: string,
    fn: () => Promise<T> | T
  ) => Promise<T | undefined>;
  selectProviders: (items: unknown[], initial?: string[]) => Promise<string[] | null | undefined>;
  selectInstallScope: () => Promise<string | null | undefined>;
  introBanner: (options: Record<string, unknown>) => void;
  showInstallPlan: (plan: InstallPlan, options?: Record<string, unknown>) => void;
  showUpdatePlan: (providers: string[], options?: Record<string, unknown>) => void;
  showUninstallPlan: (options: Record<string, unknown>, extra?: Record<string, unknown>) => void;
  showWarning: (message: string) => void;
  showSuccess: (kind: string, extraLines?: string[]) => void;
  confirmProceed: (message: string) => Promise<boolean | null | undefined>;
  confirmInstallCache: (defaultYes: boolean) => Promise<boolean | null>;
  confirmRemoveState: (defaultYes?: boolean) => Promise<boolean | null>;
  confirmFullCleanup: (defaultYes?: boolean) => Promise<boolean | null>;
}
