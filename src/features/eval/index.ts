// Purpose: Public exports for eval feature.
// Layer: presentation
// Depends on: application layer

export { listTasks, readReport, runTask } from "./application/eval-api";
export type { ListOptions, ListResult, RunOptions } from "./application/eval-api";

export { runEvalCommand } from "./presentation/eval-command";
