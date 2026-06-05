const test = require("node:test");
const assert = require("node:assert/strict");

const { add } = require("../src/math");

test("add sums both numbers", () => {
  assert.equal(add(2, 3), 5);
});
