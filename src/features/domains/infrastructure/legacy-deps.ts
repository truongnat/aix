// Purpose: Bridge to install infrastructure modules.
// Layer: infrastructure — codex rule generation

/* eslint-disable @typescript-eslint/no-require-imports */

export const legacyCodexRuleGeneration = require("../../install/infrastructure/codex-rule-generation.js") as {
  renderCodexRuleSet: (...args: unknown[]) => string;
};
