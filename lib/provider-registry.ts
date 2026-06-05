import fs from "node:fs";
import path from "node:path";

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

const PROVIDER_IDS = ["claude", "cursor", "codex", "gemini"];

function loadProviderManifests(packRoot: string): ProviderManifest[] {
  const providersDir = path.join(packRoot, "providers");
  const manifests: ProviderManifest[] = [];

  for (const id of PROVIDER_IDS) {
    const manifestPath = path.join(providersDir, `${id}.json`);
    if (!fs.existsSync(manifestPath)) {
      continue;
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as ProviderManifest;
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
  return JSON.parse(fs.readFileSync(manifestPath, "utf8")) as ProviderManifest;
}

export { PROVIDER_IDS, getProviderManifest, loadProviderManifests };
export type { ProviderManifest };
