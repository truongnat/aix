# Environment Variables

## CLI (`aix`)

| Variable | Mô tả |
|----------|-------|
| `AIX_PROVIDER` | Override auto-detect provider (`claude`\|`cursor`\|`codex`\|`gemini`) |
| `AIX_BUDGET_USD` | Default budget limit cho `aix run --auto` |

::: warning Bảo mật
Không bao giờ commit `.env` vào git. Chỉ commit `.env.example` với placeholder values.
:::
