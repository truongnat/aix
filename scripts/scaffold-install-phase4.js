#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

const copies = [
  ["lib/backend/constants.ts", "src/shared/install-kernel/constants.ts", "domain"],
  ["lib/backend/git-hygiene.ts", "src/shared/install-kernel/git-hygiene.ts", "infrastructure"],
  [
    "lib/backend/harness-skeleton.ts",
    "src/features/install/infrastructure/harness-skeleton.ts",
    "infrastructure",
  ],
  [
    "lib/backend/install-orchestrator.ts",
    "src/features/install/application/run-install.ts",
    "application",
  ],
  [
    "lib/install-cache.ts",
    "src/features/install/infrastructure/install-cache.ts",
    "infrastructure",
  ],
  [
    "lib/install-runtime.ts",
    "src/features/install/infrastructure/install-runtime.ts",
    "infrastructure",
  ],
  ["lib/backend/update.ts", "src/features/update/application/run-update.ts", "application"],
  [
    "lib/backend/uninstall.ts",
    "src/features/uninstall/application/run-uninstall.ts",
    "application",
  ],
  [
    "lib/cli-commands/install.ts",
    "src/features/install/presentation/install-command.ts",
    "presentation",
  ],
  [
    "lib/cli-commands/update.ts",
    "src/features/update/presentation/update-command.ts",
    "presentation",
  ],
  [
    "lib/cli-commands/uninstall.ts",
    "src/features/uninstall/presentation/uninstall-command.ts",
    "presentation",
  ],
];

const headers = {
  domain: (purpose) => `// Purpose: ${purpose}\n// Layer: domain\n// Depends on: nothing\n\n`,
  infrastructure: (purpose) =>
    `// Purpose: ${purpose}\n// Layer: infrastructure\n// Depends on: domain, legacy lib bridges\n\n`,
  application: (purpose) =>
    `// Purpose: ${purpose}\n// Layer: application\n// Depends on: domain, infrastructure, install-kernel\n\n`,
  presentation: (purpose) =>
    `// Purpose: ${purpose}\n// Layer: presentation\n// Depends on: application, legacy CLI bridges\n\n`,
};

const purposes = {
  "src/shared/install-kernel/constants.ts":
    "Install/uninstall path constants and provider surface maps",
  "src/shared/install-kernel/git-hygiene.ts":
    "Private git exclude block management for project installs",
  "src/features/install/infrastructure/harness-skeleton.ts":
    "Initialize .harness/ profile skeleton on first install",
  "src/features/install/application/run-install.ts": "Orchestrate full install dispatch sequence",
  "src/features/install/infrastructure/install-cache.ts":
    "Install .ai-harness/ capability cache into target repo",
  "src/features/install/infrastructure/install-runtime.ts":
    "Runtime-native provider surface installation",
  "src/features/update/application/run-update.ts":
    "Refresh installed harness surfaces via install orchestrator",
  "src/features/uninstall/application/run-uninstall.ts":
    "Remove provider surfaces and optional harness state",
  "src/features/install/presentation/install-command.ts": "Interactive install wizard CLI handler",
  "src/features/update/presentation/update-command.ts": "Interactive update wizard CLI handler",
  "src/features/uninstall/presentation/uninstall-command.ts":
    "Interactive uninstall wizard CLI handler",
};

for (const [fromRel, toRel, layer] of copies) {
  const from = path.join(root, fromRel);
  const to = path.join(root, toRel);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  let content = fs.readFileSync(from, "utf8");
  if (!content.startsWith("// Purpose:")) {
    content = headers[layer](purposes[toRel]) + content;
  }
  fs.writeFileSync(to, content);
  console.log("copied", toRel);
}

const replacements = [
  {
    base: path.join(root, "src/features/install/application"),
    rules: [
      ['from "./git-hygiene"', 'from "../../../shared/install-kernel/git-hygiene"'],
      ['from "./harness-skeleton"', 'from "../infrastructure/harness-skeleton"'],
      ['from "../install-cache"', 'from "../infrastructure/install-cache"'],
      ['from "../install-runtime"', 'from "../infrastructure/install-runtime"'],
      [
        'import { writeDomainSkillSurface } from "../domain-skill-generation";',
        'import { legacyDomainSkillGeneration } from "../infrastructure/legacy-deps";\nconst { writeDomainSkillSurface } = legacyDomainSkillGeneration;',
      ],
      [
        'import { installProviderInteraction } from "../catalog/command-installation";',
        'import { legacyCommandInstallation } from "../infrastructure/legacy-deps";\nconst { installProviderInteraction } = legacyCommandInstallation;',
      ],
      [
        'import { isRuntimeNative } from "../cli-providers";',
        'import { legacyCliProviders } from "../infrastructure/legacy-deps";\nconst { isRuntimeNative } = legacyCliProviders;',
      ],
      [
        'import { isGitRepo } from "../provider-detection";',
        'import { legacyProviderDetection } from "../infrastructure/legacy-deps";\nconst { isGitRepo } = legacyProviderDetection;',
      ],
    ],
  },
  {
    base: path.join(root, "src/features/install/infrastructure"),
    rules: [
      [
        'import { ensureDirectory, logAction } from "./file-operations";',
        'import { legacyFileOperations } from "./legacy-deps";\nconst { ensureDirectory, logAction } = legacyFileOperations;',
      ],
      [
        'import { installProviderCommandSurface } from "./runtime-command-catalog";',
        'import { legacyRuntimeCommandCatalog } from "./legacy-deps";\nconst { installProviderCommandSurface } = legacyRuntimeCommandCatalog;',
      ],
      [
        'import { installClaudeWorkers } from "./worker-claude-adapter";',
        'import { legacyWorkerClaudeAdapter } from "./legacy-deps";\nconst { installClaudeWorkers } = legacyWorkerClaudeAdapter;',
      ],
      [
        'import { renderCodexRuleSet } from "./codex-rule-generation";',
        'import { legacyCodexRuleGeneration } from "./legacy-deps";\nconst { renderCodexRuleSet } = legacyCodexRuleGeneration;',
      ],
      [
        'import {\n  renderClaudeProjectMd,\n  renderCodexAgentsMd,\n  renderCursorActivationMdc,\n  renderCursorCommandsMdc,\n  renderCursorGuardrailsMdc,\n  renderGeminiMd,\n} from "./provider-rule-renderer";',
        'import { legacyProviderRuleRenderer } from "./legacy-deps";\nconst {\n  renderClaudeProjectMd,\n  renderCodexAgentsMd,\n  renderCursorActivationMdc,\n  renderCursorCommandsMdc,\n  renderCursorGuardrailsMdc,\n  renderGeminiMd,\n} = legacyProviderRuleRenderer;',
      ],
      [
        'import { RUNTIME_NATIVE_PROVIDER_IDS } from "./cli-providers";',
        'import { legacyCliProviders } from "./legacy-deps";\nconst { RUNTIME_NATIVE_PROVIDER_IDS } = legacyCliProviders;',
      ],
      [
        'import { workers } from "../workers/registry";',
        'import { legacyWorkerRegistry } from "./legacy-deps";\nconst { workers } = legacyWorkerRegistry;',
      ],
      [
        'import { installRuntimeCommandCatalog } from "./runtime-command-catalog";',
        'import { legacyRuntimeCommandCatalog } from "./legacy-deps";\nconst { installRuntimeCommandCatalog } = legacyRuntimeCommandCatalog;',
      ],
      [
        'import { ensureDirectory } from "./file-operations";',
        'import { legacyFileOperations } from "./legacy-deps";\nconst { ensureDirectory } = legacyFileOperations;',
      ],
    ],
  },
  {
    base: path.join(root, "src/features/update/application"),
    rules: [
      ['from "./install-orchestrator"', 'from "../../install/application/run-install"'],
      [
        'import { readInstalledCommandSurface } from "../runtime-command-catalog";',
        'import { legacyRuntimeCommandCatalog } from "../../install/infrastructure/legacy-deps";\nconst { readInstalledCommandSurface } = legacyRuntimeCommandCatalog;',
      ],
    ],
  },
  {
    base: path.join(root, "src/features/uninstall/application"),
    rules: [
      ['from "./constants"', 'from "../../../shared/install-kernel/constants"'],
      ['from "./git-hygiene"', 'from "../../../shared/install-kernel/git-hygiene"'],
      [
        'import { isGitRepo } from "../provider-detection";',
        'import { legacyProviderDetection } from "../../install/infrastructure/legacy-deps";\nconst { isGitRepo } = legacyProviderDetection;',
      ],
    ],
  },
  {
    base: path.join(root, "src/features/install/presentation"),
    rules: [
      ['from "../cli-args"', 'from "./cli-legacy"'],
      ['from "../cli-providers"', 'from "./cli-legacy"'],
      ['from "../cli-detect"', 'from "./cli-legacy"'],
      ['from "../stack-detect"', 'from "./cli-legacy"'],
      ['from "../cli-plan"', 'from "./cli-legacy"'],
      ['from "../cli-ui"', 'from "./cli-legacy"'],
      ['from "../cli-command-helpers"', 'from "./cli-legacy"'],
      ['from "../backend/install-orchestrator"', 'from "../application/run-install"'],
    ],
  },
  {
    base: path.join(root, "src/features/update/presentation"),
    rules: [
      ['from "../cli-args"', 'from "../../install/presentation/cli-legacy"'],
      ['from "../cli-providers"', 'from "../../install/presentation/cli-legacy"'],
      ['from "../cli-detect"', 'from "../../install/presentation/cli-legacy"'],
      ['from "../cli-ui"', 'from "../../install/presentation/cli-legacy"'],
      ['from "../backend/update"', 'from "../application/run-update"'],
      [
        'import { readInstalledCommandSurface } from "../runtime-command-catalog";',
        'import { legacyRuntimeCommandCatalog } from "../../install/infrastructure/legacy-deps";\nconst { readInstalledCommandSurface } = legacyRuntimeCommandCatalog;',
      ],
      ['from "../cli-command-helpers"', 'from "../../install/presentation/cli-legacy"'],
    ],
  },
  {
    base: path.join(root, "src/features/uninstall/presentation"),
    rules: [
      ['from "../cli-args"', 'from "../../install/presentation/cli-legacy"'],
      ['from "../cli-providers"', 'from "../../install/presentation/cli-legacy"'],
      ['from "../cli-detect"', 'from "../../install/presentation/cli-legacy"'],
      ['from "../cli-ui"', 'from "../../install/presentation/cli-legacy"'],
      ['from "../backend/uninstall"', 'from "../application/run-uninstall"'],
      [
        'import { readInstalledCommandSurface } from "../runtime-command-catalog";',
        'import { legacyRuntimeCommandCatalog } from "../../install/infrastructure/legacy-deps";\nconst { readInstalledCommandSurface } = legacyRuntimeCommandCatalog;',
      ],
      ['from "../cli-command-helpers"', 'from "../../install/presentation/cli-legacy"'],
    ],
  },
];

function applyRules(filePath, rules) {
  let content = fs.readFileSync(filePath, "utf8");
  for (const [from, to] of rules) {
    if (!content.includes(from)) {
      continue;
    }
    content = content.replace(from, to);
  }
  fs.writeFileSync(filePath, content);
}

for (const { base, rules } of replacements) {
  for (const entry of fs.readdirSync(base)) {
    if (!entry.endsWith(".ts") || entry === "legacy-deps.ts" || entry === "cli-legacy.ts") {
      continue;
    }
    applyRules(path.join(base, entry), rules);
  }
}

console.log("Phase 4 scaffold complete.");
