import fs from "node:fs";
import path from "node:path";
import {
  COMMAND_NAMESPACE,
  RUNTIME_COMMANDS_DIR,
  providerCommandSupport,
  readInstalledCommandSurface,
  formatProviderUseLine,
} from "./runtime-command-catalog";

interface InstalledCommandSurface {
  installedProviders?: string[];
  providers?: Record<string, { mode?: string }>;
}

function formatStatusCommandLines(targetRoot: string): string[] {
  const lines: string[] = [];
  const cacheDir = path.join(targetRoot, RUNTIME_COMMANDS_DIR);
  lines.push("  command surface:");
  lines.push(
    `  local catalog:         ${fs.existsSync(cacheDir) ? "yes" : "no"} (${RUNTIME_COMMANDS_DIR}/)`
  );
  lines.push(`  canonical namespace:   ${COMMAND_NAMESPACE}`);

  const surface: InstalledCommandSurface | null = readInstalledCommandSurface(targetRoot);
  const installed = surface?.installedProviders || [];
  if (installed.length === 0) {
    lines.push("  provider modes:        (no provider entrypoints detected)");
    return lines;
  }

  for (const providerId of installed) {
    const spec = providerCommandSupport(providerId);
    const mode = surface?.providers?.[providerId]?.mode || spec.status;
    lines.push(`  ${providerId}:                  ${mode}`);
    lines.push(`    use:                   ${formatProviderUseLine(providerId)}`);
  }
  return lines;
}

function formatDoctorCommandLines(targetRoot: string, detectedRuntimes: string[]): string[] {
  const lines: string[] = [];
  const cacheDir = path.join(targetRoot, RUNTIME_COMMANDS_DIR);

  if (fs.existsSync(cacheDir)) {
    lines.push("PASS local command catalog exists (.ai-harness/runtime-commands/)");
  } else {
    lines.push("FAIL local command catalog missing (.ai-harness/runtime-commands/)");
  }

  if (fs.existsSync(path.join(targetRoot, ".ai-harness/activation.md"))) {
    lines.push("PASS .ai-harness/activation.md exists");
  } else {
    lines.push("FAIL .ai-harness/activation.md missing");
  }

  const planCatalog = path.join(targetRoot, ".ai-harness/runtime-commands/harness-plan.md");
  if (fs.existsSync(planCatalog)) {
    const text = fs.readFileSync(planCatalog, "utf8");
    if (
      text.includes(".ai-harness/activation.md") &&
      text.includes(".ai-harness/commands/harness-plan.md")
    ) {
      lines.push("PASS harness-plan local catalog routes activation and source command");
    } else {
      lines.push("FAIL harness-plan local catalog incomplete");
    }
  }

  for (const rt of detectedRuntimes) {
    const spec = providerCommandSupport(rt);
    if (spec.status === "plugin-packaging" && rt === "codex") {
      lines.push(
        `WARN ${spec.provider}: plugin-packaging — no project-local /harness-* slash; use /plugins plugin skills or project .codex/ + .agents/skills/ fallback`
      );
      const packManifest = path.join(__dirname, "../../../..", ".codex-plugin/plugin.json");
      if (fs.existsSync(packManifest)) {
        lines.push("PASS npm package includes .codex-plugin/plugin.json (Codex plugin surface)");
      }
      const agents = path.join(targetRoot, "AGENTS.md");
      if (fs.existsSync(agents)) {
        lines.push("PASS Codex project fallback: AGENTS.md present");
      }
    } else if (spec.status === "fallback-only" || spec.status === "plugin-ready") {
      lines.push(`WARN ${spec.provider}: ${spec.status}; ${formatProviderUseLine(rt)}`);
    } else if (spec.status === "native-command-files" || spec.status === "native-plugin") {
      lines.push(
        `PASS ${spec.provider}: ${spec.status} (${spec.workflowInvocation || "see docs"})`
      );
      if (rt === "claude") {
        const clPlan = path.join(targetRoot, ".claude/commands/harness-plan.md");
        if (!fs.existsSync(clPlan)) {
          lines.push(
            "WARN Claude project command file missing: .claude/commands/harness-plan.md (plugin install may still apply)"
          );
        }
      }
    } else if (spec.status === "native-verified") {
      lines.push(
        `PASS ${spec.provider}: native command support verified (${spec.workflowInvocation || "see docs"})`
      );
    }

    for (const rel of spec.installedPaths || []) {
      if (rel.includes("(package)") || rel.includes("npm package")) {
        continue;
      }
      const dest = path.join(targetRoot, rel.replace(/ \(package\)$/, "").split(" ")[0]);
      if (!fs.existsSync(dest)) {
        continue;
      }
      if (rel.endsWith("/")) {
        const entries = fs.readdirSync(dest).filter((n) => !n.startsWith("."));
        if (entries.length === 0) {
          lines.push(`WARN ${spec.provider} fallback path empty: ${rel}`);
        } else {
          lines.push(`PASS ${spec.provider} fallback files present under ${rel}`);
        }
      } else if (fs.existsSync(dest)) {
        const text = fs.readFileSync(dest, "utf8");
        if (text.includes(".ai-harness/activation.md")) {
          lines.push(
            `PASS ${spec.provider} command surface references .ai-harness/activation.md (${rel})`
          );
        } else {
          lines.push(`WARN ${spec.provider} command surface missing activation reference (${rel})`);
        }
      }
    }
  }

  return lines;
}

function main(): void {
  const mode = process.argv[2];
  const targetRoot = path.resolve(process.argv[3] || ".");
  const runtimes = process.argv.slice(4).filter(Boolean);

  let lines: string[] = [];
  if (mode === "status") {
    lines = formatStatusCommandLines(targetRoot);
  } else if (mode === "doctor") {
    lines = formatDoctorCommandLines(targetRoot, runtimes);
  } else {
    process.exit(1);
  }

  for (const line of lines) {
    console.log(line);
  }
}

if (require.main === module) {
  main();
}

export { formatStatusCommandLines, formatDoctorCommandLines };
export type { InstalledCommandSurface };
