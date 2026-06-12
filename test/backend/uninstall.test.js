const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");
const { runUninstall } = require("../../dist/features/uninstall/application/run-uninstall.js");

function tmpRepo() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "un-"));
  cp.spawnSync("git", ["init", "-q"], { cwd: d });
  return d;
}

function withTempHome(fn) {
  const originalHome = process.env.HOME;
  const originalUserProfile = process.env.USERPROFILE;
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "aih-home-"));
  process.env.HOME = home;
  process.env.USERPROFILE = home;
  try {
    return fn(home);
  } finally {
    if (originalHome === undefined) {
      delete process.env.HOME;
    } else {
      process.env.HOME = originalHome;
    }
    if (originalUserProfile === undefined) {
      delete process.env.USERPROFILE;
    } else {
      process.env.USERPROFILE = originalUserProfile;
    }
  }
}

test("claude uninstall removes always-owned files and harness-owned settings.json", () => {
  const dir = tmpRepo();
  fs.mkdirSync(path.join(dir, ".claude", "commands"), { recursive: true });
  fs.mkdirSync(path.join(dir, ".claude", "agents"), { recursive: true });
  fs.mkdirSync(path.join(dir, ".claude", "skills"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".claude", "CLAUDE.md"), "anything\n"); // ownership always -> removed regardless of content
  fs.writeFileSync(
    path.join(dir, ".claude", "settings.json"),
    JSON.stringify(
      {
        hooks: {
          PreToolUse: [
            {
              matcher: "Bash",
              hooks: [
                {
                  type: "command",
                  command: "node .ai-harness/hooks/core/guard-phase.js",
                },
              ],
            },
          ],
          PostToolUse: [
            {
              matcher: "Bash",
              hooks: [
                {
                  type: "command",
                  command: "node .ai-harness/hooks/core/record-tool-output.js",
                },
              ],
            },
          ],
          SubagentStop: [
            {
              hooks: [
                {
                  type: "command",
                  command: "node .ai-harness/hooks/core/record-subagent-result.js",
                },
              ],
            },
          ],
          Stop: [
            {
              hooks: [
                {
                  type: "command",
                  command: "node .ai-harness/hooks/core/compact-session-memory.js",
                },
              ],
            },
          ],
        },
        extraKnownMarketplaces: {
          "ai-engineering-harness": {
            source: {
              source: "github",
              repo: "truongnat/ai-engineering-harness",
            },
          },
        },
      },
      null,
      2
    ) + "\n"
  );
  fs.writeFileSync(path.join(dir, ".claude", "commands", "harness-plan.md"), "x\n");
  runUninstall({
    targetAbs: dir,
    provider: "claude",
    scope: "project",
    dryRun: false,
    removeCache: false,
    removeState: false,
    all: false,
  });
  assert.equal(
    fs.existsSync(path.join(dir, ".claude", "CLAUDE.md")),
    false,
    "CLAUDE.md removed (always)"
  );
  assert.equal(
    fs.existsSync(path.join(dir, ".claude", "settings.json")),
    false,
    "settings.json removed when harness-owned"
  );
  assert.equal(
    fs.existsSync(path.join(dir, ".claude", "commands")),
    false,
    "commands dir removed (always)"
  );
  assert.equal(fs.existsSync(path.join(dir, ".claude", "agents")), false, "agents dir removed");
  assert.equal(fs.existsSync(path.join(dir, ".claude", "skills")), false, "skills dir removed");
});

test("AGENTS.md removed only when it contains the harness marker (codex provider)", () => {
  const owned = tmpRepo();
  fs.writeFileSync(path.join(owned, "AGENTS.md"), "# ai-engineering-harness\n");
  runUninstall({
    targetAbs: owned,
    provider: "codex",
    scope: "project",
    dryRun: false,
    removeCache: false,
    removeState: false,
    all: false,
  });
  assert.equal(fs.existsSync(path.join(owned, "AGENTS.md")), false, "marker AGENTS.md removed");

  const foreign = tmpRepo();
  fs.writeFileSync(path.join(foreign, "AGENTS.md"), "my own agents file\n");
  runUninstall({
    targetAbs: foreign,
    provider: "codex",
    scope: "project",
    dryRun: false,
    removeCache: false,
    removeState: false,
    all: false,
  });
  assert.equal(fs.existsSync(path.join(foreign, "AGENTS.md")), true, "non-marker AGENTS.md kept");
});

test("cache/state dirs kept unless requested; all=true removes both", () => {
  const dir = tmpRepo();
  fs.mkdirSync(path.join(dir, ".ai-harness"));
  fs.mkdirSync(path.join(dir, ".harness"));
  runUninstall({
    targetAbs: dir,
    provider: "claude",
    scope: "project",
    dryRun: false,
    removeCache: false,
    removeState: false,
    all: false,
  });
  assert.equal(fs.existsSync(path.join(dir, ".ai-harness")), true, "cache kept by default");
  assert.equal(fs.existsSync(path.join(dir, ".harness")), true, "state kept by default");
  runUninstall({
    targetAbs: dir,
    provider: "claude",
    scope: "project",
    dryRun: false,
    removeCache: false,
    removeState: false,
    all: true,
  });
  assert.equal(fs.existsSync(path.join(dir, ".ai-harness")), false, "cache removed with all");
  assert.equal(fs.existsSync(path.join(dir, ".harness")), false, "state removed with all");
});

test("dryRun removes nothing", () => {
  const dir = tmpRepo();
  fs.mkdirSync(path.join(dir, ".claude"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".claude", "CLAUDE.md"), "x\n");
  runUninstall({
    targetAbs: dir,
    provider: "claude",
    scope: "project",
    dryRun: true,
    removeCache: true,
    removeState: true,
    all: true,
  });
  assert.equal(fs.existsSync(path.join(dir, ".claude", "CLAUDE.md")), true);
});

test("uninstall strips the git exclude harness block", () => {
  const dir = tmpRepo();
  fs.mkdirSync(path.join(dir, ".git", "info"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, ".git", "info", "exclude"),
    "x/\n# ai-engineering-harness start\n.harness/\n# ai-engineering-harness end\n"
  );
  runUninstall({
    targetAbs: dir,
    provider: "claude",
    scope: "project",
    dryRun: false,
    removeCache: false,
    removeState: false,
    all: false,
  });
  assert.doesNotMatch(
    fs.readFileSync(path.join(dir, ".git", "info", "exclude"), "utf8"),
    /ai-engineering-harness/
  );
});

test("global uninstall removes Claude home-directory surface", () => {
  withTempHome((home) => {
    fs.mkdirSync(path.join(home, ".claude", "agents"), { recursive: true });
    fs.mkdirSync(path.join(home, ".claude", "skills"), { recursive: true });
    fs.mkdirSync(path.join(home, ".claude", "commands"), { recursive: true });
    fs.writeFileSync(path.join(home, ".claude", "CLAUDE.md"), "# ai-engineering-harness\n");
    fs.writeFileSync(
      path.join(home, ".claude", "settings.json"),
      JSON.stringify(
        {
          hooks: {
            PreToolUse: [
              {
                matcher: "Bash",
                hooks: [{ type: "command", command: "node .ai-harness/hooks/core/guard-phase.js" }],
              },
            ],
            PostToolUse: [
              {
                matcher: "Bash",
                hooks: [
                  {
                    type: "command",
                    command: "node .ai-harness/hooks/core/record-tool-output.js",
                  },
                ],
              },
            ],
            SubagentStop: [
              {
                hooks: [
                  {
                    type: "command",
                    command: "node .ai-harness/hooks/core/record-subagent-result.js",
                  },
                ],
              },
            ],
            Stop: [
              {
                hooks: [
                  {
                    type: "command",
                    command: "node .ai-harness/hooks/core/compact-session-memory.js",
                  },
                ],
              },
            ],
          },
        },
        null,
        2
      ) + "\n"
    );

    const result = runUninstall({
      targetAbs: tmpRepo(),
      provider: "claude",
      scope: "global",
      dryRun: false,
      removeCache: false,
      removeState: false,
      all: false,
    });

    assert.equal(result.ok, true);
    assert.equal(fs.existsSync(path.join(home, ".claude", "CLAUDE.md")), false);
    assert.equal(fs.existsSync(path.join(home, ".claude", "settings.json")), false);
    assert.equal(fs.existsSync(path.join(home, ".claude", "agents")), false);
    assert.equal(fs.existsSync(path.join(home, ".claude", "skills")), false);
    assert.equal(fs.existsSync(path.join(home, ".claude", "commands")), false);
  });
});

test("global uninstall removes Codex home-directory skills surface", () => {
  withTempHome((home) => {
    fs.mkdirSync(path.join(home, ".agents", "skills", "verification"), { recursive: true });
    fs.writeFileSync(path.join(home, ".agents", "skills", "verification", "SKILL.md"), "# x\n");
    fs.mkdirSync(path.join(home, ".codex"), { recursive: true });
    fs.writeFileSync(path.join(home, ".codex", "AGENTS.md"), "# ai-engineering-harness\n");

    const result = runUninstall({
      targetAbs: tmpRepo(),
      provider: "codex",
      scope: "global",
      dryRun: false,
      removeCache: false,
      removeState: false,
      all: false,
    });

    assert.equal(result.ok, true);
    assert.equal(fs.existsSync(path.join(home, ".agents", "skills")), false);
    assert.equal(fs.existsSync(path.join(home, ".codex", "AGENTS.md")), false);
  });
});
