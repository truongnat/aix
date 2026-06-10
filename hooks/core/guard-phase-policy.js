#!/usr/bin/env node
"use strict";

module.exports = require("./guard-phase.js");

if (require.main === module) {
  const path = require("node:path");
  const { spawnSync } = require("node:child_process");
  const child = spawnSync(
    process.execPath,
    [path.join(__dirname, "guard-phase.js"), ...process.argv.slice(2)],
    { stdio: "inherit" }
  );
  process.exit(child.status === null ? 1 : child.status);
}
