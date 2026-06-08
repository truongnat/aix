const fs = require("node:fs");

const file = process.argv[2];
if (!file) {
  process.exit(1);
}

const content = fs.readFileSync(file, "utf8");
const required = ["Status:", "Evidence:", "Known Gaps:"];
const forbidden = ["follows the Output Contract"];

for (const pattern of required) {
  if (!content.includes(pattern)) {
    process.exit(1);
  }
}

for (const pattern of forbidden) {
  if (content.toLowerCase().includes(pattern.toLowerCase())) {
    process.exit(1);
  }
}

process.exit(0);
