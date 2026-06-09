#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { appendHarnessEvent, findHarnessRoot, readText } = require("./_util.js");
const { buildSessionStartIntent } = require("./domain-bootstrap.js");

function readHookPayload() {
  try {
    if (process.stdin.isTTY) {
      return {};
    }
    const raw = fs.readFileSync(0, "utf8").trim();
    if (!raw) {
      return {};
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function getHookEventName(payload) {
  return payload.hook_event_name || payload.hookEventName || payload.event || payload.name || "";
}

function getCwd(payload) {
  return payload.cwd || payload.working_directory || payload.workingDirectory || process.cwd();
}

function getCommand(payload) {
  const toolInput = payload.tool_input || payload.toolInput || payload.input || {};
  if (typeof toolInput === "string") {
    return toolInput;
  }
  if (toolInput && typeof toolInput === "object") {
    return (
      toolInput.command ||
      toolInput.shell_command ||
      toolInput.text ||
      toolInput.prompt ||
      toolInput.input ||
      ""
    );
  }
  return payload.command || payload.shell_command || "";
}

function getPrompt(payload) {
  return payload.prompt || payload.user_prompt || payload.message || "";
}

function safeRead(filePath) {
  try {
    return fs.existsSync(filePath) ? readText(filePath) : "";
  } catch {
    return "";
  }
}

function buildSessionContext(repoRoot) {
  const goal = safeRead(path.join(repoRoot, ".harness", "GOAL.md"));
  const plan = safeRead(path.join(repoRoot, ".harness", "PLAN.md"));
  const state = safeRead(path.join(repoRoot, ".harness", "STATE.md"));
  const chunks = [buildSessionStartIntent(repoRoot)];
  if (state.trim()) {
    chunks.push("Current harness state is present.");
  }
  if (goal.trim()) {
    chunks.push("A goal file exists; keep the current goal in scope.");
  }
  if (plan.trim()) {
    chunks.push("A plan file exists; follow the approved step order.");
  }
  return chunks.join(" ");
}

function buildPromptContext() {
  return "Use the harness loop: discuss, plan, run, verify, ship, then remember.";
}

function sanitizeCommand(command) {
  return command.replace(/\s+/g, " ").trim();
}

function isDangerous(command) {
  return (
    /(^|\s)git push\s+--force(\-with-lease)?(\s|$)/.test(command) ||
    /(^|\s)git reset\s+--hard(\s|$)/.test(command) ||
    /(^|\s)git clean\s+-fdx(\s|$)/.test(command) ||
    /(^|\s)rm\s+-rf(\s|$)/.test(command)
  );
}

function isPromptWorthy(command) {
  return (
    /(^|\s)(npm|pnpm|yarn)\s+(install|add)\b/.test(command) ||
    /(^|\s)gh\s+pr\s+merge\b/.test(command) ||
    /(^|\s)npm\s+publish\b/.test(command) ||
    /(^|\s)vercel\b/.test(command)
  );
}

function recordEvent(repoRoot, event) {
  try {
    appendHarnessEvent(repoRoot, event);
  } catch {
    // Best-effort only.
  }
}

function hookOutput(eventName, payload) {
  return {
    hookSpecificOutput: {
      hookEventName: eventName,
      ...payload,
    },
  };
}

function handleSessionStart(repoRoot, eventName) {
  recordEvent(repoRoot, {
    type: "codex-hook",
    hook_event: eventName,
    cwd: repoRoot,
  });
  return hookOutput(eventName, {
    additionalContext: buildSessionContext(repoRoot),
  });
}

function handlePromptSubmit(repoRoot, eventName, payload) {
  const prompt = getPrompt(payload).trim();
  recordEvent(repoRoot, {
    type: "codex-hook",
    hook_event: eventName,
    prompt,
  });
  const parts = [buildPromptContext()];
  if (prompt) {
    parts.push(`User prompt: ${prompt}`);
  }
  return hookOutput(eventName, {
    additionalContext: parts.join(" "),
  });
}

function handleToolEvent(repoRoot, eventName, payload) {
  const command = sanitizeCommand(getCommand(payload));
  recordEvent(repoRoot, {
    type: "codex-hook",
    hook_event: eventName,
    command,
  });

  if (!command) {
    return null;
  }

  if (isDangerous(command)) {
    return hookOutput(eventName, {
      permissionDecision: "deny",
      decision: "deny",
      permissionDecisionReason:
        "Blocked by harness Codex policy: use a safer alternative such as revert, branch, or targeted cleanup.",
      systemMessage:
        "Blocked by harness Codex policy: use a safer alternative such as revert, branch, or targeted cleanup.",
    });
  }

  if (isPromptWorthy(command)) {
    return hookOutput(eventName, {
      additionalContext:
        "Harness Codex policy: confirm dependency, merge, or deploy operations before continuing.",
    });
  }

  return hookOutput(eventName, {
    permissionDecision: "allow",
    decision: "allow",
  });
}

function handlePostToolUse(repoRoot, eventName, payload) {
  const command = sanitizeCommand(getCommand(payload));
  recordEvent(repoRoot, {
    type: "codex-hook",
    hook_event: eventName,
    command,
    status: payload.status || payload.exit_code || payload.exitCode || "recorded",
  });
  return hookOutput(eventName, {
    additionalContext: "Command output was recorded in the harness event log.",
  });
}

function handleStop(repoRoot, eventName) {
  recordEvent(repoRoot, {
    type: "codex-hook",
    hook_event: eventName,
    status: "stop",
  });
  return hookOutput(eventName, {
    additionalContext: "Stop event received. Compact session memory if needed before exit.",
  });
}

function handleCodexHook(payload) {
  const eventName = getHookEventName(payload) || "Unknown";
  const cwd = getCwd(payload);
  let repoRoot = cwd;

  try {
    repoRoot = findHarnessRoot(cwd);
  } catch {
    // Fall back to cwd.
  }

  switch (eventName) {
    case "SessionStart":
      return handleSessionStart(repoRoot, eventName);
    case "UserPromptSubmit":
      return handlePromptSubmit(repoRoot, eventName, payload);
    case "PreToolUse":
    case "PermissionRequest":
      return handleToolEvent(repoRoot, eventName, payload);
    case "PostToolUse":
      return handlePostToolUse(repoRoot, eventName, payload);
    case "Stop":
      return handleStop(repoRoot, eventName);
    case "SubagentStart":
    case "SubagentStop":
      recordEvent(repoRoot, {
        type: "codex-hook",
        hook_event: eventName,
      });
      return hookOutput(eventName, {
        additionalContext: `Harness recorded ${eventName.toLowerCase()} for traceability.`,
      });
    default:
      recordEvent(repoRoot, {
        type: "codex-hook",
        hook_event: eventName,
      });
      return null;
  }
}

function main() {
  const payload = readHookPayload();
  const result = handleCodexHook(payload);
  if (result) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  handleCodexHook,
  isDangerous,
  isPromptWorthy,
};
