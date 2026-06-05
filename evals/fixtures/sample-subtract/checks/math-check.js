const test = require("node:test");
const assert = require("node:assert/strict");
const { subtract } = require("../src/math");

test("subtract removes the second value", () => {
  assert.equal(subtract(10, 3), 7);
});
