# Contributing to Personal KB + Skill Hub

Thank you for your interest in contributing! This document explains how to contribute code, documentation, or skills to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Report issues responsibly (don't publicly disclose security vulnerabilities)

## Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0+
- Docker & Docker Compose
- Git

### Fork & Clone

```bash
git clone https://github.com/truongnat/personal-ai.git
cd personal-ai
```

### Install & Test

```bash
# Start services
docker compose up -d neo4j meilisearch redis

# Install API dependencies
cd apps/api && bun install

# Run tests
bun run test

# Start dev server
bun run start:dev
```

## Contribution Types

### 1. Bug Reports

**Before submitting:**
- Search existing [issues](https://github.com/truongnat/personal-ai/issues)
- Include version (`npm list nestjs`)
- Include reproduction steps

**Template:**
```markdown
**Describe the bug:**
Brief description...

**To reproduce:**
1. Run `skill kb push ...`
2. ...

**Expected behavior:**
What should happen...

**Actual behavior:**
What actually happens...

**Environment:**
- OS: macOS 14.5
- Node/Bun: Node 20.0
- API version: 1.0.0
```

### 2. Feature Requests

**Before submitting:**
- Check [Discussions](https://github.com/truongnat/personal-ai/discussions)
- Consider impact on architecture

**Template:**
```markdown
**Is your feature request related to a problem?**
e.g., "I'm frustrated when searching returns stale results"

**Describe the solution you'd like:**
How the feature should work...

**Describe alternatives you've considered:**
Other approaches...

**Additional context:**
Why this matters, use cases, etc.
```

### 3. Code Changes

#### Branch Naming
```
feature/short-description    # New feature
fix/short-description        # Bug fix
docs/short-description       # Documentation
refactor/short-description   # Code refactoring
```

#### Commit Format
Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add auto-tagging endpoint

Analyzes solution content and suggests relevant tags based on:
- Meilisearch search similarity
- Neo4j graph patterns
- Direct keyword matching

Includes 5 unit tests and CLI integration."
```

**Types:**
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation
- `test:` — Tests
- `refactor:` — Code refactoring
- `perf:` — Performance improvement
- `chore:` — Build/config changes

#### Code Style

**TypeScript:**
```typescript
// Follow NestJS conventions
// - PascalCase for classes
// - camelCase for methods/variables
// - kebab-case for files
// - JSDoc for public APIs

/**
 * Validates and pushes a solution to the KB
 * @param dto - Solution data
 * @returns Created solution ID
 */
async push(dto: PushKbDto): Promise<string> {
  // Implementation...
}
```

**Imports:**
- Order: Node, external, local
- Group logically
- Use absolute paths (configured in tsconfig)

**Error Handling:**
```typescript
// Use NestJS exceptions
if (!entity) {
  throw new NotFoundException(`Solution ${id} not found`)
}

// Validate input
const validation = await validate(dto)
if (validation.length > 0) {
  throw new BadRequestException(validation)
}
```

#### Testing

**Unit Tests:**
```bash
# Write tests for new services
# File: src/kb/kb.service.spec.ts

describe('suggestTags', () => {
  it('should suggest tags based on content similarity', async () => {
    const suggestions = await service.suggestTags('test content')
    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions[0].confidence).toBeGreaterThan(0.2)
  })
})

# Run tests
bun run test

# Coverage
bun run test:cov
```

**Test Requirements:**
- ✅ Unit tests for services (target: 70%+ coverage)
- ✅ Integration tests for controllers
- ✅ Mock external dependencies (Neo4j, Redis, Meilisearch)

#### Database Migrations

For Neo4j schema changes:

```typescript
// In neo4j.service.ts > createConstraints()
const constraints = [
  'CREATE CONSTRAINT new_constraint IF NOT EXISTS ...',
]

// Constraints are idempotent (IF NOT EXISTS prevents errors)
// Always use IF NOT EXISTS for safety
```

### 4. Skill Contributions

**Requirements:**
- Must follow [`SKILL_AUTHORING_RULES.md`](SKILL_AUTHORING_RULES.md)
- Must pass `skill validate ./skills/my-skill`
- Must include 6 layers: Metadata → Contract → Decision → Knowledge → Execution → Quality
- Must include Karpathy discipline gates

**Steps:**

```bash
# 1. Scaffold from template
skill new my-domain-pro

# 2. Edit skills/my-domain-pro/SKILL.md
# Follow SKILL_AUTHORING_RULES.md structure

# 3. Create reference docs
# skills/my-domain-pro/references/*.md

# 4. Validate
skill validate ./skills/my-domain-pro

# 5. Test in Claude Code/Cursor
# Install locally: skill install ./skills/my-domain-pro

# 6. Submit PR
```

**Skill Checklist:**
- [ ] 6-layer architecture complete
- [ ] All Karpathy principles embedded
- [ ] References folder has docs
- [ ] Validated with `skill validate`
- [ ] Tested in Claude Code or Cursor
- [ ] Section order matches canonical order
- [ ] Metadata frontmatter correct
- [ ] No broken reference links

### 5. Documentation

**Update README.md if you:**
- Add new endpoints
- Change CLI commands
- Add deployment requirements
- Modify architecture

**Update CLAUDE.md if you:**
- Change NestJS conventions
- Update graph schema
- Modify auth patterns

---

## Pull Request Process

### Before Submitting

1. **Format code:**
   ```bash
   npm run lint:fix  # If configured
   # OR manually follow style guide
   ```

2. **Run tests:**
   ```bash
   bun run test      # API tests
   make validate-skills  # Skill validation
   ```

3. **Type check:**
   ```bash
   npx tsc --noEmit
   ```

4. **Update docs:**
   - Update README.md if behavior changed
   - Add CHANGELOG entry
   - Update API docs if endpoints changed

### PR Template

```markdown
## Description
Brief description of changes...

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Related Issue
Fixes #123

## Testing
- [ ] Unit tests added
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No new warnings in logs
- [ ] Commit messages follow Conventional Commits

## Screenshots (if applicable)
```

### Review Process

- **Automatic checks:** TypeScript, tests, linting
- **Code review:** Look for correctness, performance, maintainability
- **Feedback:** Will be thorough but constructive
- **Approval:** Need 1 approval for features, 2 for major changes

---

## Development Workflow

### Local Development

```bash
# 1. Start services
make up

# 2. Start API
cd apps/api && bun run start:dev

# 3. In another terminal, test
cd packages/cli
bun run src/index.ts kb search "test"
```

### Database Inspection

```bash
# Neo4j Browser
open http://localhost:7474/browser/

# Meilisearch Admin
open http://localhost:7700/

# Redis CLI
docker exec -it personal-ai-redis-1 redis-cli
```

### Debugging

**VS Code:**

Add to `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "API Debug",
      "program": "${workspaceFolder}/apps/api/src/main.ts",
      "preLaunchTask": "tsc: build",
      "outFiles": ["${workspaceFolder}/apps/api/dist/**/*.js"]
    }
  ]
}
```

**Logs:**
```bash
# Follow API logs
make logs

# View specific service
docker logs -f personal-ai-api-1
```

---

## Performance Considerations

When submitting code:

- ✅ Batch Neo4j queries (use UNWIND, not N separate queries)
- ✅ Use Redis for caching search results
- ✅ Add indexes for frequently-queried properties
- ✅ Test with realistic data volumes (1000+ solutions)
- ✅ Use pagination for list endpoints
- ✅ Profile before optimizing (`make logs` then check duration)

**N+1 Query Example:**

```typescript
// ❌ Bad: One query per item
for (const hit of hits) {
  const details = await neo4j.runQuery(...) // N queries
}

// ✅ Good: Fetch all at once
const ids = hits.map(h => h.id)
const details = await neo4j.runQuery(
  `UNWIND $ids AS id MATCH (n) WHERE n.id = id RETURN n`,
  { ids }  // 1 query
)
```

---

## Questions or Need Help?

- **Bug?** → Create an [issue](https://github.com/truongnat/personal-ai/issues)
- **Feature idea?** → Start a [discussion](https://github.com/truongnat/personal-ai/discussions)
- **Skill question?** → Check [`SKILL_AUTHORING_RULES.md`](SKILL_AUTHORING_RULES.md)
- **Architecture?** → See [`ARCHITECTURE.md`](ARCHITECTURE.md)

---

**Thank you for contributing! 🚀**
