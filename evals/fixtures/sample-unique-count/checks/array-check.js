const test = require("node:test");
const assert = require("node:assert/strict");
const { uniqueCount } = require("../src/array");

test("uniqueCount counts distinct values", () => {
  assert.equal(uniqueCount([1, 1, 2]), 2);
});
