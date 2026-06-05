const test = require("node:test");
const assert = require("node:assert/strict");
const { abs } = require("../src/math");

test("abs removes negative sign", () => {
  assert.equal(abs(-4), 4);
});
