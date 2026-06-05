const test = require("node:test");
const assert = require("node:assert/strict");
const { clamp } = require("../src/math");

test("clamp bounds value", () => {
  assert.equal(clamp(15, 0, 10), 10);
});
