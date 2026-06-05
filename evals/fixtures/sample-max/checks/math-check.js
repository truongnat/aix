const test = require("node:test");
const assert = require("node:assert/strict");
const { max } = require("../src/math");

test("max picks larger value", () => {
  assert.equal(max(2, 9), 9);
});
