const test = require("node:test");
const assert = require("node:assert/strict");
const { sumArray } = require("../src/array");

test("sumArray totals values", () => {
  assert.equal(sumArray([1, 2, 3]), 6);
});
