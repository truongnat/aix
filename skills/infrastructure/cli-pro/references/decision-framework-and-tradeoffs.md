# Decision framework and trade-offs

## Trade-off matrix

| Choice | Upside | Downside |
|--------|--------|----------|
| **Flat flags** (no subcommands) | Simple mental model | Explodes when surface grows |
| **Subcommands** | Organizes large tools | Longer argv; completion complexity |
| **`--json` opt-in** | Human default | Scripts must remember flag |
| **JSON default** | Script-friendly | Poor DX for humans unless paired with `--pretty` |
| **Strict parsing** | Typos fail fast | Less forgiving for exploratory use |
| **Permissive + warn** | Softer onboarding | Silent misconfiguration risk |

## Defaults by scenario

| Scenario | Default |
|----------|---------|
| **Developer tool** (git-like) | Subcommands; stable stdout/stderr; good `--help` |
| **CI-only utility** | No prompts; exit codes documented; `--json` if structured output |
| **Data emitter** (pipe-friendly) | Line-oriented or JSON; quiet errors; handle SIGPIPE |
| **Destructive ops** | `--dry-run`; explicit `--force` when not TTY |

## Machine output policy

Pick **one** story and document:

- Errors: stderr text **or** JSON envelope on stderr — not both mixed without flag.
- Success: stdout only **one** stream format per invocation.
