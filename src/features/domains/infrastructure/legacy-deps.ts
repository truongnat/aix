// Purpose: Bridge to legacy lib modules until later migration phases.
// Layer: infrastructure
// Depends on: dist/lib codex-rule-generation at runtime

/* eslint-disable @typescript-eslint/no-require-imports */

export const legacyCodexRuleGeneration = require("../../../lib/codex-rule-generation.js") as {
  renderCodexRuleSet: (...args: unknown[]) => string;
};
