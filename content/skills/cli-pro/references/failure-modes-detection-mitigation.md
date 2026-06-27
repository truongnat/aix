# CLI failure modes — detection and mitigation

| Failure | Why | Detect | Mitigate |
|---------|-----|--------|----------|
| **Broken pipe noise** | Writer continues after reader closed | Traceback / error on `EPIPE` | Catch SIGPIPE/EPIPE; quiet exit — **`cli-runtime-system-model.md`** |
| **Hung CI** | Prompt waits for stdin | Job timeout | Non-TTY guard; `--yes` / fail fast |
| **Secrets in argv / logs** | `ps`, shell history | Security audit | Env, file, prompt on TTY only — **`security-pro`** |
| **Wrong encoding output** | Mixed locale | Mojibake in fixtures | UTF-8 default; document `PYTHONUTF8`, `chcp` on Windows |
| **Exit code always 1** | Lazy error handling | Scripts can’t branch | Document **usage** vs **runtime** codes |
| **Completion drift** | Parser changed; completion stub stale | Users report wrong completions | Generate from same source as parser — **`patterns-by-runtime.md`** |
| **JSON + logs mixed** | Progress to stdout | Broken JSON parsers | Logs to stderr only when `--json` |
| **chmod / path on Windows** | POSIX assumptions on global install | Install failures | Document `npm`/installer shims — **`versions.md`** |
| **Docker exec -T** | No TTY in container | Prompt hangs | Doc `-i` when interactive needed — **`integration-map`** |
