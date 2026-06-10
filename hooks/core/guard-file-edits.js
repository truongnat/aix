#!/usr/bin/env node
"use strict";

const { emitResult, exitFromResult } = require("./_util.js");
const { evaluateFileEditHook, readHookPayload } = require("./file-edit-guards.js");

function main() {
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
    const result = { ok: false, status: "failed", reason: error.message };
    emitResult(result, process.argv.includes("--json"));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { evaluateFileEditHook };
