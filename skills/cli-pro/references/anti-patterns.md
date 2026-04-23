# CLI — anti-patterns

## Errors on stdout

- Breaks `$(cmd)` and pipes.
- **Fix:** stderr for all failure paths.

## Secrets on argv

- Visible in `ps`.
- **Fix:** Env file, stdin, or OS keychain — **`security-pro`**.

## Ambiguous prompts in CI

- Hung jobs.
- **Fix:** Detect non-TTY; require explicit flags.

## Breaking flag rename without semver

- Breaks user scripts.
- **Fix:** Deprecation period + release notes.

## Progress / logs on stdout when `--json`

- Breaks `jq` and parsers.
- **Fix:** Diagnostics only to stderr when machine-readable mode active — **`failure-modes-detection-mitigation.md`**.
