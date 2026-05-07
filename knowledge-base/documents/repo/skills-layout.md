| Field | Value |
|-------|-------|
| title | Skills directory layout |
| summary | Flat `skills/` tree: one folder per bundled skill plus `examples/skill-template` |
| tags | repo, skills, convention |
| updated | 2026-04-03 |

# Skills directory layout (current)

All skills live directly under **`skills/`**. There is no `public/` vs `private/` split; add sensitive skills in a private fork or `.gitignore` if needed.

**Maintenance:** When bundled skills change, update this file in the **same change** as `skills/README.md` — see `skills/SKILL_AUTHORING_RULES.md` §8.

```
skills/
  a2a-protocol-pro/
  ag-ui-pro/
  agent-evaluation-pro/
  ai-integration-pro/
  algorithm-pro/
  api-design-pro/
  auth-pro/
  azure-storage/
  brainstorming-pro/
  bug-discovery-pro/
  business-analysis-pro/
  caching-pro/
  ci-cd-pro/
  clean-architecture/
  clean-code-architecture-pro/
  cli-pro/
  cloud-native-agent-pro/
  code-packaging-pro/
  content-analysis-pro/
  data-analysis-pro/
  deployment-pro/
  design-system-pro/
  docker-pro/
  electron-pro/
  executing-plans-pro/
  feedback-pro/
  figma-mcp-pro/
  flutter-pro/
  frontend-design-pro/
  frontend-patterns/
  gemini-api-dev/
  git-operations-pro/
  graphql-pro/
  grill-me-pro/
  image-processing-pro/
  infrastructure-as-code-pro/
  javascript-pro/
  karpathy-coding-pro/
  market-research-pro/
  mcp-server-pro/
  microservices-pro/
  mobile-design-pro/
  motion-design-pro/
  nestjs-pro/
  network-infra-pro/
  nextjs-pro/
  nextjs-security-scan/
  ocr-pro/
  parallel-agents-pro/
  pdf/
  performance-tuning-pro/
  planning-pro/
  platform-design-pro/
  postgres-patterns/
  postgresql-pro/
  prisma-postgres/
  prompt-engineering-pro/
  react-native-pro/
  react-pro/
  repo-tooling-pro/
  router-pro/
  security-pro/
  security-review/
  self-improve-agent-pro/
  senior-architect/
  senior-backend/
  senior-frontend/
  senior-security/
  seo-pro/
  shadcn-mastery-pro/
  skill-creator-pro/
  skills-self-review-pro/
  solidity-security/
  sql-data-access-pro/
  strategic-consulting-pro/
  stream-rtc-pro/
  sync-custom-to-repo/
  system-design/
  systematic-debugging-pro/
  tauri-pro/
  test-driven-development-pro/
  testing-pro/
  to-issues-pro/
  to-prd-pro/
  typescript-pro/
  ui-design-brain-pro/
  ui-reverse-engineer-pro/
  ui-stack-pro/
  ui-ux-system-pro/
  web-research-pro/
  websocket-pro/
  writing-plans-pro/
```

Each skill requires **`SKILL.md`** with YAML frontmatter (`name`, `description`, optional `metadata.short-description`). Optional folders: `references/`, `scripts/`, `assets/`. Many bundles also ship a short **`README.md`** (entry point + links) for IDE or repo browsing — not required by validation, but preferred for Tier A polish.

Cross-references between skills use sibling paths, e.g. from `nestjs-pro` to PostgreSQL RLS docs: `../postgresql-pro/references/row-level-security.md`.

For Cursor: copy or symlink `skills/<name>/` to `.cursor/skills/<name>/` (see project `AGENTS.md`).
