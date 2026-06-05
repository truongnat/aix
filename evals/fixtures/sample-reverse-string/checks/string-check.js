const test = require("node:test");
const assert = require("node:assert/strict");
const { reverseString } = require("../src/string");

test("reverseString reverses text", () => {
  assert.equal(reverseString("abc"), "cba");
});
