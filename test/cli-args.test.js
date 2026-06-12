const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

function fresh(modulePath) {
  const resolved = require.resolve(path.join(repoRoot, modulePath));
  delete require.cache[resolved];
  return require(resolved);
}

function parse(...argv) {
  const { parseArgv } = fresh("dist/cli/args.js");
  return parseArgv(["node", "script", ...argv]);
}

describe("parseArgv", () => {
  describe("commands", () => {
    it("defaults to install when no command given", () => {
      const opts = parse();
      assert.equal(opts.command, "install");
    });

    for (const cmd of [
      "install",
      "status",
      "doctor",
      "update",
      "uninstall",
      "help",
      "eval",
      "insights",
      "domains",
    ]) {
      it(`recognises command: ${cmd}`, () => {
        const opts = parse(cmd);
        assert.equal(opts.command, cmd);
      });
    }

    it("treats unknown first arg as install (not a command)", () => {
      assert.throws(() => parse("bogus"), /Unknown argument/);
    });
  });

  describe("boolean flags", () => {
    it("--dry-run sets dryRun", () => {
      assert.equal(parse("install", "--dry-run").dryRun, true);
    });

    it("--yes sets yes", () => {
      assert.equal(parse("install", "--yes").yes, true);
    });

    it("-y sets yes", () => {
      assert.equal(parse("install", "-y").yes, true);
    });

    it("--help sets help", () => {
      assert.equal(parse("install", "--help").help, true);
    });

    it("-h sets help", () => {
      assert.equal(parse("install", "-h").help, true);
    });

    it("--all sets all", () => {
      assert.equal(parse("status", "--all").all, true);
    });

    it("--verbose sets verbose", () => {
      assert.equal(parse("status", "--verbose").verbose, true);
    });

    it("--json sets json", () => {
      assert.equal(parse("status", "--json").json, true);
    });

    it("--export sets export", () => {
      assert.equal(parse("insights", "--export").export, true);
    });

    it("--force sets force", () => {
      assert.equal(parse("install", "--force").force, true);
    });
  });

  describe("--provider flag", () => {
    it("parses single provider", () => {
      const opts = parse("install", "--provider", "openai");
      assert.deepEqual(opts.providers, ["openai"]);
      assert.equal(opts.providerAlias, "provider");
    });

    it("parses comma-separated providers", () => {
      const opts = parse("install", "--provider", "openai,anthropic");
      assert.deepEqual(opts.providers, ["openai", "anthropic"]);
    });

    it("deduplicates providers", () => {
      const opts = parse("install", "--provider", "openai,openai");
      assert.deepEqual(opts.providers, ["openai"]);
    });

    it("throws when --provider has no value", () => {
      assert.throws(() => parse("install", "--provider"), /Missing value/);
    });
  });

  describe("--runtime alias", () => {
    it("sets runtimeAliasUsed to true", () => {
      const opts = parse("install", "--runtime", "openai");
      assert.equal(opts.runtimeAliasUsed, true);
      assert.deepEqual(opts.providers, ["openai"]);
    });
  });

  describe("--scope flag", () => {
    it("parses scope", () => {
      const opts = parse("install", "--scope", "project");
      assert.equal(opts.scope, "project");
    });
  });

  describe("--target flag", () => {
    it("parses target path", () => {
      const opts = parse("install", "--target", "/some/path");
      assert.equal(opts.target, "/some/path");
    });

    it("defaults to . when no target given", () => {
      assert.equal(parse("install").target, ".");
    });
  });

  describe("--ref flag", () => {
    it("throws error", () => {
      assert.throws(() => parse("install", "--ref", "main"), /--ref is not supported/);
    });
  });

  describe("--skip-demo-eval flag", () => {
    it("is silently accepted", () => {
      const opts = parse("install", "--skip-demo-eval");
      assert.equal(opts.command, "install");
    });
  });

  describe("eval subcommands", () => {
    for (const sub of ["list", "run", "report"]) {
      it(`parses eval ${sub}`, () => {
        const opts = parse("eval", sub);
        assert.equal(opts.command, "eval");
        assert.equal(opts.evalCommand, sub);
      });
    }

    it("parses eval run with target", () => {
      const opts = parse("eval", "run", "my-eval");
      assert.equal(opts.evalCommand, "run");
      assert.equal(opts.evalTarget, "my-eval");
    });

    it("throws on unknown eval subcommand", () => {
      assert.throws(() => parse("eval", "bogus"), /Unknown eval subcommand/);
    });

    it("throws on extra positional after eval target", () => {
      assert.throws(() => parse("eval", "run", "target", "extra"), /Unknown argument/);
    });
  });

  describe("--domains flag", () => {
    it("parses comma-separated domains", () => {
      const opts = parse("domains", "--domains", "web,api");
      assert.deepEqual(opts.domains, ["web", "api"]);
    });

    it("deduplicates domains", () => {
      const opts = parse("domains", "--domains", "web,web");
      assert.deepEqual(opts.domains, ["web"]);
    });

    it("throws when --domains has no value", () => {
      assert.throws(() => parse("domains", "--domains"), /Missing value/);
    });
  });

  describe("error cases", () => {
    it("throws on unknown flag", () => {
      assert.throws(() => parse("install", "--banana"), /Unknown argument/);
    });
  });
});

describe("modeToScopeVisibility", () => {
  it("maps project-private", () => {
    const { modeToScopeVisibility } = fresh("dist/cli/args.js");
    assert.deepEqual(modeToScopeVisibility("project-private"), {
      scope: "project",
      visibility: "private",
    });
  });

  it("maps project-shared", () => {
    const { modeToScopeVisibility } = fresh("dist/cli/args.js");
    assert.deepEqual(modeToScopeVisibility("project-shared"), {
      scope: "project",
      visibility: "shared",
    });
  });

  it("maps global", () => {
    const { modeToScopeVisibility } = fresh("dist/cli/args.js");
    assert.deepEqual(modeToScopeVisibility("global"), { scope: "global", visibility: "" });
  });

  it("defaults unknown to project-private", () => {
    const { modeToScopeVisibility } = fresh("dist/cli/args.js");
    assert.deepEqual(modeToScopeVisibility("unknown"), { scope: "project", visibility: "private" });
  });
});
