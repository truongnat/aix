const api = require("./lib/validate/index.js");

if (require.main === module) {
  api.main();
}

module.exports = api;
