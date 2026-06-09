const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const {
  renderProviderInteractionMarkdown,
  normalizeProvider,
} = require(path.join(__dirname, "..", "dist", "lib", "provider-interaction-tools.js"));

test("renderProviderInteractionMarkdown includes AskQuestion for cursor", () => {
  const md = renderProviderInteractionMarkdown(["cursor"]);
  assert.match(md, /Primary provider/);
  assert.match(md, /cursor/i);
  assert.match(md, /AskQuestion/);
  assert.match(md, /do not stop at markdown-only/i);
});

test("renderProviderInteractionMarkdown includes AskUserQuestion for claude", () => {
  const md = renderProviderInteractionMarkdown(["claude"]);
  assert.match(md, /AskUserQuestion/);
});

test("normalizeProvider falls back to generic", () => {
  assert.equal(normalizeProvider("unknown"), "generic");
});
