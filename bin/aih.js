#!/usr/bin/env node
"use strict";

const { main } = require("../lib/cli-main");

main(process.argv, __filename).then((code) => {
  process.exit(code);
});
