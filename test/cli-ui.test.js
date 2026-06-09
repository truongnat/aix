"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { useInteractiveUi, isCancel } = require("../dist/lib/cli-ui");

describe("cli-ui", () => {
  describe("useInteractiveUi", () => {
    it("returns falsy when --yes is set", () => {
      assert.ok(!useInteractiveUi({ yes: true, providers: [] }));
    });

    it("returns falsy in non-TTY environment", () => {
      if (!process.stdin.isTTY || !process.stdout.isTTY) {
        assert.ok(!useInteractiveUi({ yes: false, providers: [] }));
      }
    });

    it("returns falsy when providers are pre-selected in non-TTY", () => {
      if (!process.stdin.isTTY || !process.stdout.isTTY) {
        assert.ok(!useInteractiveUi({ yes: false, providers: ["claude"] }));
      }
    });
  });

  describe("isCancel", () => {
    it("always returns false (stub implementation)", () => {
      assert.equal(isCancel(undefined), false);
      assert.equal(isCancel(null), false);
      assert.equal(isCancel("value"), false);
      assert.equal(isCancel(Symbol("cancel")), false);
    });
  });
});
