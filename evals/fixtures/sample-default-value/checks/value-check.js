const test = require("node:test");
const assert = require("node:assert/strict");
const { defaultValue } = require("../src/value");

test("defaultValue uses fallback", () => {
  assert.equal(defaultValue(undefined, "x"), "x");
});
