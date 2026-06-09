const js = require("@eslint/js");
const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = compat.config({
  env: {
    node: true,
    es2020: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  rules: {
    "linebreak-style": ["error", "unix"],
    semi: ["error", "always"],
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "no-console": ["warn", { allow: ["warn", "error", "log"] }],
    eqeqeq: ["error", "always"],
    curly: ["error", "all"],
    "no-var": "error",
    "prefer-const": "error",
  },
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "coverage/",
    "out/",
    ".ai-harness/",
    ".harness/",
    "demo-video/",
  ],
});
