"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

function isContainedPath(rootPath, candidatePath) {
  const relativePath = path.relative(rootPath, candidatePath);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

function resolveContainedPath(rootPath, candidatePath, label, boundaryLabel) {
  const resolvedRoot = path.resolve(rootPath);
  const resolvedCandidate = path.resolve(resolvedRoot, candidatePath);

  if (!isContainedPath(resolvedRoot, resolvedCandidate)) {
    throw new Error(`${label} must stay within ${boundaryLabel}: ${candidatePath}`);
  }

  return resolvedCandidate;
}

function copyDirectory(sourceDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
      continue;
    }

    fs.copyFileSync(sourcePath, targetPath);
  }
}

function materializeFixture(packRoot, task) {
  const sourceDir = resolveContainedPath(packRoot, task.fixture.path, "Fixture source", "packRoot");
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "aih-eval-"));
  const cwd = resolveContainedPath(root, task.id, "Task workspace", "temp root");

  copyDirectory(sourceDir, cwd);

  return {
    root,
    cwd,
    sourceDir,
  };
}

module.exports = {
  materializeFixture,
};
