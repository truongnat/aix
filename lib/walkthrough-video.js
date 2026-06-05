"use strict";

const fs = require("node:fs");
const path = require("node:path");

function loadWalkthroughVideoConfig(repoRoot = path.resolve(__dirname, "..")) {
  const configPath = path.join(repoRoot, "media", "walkthrough-video.json");
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

module.exports = {
  loadWalkthroughVideoConfig,
};
