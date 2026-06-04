# Plugin Install Security

## Purpose

Document risks and safe practices for `curl | sh` and remote pack installation.

## curl pipe shell Risk

Running:

```bash
curl -fsSL https://raw.githubusercontent.com/.../install.sh | sh
```

executes whatever the script contains at fetch time. Users should treat this like any remote installer: trust the source, pin versions, and review when stakes are high.

## Safer Review-Before-Run Flow

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh -o install-harness.sh
less install-harness.sh
sh install-harness.sh --target . --ref v0.9.1
```

Or download the release tarball and run `node install.js` from the extracted pack without piping to shell.

## Pin To Tag

Prefer `--ref v0.9.1` (latest experimental runtime-native tag) over default branch `main` for reproducible installs. Runtime-native modes remain **experimental**; stable per-runtime support is not claimed.

The archive URL should use the same ref for tarball and documented compatibility.

`install.sh` downloads `https://github.com/truongnat/ai-engineering-harness/archive/<ref>.tar.gz` then runs `node install.js` from the extracted pack. See [install-sh-usage.md](install-sh-usage.md).

## What install.sh Is Allowed To Do

- download pack archive from GitHub (or documented mirror)
- extract to a temp directory
- run `node install.js` with user-provided flags
- optionally install a small `ai-harness` shim under `--global` (user bin only)
- print stdout/stderr from install steps

## What install.sh Must Not Do

- send telemetry or analytics
- read or write secrets, `.env`, or credentials (see [SECURITY.md](../SECURITY.md))
- modify files outside the target repo (and explicit global bin path when `--global`)
- run arbitrary code from the network besides the documented install script and pack archive
- require sudo unless user explicitly opts into system-wide paths

## No Secrets

Install flow must not embed tokens. Private repos are out of scope for the public one-liner; use manual clone or private tarball.

## No Telemetry

No phone-home, analytics, or usage tracking in `install.sh` or `install.js`.

## No Hidden Network Calls

Beyond:

- fetching `install.sh` (user-initiated curl)
- fetching pack archive tarball for the selected `--ref`

document any future mirror URL in this file before use.

## Relationship To Frozen Contracts

Installing into a target repo still follows [frozen-installed-surface-contract.md](frozen-installed-surface-contract.md) copy behavior via `install.js`. Security doc does not change installed surface; it governs **how** the pack arrives on disk.
