# Decision Tree: CLI Design Choices

## 1. Commander.js vs Yargs vs custom parser

**Decision:** Which argument parsing library?

| Criterion | Commander | Yargs | Custom |
|-----------|-----------|-------|--------|
| **Readability** | Excellent (fluent API) | Good (config object) | Poor (verbose) |
| **Feature completeness** | All 4 levels ✓ | Most ✓ | Fragile |
| **Community size** | Large | Large | Solo |
| **Recommended for** | Professional CLIs | Config-heavy CLIs | Learning only |

**Decision:** Use **Commander** for production CLIs. It's the standard, readable, and battle-tested. Yargs is fine if you have complex option types (types, coercion). Avoid custom parsers — they're error-prone and hard to extend.

```typescript
// Commander (professional)
program
  .command('push <file>')
  .option('--force', 'Force overwrite')
  .action((file, opts) => { });

// Yargs (alternative, more config-based)
yargs
  .command('push <file>', 'Push file', () => {}, (argv) => { });
```

---

## 2. Conf vs dotfiles vs environment variables

**Decision:** Where to store user configuration?

| Strategy | Use Case | Pros | Cons |
|----------|----------|------|------|
| **Conf (npm package)** | Structured settings | XDG standard, typed, migrations | Single OS-specific location |
| **Dotfiles (.skillrc)** | Simple key=value | Universal, human-editable | No schemas, no validation |
| **.env files** | Deploy-time secrets | Standard in CI/CD | Unversioned, hard to share |
| **Environment variables only** | Deployment | Immutable, secure | Not discoverable by CLI |

**Recommendation:**
- **User config**: Use Conf library → `~/.config/myapp/config.json` (XDG standard)
- **Secrets in CI/CD**: Use env vars → `API_KEY=xyz myapp deploy`
- **Project-local config**: Dotfiles like `.skillconfig` if sharing within team

Layered priority:
```typescript
// 1. Env var (highest priority, deploy-time override)
const apiKey = process.env.API_KEY
  // 2. Config file (persistent, user-set)
  || config.get('apiKey')
  // 3. Default (lowest priority, fallback)
  || 'https://api.example.com';
```

---

## 3. Bun vs Node.js as target

**Decision:** `bun build --target bun` or `--target node`?

| Factor | Bun target | Node target |
|--------|------------|-------------|
| **Speed** | Fast (~50ms startup) | Slower (~200ms) |
| **File size** | Larger, includes runtime | Smaller, requires Node |
| **Portability** | Only if Bun installed | Works on any Node 18+ |
| **Maturity** | Newer, evolving | Stable |
| **When to use** | Internal tools | Public releases |

**Decision tree:**
- **Public tool on npm**: Use `--target node` for maximum compatibility
- **Internal tool, team has Bun**: Use `--target bun` for speed
- **GitHub Releases**: Ship both, let user choose
- **Docker container**: Either fine; Node more common

---

## 4. Interactive mode vs flags

**Decision:** Should the CLI prompt for input, or require flags?

| Approach | Use Case | Pros | Cons |
|----------|----------|------|------|
| **Flags only** | Automation, scripts | Fast, repeatable, scriptable | Verbose, many options overwhelming |
| **Interactive prompts** | Onboarding, setup | Friendly, discoverable | Slow, hard to script |
| **Hybrid** | Most CLIs | Best of both | More code |

**Recommendation:** Hybrid approach:
- Flags for experienced users (`skill push ./file.md --tag neo4j`)
- Prompts for first-time setup only (`skill login` → password prompt)
- Never force interactive if flag provided

```typescript
// ✓ GOOD: Hybrid
program
  .command('create <name>')
  .option('--template <name>', 'Template to use')
  .action(async (name, opts) => {
    let template = opts.template;
    if (!template) {
      // Only prompt if flag not provided
      const response = await prompts({ type: 'select', name: 'template', ... });
      template = response.template;
    }
    // Proceed with template
  });

// Usage
skill create myapp --template react      // No prompts
skill create myapp                        // Prompts for template
```

---

## 5. JSON output flag

**Decision:** Should CLI support `--json` for scripting?

**Recommendation:** Yes, always. Default to human-readable (tables, colors), provide `--json` for machines.

```typescript
program
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    const results = await fetchResults();
    if (opts.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      displayTable(results);
    }
  });

// Usage
skill search "neo4j" --json | jq '.[] | select(.tags | contains(["backend"]))'
skill search "neo4j"          # Pretty table
```

---

## 6. Global vs local installation

**Decision:** Should users install globally or per-project?

| Approach | When | Pros | Cons |
|----------|------|------|------|
| **Global (npm -g)** | Tools (skill, cli, build commands) | Available everywhere | Version conflicts, hard to upgrade |
| **Local (devDependencies)** | Dev tools (lint, format, test) | Per-project versions | Not in PATH by default |
| **Both** | Tools with project plugins | Flexibility | Complexity |

**Recommendation:**
- **User-facing CLI**: Global (`npm i -g @org/skill`)
- **Dev tool**: Local (`npm i -D @org/linter`)
- **Plugin-based**: Global base + local plugins

---

## 7. Config location discoverability

**Decision:** How do users find their config file?

**Recommendation:** Always show config path in `--help`:

```typescript
program.on('--help', () => {
  console.log('');
  console.log(`Config file: ${config.path}`);
  console.log('Edit directly or use: skill config set <key> <value>');
  console.log('');
});

// Also provide command
program
  .command('config:show')
  .action(() => {
    console.log(`Config: ${config.path}`);
    console.log(JSON.stringify(config.store, null, 2));
  });
```

---

## 8. Error verbosity in production

**Decision:** How much detail to show users on error?

**Recommendation:** Context + suggestion, not full stack trace (unless --debug).

```typescript
// ❌ BAD
console.error(error.stack);  // 50 lines of noise

// ✓ GOOD
if (process.env.DEBUG) {
  console.error(error.stack);  // Full trace for developers
} else {
  console.error(`Error: ${error.message}`);
  if (error.suggestion) {
    console.error(`Suggestion: ${error.suggestion}`);
  }
}
```

---

## 9. Rate limiting and retry strategy

**Decision:** Should CLI retry on transient failures?

**Recommendation:** Yes, with exponential backoff for transient errors (5xx, 429, network), but fail fast on permanent errors (4xx auth, validation).

```typescript
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  retries = 3,
): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, { ... });
      if (response.status === 429 || response.status >= 500) {
        if (attempt < retries - 1) {
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
      }
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      if (attempt === retries - 1) throw error;
    }
  }
}
```

---

## 10. Version locking in CLI

**Decision:** Should CLI pin dependencies or allow flexibility?

**Recommendation:** Pin major versions in package-lock.json (auto via npm), but allow minor/patch updates. Tag releases in git.

```json
{
  "version": "1.2.3",
  "scripts": {
    "release": "npm version patch && npm publish && git push --tags"
  }
}
```

Then users always get stable latest: `npm i -g @org/skill` → 1.2.x (auto-updates for patches).
