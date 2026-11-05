# Environment Variables

## Knowledge service and CLI management

| Variable | Default / requirement | Purpose |
|---|---|---|
| `KB_MASTER_PASSWORD` | Required by a directly launched service | Administrative credential; CLI startup otherwise creates a private random local credential |
| `KB_API_KEY` | Optional | CLI/adapter memory credential; cannot authorize shutdown |
| `KB_DATA_DIR` | `~/.aix/kb` | SQLite, API-key hashes and optional local management credential |
| `KB_HOST` | `127.0.0.1` | Standalone listener; Compose overrides to `0.0.0.0` inside the container |
| `PORT` | `4000` | Service HTTP listener port |
| `KB_PORT` | `4000` | CLI connection/spawn port and Compose host published port |
| `KB_SERVER_MAIN` | Auto-located built service | Optional explicit CLI startup entrypoint |

The current service does not use Neo4j, Meilisearch or Redis environment variables.
The CLI does not read `AIX_KB_URL`/`AIX_KB_KEY`; use the supported settings above.

## Runtime model provider

| Variable | Purpose |
|---|---|
| `AIX_PROVIDER` | Runtime API family: `anthropic` (default), `openai`, or `groq`; separate from install-time host provider selection |
| `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GROQ_API_KEY` | Supported provider credentials; absent credentials select labeled mock mode |
| `ANTHROPIC_MODEL`, `OPENAI_MODEL`, `GROQ_MODEL` | Optional model identifiers |
| `AIX_CONTENT_ROOT` | Engine canonical content directory; defaults to the working directory's `content/` |

Select the API family explicitly when using a non-default provider. Configuration compiler
host names (`claude`, `cursor`, `codex`, `gemini`) are not runtime API families.

## Compose template

```bash
cp services/kb-server/.env.example services/kb-server/.env
# Set a strong unique KB_MASTER_PASSWORD in the private .env before starting Compose.
```

Never commit populated `.env` files, API keys, or the generated management credential.
