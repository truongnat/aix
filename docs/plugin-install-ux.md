# Plugin Install UX

## Purpose

Define the consumer installation experience `ai-engineering-harness` should provide—plugin/superpower style—not an internal SDK clone workflow.

## Why Local Clone Is Not Enough

Today many docs show:

```bash
git clone ai-engineering-harness
cd ai-engineering-harness
node install.js --target ../my-project
```

That is valid for **maintainers** and contributors. It is **not** the desired default for product teams adopting the pack because it:

- requires understanding source pack vs target repo
- forces two repositories in the mental model
- feels like an SDK checkout, not a plugin install
- blocks one-command adoption in CI or fresh machines

Core assets (`AGENTS.md`, commands, skills, `.harness/` contract, `validate.js` behavior) remain sound. The gap is **installation/adoption UX**.

## Plugin-like Install Target

Consumers should think:

```txt
install harness into my repo → init profile → validate → run agent loop
```

Not:

```txt
clone harness repo → cd into harness → point installer at my repo
```

## Supported User Flows

Active installer: [install.sh](../install.sh) — see [install-sh-usage.md](install-sh-usage.md).

### Project install (default target = cwd)

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh
```

Installs into the current directory (the real product repository).

### Explicit target install

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh -s -- --target ../my-project
```

### Dry run

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh -s -- --dry-run
```

### Force overwrite

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh -s -- --target . --force
```

### Global CLI install (planned)

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh -s -- --global
ai-harness install --target .
ai-harness validate --target . --profile-only
```

See [one-line-installer-design.md](one-line-installer-design.md).

## Future Runtime Folder Install

Later (`v0.10.0` direction): install into runtime capability folders, for example:

```txt
~/.cursor/...
~/.claude/...
~/.codex/...
~/.ai-harness/...
```

Not part of the first `install.sh` milestone. See [runtime-consumption-model.md](runtime-consumption-model.md).

## What This Does Not Mean

- not npm publish or marketplace (yet)
- not runtime adapters or MCP plugins
- not removing `install.js` or structural validation
- not merging source pack and target repo into one tree

## v1 Implications

`v1.0.0` should be **Stable Plugin-like Capability Pack**, not stable “clone source pack first.”

Contract freeze documents under `docs/frozen-*.md` are **pre-v1 candidates** until plugin install UX is implemented and dogfooded. See [stable-contract-index.md](stable-contract-index.md).

Manual clone remains documented for maintainers: [manual-packaging-guide.md](manual-packaging-guide.md), [consume-as-pack.md](consume-as-pack.md).
