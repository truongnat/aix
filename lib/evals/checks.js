"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runChecks = runChecks;
exports.runSingleCheck = runSingleCheck;
const node_child_process_1 = __importDefault(require("node:child_process"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
function isolatedCommandEnv() {
    const env = { ...process.env };
    for (const key of Object.keys(env)) {
        if (key.startsWith("NODE_TEST")) {
            delete env[key];
        }
    }
    delete env.NODE_OPTIONS;
    return env;
}
function runCommand(command, cwd) {
    return node_child_process_1.default.spawnSync(command, {
        cwd,
        encoding: "utf8",
        shell: true,
        timeout: 15000,
        env: isolatedCommandEnv(),
    });
}
function runSingleCheck(cwd, check) {
    if (check.type === "artifact-exists") {
        const target = node_path_1.default.join(cwd, check.path);
        return {
            type: check.type,
            passed: node_fs_1.default.existsSync(target),
            detail: target,
        };
    }
    if (check.type === "file-contains") {
        const target = node_path_1.default.join(cwd, check.path);
        const content = node_fs_1.default.existsSync(target) ? node_fs_1.default.readFileSync(target, "utf8") : "";
        return {
            type: check.type,
            passed: node_fs_1.default.existsSync(target) && content.includes(check.pattern),
            detail: target,
        };
    }
    if (check.type === "command") {
        const result = runCommand(check.command, node_path_1.default.join(cwd, check.cwd || "."));
        return {
            type: check.type,
            passed: result.status === 0,
            detail: (result.stdout || result.stderr || "").trim(),
        };
    }
    throw new Error(`Unsupported check type: ${check.type}`);
}
async function runChecks(cwd, task) {
    const outcome = task.successChecks.map((check) => runSingleCheck(cwd, check));
    const behavior = task.behaviorChecks.map((check) => runSingleCheck(cwd, check));
    return { outcome, behavior };
}
