"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyModeMutation = applyModeMutation;
exports.loadMutationRegistry = loadMutationRegistry;
exports.mutationMetrics = mutationMetrics;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
function loadMutationRegistry(packRoot) {
    const registryPath = node_path_1.default.join(packRoot, "evals", "mutations", "registry.json");
    if (!node_fs_1.default.existsSync(registryPath)) {
        return {};
    }
    return JSON.parse(node_fs_1.default.readFileSync(registryPath, "utf8"));
}
function applyModeMutation(mode, cwd, task, packRoot) {
    const registry = loadMutationRegistry(packRoot);
    const entry = registry[task.id];
    if (!entry) {
        return;
    }
    const files = mode === "with-harness" ? entry.withHarness : entry.withoutHarness;
    if (!files) {
        return;
    }
    for (const [relativePath, content] of Object.entries(files)) {
        const target = node_path_1.default.join(cwd, relativePath);
        node_fs_1.default.mkdirSync(node_path_1.default.dirname(target), { recursive: true });
        node_fs_1.default.writeFileSync(target, content);
    }
}
function mutationMetrics(task, packRoot) {
    const registry = loadMutationRegistry(packRoot);
    const entry = registry[task.id];
    if (entry && entry.metrics) {
        return entry.metrics;
    }
    if (task.metrics) {
        return task.metrics;
    }
    return {
        withHarnessSteps: 3,
        withoutHarnessSteps: 8,
        phases: ["verify"],
    };
}
