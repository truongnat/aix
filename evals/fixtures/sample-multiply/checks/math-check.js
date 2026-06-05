const test = require("node:test");
const assert = require("node:assert/strict");
const { multiply } = require("../src/math");

test("multiply combines factors", () => {
  assert.equal(multiply(6, 7), 42);
});
