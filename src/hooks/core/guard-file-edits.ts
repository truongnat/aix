#!/usr/bin/env node
// Purpose: Provider hook entrypoint for scope + test-first file-edit checks.
// Layer: infrastructure
// Depends on: ../shared/util, ./file-edit-guards

import { emitResult, exitFromResult } from "../shared/util";
import { evaluateFileEditHook, readHookPayload } from "./file-edit-guards";

function main(): void {
  try {
    const payload = readHookPayload();
    const block = evaluateFileEditHook(payload);
    if (block) {
      const jsonMode = process.argv.includes("--json");
      emitResult(block, jsonMode);
      exitFromResult(block);
    }
    process.exit(0);
  } catch (error) {
    const result = { ok: false, status: "failed", reason: (error as Error).message };
    emitResult(result, process.argv.includes("--json"));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { evaluateFileEditHook };
