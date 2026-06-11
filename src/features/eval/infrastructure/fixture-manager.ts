// Purpose: Materialize eval fixtures into temp workspaces
// Layer: infrastructure
// Depends on: domain

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

interface Task {
  id: string;
  fixture: {
    path: string;
  };
}

interface Workspace {
  root: string;
  cwd: string;
  sourceDir: string;
}

function isContainedPath(rootPath: string, candidatePath: string): boolean {
  const relativePath = path.relative(rootPath, candidatePath);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

function resolveContainedPath(
  rootPath: string,
  candidatePath: string,
  label: string,
  boundaryLabel: string
): string {
  const resolvedRoot = path.resolve(rootPath);
  const resolvedCandidate = path.resolve(resolvedRoot, candidatePath);

  if (!isContainedPath(resolvedRoot, resolvedCandidate)) {
    throw new Error(`${label} must stay within ${boundaryLabel}: ${candidatePath}`);
  }

  return resolvedCandidate;
}

function copyDirectory(sourceDir: string, targetDir: string): void {
  fs.mkdirSync(targetDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
      continue;
    }

    if (entry.isSymbolicLink()) {
      fs.symlinkSync(fs.readlinkSync(sourcePath), targetPath);
      continue;
    }

    fs.copyFileSync(sourcePath, targetPath);
  }
}

function materializeFixture(packRoot: string, task: Task): Workspace {
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

function cleanupWorkspace(workspace: Workspace): void {
  fs.rmSync(workspace.root, { recursive: true, force: true });
}

export { materializeFixture, cleanupWorkspace };
export type { Workspace };
