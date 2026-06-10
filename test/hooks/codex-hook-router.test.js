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

test("codex hook router intercepts /harness-plan slash command", () => {
  const dir = tmpRepo();
  fs.mkdirSync(path.join(dir, ".codex", "commands"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, ".codex", "commands", "harness-plan.md"),
    "# harness-plan\n\nTranslate the agreed goal into a plan.\n"
  );
  const result = handleCodexHook({
    hook_event_name: "UserPromptSubmit",
    cwd: dir,
    prompt: "/harness-plan",
  });
  assert.match(result.hookSpecificOutput.additionalContext, /Execute the harness command/);
  assert.match(result.hookSpecificOutput.additionalContext, /harness-plan/);
  assert.match(result.hookSpecificOutput.additionalContext, /Translate the agreed goal/);
});

test("codex hook router passes args for slash commands", () => {
  const dir = tmpRepo();
  fs.mkdirSync(path.join(dir, ".codex", "commands"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, ".codex", "commands", "harness-start.md"),
    "# harness-start\n\nRun session start.\n"
  );
  const result = handleCodexHook({
    hook_event_name: "UserPromptSubmit",
    cwd: dir,
    prompt: "/harness-start goal-123",
  });
  assert.match(result.hookSpecificOutput.additionalContext, /Execute the harness command/);
  assert.match(result.hookSpecificOutput.additionalContext, /User arguments: goal-123/);
});

test("codex hook router falls back for non-harness slash prompts", () => {
  const dir = tmpRepo();
  const result = handleCodexHook({
    hook_event_name: "UserPromptSubmit",
    cwd: dir,
    prompt: "/something-else",
  });
  assert.match(result.hookSpecificOutput.additionalContext, /harness loop/);
  assert.doesNotMatch(result.hookSpecificOutput.additionalContext, /Execute the harness command/);
});

test("codex hook router allows non-shell tools with no command field", () => {
  const dir = tmpRepo();
  const result = handleCodexHook({
    hook_event_name: "PreToolUse",
    cwd: dir,
    tool_input: { path: ".harness/STATE.md" },
  });
  assert.ok(result, "should return a result, not null");
  assert.equal(result.hookSpecificOutput.permissionDecision, "allow");
  assert.equal(result.hookSpecificOutput.decision, "allow");
});

test("codex hook router denies out-of-scope file edits", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "codex-scope-"));
  const sessionId = "2026-06-10-scope";
  const sessionDir = path.join(dir, ".harness", "sessions", sessionId);
  fs.mkdirSync(path.join(dir, "lib"), { recursive: true });
  fs.mkdirSync(sessionDir, { recursive: true });
  fs.writeFileSync(path.join(dir, "lib", "allowed.ts"), "// allowed\n");
  fs.writeFileSync(path.join(dir, "lib", "blocked.ts"), "// blocked\n");
  fs.writeFileSync(path.join(sessionDir, "GOAL.md"), "Change lib/allowed.ts only.\n");
  fs.writeFileSync(path.join(sessionDir, "PLAN-001.md"), "Update lib/allowed.ts\n");
  fs.writeFileSync(
    path.join(dir, ".harness", "STATE.md"),
    `session: sessions/${sessionId}\ncurrent_plan: PLAN-001.md\n`
  );

  const result = handleCodexHook({
    hook_event_name: "PreToolUse",
    cwd: dir,
    tool_name: "Write",
    tool_input: { path: "lib/blocked.ts" },
  });

  assert.equal(result.hookSpecificOutput.permissionDecision, "deny");
  assert.match(result.hookSpecificOutput.permissionDecisionReason, /outside approved scope/i);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("codex hook router allows Read on out-of-scope paths", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "codex-read-"));
  const sessionId = "2026-06-10-read";
  const sessionDir = path.join(dir, ".harness", "sessions", sessionId);
  fs.mkdirSync(path.join(dir, "lib"), { recursive: true });
  fs.mkdirSync(sessionDir, { recursive: true });
  fs.writeFileSync(path.join(dir, "lib", "allowed.ts"), "// allowed\n");
  fs.writeFileSync(path.join(dir, "lib", "blocked.ts"), "// blocked\n");
  fs.writeFileSync(path.join(sessionDir, "GOAL.md"), "Change lib/allowed.ts only.\n");
  fs.writeFileSync(
    path.join(dir, ".harness", "STATE.md"),
    `session: sessions/${sessionId}\ncurrent_plan: PLAN-001.md\n`
  );

  const result = handleCodexHook({
    hook_event_name: "PreToolUse",
    cwd: dir,
    tool_name: "Read",
    tool_input: { path: "lib/blocked.ts" },
  });

  assert.equal(result.hookSpecificOutput.permissionDecision, "allow");
  fs.rmSync(dir, { recursive: true, force: true });
});

test("codex hook router falls back to runtime-commands when .codex/commands/ missing", () => {
  const dir = tmpRepo();
  fs.mkdirSync(path.join(dir, ".ai-harness", "runtime-commands"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, ".ai-harness", "runtime-commands", "harness-verify.md"),
    "# harness-verify\n\nVerify implementation.\n"
  );
  const result = handleCodexHook({
    hook_event_name: "UserPromptSubmit",
    cwd: dir,
    prompt: "/harness-verify",
  });
  assert.match(result.hookSpecificOutput.additionalContext, /Execute the harness command/);
  assert.match(result.hookSpecificOutput.additionalContext, /harness-verify/);
  assert.match(result.hookSpecificOutput.additionalContext, /Verify implementation/);
});
