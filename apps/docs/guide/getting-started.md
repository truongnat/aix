# Getting Started

## Requirements

- A current Node 22 release (22.13 or newer) or Node 24.
- pnpm 9.15.0, as pinned by the workspace.
- Docker only if choosing container deployment; the local SQLite KB needs no external services.

## Build the private workspace

```bash
git clone https://github.com/truongnat/aix
cd aix
pnpm install --frozen-lockfile --ignore-scripts
pnpm build
pnpm lint
pnpm test
```

These packages are not published npm installation targets. Use the local built CLI:

```bash
node packages/cli/dist/index.js skills validate
node packages/cli/dist/index.js install --provider cursor --dry-run
pnpm run doctor
```

`skills/` is the canonical library. The primary Claude/Codex plugin workflow uses
the host agent as runtime; see the repository README for plugin installation commands.

## Optional local KB

```bash
node packages/cli/dist/index.js kb ensure
node packages/cli/dist/index.js kb status
```

The CLI creates a private random management credential when it starts its own service.
The service uses SQLite/FTS5 and an in-memory cache, with loopback binding by default.
For standalone/Compose operation and existing service credentials, see [KB Server](./kb-server).
Doctor reports environment/configuration and optional KB health; it is not a test runner.

## Generate and explicitly verify

```bash
node packages/cli/dist/index.js run "<your task>" --auto
node packages/cli/dist/index.js verify <printed-session-id> --command "<your actual verification command>"
```

Omit `--auto` for human approval. Configure the correct runtime provider/key for real model
output; absent credentials deliberately produce labeled mock artifacts. Generation stays
inside `.aix/sessions/<id>/generated/`. Heuristic scores are not verification; the explicit
command must check your actual acceptance criteria and runs with your user's permissions.
There is no automatic application to source, shipment or deployment.

## Desktop sessions

After building the workspace, run `pnpm desktop:build` and `pnpm desktop` to open the desktop app.
The chat header lists sessions by the first line of their task rather than by UUID. Older
sessions use their saved first user message when task metadata is unavailable. UUIDs remain
the storage identifiers; no session folders are renamed.

New tasks appear immediately with a **Running** label. Active runs appear first, followed
by sessions ordered by their latest state, chat, or artifact update. The Inspector shows
the same named session as Chat. **New Task** clears that context instead of showing an
unrelated older session. Stop the current run before switching to another session.

## Next

- [Architecture](./architecture)
- [Skills & Progressive Disclosure](./skills)
- [CLI Reference](/reference/cli)
