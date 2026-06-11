// Purpose: Public exports for CLI package surface.
// Layer: presentation
// Depends on: main, help, args

export { main, printHelp, SOURCE_URL } from "./main";
export { parseArgv, modeToScopeVisibility, isNonInteractive, COMMANDS, EVAL_COMMANDS } from "./args";
export type { ParseOptions, ScopeVisibility } from "./args";
