harness system defined:
 - agents
 - tools
 - skills
 - mcp
 - template
 - rules
 - config
 - hooks


=> here is core for shared of harness system

O day khi install hoac update hoac uninstall thi se chi cau hinh o day thoi

Codex:

- global:
    - $HOME/.codex/... 
- local:
    - .codex/


- Ben trong .codex/...
    - rules:
        - default.rules -> se mapping voi rules cua harness system defined (rule chung)
        - <sort-title>.rules -> se duoc generate dua theo project dang chay, se co the co nhieu files
    - hoooks:
        - ~/.codex/hooks.json
        - ~/.codex/config.toml
        - <repo>/.codex/hooks.json
        - <repo>/.codex/config.toml
        - No se ke thua tu hooks cua harness system
    - AGENTS.md -> create fit with codex inside .codex/AGENTS.md
    - mcp -> comming soon
    - plugins -> custom rieng cho codex
    - skills
        - Tuong tu can ke thua voi harness system va co the mo rong theo project
    - subagents:
        - Tuong tu cung ke thua tu harness system va co the mo rong theo project

---

# PLAN: Provider-adapter refactor (chua code - chi ke hoach)

## 0. Muc tieu
Chuyen tu mo hinh hien tai (1 file `install-runtime.ts` ~900 dong, moi provider la 1 ham
doc thang tu `packRoot`) sang mo hinh **core dung chung -> adapter rieng tung provider**,
trong do **core = `.ai-harness/`** la source of truth duy nhat.

Flow install sau refactor:
```
install
  -> chon provider(s)        (multi-select, da co)
  -> chon global / project   (da co)
  -> dam bao core .ai-harness/ ton tai
  -> for each provider: adapter.install(core, scope) -> sinh file rieng cua provider
```

## 1. Hien trang (de doi chieu)
- `run-install.ts` goi `installRuntime()` (runtime-native) chung chung.
- `install-runtime.ts`: `installCodex / installClaude / installCursor / installGemini`
  doc tu `packRoot/runtime`, `packRoot/skills`, `packRoot/workers`, `packRoot/commands`.
- `.ai-harness/` (install-cache.ts) hien CO: skills, hooks/, agent-system/, tool-capabilities,
  templates, prompt-templates, workflows, patterns, commands, AGENTS.md.
- `.ai-harness/` hien THIEU: `rules/` (dang hardcode trong installCodexRules),
  `agents/` (workers dang doc tu packRoot/workers).

## 2. Kien truc dich

### 2.1 Core source (`.ai-harness/`)
Map 8 thanh phan harness -> thu muc trong `.ai-harness/`:
| Core item | Thu muc trong .ai-harness/ | Trang thai |
|-----------|----------------------------|------------|
| agents    | `agent-system/` + `agents/` (workers) | THEM `agents/` |
| tools     | `tool-capabilities/`       | da co |
| skills    | `skills/`                  | da co |
| mcp       | `mcp/`                     | coming soon |
| template  | `templates/`, `prompt-templates/` | da co |
| rules     | `rules/` (default + rule chung) | THEM `rules/` (tach khoi code) |
| config    | `config/` (hoac config.json) | xac nhan vi tri |
| hooks     | `hooks/`                   | da co |

### 2.2 Interface adapter
```ts
interface ProviderAdapter {
  id: "codex" | "claude" | "cursor" | "gemini";
  install(ctx: AdapterContext): AdapterResult;
  // update(ctx) / uninstall(ctx) -> pha sau
}

interface AdapterContext {
  core: CoreSource;          // reader root tai .ai-harness/
  scope: "global" | "project";
  targetRoot: string;        // repo root (project)
  homeRoot: string;          // os.homedir() (global)
  project: ProjectContext;   // stack/title detect -> sinh <title>.rules
  dryRun: boolean;
  force: boolean;
}
```

### 2.3 Mapping ke thua cho moi provider (vi du Codex)
| Output (.codex/) | Kieu | Nguon |
|------------------|------|-------|
| rules/default.rules | inherit | core rules |
| rules/<title>.rules | generate | project context |
| hooks.json + config.toml + hooks/core/ | inherit | core hooks |
| AGENTS.md | adapt | core AGENTS.md -> fit codex |
| skills/ | inherit + extend | core skills + project |
| agents/ (subagents) | inherit + extend | core agents + project |
| plugins/ | custom | rieng codex |
| mcp | coming soon | - |

Moi provider co 1 bang mapping tuong tu (claude/cursor/gemini).

## 3. Cau truc file de xuat
```
src/features/install/
  domain/
    provider-adapter.ts     # interface + types
    core-source.ts          # reader over .ai-harness/
  infrastructure/adapters/
    codex-adapter.ts        # tach tu installCodex*
    claude-adapter.ts       # tach tu installClaude*
    cursor-adapter.ts       # tach tu installCursor
    gemini-adapter.ts       # tach tu installGemini
    registry.ts             # id -> adapter
  application/run-install.ts # dispatch qua registry
```

## 4. Cac buoc trien khai (tang dan, it rui ro)
1. **Bo sung core**: dua `rules/` va `agents/` (workers) vao `cacheExportPaths`
   trong install-cache.ts; tach rule-set hardcode -> file data trong `.ai-harness/rules/`.
2. **Dinh nghia** `ProviderAdapter` + `CoreSource` + `registry`.
3. **Tach** installCodex/Claude/Cursor/Gemini tu install-runtime.ts thanh cac adapter,
   doi nguon doc tu `packRoot/...` sang `core` (CoreSource).
4. **Dispatch**: run-install.ts build AdapterContext roi goi registry thay cho installRuntime.
5. **Generate**: them buoc sinh `<title>.rules` tu ProjectContext (dung stack-detect san co).
6. **Test**: cap nhat test theo adapter; hoan tat viec da bo nhanh non-interactive.

## 5. Quyet dinh con mo (can chot truoc khi code)
- **Core cho global install**: `.ai-harness/` la project-local. Khi cai `global` ($HOME/.codex/)
  thi doc core o dau? -> A) cai luon `~/.ai-harness/`  B) global van doc tu packRoot.
- **config**: vi tri chinh xac cua "config" trong core (file gi).
- **Backwards compat**: giu `installRuntime` song song trong giai doan migrate, hay thay han.
- **plugins/mcp**: pham vi cu the cua "plugins custom" va moc thoi gian cho mcp.