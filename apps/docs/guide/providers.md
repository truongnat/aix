# Providers & Compiler

## Compiler

`@x/compiler` đọc canonical source (SKILL.md trung lập) và compile ra artefacts cho từng provider.

```bash
# Compile tất cả providers
npx aix install

# Compile provider cụ thể
npx aix install --provider claude
npx aix install --provider cursor
npx aix install --provider codex
npx aix install --provider gemini
```

## Output theo provider

### Claude Code
```
content/skills/<skill>/SKILL.md
.claude-plugin/plugin.json   ← skills: ["./content/skills/"]
CLAUDE.md
.claude/settings.json
```

### Cursor
```
.cursor/
└── rules/
    ├── spine-guardrail.mdc
    └── aix-skill-<skill>.mdc
```

### Codex
```
AGENTS.md                 ← compact router, stays below Codex project doc cap
.codex/skills/index.md    ← searchable skill catalog
.codex/skills/<skill>.md  ← full skill body, opened on demand
.codex/rules.md
```

### Gemini CLI
```
GEMINI.md                 ← compact router
.gemini/settings.json     ← contextFileName: GEMINI.md
.gemini/aix-rules.md
gemini-extension.json
skills/index.md
skills/<skill>.md
agents/
```

## Provider adapters

Mỗi provider có adapter riêng trong `@x/providers`:

| File | Provider |
|------|---------|
| `src/claude.ts` | Claude Code — canonical `content/skills`, plugin manifest, settings |
| `src/cursor.ts` | Cursor — `.cursor/rules/aix-skill-*.mdc` |
| `src/codex.ts` | Codex — compact `AGENTS.md` plus `.codex/` retrieval files |
| `src/gemini.ts` | Gemini CLI — compact `GEMINI.md`, skill index, extension metadata |
| `src/mcp/browser.ts` | Browser MCP (chrome-devtools / claude-in-chrome) |
