const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  handleCodexHook,
  isDangerous,
  isPromptWorthy,
} = require("../../hooks/core/codex-hook-router.js");

function tmpRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "codex-hook-"));
  fs.mkdirSync(path.join(dir, ".harness"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".harness", "GOAL.md"), "# Goal\n\nBuild the Codex surface.\n");
  fs.writeFileSync(path.join(dir, ".harness", "PLAN.md"), "# Plan\n\nstatus: approved\n");
  fs.writeFileSync(
    path.join(dir, ".harness", "STATE.md"),
    "current_goal: Build the Codex surface\n"
  );
  return dir;
}

test("codex hook router denies destructive history commands", () => {
  assert.equal(isDangerous("git push --force"), true);
  assert.equal(isDangerous("rm -rf ."), true);
  assert.equal(isPromptWorthy("git push --force"), false);
  const result = handleCodexHook({
    hook_event_name: "PreToolUse",
    cwd: tmpRepo(),
    tool_input: { command: "git push --force" },
  });
  assert.equal(result.hookSpecificOutput.permissionDecision, "deny");
  assert.equal(result.hookSpecificOutput.decision, "deny");
  assert.match(result.hookSpecificOutput.permissionDecisionReason, /safer alternative/i);
});

test("codex hook router warns on install and deploy commands", () => {
  assert.equal(isPromptWorthy("npm install left-pad"), true);
  const result = handleCodexHook({
    hook_event_name: "PermissionRequest",
    cwd: tmpRepo(),
    tool_input: { command: "npm install left-pad" },
  });
  assert.match(result.hookSpecificOutput.additionalContext, /confirm dependency/i);
});

test("codex hook router emits session context and records events", () => {
  const dir = tmpRepo();
  const result = handleCodexHook({
    hook_event_name: "SessionStart",
    cwd: dir,
  });
  assert.match(result.hookSpecificOutput.additionalContext, /Harness session start/i);
  const eventsPath = path.join(dir, ".harness", "history", "events.jsonl");
  assert.equal(fs.existsSync(eventsPath), true);
  assert.match(fs.readFileSync(eventsPath, "utf8"), /codex-hook/);
});

test("codex hook router signals domain bootstrap when domains are empty", () => {
  const dir = tmpRepo();
  fs.writeFileSync(
    path.join(dir, ".harness", "config.json"),
    `${JSON.stringify({ domains: [] }, null, 2)}\n`
  );
  const result = handleCodexHook({
    hook_event_name: "SessionStart",
    cwd: dir,
  });
  assert.match(result.hookSpecificOutput.additionalContext, /Domain bootstrap required/i);
  assert.match(result.hookSpecificOutput.additionalContext, /harness-start/i);
});

test("codex hook router skips domain bootstrap when domains are configured", () => {
  const dir = tmpRepo();
  fs.writeFileSync(
    path.join(dir, ".harness", "config.json"),
    `${JSON.stringify({ domains: ["backend"] }, null, 2)}\n`
  );
  const result = handleCodexHook({
    hook_event_name: "SessionStart",
    cwd: dir,
  });
  assert.doesNotMatch(result.hookSpecificOutput.additionalContext, /Domain bootstrap required/i);
});
