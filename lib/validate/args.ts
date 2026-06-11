// Purpose: Backward-compat shim — implementation in src/features/validate/.
// Layer: presentation (shim)
// Depends on: dist/features/validate (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports */
const api =
  require("../../features/validate/presentation/args.js") as typeof import("../../src/features/validate/presentation/args");

export const parseValidateArgs = api.parseValidateArgs;

export type ParseResult = import("../../src/features/validate/presentation/args").ParseResult;
