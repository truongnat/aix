import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false,
  sourcemap: false,
  clean: true,
  target: "es2023",
  platform: "node",
  outDir: "dist",
  bundle: true,
  noExternal: [/^@x\//, /^(?!node:|readline).*/],
  
  banner: {
    js: "#!/usr/bin/env node\nimport { createRequire } from 'module';\nconst require = createRequire(import.meta.url);",
  },
});
