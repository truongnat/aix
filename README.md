<div align="center">

# ⚙️ ai-engineering-harness

### Runtime-native engineering discipline for AI coding agents

![Version](https://img.shields.io/badge/version-v0.9.2%20experimental-2563eb)
![License](https://img.shields.io/badge/license-MIT-16a34a)
![Markdown First](https://img.shields.io/badge/markdown-first-7c3aed)
![Runtime Native](https://img.shields.io/badge/runtime-native-f59e0b)
![Stable Runtime Support](https://img.shields.io/badge/stable%20runtime%20support-no-ef4444)

**Plan -> Build -> Verify -> Ship -> Remember**

A markdown capability pack that gives AI coding agents a durable operating model inside your repo without dumping a framework into your project root.

[Quickstart](#-quickstart) · [Commands](#-commands) · [Installed Layout](#-installed-layout) · [Runtime Support](#-runtime-support) · [Docs](#-docs)

</div>

---

## What is this?

`ai-engineering-harness` installs a local capability pack for AI coding tools such as Cursor, Claude Code, Codex, Gemini, and OpenCode.

It gives the agent:

- reusable commands, skills, workflows, patterns, and templates
- project-specific state under `.harness/`
- runtime-specific entrypoints such as Cursor rules or Claude instructions
- local git hygiene through `.git/info/exclude`, not `.gitignore`

> [!IMPORTANT]
> `v0.9.2` is experimental. File and install flows are dogfooded, but stable runtime support is not claimed yet.

## Why it exists

- Agents lose context.
- Agents code before planning.
- Agents skip verification.
- Agents forget previous fixes.
- Agents need durable project-specific artifacts.

## Current Model

Project runtime-native install now follows:

```txt
aih.sh lifecycle dispatcher
    ->
provider entrypoint
    ->
.ai-harness/   capability source
    ->
.harness/      project state
```

Primary references:

- [TARGET.md](TARGET.md)
- [docs/simple-cli-ux.md](docs/simple-cli-ux.md)
- [docs/plugin-install-ux.md](docs/plugin-install-ux.md)
- [docs/private-capability-cache.md](docs/private-capability-cache.md)
- [docs/target-repo-validation.md](docs/target-repo-validation.md)
- [docs/runtime-dogfood-summary.md](docs/runtime-dogfood-summary.md)

## 🚀 Quickstart

Run this inside your target project repo:

```bash
npx ai-engineering-harness install
```

Then:

```bash
npx ai-engineering-harness status
npx ai-engineering-harness doctor
```

The install wizard shows detected context, lets you **choose provider(s)** with keyboard selection, shows a plan, and asks for confirmation — it does not auto-install based on detection alone. See [docs/npx-cli-ux.md](docs/npx-cli-ux.md).

Non-interactive example:

```bash
npx ai-engineering-harness install --provider cursor --yes
```

### Shell fallback

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/aih.sh | sh -s -- install --runtime cursor --yes
```

```bash
sh aih.sh install --runtime cursor --scope project --visibility private --yes
```

### Windows PowerShell (bootstrap fallback)

```powershell
$script = "$env:TEMP\aih.ps1"
Invoke-WebRequest https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/aih.ps1 -OutFile $script
powershell -ExecutionPolicy Bypass -File $script install -Runtime cursor -Yes
```

Then check the install:

```powershell
powershell -ExecutionPolicy Bypass -File $script status
powershell -ExecutionPolicy Bypass -File $script doctor
```

Notes for Windows:

- Add `-Yes` to skip the `Proceed? [y/N]` confirmation prompt (copy-paste friendly).
- Private git hygiene requires the target folder to be a Git repo (`.git/`). If you see “not a Git repo”, run `git init` or install inside a cloned repository.
- PowerShell `curl` is often an alias for `Invoke-WebRequest`, so bare `curl -fsSL ...` is not the right command there.
- If you want the shell bootstrap path in PowerShell, use `curl.exe`, not `curl`.
- `aih.ps1` is an experimental wrapper that downloads `aih.sh` and runs it through `sh`.
- `sh` is still required today. Use Git Bash, Git for Windows, or WSL until native PowerShell mode is dogfooded.
- Warnings from your PowerShell profile (for example PSReadLine prediction) are unrelated to ai-engineering-harness.

Git Bash on Windows:

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/aih.sh | sh -s -- install --runtime cursor
```

Unix / macOS status and doctor:

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/aih.sh | sh -s -- status
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/aih.sh | sh -s -- doctor
```

Other Windows alternatives:

```powershell
curl.exe -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/aih.sh | sh -s -- install --runtime cursor --yes
irm https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/aih.ps1 | iex
```

If the provider cannot be detected in non-interactive mode, pass it explicitly:

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/aih.sh | sh -s -- install --runtime cursor
```

Pin a release tag:

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/aih.sh | sh -s -- install --ref v0.9.2 --runtime cursor
```

Local checkout (NPX-style):

```bash
node bin/aih.js install
node bin/aih.js status
node bin/aih.js doctor
```

Shell fallback:

```bash
sh aih.sh install
sh aih.sh status
sh aih.sh doctor
sh aih.sh update
sh aih.sh uninstall
```

Providers: `cursor`, `claude`, `codex`, `gemini`, `opencode`, `generic`, `manual` (fallback). Antigravity is planned, not implemented. Avoid `--runtime all` until dogfooded.

---

## 🧰 Commands

| Command | Purpose |
|---|---|
| `aih.sh install` | Install capability cache, project state, and runtime entrypoint |
| `aih.sh status` | Show detected runtime, cache, state, and git exclude status |
| `aih.sh doctor` | Check whether the install is usable |
| `aih.sh update` | Refresh `.ai-harness/` and runtime entrypoint |
| `aih.sh uninstall` | Remove runtime entrypoint, keep cache/state by default |
| `aih.sh uninstall --all` | Remove runtime entrypoint, `.ai-harness/`, `.harness/`, and exclude block |

Local source checkout:

```bash
sh aih.sh install --runtime cursor --dry-run
sh aih.sh install --runtime cursor
sh aih.sh update
sh aih.sh uninstall
```

`install.sh` still exists as a compatibility wrapper around `aih.sh`, but `aih.sh` is the preferred lifecycle command.

---

## 📦 Installed Layout

A private project install creates:

```txt
your-repo/
├── .ai-harness/                         # capability source
│   ├── AGENTS.md
│   ├── commands/
│   ├── skills/
│   ├── workflows/
│   ├── patterns/
│   ├── templates/
│   └── docs/
├── .harness/                            # project state
│   ├── HARNESS.md
│   ├── TEAM.md
│   ├── SKILLS.md
│   ├── WORKFLOW.md
│   ├── GATES.md
│   ├── MEMORY.md
│   └── goals/
└── .cursor/rules/ai-engineering-harness.mdc
```

Provider entrypoints change by runtime:

| Runtime | Entrypoint |
|---|---|
| Cursor | `.cursor/rules/ai-engineering-harness.mdc` |
| Claude Code | `.claude/CLAUDE.md` |
| Codex / Generic | `AGENTS.md` |
| Gemini | `.gemini/extensions/ai-engineering-harness/` |
| OpenCode | `.opencode/plugins/ai-engineering-harness.js` |

Root pollution is avoided: `commands/`, `skills/`, `workflows/`, and `templates/` are installed under `.ai-harness/`, not your project root.

---

## 🧼 Git Hygiene

Private project installs use `.git/info/exclude` so generated harness files do not dirty your repo and `.gitignore` is not modified.

Typical private exclude block:

```gitignore
# ai-engineering-harness start
.ai-harness/
.harness/
.cursor/rules/ai-engineering-harness.mdc
# ai-engineering-harness end
```

Use shared mode only when you intentionally want generated files visible for commit.

```bash
sh aih.sh install --runtime cursor --visibility shared
```

---

## 🧠 How agents use it

```txt
runtime entrypoint
        ↓
.ai-harness/  = reusable capability source
        ↓
.harness/     = this repo's project state
```

The agent should read `.ai-harness/AGENTS.md` first, then use `.ai-harness/commands/`, `.ai-harness/skills/`, and `.ai-harness/workflows/`. It reads `.harness/` for project-specific memory, goals, gates, and workflow choices.

---

## 🔌 Runtime Support

| Runtime | Project install | Update | Uninstall | Stable claim |
|---|---:|---:|---:|---:|
| Cursor | ✅ experimental | ✅ | ✅ | No |
| Claude Code | ✅ experimental | ✅ | ✅ | No |
| Codex / Generic | ✅ experimental | ✅ | ✅ | No |
| Gemini | ✅ experimental | ✅ | ✅ | No |
| OpenCode | ✅ experimental | ✅ | ✅ | No |
| Antigravity | planned | — | — | No |

Manual root copy still exists via `--runtime manual`, but it is a fallback, not the recommended UX.

---

## 📚 Docs

| Need | Read |
|---|---|
| Release notes | [docs/v0.9.2-release-notes.md](docs/v0.9.2-release-notes.md) |
| Simple CLI | [docs/simple-cli-ux.md](docs/simple-cli-ux.md) |
| Capability cache | [docs/private-capability-cache.md](docs/private-capability-cache.md) |
| Git hygiene | [docs/private-install-git-hygiene.md](docs/private-install-git-hygiene.md) |
| Runtime dogfood | [docs/runtime-dogfood-summary.md](docs/runtime-dogfood-summary.md) |
| Validation | [docs/runtime-aware-validation.md](docs/runtime-aware-validation.md) |
| Long-term target | [TARGET.md](TARGET.md) |

## 🛠️ Adoption

- [Adoption Guide](docs/adoption-guide.md)
- [Adoption Smoke Test](docs/adoption-smoke-test.md)
- [Install-To-Profile Walkthrough](docs/install-to-profile-walkthrough.md)
- [Validation Troubleshooting](docs/validation-troubleshooting.md)
- [Tiny Repo Adoption Example](examples/tiny-repo-adoption/)
- [Small Repo Memory](docs/small-repo-memory.md)
- [Usage Examples](docs/usage-examples.md)
- [Host Repo Checklist](docs/host-repo-checklist.md)

---

## 🛠️ Maintainers

```bash
git clone https://github.com/truongnat/ai-engineering-harness.git
cd ai-engineering-harness
node validate.js
npm test
```

Target validation examples:

```bash
node validate.js --target ../my-project --profile-only
node validate.js --target ../my-project --runtime cursor --profile-only
```

---

## Status

- Current release: [`v0.9.2`](docs/v0.9.2-release-notes.md), experimental
- Stable runtime support: **No**
- Next likely work: binary `aih`, manual runtime verification, Antigravity research

## Contributing

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)

Keep markdown as the source of truth. Avoid heavy runtime features unless the roadmap explicitly moves there.
