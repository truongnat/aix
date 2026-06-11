// Purpose: Backward-compat shim — implementation in src/cli/.
// Layer: presentation (shim)
// Depends on: dist/cli (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../cli/args.js") as any;

export const COMMANDS = api.COMMANDS;
export const EVAL_COMMANDS = api.EVAL_COMMANDS;
export const parseArgv = api.parseArgv;
export const modeToScopeVisibility = api.modeToScopeVisibility;
export const isNonInteractive = api.isNonInteractive;

export type ParseOptions = any;
export type ScopeVisibility = any;
