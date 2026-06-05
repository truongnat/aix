"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRunContext = createRunContext;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
function createRunContext(packRoot, taskId) {
    const runId = `${new Date().toISOString().replace(/[:.]/g, "-")}-${taskId}`;
    const runRoot = node_path_1.default.join(packRoot, "artifacts", "runs", runId);
    node_fs_1.default.mkdirSync(runRoot, { recursive: true });
    return {
        runId,
        runRoot,
        modeDir(mode) {
            const dir = node_path_1.default.join(runRoot, mode);
            node_fs_1.default.mkdirSync(dir, { recursive: true });
            return dir;
        },
    };
}
