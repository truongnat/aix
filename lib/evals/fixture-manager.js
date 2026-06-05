"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.materializeFixture = materializeFixture;
const node_fs_1 = __importDefault(require("node:fs"));
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
function isContainedPath(rootPath, candidatePath) {
    const relativePath = node_path_1.default.relative(rootPath, candidatePath);
    return relativePath === "" || (!relativePath.startsWith("..") && !node_path_1.default.isAbsolute(relativePath));
}
function resolveContainedPath(rootPath, candidatePath, label, boundaryLabel) {
    const resolvedRoot = node_path_1.default.resolve(rootPath);
    const resolvedCandidate = node_path_1.default.resolve(resolvedRoot, candidatePath);
    if (!isContainedPath(resolvedRoot, resolvedCandidate)) {
        throw new Error(`${label} must stay within ${boundaryLabel}: ${candidatePath}`);
    }
    return resolvedCandidate;
}
function copyDirectory(sourceDir, targetDir) {
    node_fs_1.default.mkdirSync(targetDir, { recursive: true });
    for (const entry of node_fs_1.default.readdirSync(sourceDir, { withFileTypes: true })) {
        const sourcePath = node_path_1.default.join(sourceDir, entry.name);
        const targetPath = node_path_1.default.join(targetDir, entry.name);
        if (entry.isDirectory()) {
            copyDirectory(sourcePath, targetPath);
            continue;
        }
        node_fs_1.default.copyFileSync(sourcePath, targetPath);
    }
}
function materializeFixture(packRoot, task) {
    const sourceDir = resolveContainedPath(packRoot, task.fixture.path, "Fixture source", "packRoot");
    const root = node_fs_1.default.mkdtempSync(node_path_1.default.join(node_os_1.default.tmpdir(), "aih-eval-"));
    const cwd = resolveContainedPath(root, task.id, "Task workspace", "temp root");
    copyDirectory(sourceDir, cwd);
    return {
        root,
        cwd,
        sourceDir,
    };
}
