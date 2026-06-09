"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  getRuntimeBootstrapPaths,
  isValidTargetRuntime,
  normalizeTargetRuntime,
} = require("../dist/lib/validate/target");

describe("validate/target", () => {
  describe("normalizeTargetRuntime", () => {
    it("returns input unchanged", () => {
      assert.equal(normalizeTargetRuntime("cursor"), "cursor");
      assert.equal(normalizeTargetRuntime("claude"), "claude");
      assert.equal(normalizeTargetRuntime("codex"), "codex");
    });
  });

  describe("isValidTargetRuntime", () => {
    it("accepts known runtimes", () => {
      for (const id of ["generic", "cursor", "codex", "claude", "gemini", "manual"]) {
        assert.ok(isValidTargetRuntime(id), `expected ${id} to be valid`);
      }
    });

    it("rejects unknown runtimes", () => {
      assert.equal(isValidTargetRuntime("unknown"), false);
      assert.equal(isValidTargetRuntime(""), false);
      assert.equal(isValidTargetRuntime("vscode"), false);
    });
  });

  describe("getRuntimeBootstrapPaths", () => {
    it("returns AGENTS.md for generic", () => {
      const paths = getRuntimeBootstrapPaths("generic");
      assert.deepEqual(paths, ["AGENTS.md"]);
    });

    it("returns AGENTS.md for codex", () => {
      const paths = getRuntimeBootstrapPaths("codex");
      assert.deepEqual(paths, ["AGENTS.md"]);
    });

    it("returns AGENTS.md for manual", () => {
      const paths = getRuntimeBootstrapPaths("manual");
      assert.deepEqual(paths, ["AGENTS.md"]);
    });

    it("returns cursor rule paths", () => {
      const paths = getRuntimeBootstrapPaths("cursor");
      assert.ok(Array.isArray(paths));
      assert.ok(paths.length >= 3);
      assert.ok(paths.some((p) => p.includes(".cursor/")));
    });

    it("returns gemini extension paths", () => {
      const paths = getRuntimeBootstrapPaths("gemini");
      assert.ok(Array.isArray(paths));
      assert.ok(paths.some((p) => p.includes(".gemini/")));
    });

    it("returns claude paths", () => {
      const paths = getRuntimeBootstrapPaths("claude");
      assert.ok(Array.isArray(paths));
      assert.ok(paths.some((p) => p.includes(".claude/")));
    });

    it("returns null for unknown runtime", () => {
      assert.equal(getRuntimeBootstrapPaths("unknown"), null);
    });
  });
});
