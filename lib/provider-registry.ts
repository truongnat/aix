import fs from "node:fs";
import path from "node:path";
import { ACTIVE_PROVIDER_IDS } from "./cli-providers";

interface ProviderManifest {
  id: string;
  label: string;
  nativeSlashCommands: boolean;
  supportsSubagents?: boolean;
  ruleEntrypoints: string[];
  installPaths: string[];
  pluginPath?: string;
  status?: string;
  notes?: string;
}

const PROVIDER_IDS = ACTIVE_PROVIDER_IDS;

function validateStringArray(
  manifestPath: string,
  field: "ruleEntrypoints" | "installPaths",
  value: unknown
): string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new Error(
      `Invalid provider manifest ${manifestPath}: ${field} must be an array of strings`
    );
  }
  return value;
}

function validateProviderManifest(manifestPath: string, manifest: unknown): ProviderManifest {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new Error(`Invalid provider manifest ${manifestPath}: manifest must be an object`);
  }

  const candidate = manifest as Record<string, unknown>;

  if (typeof candidate.id !== "string" || candidate.id.length === 0) {
    throw new Error(`Invalid provider manifest ${manifestPath}: id must be a non-empty string`);
  }
  if (typeof candidate.label !== "string" || candidate.label.length === 0) {
    throw new Error(`Invalid provider manifest ${manifestPath}: label must be a non-empty string`);
  }
  if (typeof candidate.nativeSlashCommands !== "boolean") {
    throw new Error(
      `Invalid provider manifest ${manifestPath}: nativeSlashCommands must be a boolean`
    );
  }
  if (
    candidate.supportsSubagents !== undefined &&
    typeof candidate.supportsSubagents !== "boolean"
  ) {
    throw new Error(
      `Invalid provider manifest ${manifestPath}: supportsSubagents must be a boolean`
    );
  }
  if (candidate.pluginPath !== undefined && typeof candidate.pluginPath !== "string") {
    throw new Error(`Invalid provider manifest ${manifestPath}: pluginPath must be a string`);
  }
  if (candidate.status !== undefined && typeof candidate.status !== "string") {
    throw new Error(`Invalid provider manifest ${manifestPath}: status must be a string`);
  }
  if (candidate.notes !== undefined && typeof candidate.notes !== "string") {
    throw new Error(`Invalid provider manifest ${manifestPath}: notes must be a string`);
  }

  return {
    id: candidate.id,
    label: candidate.label,
    nativeSlashCommands: candidate.nativeSlashCommands,
    supportsSubagents: candidate.supportsSubagents as boolean | undefined,
    ruleEntrypoints: validateStringArray(
      manifestPath,
      "ruleEntrypoints",
      candidate.ruleEntrypoints
    ),
    installPaths: validateStringArray(manifestPath, "installPaths", candidate.installPaths),
    pluginPath: candidate.pluginPath as string | undefined,
    status: candidate.status as string | undefined,
    notes: candidate.notes as string | undefined,
  };
}

function readProviderManifest(manifestPath: string): ProviderManifest {
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    throw new Error(`Failed to parse provider manifest: ${manifestPath}`);
  }
  return validateProviderManifest(manifestPath, raw);
}

function loadProviderManifests(packRoot: string): ProviderManifest[] {
  const providersDir = path.join(packRoot, "providers");
  const manifests: ProviderManifest[] = [];

  for (const id of PROVIDER_IDS) {
    const manifestPath = path.join(providersDir, `${id}.json`);
    if (!fs.existsSync(manifestPath)) {
      continue;
    }
    const manifest = readProviderManifest(manifestPath);
    if (manifest.id !== id) {
      throw new Error(`Provider manifest id mismatch: ${manifestPath}`);
    }
    manifests.push(manifest);
  }

  return manifests.sort((left, right) => left.id.localeCompare(right.id));
}

function getProviderManifest(packRoot: string, providerId: string): ProviderManifest {
  const manifestPath = path.join(packRoot, "providers", `${providerId}.json`);
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Unknown provider manifest: ${providerId}`);
  }
  return readProviderManifest(manifestPath);
}

export { PROVIDER_IDS, getProviderManifest, loadProviderManifests };
export type { ProviderManifest };
