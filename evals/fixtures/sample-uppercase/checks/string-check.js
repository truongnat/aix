const test = require("node:test");
const assert = require("node:assert/strict");
const { uppercase } = require("../src/string");

test("uppercase capitalizes text", () => {
  assert.equal(uppercase("Harness"), "HARNESS");
});
