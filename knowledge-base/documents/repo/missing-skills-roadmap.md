# Missing Skills Roadmap

## Priority: High (Foundation)

These skills are foundational and would unlock many use cases.

| Skill | Domain | Rationale | Status |
|-------|--------|-----------|--------|
| `redis-pro` | Caching/State | Essential for performance, session management | 🔴 |
| `kafka-pro` | Event streaming | Critical for async architectures, microservices | 🔴 |
| `terraform-pro` | Infrastructure-as-code | Essential for cloud deployments, DevOps | 🔴 |
| `kubernetes-pro` | Orchestration | Required for scaling, container management | 🔴 |
| `elasticsearch-pro` | Search/Analytics | Important for large-scale data systems | 🔴 |
| `llm-ops-pro` | LLM Operations | New domain: prompt engineering, fine-tuning, cost optimization | 🔴 |
| `prompt-engineering-pro` | AI workflows | Prompt optimization, few-shot learning, chain-of-thought | 🔴 |

## Priority: Medium (Common Patterns)

Useful for specific common scenarios.

| Skill | Domain | Rationale | Status |
|--------|--------|-----------|--------|
| `monorepo-pro` | Monorepo management | Yarn/Lerna/Nx patterns for multi-package repos | 🔴 |
| `mobile-release-pro` | Mobile deployment | iOS/Android app store releases, versioning | 🔴 |
| `db-migration-pro` | Database operations | Schema migrations, zero-downtime deployments | 🔴 |
| `feature-flags-pro` | Release management | LaunchDarkly, feature flag patterns | 🔴 |
| `observability-pro` | Monitoring | Datadog, New Relic, metrics/traces/logs | 🔴 |

## Priority: Low (Niche)

Specialized areas that extend existing skills.

| Skill | Domain | Rationale | Status |
|--------|--------|-----------|--------|
| `storybook-pro` | Component documentation | Component library documentation patterns | 🔴 |
| `tdd-specific-pro` | TDD patterns | Test-first workflows (extends `testing-pro`) | 🔴 |
| `graphql-federation-pro` | GraphQL advanced | Apollo Federation patterns (extends `graphql-pro`) | 🔴 |

## Already Covered (No New Skills Needed)

These topics are adequately handled by existing skills or combinations:

- Conventional commits → `git-operations-pro`
- Environment variables → `deployment-pro`
- Build optimization → `performance-tuning-pro`
- Package publication → `code-packaging-pro`
- Mobile UI components → `mobile-design-pro` + `react-native-pro`
- Web components → `javascript-pro` (or extend)
- E2E testing → `testing-pro`
- API Gateway → `api-design-pro`

## How to Propose New Skills

1. Check this roadmap + SKILL_AUTHORING_RULES.md
2. Verify not already covered
3. Define clear "When to use" and "When not to use"
4. Draft PR with skill definition + rationale
5. Request review from domain expert

## Notes

- Skills are created on-demand, not preemptively
- Prefer extending existing skills over creating new ones
- Each new skill adds maintenance burden
- Domain expertise required for new skill quality
