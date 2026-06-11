// Purpose: Backward-compat shim — implementation in src/features/eval/.
// Layer: presentation (shim)
// Depends on: dist/features/eval (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../../features/eval/infrastructure/llm-judge.js") as any;

export const judgeWithLlmFallback = api.judgeWithLlmFallback;

export type Rubric = any;
export type Task = any;
export type JudgeResult = any;
export type JudgeOptions = any;
