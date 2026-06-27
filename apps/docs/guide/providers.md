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
~/.claude/
├── skills/
│   └── api-design/
│       └── SKILL.md
├── agents/
│   └── code-reviewer.md
└── CLAUDE.md
```

### Cursor
```
.cursor/
└── rules/
    └── api-design.md
```

### Codex
```
AGENTS.md   ← tổng hợp rules + skills context
```

### Gemini CLI
```
GEMINI.md
gemini-extension.json
skills/
agents/
```

## Provider adapters

Mỗi provider có adapter riêng trong `@x/providers`:

| File | Provider |
|------|---------|
| `src/claude.ts` | Claude Code — SKILL.md, agents, hooks, MCP |
| `src/cursor.ts` | Cursor — `.cursor/rules/` recursive scan |
| `src/codex.ts` | Codex — `AGENTS.md` synthesis |
| `src/gemini.ts` | Gemini CLI — `gemini-extension.json` |
| `src/mcp/browser.ts` | Browser MCP (chrome-devtools / claude-in-chrome) |
