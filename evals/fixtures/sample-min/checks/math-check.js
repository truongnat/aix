const test = require("node:test");
const assert = require("node:assert/strict");
const { min } = require("../src/math");

test("min picks smaller value", () => {
  assert.equal(min(2, 9), 2);
});
