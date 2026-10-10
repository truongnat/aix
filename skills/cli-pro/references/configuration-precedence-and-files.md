# Configuration precedence and files

## Typical precedence (document yours)

```text
CLI flags > environment variables > project config > user config > defaults
```

## Config file discovery

- **Explicit path** via `--config` — preferred for reproducibility.
- **Cwd search** (`./.toolrc`, `./tool.toml`) — convenient but implicit; document search order.

## Secrets in config

- **Never** commit tokens — use env interpolation or OS store — **`security-pro`**.
- File permissions: warn if world-readable secret file.

## Validation

- Fail **early** on invalid config with **path + key** in message (stderr).
- `--help` should not require valid config unless unavoidable — load config **after** help routing.
