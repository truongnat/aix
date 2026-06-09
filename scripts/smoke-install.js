const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const childProcess = require("node:child_process");

const isWindows = process.platform === "win32";
const target = path.join(process.env.RUNNER_TEMP || os.tmpdir(), "aih-smoke-install");
const binDir = path.join(target, "bin");
const cursorBinary = path.join(binDir, isWindows ? "cursor.cmd" : "cursor");

fs.mkdirSync(target, { recursive: true });
fs.mkdirSync(binDir, { recursive: true });
childProcess.spawnSync("git", ["init", "-q"], { cwd: target });

if (isWindows) {
  fs.writeFileSync(cursorBinary, "@echo cursor 1.0.0\r\n", "utf8");
} else {
  fs.writeFileSync(cursorBinary, '#!/bin/sh\necho "cursor 1.0.0"\n', "utf8");
  fs.chmodSync(cursorBinary, 0o755);
}

const result = childProcess.spawnSync(
  process.execPath,
  ["bin/aih.js", "install", "--provider", "cursor", "--yes", "--target", target, "--dry-run"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      PATH: [binDir, process.env.PATH].filter(Boolean).join(path.delimiter),
    },
  }
);

process.exit(result.status ?? 1);
