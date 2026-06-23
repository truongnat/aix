#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const srcPath = path.join(repoRoot, "lib", "runtime-command-catalog.js");
const lines = fs.readFileSync(srcPath, "utf8").split(/\r?\n/);

const catalogDir = path.join(repoRoot, "lib", "catalog");
fs.mkdirSync(catalogDir, { recursive: true });

const metadataHeader = `"use strict";

const { PROVIDER_RULE_ADAPTERS } = require("../provider-rule-renderer.js");

`;

const metadataBody = [...lines.slice(34, 268), "", ...lines.slice(784, 806)].join("\n");

const metadataFooter = `
module.exports = {
  COMMAND_NAMESPACE,
  CACHE_DIR,
  RUNTIME_COMMANDS_DIR,
  PROMPT_TEMPLATES_DIR,
  PACK_PLUGIN_PATHS,
  PROVIDER_COMMAND_SUPPORT,
  WORKFLOW_COMMANDS,
  CLI_DIAGNOSTIC_COMMANDS,
  CANONICAL_COMMANDS,
  SLASH_COMMANDS,
  providerCommandSupport,
  providerInvocationFor,
  formatProviderUseLine,
  providerCommandPathsForRuntime,
  runtimeCommandCatalogPathsForPlan,
};
`;

fs.writeFileSync(
  path.join(catalogDir, "provider-command-metadata.js"),
  metadataHeader + metadataBody + metadataFooter
);

const renderingHeader = `"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { renderClaudeCommandFile } = require("../provider-rule-renderer.js");
const {
  COMMAND_NAMESPACE,
  CACHE_DIR,
  RUNTIME_COMMANDS_DIR,
  WORKFLOW_COMMANDS,
  CANONICAL_COMMANDS,
  PROVIDER_COMMAND_SUPPORT,
  providerCommandSupport,
} = require("./provider-command-metadata.js");

`;

const renderingBody = lines.slice(269, 463).join("\n");
const renderingFooter = `
module.exports = {
  buildCommandSurface,
  readInstalledCommandSurface,
  formatCommandSupportForPlan,
  activationMarkdown,
  renderRuntimeCommandFile,
  renderClaudeCommandFileFromSpec,
  renderAgentsCommandAliasesSection,
  buildManifest,
};
`;

fs.writeFileSync(
  path.join(catalogDir, "command-rendering.js"),
  renderingHeader + renderingBody + renderingFooter
);

const installHeader = `"use strict";

const fs = require("node:fs");
const path = require("node:path");
const {
  renderCursorActivationMdc,
  renderCursorCommandsMdc,
  renderCursorGuardrailsMdc,
} = require("../provider-rule-renderer.js");
const {
  CACHE_DIR,
  RUNTIME_COMMANDS_DIR,
  PROMPT_TEMPLATES_DIR,
  WORKFLOW_COMMANDS,
  providerCommandPathsForRuntime,
} = require("./provider-command-metadata.js");
const {
  activationMarkdown,
  renderRuntimeCommandFile,
  renderClaudeCommandFileFromSpec,
  renderAgentsCommandAliasesSection,
  buildManifest,
  buildCommandSurface,
} = require("./command-rendering.js");

`;

let installBody = lines.slice(464, 779).join("\n");
installBody = installBody.replace(
  'const repoRoot = path.resolve(__dirname, "..");',
  'const repoRoot = path.resolve(__dirname, "../..");'
);

const installFooter = `
${lines.slice(807, 814).join("\n")}

module.exports = {
  writeFile,
  installPromptTemplates,
  installRuntimeCommandCatalog,
  mergeManifestProviders,
  installClaudeNativeCommands,
  installCursorHarnessFallback,
  appendAgentsCommandAliases,
  installGeminiHarnessFallback,
  installProviderNativeCommands,
  installProviderFallbackCommands,
  installProviderCommandSurface,
  fileReferencesActivation,
};
`;

fs.writeFileSync(
  path.join(catalogDir, "command-installation.js"),
  installHeader + installBody + installFooter
);

const facade = `"use strict";

const { PROVIDER_RULE_ADAPTERS } = require("./provider-rule-renderer.js");
const metadata = require("./catalog/provider-command-metadata.js");
const rendering = require("./catalog/command-rendering.js");
const installation = require("./catalog/command-installation.js");

module.exports = {
  ...metadata,
  ...rendering,
  ...installation,
  PROVIDER_RULE_ADAPTERS,
};
`;

fs.writeFileSync(path.join(repoRoot, "lib", "runtime-command-catalog.js"), facade);
process.stdout.write("catalog split complete\n");
