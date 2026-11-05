# Quality validation and guardrails (anti-hallucination)

## Before advising flags / behavior

- [ ] **Runtime and OS** stated — Windows vs Unix signal and path behavior differs.
- [ ] **No invented flags** — If library unknown, describe **pattern** (`--verbose` common) not fake tool-specific switches.
- [ ] **Exit codes** — Don’t claim “POSIX mandates code 2 for usage” unless documenting **your** contract; conventions vary.

## Wrong-answer prevention

- **“Always use library X”** — Without knowing repo constraints — instead compare **trade-offs** — **`decision-framework-and-tradeoffs.md`**.
- **Copy-paste completion scripts** — Must match **exact** binary name and subcommand structure from user’s parser.

## Validation points

1. **stdout empty on error** when stdout is machine-readable channel for success-only.
2. **`--help` / `--version`** side-effect free and exit `0`.
3. **Breaking argv** → semver note for published CLIs — **`versions.md`**.
