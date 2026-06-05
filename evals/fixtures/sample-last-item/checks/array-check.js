const test = require("node:test");
const assert = require("node:assert/strict");
const { lastItem } = require("../src/array");

test("lastItem returns the final element", () => {
  assert.equal(lastItem([3, 5, 8]), 8);
});
