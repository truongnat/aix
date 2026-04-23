# Skill authoring rules (mandatory)

**Do not create a new skill directory under `skills/` unless every mandatory rule below is satisfied.**  
If a proposed skill cannot meet these rules, **stop** — extend an existing `*-pro` skill or update `references/` instead.

## Reference architecture — six layers

Every bundled skill should cover these layers (some sections live in `SKILL.md`, depth in `references/`):


| Layer            | Role                                                    | Typical location                                                                                           |
| ---------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **1. Metadata**  | Routing: name, description, triggers, short-description | YAML frontmatter                                                                                           |
| **2. Contract**  | Scope, when / when not, inputs, expected output shape   | `## Boundary`, `## When to use`, `## When not to use`, optional `## Required inputs`, `## Expected output` |
| **3. Decision**  | Defaults, trees, anti-patterns, operating principles    | `## Default recommendations…`, `## Decision trees`, `## Anti-patterns`, `### Operating principles`         |
| **4. Knowledge** | Deep reference chunked for retrieval                    | `references/*.md` + short `### … (summary)` stanzas in `SKILL.md`                                          |
| **5. Execution** | How the agent runs the skill                            | `## Workflow`, `## Suggested response format`, `## Quick example`                                          |
| **6. Quality**   | Gates before “done”                                     | `## Checklist before calling the skill done`                                                               |


**Formula:** Skill = Contract + Decision + Knowledge (references) + Execution + Quality. Metadata enables discovery.

---

## 1. When you may add a new skill

- The topic is **not** already covered by an existing bundled skill (`react-pro`, `nextjs-pro`, `react-native-pro`, `flutter-pro`, `nestjs-pro`, `postgresql-pro`, `sql-data-access-pro`, `testing-pro`, `security-pro`, `electron-pro`, `tauri-pro`, `deployment-pro`, `seo-pro`, `design-system-pro`, `mobile-design-pro`, `business-analysis-pro`, `content-analysis-pro`, `data-analysis-pro`, `image-processing-pro`, `web-research-pro`, `market-research-pro`, `strategic-consulting-pro`, `code-packaging-pro`, `caching-pro`, `network-infra-pro`, `planning-pro`, `algorithm-pro`, `feedback-pro`, `auth-pro`, `self-improve-agent-pro`, `git-operations-pro`, `skills-self-review-pro`, `bug-discovery-pro`, `repo-tooling-pro`, `typescript-pro`, `docker-pro`, `ci-cd-pro`, `ai-integration-pro`).
- The topic is **distinct** enough that merging into an existing skill would blur scope (document the reason in the PR or commit message).
- You have (or will add) at least `**SKILL.md`** and, for non-trivial domains, a `**references/**` folder — not a dump of all docs inside `SKILL.md`.

## 2. Canonical `SKILL.md` structure (required order)

Use **exactly** these section headings and order for **new** skills and **refactored** skills. Older bundled skills may use a legacy layout until migrated.


| Order | Section                                                                       | Layer               | Required                        |
| ----- | ----------------------------------------------------------------------------- | ------------------- | ------------------------------- |
| —     | YAML: `name`, `description`, `metadata.short-description`                     | Metadata            | **Yes**                         |
| —     | Optional: `metadata.content-language`, `metadata.domain`, `metadata.level`    | Metadata            | No                              |
| 1     | `# <Display name> (professional)`                                             | —                   | **Yes**                         |
| 2     | Intro paragraph (§3); optional language note (§13)                            | Contract            | **Yes**                         |
| 3     | `## Boundary` — owns vs defers; optional **Related skills (this repo)** table | Contract            | **Yes**                         |
| 4     | `## When to use` — bullets + `- Trigger keywords: ...`                        | Contract            | **Yes**                         |
| 5     | `## When not to use` — explicit out-of-scope                                  | Contract            | **Yes** for new/refactored      |
| 6     | `## Required inputs`                                                          | Contract            | Optional                        |
| 7     | `## Expected output` — mirrors **Suggested response format** (shape only)     | Contract            | Optional                        |
| 8     | `## Workflow` — **only** the three numbered steps (§4)                        | Execution           | **Yes**                         |
| 9     | `### Operating principles` — immediately after Workflow                       | Decision            | **Yes**                         |
| 10    | `## Default recommendations by scenario`                                      | Decision            | Recommended                     |
| 11    | `## Decision trees` — summary + `Details:` link                               | Decision            | Optional                        |
| 12    | `## Anti-patterns` — summary + `Details:` link                                | Decision            | Recommended                     |
| 13    | Additional `### <Topic> (summary)` blocks → `references/`                     | Knowledge           | **Yes** if `references/` exists |
| 14    | `## Cross-skill handoffs` — optional + `Details:` to `integration-map.md`     | Execution / Quality | Optional                        |
| 15    | `### Versions (summary)` — optional + `Details:` to `versions.md`             | Knowledge           | Optional                        |
| —     | `## Suggested response format (implement / review)` — after summaries above   | Execution           | **Yes**                         |
| 16    | `## Resources in this skill` — **Topic | File** table                         | Knowledge           | **Yes**                         |
| 17    | `## Quick example` — three cases when feasible                                | Execution           | **Yes**                         |
| 18    | `## Checklist before calling the skill done`                                  | Quality             | **Yes**                         |


**Layout:** See `**auth-pro`** — `## Workflow` is only steps 1–3; `**## Suggested response format**` comes after principles, defaults, decision/anti-pattern hooks, and topic summaries.

**Legacy:** Skills may still use a standalone `## Related skills` section; migrate toward **Boundary** + table when editing.

## 3. Frontmatter and intro

- `**name`**: kebab-case, matches folder name.
- `**description**`: Scope line; `Use this skill when …`; `Triggers:`; optional **combine with**; include **when not to use** in prose if helpful.
- `**metadata.short-description`**: One line; `Product — areas`.
- `**metadata.content-language**` (optional): `en` — authoring language; not chat language (§13).
- `**metadata.domain**` (optional): e.g. `identity`, `frontend`, `data`.
- `**metadata.level**` (optional): `foundation`  `professional`  `advanced`.
- **Intro** (after H1): Official docs (links); what the skill **encodes**; what to **confirm** from the project.

## 4. Workflow — three fixed steps

1. **Confirm** versions / environment / stack / actors (skill-specific).
2. **Apply the principles and summaries below; open `references/` when you need depth.**
3. **Respond using Suggested response format;** note main risks (skill-specific).

## 5. Suggested response format

### Standard labels (default)

1. **Issue or goal**
2. **Recommendation**
3. **Code** — snippets, YAML, checklist — still labeled **Code**
4. **Residual risks**

### Extended format (auth, security-heavy)

More blocks **only** if listed in `**## Suggested response format`** and `**## Expected output**`. Example — `**auth-pro**`: **Context**, **Authentication recommendation**, **Authorization recommendation**, **Token/session lifecycle**, **Implementation / infrastructure notes**, **Residual risks & verification**.

## 6. References

- Long content in `**references/*.md`** — one topic per file where possible.
- Prefer: `**tips-and-tricks.md**`, `**edge-cases.md**`, `**decision-tree.md**`, `**anti-patterns.md**`, `**integration-map.md**`, `**versions.md**`.
- `SKILL.md` = summaries + `Details:` links.

## 7. Copy procedure

1. Copy `skills/examples/skill-template/` → `skills/<new-skill-name>/`.
2. Replace placeholders per this document.
3. Complete the template checklist in `SKILL.md`.
4. Complete **§8** in the same change.

## 8. Mandatory repository documentation (same change)


| Trigger                                                      | Updates                                                                                                                            |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Add** bundled skill                                        | `skills/README.md`; root `**README.md`**; `**AGENTS.md**`; **§1** skill list; `**knowledge-base/documents/repo/skills-layout.md`** |
| **Remove/rename** skill                                      | Same; fix all mentions                                                                                                             |
| **Add** workflow under `workflows/`                          | Root `**README.md`**; `<slug>.md` naming per `[workflows/README.md](../workflows/README.md#naming)`; domain `**README.md**` if new |
| **Add** `knowledge-base/documents/`** file                   | `**knowledge-base/INDEX.md**`                                                                                                      |
| **Substantive** `SKILL.md` / `references/` (routing meaning) | `**node dist/tools.js build-skill-index`**; if `name`/frontmatter changed: `**validate-skills**` first                             |


## 9. Review

Section order §2 (or legacy); Workflow §4; **When not to use** for new/refactored skills; **Suggested response format** §5; **§8** updates; **§10** quality.

## 10. Quality rubric


| Dimension                | 1       | 3             | 5                                      |
| ------------------------ | ------- | ------------- | -------------------------------------- |
| **Operating principles** | Generic | Concrete      | Decision-forcing                       |
| **Trigger coverage**     | Narrow  | Obvious terms | Slang, errors, adjacent concepts       |
| **Reference depth**      | Thin    | 2–3 files     | 4+ files; anti-patterns; when NOT      |
| **Quick examples**       | One     | Two           | **Three:** simple, tricky, cross-skill |
| **Checklist**            | Vague   | 5–6 items     | Verifiable; scenario subsections       |


## 11. Prompt-engineering for consumers

- **Context:** stack, severity, what was tried.
- **One job** per invocation unless a workflow chains steps.
- **Combining skills:** name both; state ownership.

## 12. Update vs new skill

```
New topic
├── Covered by §1 skill? → extend; edit references/
├── SKILL.md would exceed ~300 lines if merged? → split scope
└── Distinct job + triggers? → new skill + §1–§9 + §8
```

## 13. Language policy

- `**SKILL.md**`, `**references/*.md**`: **English** unless repo ships a localized bundle.
- **Chat replies:** User Rules, project rules, or explicit chat instruction.
- **Behavior:** Apply skill as written; answer in the user’s preferred language when set; keep identifiers and protocol names conventional.

Optional line in a skill: *Skill text is English; match response language from Cursor/project rules when applicable.*