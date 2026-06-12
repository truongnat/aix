/**
 * Provider-native interaction tools for deliberative discuss / option scoring.
 * Markdown-only prompts are fallback when no structured tool exists.
 */

type SupportedProvider = "cursor" | "claude" | "codex" | "gemini" | "generic" | "manual";

interface InteractionCapability {
  structuredUserChoice: {
    tool: string | null;
    invoke: string;
    notes: string;
  };
  blockingGate: {
    tool: string | null;
    invoke: string;
    notes: string;
  };
  fallback: string;
}

const PROVIDER_INTERACTION: Record<SupportedProvider, InteractionCapability> = {
  cursor: {
    structuredUserChoice: {
      tool: "AskQuestion",
      invoke:
        "Call the `AskQuestion` tool with exactly 3 options (id + label including score, e.g. `A: phased rollout (18/20)`). Wait for the tool result before continuing discuss.",
      notes: "Primary path for three-option scoring. Do not only print markdown choices.",
    },
    blockingGate: {
      tool: "AskQuestion",
      invoke:
        "Use `AskQuestion` for yes/no or single-choice gate questions when possible instead of open-ended `### Blocked` prose only.",
      notes: "Still return `### Blocked` header when a hard gate applies.",
    },
    fallback: "Numbered options in chat if `AskQuestion` is unavailable in the tool list.",
  },
  claude: {
    structuredUserChoice: {
      tool: "AskUserQuestion",
      invoke:
        "Call Claude Code `AskUserQuestion` with 3 options and short labels (include score). Continue discuss after the answer.",
      notes: "Do not substitute markdown-only menus when AskUserQuestion is available.",
    },
    blockingGate: {
      tool: "AskUserQuestion",
      invoke: "Use `AskUserQuestion` for minimal gate questions when a hard stop is required.",
      notes: "Pair with `### Blocked` contract from RESPONSE_CONTRACT.md.",
    },
    fallback: "Numbered options in the reply when no question tool is exposed.",
  },
  codex: {
    structuredUserChoice: {
      tool: null,
      invoke:
        "Codex has no verified structured choice tool in harness v1. Present the scoring table, then pause for the user's numeric/letter reply in chat.",
      notes: "Record the answer in DISCUSSION.md on the next turn.",
    },
    blockingGate: {
      tool: null,
      invoke: "Return `### Blocked` with one explicit question; wait for chat reply.",
      notes: "",
    },
    fallback: "Chat reply with A/B/C labels.",
  },
  gemini: {
    structuredUserChoice: {
      tool: null,
      invoke:
        "Gemini extension has no verified structured choice tool in harness v1. Use scored markdown table + ask user to reply with A, B, or C.",
      notes: "",
    },
    blockingGate: {
      tool: null,
      invoke: "Return `### Blocked` and wait for chat reply.",
      notes: "",
    },
    fallback: "Chat reply with A/B/C labels.",
  },
  generic: {
    structuredUserChoice: {
      tool: null,
      invoke: "Present scored options and ask the user to reply with A, B, or C in chat.",
      notes: "",
    },
    blockingGate: {
      tool: null,
      invoke: "Return `### Blocked` with explicit next action.",
      notes: "",
    },
    fallback: "Plain chat.",
  },
  manual: {
    structuredUserChoice: {
      tool: null,
      invoke: "Present scored options; user replies in chat with A, B, or C.",
      notes: "",
    },
    blockingGate: {
      tool: null,
      invoke: "Return `### Blocked` with explicit question.",
      notes: "",
    },
    fallback: "Plain chat.",
  },
};

function normalizeProvider(provider: string): SupportedProvider {
  const id = provider.trim().toLowerCase();
  if (id in PROVIDER_INTERACTION) {
    return id as SupportedProvider;
  }
  return "generic";
}

function resolveInstalledProviders(manifest: {
  commandSurface?: { providers?: Record<string, unknown> };
}): SupportedProvider[] {
  const providers = manifest.commandSurface?.providers;
  if (!providers || typeof providers !== "object") {
    return ["generic"];
  }
  const installed = Object.entries(providers)
    .filter(([, value]) => {
      if (!value || typeof value !== "object") {
        return false;
      }
      const paths = (value as { installedPaths?: unknown }).installedPaths;
      return Array.isArray(paths) && paths.length > 0;
    })
    .map(([key]) => normalizeProvider(key));
  return installed.length ? installed : ["generic"];
}

function renderCapabilitySection(provider: SupportedProvider): string[] {
  const cap = PROVIDER_INTERACTION[provider];
  const lines: string[] = [];
  lines.push(`### ${provider}`);
  lines.push("");
  if (cap.structuredUserChoice.tool) {
    lines.push(`- **Structured user choice tool:** \`${cap.structuredUserChoice.tool}\``);
  } else {
    lines.push(`- **Structured user choice tool:** none (chat fallback)`);
  }
  lines.push(`- **Invoke:** ${cap.structuredUserChoice.invoke}`);
  if (cap.structuredUserChoice.notes) {
    lines.push(`- **Notes:** ${cap.structuredUserChoice.notes}`);
  }
  lines.push(`- **Fallback:** ${cap.fallback}`);
  lines.push("");
  return lines;
}

function renderProviderInteractionMarkdown(providers: string[]): string {
  const normalized = [...new Set(providers.map(normalizeProvider))];
  const primary = normalized[0] ?? "generic";

  const lines: string[] = [
    "# Provider Interaction Tools",
    "",
    "> Generated for this install. Read before deliberative discuss or three-option scoring.",
    "",
    "## Primary provider",
    "",
    primary,
    "",
    "## Rule",
    "",
    "For deliberative decisions (`harness-discuss`, ambiguous `harness-start` routing):",
    "",
    "1. Build the three-option scoring table in markdown.",
    `2. **Invoke the provider tool** for \`${primary}\` below — do not stop at markdown-only choices when a tool is listed.`,
    "3. Continue the discuss workflow after the tool returns the user's selection.",
    "4. Use chat fallback only when the tool is missing from the active tool list.",
    "",
    "## Capabilities by provider",
    "",
  ];

  for (const provider of normalized) {
    lines.push(...renderCapabilitySection(provider));
  }

  lines.push("## Three-option scoring");
  lines.push("");
  lines.push("See `rules/core/option-scoring.md` and `prompt-templates/option-scoring.md`.");
  lines.push("");

  return lines.join("\n");
}

function renderProviderInteractionFromManifest(manifest: {
  commandSurface?: { providers?: Record<string, unknown> };
}): string {
  return renderProviderInteractionMarkdown(resolveInstalledProviders(manifest));
}

export {
  PROVIDER_INTERACTION,
  normalizeProvider,
  renderCapabilitySection,
  renderProviderInteractionFromManifest,
  renderProviderInteractionMarkdown,
  resolveInstalledProviders,
};
export type { InteractionCapability, SupportedProvider };
