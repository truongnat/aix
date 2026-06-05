const test = require("node:test");
const assert = require("node:assert/strict");
const { firstItem } = require("../src/array");

test("firstItem returns the first element", () => {
  assert.equal(firstItem([3, 5, 8]), 3);
});
