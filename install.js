/**
 * DEPRECATED: This legacy install path is maintained for backward compatibility only.
 *
 * New installations should use:
 *   npx ai-engineering-harness install --provider claude --yes
 *
 * This module will be removed in v1.1.0.
 * See lib/install-legacy.js for deprecation details.
 */
const api = require("./lib/install-legacy.js");

if (require.main === module) {
  try {
    api.main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = api;
