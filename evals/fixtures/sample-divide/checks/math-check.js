const test = require("node:test");
const assert = require("node:assert/strict");
const { divide } = require("../src/math");

test("divide splits numbers", () => {
  assert.equal(divide(10, 2), 5);
});
