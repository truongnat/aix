"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.judgeWithLlmFallback = judgeWithLlmFallback;
exports.loadRubric = loadRubric;
exports.runDeterministicRubric = runDeterministicRubric;
exports.callLlmJudge = callLlmJudge;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const checks_1 = require("./checks");
function loadRubric(packRoot, rubricPath) {
    if (!rubricPath) {
        return null;
    }
    const resolved = node_path_1.default.isAbsolute(rubricPath) ? rubricPath : node_path_1.default.join(packRoot, rubricPath);
    if (!node_fs_1.default.existsSync(resolved)) {
        throw new Error(`Rubric not found: ${rubricPath}`);
    }
    return JSON.parse(node_fs_1.default.readFileSync(resolved, "utf8"));
}
function readJudgeContent(cwd) {
    const responsePath = node_path_1.default.join(cwd, "final-response.txt");
    if (node_fs_1.default.existsSync(responsePath)) {
        return node_fs_1.default.readFileSync(responsePath, "utf8");
    }
    return "";
}
function runDeterministicRubric(cwd, rubric) {
    if (!rubric) {
        return { mode: "none", checks: [], passed: true };
    }
    const checks = (rubric.behaviorChecks || []).map((check) => (0, checks_1.runSingleCheck)(cwd, check));
    const passed = checks.every((check) => check.passed);
    return {
        mode: "deterministic",
        rubricId: rubric.id,
        checks,
        passed,
    };
}
async function callLlmJudge(endpoint, payload) {
    const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const body = await response.text();
        throw new Error(`LLM judge request failed (${response.status}): ${body}`);
    }
    return response.json();
}
async function judgeWithLlmFallback(packRoot, cwd, task, options = {}) {
    const rubric = loadRubric(packRoot, task.rubric);
    const deterministic = runDeterministicRubric(cwd, rubric);
    const endpoint = process.env.EVAL_JUDGE_ENDPOINT;
    const useLlm = options.useLlmJudge !== false && Boolean(endpoint);
    if (!useLlm) {
        return {
            ...deterministic,
            llm: { attempted: false, reason: "EVAL_JUDGE_ENDPOINT unset or useLlmJudge disabled" },
        };
    }
    try {
        const llmResult = await callLlmJudge(endpoint, {
            taskId: task.id,
            rubricId: deterministic.rubricId ?? "",
            content: readJudgeContent(cwd),
            deterministicPassed: deterministic.passed,
        });
        const passed = typeof llmResult.passed === "boolean" ? llmResult.passed : deterministic.passed;
        return {
            ...deterministic,
            passed,
            llm: {
                attempted: true,
                passed,
                score: llmResult.score ?? null,
                reason: llmResult.reason || "LLM judge response",
            },
        };
    }
    catch (error) {
        return {
            ...deterministic,
            llm: {
                attempted: true,
                passed: deterministic.passed,
                reason: `LLM judge fallback: ${error.message}`,
            },
        };
    }
}
