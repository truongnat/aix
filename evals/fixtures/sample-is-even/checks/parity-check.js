const test = require("node:test");
const assert = require("node:assert/strict");
const { isEven } = require("../src/parity");

test("isEven detects even numbers", () => {
  assert.equal(isEven(4), true);
});
