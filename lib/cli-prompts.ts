// Purpose: Backward-compat shim — implementation in src/cli/.
// Layer: presentation (shim)
// Depends on: dist/cli (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../cli/ui/prompts.js") as any;

export const selectMany = api.selectMany;
export const selectOne = api.selectOne;
export const confirm = api.confirm;
export const promptText = api.promptText;
