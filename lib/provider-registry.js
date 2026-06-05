"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROVIDER_IDS = void 0;
exports.getProviderManifest = getProviderManifest;
exports.loadProviderManifests = loadProviderManifests;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const PROVIDER_IDS = ["claude", "cursor", "codex", "gemini"];
exports.PROVIDER_IDS = PROVIDER_IDS;
function loadProviderManifests(packRoot) {
    const providersDir = node_path_1.default.join(packRoot, "providers");
    const manifests = [];
    for (const id of PROVIDER_IDS) {
        const manifestPath = node_path_1.default.join(providersDir, `${id}.json`);
        if (!node_fs_1.default.existsSync(manifestPath)) {
            continue;
        }
        const manifest = JSON.parse(node_fs_1.default.readFileSync(manifestPath, "utf8"));
        if (manifest.id !== id) {
            throw new Error(`Provider manifest id mismatch: ${manifestPath}`);
        }
        manifests.push(manifest);
    }
    return manifests.sort((left, right) => left.id.localeCompare(right.id));
}
function getProviderManifest(packRoot, providerId) {
    const manifestPath = node_path_1.default.join(packRoot, "providers", `${providerId}.json`);
    if (!node_fs_1.default.existsSync(manifestPath)) {
        throw new Error(`Unknown provider manifest: ${providerId}`);
    }
    return JSON.parse(node_fs_1.default.readFileSync(manifestPath, "utf8"));
}
