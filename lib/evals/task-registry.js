"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTaskList = formatTaskList;
exports.loadRegistry = loadRegistry;
exports.validateTaskManifest = validateTaskManifest;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const REQUIRED_FIELDS = ["id", "suite", "title", "goal", "mode", "fixture", "prompt"];
function validateTaskManifest(task) {
    for (const field of REQUIRED_FIELDS) {
        if (!task || !task[field]) {
            throw new Error(`Missing required task field: ${field}`);
        }
    }
    if (!task.fixture.path) {
        throw new Error("Missing required task field: fixture.path");
    }
    return {
        ...task,
        successChecks: Array.isArray(task.successChecks) ? task.successChecks : [],
        behaviorChecks: Array.isArray(task.behaviorChecks) ? task.behaviorChecks : [],
        tags: Array.isArray(task.tags) ? task.tags : [],
    };
}
function loadManifest(filePath) {
    return JSON.parse(node_fs_1.default.readFileSync(filePath, "utf8"));
}
function loadRegistry(packRoot) {
    const registryRoot = node_path_1.default.join(packRoot, "evals", "registry");
    const tasks = [];
    for (const suiteEntry of node_fs_1.default.readdirSync(registryRoot, { withFileTypes: true })) {
        if (!suiteEntry.isDirectory()) {
            continue;
        }
        const suiteDir = node_path_1.default.join(registryRoot, suiteEntry.name);
        for (const fileName of node_fs_1.default.readdirSync(suiteDir)) {
            if (!fileName.endsWith(".json")) {
                continue;
            }
            const manifestPath = node_path_1.default.join(suiteDir, fileName);
            tasks.push(validateTaskManifest(loadManifest(manifestPath)));
        }
    }
    tasks.sort((left, right) => left.id.localeCompare(right.id));
    return { tasks };
}
function formatTaskList(registry) {
    return registry.tasks.map((task) => `${task.id} | ${task.title} | ${task.mode}`).join("\n");
}
