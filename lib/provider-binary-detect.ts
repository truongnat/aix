import childProcess from "node:child_process";

import { ACTIVE_PROVIDER_IDS } from "./cli-providers";

interface ProviderBinaryProbe {
  providerId: string;
  commands: string[];
  commandUsed: string | null;
  installed: boolean;
  version: string | null;
  output: string;
}

type ProviderBinaryMap = Record<string, ProviderBinaryProbe>;

interface SpawnResult {
  stdout?: string | Buffer;
  stderr?: string | Buffer;
  status: number | null;
  error?: unknown;
}

function firstLine(text: string): string {
  return (
    text
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.length > 0)
      ?.trim()
      .replace(/^v(?=\d)/, "") || ""
  );
}

function getErrorCode(result: SpawnResult): string {
  return result.error && typeof result.error === "object"
    ? ((result.error as { code?: string }).code ?? "")
    : "";
}

function shouldRetryWithWindowsShell(result: SpawnResult): boolean {
  const errorCode = getErrorCode(result);
  return process.platform === "win32" && (errorCode === "ENOENT" || errorCode === "EINVAL");
}

function quoteWindowsShellArg(arg: string): string {
  if (!/[\s"&()<>^|]/.test(arg)) {
    return arg;
  }

  return `"${arg.replace(/"/g, '""')}"`;
}

function runProbe(command: string, args: string[]): SpawnResult {
  const options = {
    encoding: "utf8" as const,
    timeout: 3000,
    windowsHide: true,
    env: process.env,
  };
  const result = childProcess.spawnSync(command, args, options);

  if (!shouldRetryWithWindowsShell(result)) {
    return result;
  }

  const comspec = process.env.ComSpec || "cmd.exe";
  return childProcess.spawnSync(
    comspec,
    ["/d", "/s", "/c", [command, ...args].map(quoteWindowsShellArg).join(" ")],
    options
  );
}

function probeCommand(command: string, args: string[] = ["--version"]): ProviderBinaryProbe {
  const result = runProbe(command, args);

  const stdout = typeof result.stdout === "string" ? result.stdout : "";
  const stderr = typeof result.stderr === "string" ? result.stderr : "";
  const output = [stdout.trim(), stderr.trim()].filter(Boolean).join("\n");
  const version = firstLine(output);
  const errorCode = getErrorCode(result);
  const installed = errorCode !== "ENOENT" && errorCode !== "ENOTFOUND" && result.status !== null;

  return {
    providerId: command,
    commands: [command],
    commandUsed: installed ? command : null,
    installed,
    version: version || null,
    output,
  };
}

function probeCursorBinary(): ProviderBinaryProbe {
  const candidates = ["cursor", "cursor-agent"];
  const attempts: ProviderBinaryProbe[] = [];

  for (const command of candidates) {
    const probe = probeCommand(command);
    attempts.push(probe);
    if (probe.installed) {
      return {
        providerId: "cursor",
        commands: candidates,
        commandUsed: command,
        installed: true,
        version: probe.version,
        output: probe.output,
      };
    }
  }

  return {
    providerId: "cursor",
    commands: candidates,
    commandUsed: null,
    installed: false,
    version: attempts[0]?.version || null,
    output: attempts
      .map((attempt) => attempt.output)
      .filter(Boolean)
      .join("\n"),
  };
}

function probeProviderBinary(providerId: string): ProviderBinaryProbe {
  switch (providerId) {
    case "claude":
      return probeCommand("claude");
    case "codex":
      return probeCommand("codex");
    case "cursor":
      return probeCursorBinary();
    case "gemini":
      return probeCommand("gemini");
    default:
      return {
        providerId,
        commands: [],
        commandUsed: null,
        installed: false,
        version: null,
        output: "",
      };
  }
}

function detectProviderBinaries(): ProviderBinaryMap {
  const detected: ProviderBinaryMap = {};
  for (const providerId of ACTIVE_PROVIDER_IDS) {
    detected[providerId] = probeProviderBinary(providerId);
  }
  return detected;
}

function listDetectedProviderIds(binaries: ProviderBinaryMap): string[] {
  return ACTIVE_PROVIDER_IDS.filter((providerId) => binaries[providerId]?.installed);
}

export {
  detectProviderBinaries,
  listDetectedProviderIds,
  probeProviderBinary,
  probeCommand,
  probeCursorBinary,
};
export type { ProviderBinaryProbe, ProviderBinaryMap };
