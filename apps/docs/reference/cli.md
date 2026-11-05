# CLI Reference

Packages are private. Build the checkout, then use `node packages/cli/dist/index.js` wherever
examples below say `aix`. Run `aix <command> --help` for authoritative flags.

## Provider installation

```bash
aix install --provider claude
aix install --provider cursor --dry-run
aix install --all
```

Default provider is Claude. `--all` selects all four providers; it is not a filter for
`--provider`. Existing unmarked user files are conflicts unless `--force` is explicitly used.

## Generate artifacts

```bash
aix run "<task>"
aix run "<task>" --auto
aix run "<task>" --dry-run
aix run "<task>" --resume <session-id>
```

Default mode asks for human approval. `--auto` bypasses those approvals, not budget checks
or the output sandbox. Missing provider keys activates explicitly labeled mock generation.
Generation processes the planned tasks and writes under `.aix/sessions/<id>/generated/`.
Text scores are heuristic; no generated status or score means tests passed.

## Verify a persisted session

```bash
aix verify <session-id> --command "node --test"
```

The command is explicitly supplied by you and executes inside that session's `generated/`
directory with your account's permissions. Choose checks that exercise the actual output.
Missing sessions, incomplete generation and missing output are errors. The command's real
exit code, redacted output and generated-file SHA-256 values are saved to `state.json` and
`VERIFY.md`. Failed rechecks invalidate prior success; changed output during verification
cannot pass. Nothing is deployed or copied into project source.

The unsupported `aix ship` command and automatic shipping phase were removed. Use your
project's actual reviewed deployment workflow; the CLI does not invent one.

## Skills

```bash
aix skills validate [--content-root <content-directory>]
aix skills list [--kind <kind>] [--role <role>]
aix skills show <name>
aix skills migrate [--write]
```

Validation includes malformed YAML, invalid metadata and duplicate names; fatal errors produce
a nonzero exit. Body-size warnings remain warnings. `list` regenerates the local catalog
from canonical content. Migration defaults to dry-run; `--write` changes canonical files.

## Context

```bash
aix context build [path]
aix context query "<question>" [--top 5]
```

The default analyzer/search are regex-based and in-memory, with the CLI's saved local index.
No `context wiki` subcommand is currently registered.

## Local Markdown memory

```bash
aix memory push "<title>" "<body>" [--kind decision] [--tags tag1,tag2]
aix memory search "<query>"
aix memory list [--kind decision]
```

These commands use redacted local Markdown storage. They do not automatically select the
remote KB. There is no registered `memory get` subcommand.

## Knowledge service

```bash
aix kb ensure
aix kb start
aix kb status
aix kb list [--kind decision]
aix kb search "<query>" [--limit 10]
aix kb stop
```

`start` and `ensure` request local startup. `KB_PORT` selects the service port; credentials
come from `KB_API_KEY`, `KB_MASTER_PASSWORD`, or the private CLI-managed credential. Rejected
credentials fail nonzero. Explicit stop requires administrative authorization; API keys
are for memory access only. No `kb connect` subcommand is registered.

## Diagnostics and evaluation

```bash
aix doctor
aix eval list
aix eval run <suite> [--variant <name>]
```

Doctor checks Node/pnpm, optional configuration/content and KB health; it does not run tests
or validate every skill. In the repository use `pnpm run doctor`: bare `pnpm doctor` is
pnpm's own diagnostic command. Eval suites live in `.aix/static/evals/`; the current CLI
evaluation runner is explicitly mocked and must not be treated as real-model verification.
