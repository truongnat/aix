"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseValidateArgs = parseValidateArgs;
const node_path_1 = __importDefault(require("node:path"));
const constants_1 = require("./constants");
const target_1 = require("./target");
function parseValidateArgs(argv = []) {
    if (argv.length === 0) {
        return {
            mode: "harness-repository",
            baseDir: constants_1.root,
        };
    }
    if (argv[0] !== "--target") {
        return { usageErrors: [`Unsupported argument: ${argv[0]}`] };
    }
    if (argv.length < 2 || argv[1].startsWith("--")) {
        return { usageErrors: ["Missing required path after --target"] };
    }
    const baseDir = node_path_1.default.resolve(process.cwd(), argv[1]);
    let goalId = undefined;
    let runtime = undefined;
    let profileOnly = false;
    const usageErrors = [];
    for (let index = 2; index < argv.length; index += 1) {
        const arg = argv[index];
        if (arg === "--profile-only") {
            profileOnly = true;
            continue;
        }
        if (arg === "--runtime") {
            const value = argv[index + 1];
            if (!value || value.startsWith("--")) {
                usageErrors.push("Missing required runtime name after --runtime");
                break;
            }
            runtime = value;
            index += 1;
            continue;
        }
        if (arg === "--goal") {
            const value = argv[index + 1];
            if (!value || value.startsWith("--")) {
                usageErrors.push("Missing required goal id after --goal");
                break;
            }
            goalId = value;
            index += 1;
            continue;
        }
        usageErrors.push(`Unsupported argument: ${arg}`);
        break;
    }
    if (profileOnly && goalId) {
        usageErrors.push("--profile-only cannot be combined with --goal");
    }
    if (runtime && !(0, target_1.isValidTargetRuntime)(runtime)) {
        usageErrors.push(`Unsupported runtime: ${runtime} (expected: ${constants_1.VALID_TARGET_RUNTIMES.join(", ")})`);
    }
    if (usageErrors.length > 0) {
        return { usageErrors };
    }
    if (goalId) {
        return {
            mode: "target-goal",
            baseDir,
            goalId,
            runtime,
        };
    }
    return {
        mode: "target-profile",
        baseDir,
        runtime,
    };
}
