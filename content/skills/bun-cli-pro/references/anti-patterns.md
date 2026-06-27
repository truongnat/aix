# Anti-Patterns in CLI Development

## 1. No feedback during async operations

**Problem:** User runs command and sees nothing — hangs without indication of progress.

```typescript
// ❌ BAD
program
  .command('deploy')
  .action(async () => {
    const result = await uploadLargeFile(); // Silent wait
    console.log('Done!');
  });
```

**Consequence:** User thinks CLI hung; they kill it with Ctrl+C, leaving partial state.

**Fix:** Add spinner.

```typescript
// ✓ GOOD
program
  .command('deploy')
  .action(async () => {
    const spinner = ora('Uploading...').start();
    try {
      const result = await uploadLargeFile();
      spinner.succeed('Upload complete');
    } catch (error) {
      spinner.fail(`Upload failed: ${error.message}`);
      process.exit(1);
    }
  });
```

## 2. Swallowing errors without context

**Problem:** Catch all errors, log nothing useful, exit silently.

```typescript
// ❌ BAD
async function search(query) {
  try {
    return await api.search(query);
  } catch (e) {
    console.error('Error');  // User has no idea what failed
    process.exit(1);
  }
}
```

**Consequence:** User can't fix the problem; they blame the CLI.

**Fix:** Provide context and suggest recovery.

```typescript
// ✓ GOOD
async function search(query) {
  try {
    return await api.search(query);
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('Error: Cannot connect to API at', config.apiUrl);
      console.error('Suggestion: Check your network, or configure --api-url');
    } else if (error instanceof ApiError && error.status === 401) {
      console.error('Error: API key is invalid or expired');
      console.error('Suggestion: Run "skill login" to re-authenticate');
    } else {
      console.error(`Error: ${error.message}`);
    }
    process.exit(1);
  }
}
```

## 3. Hardcoded API URLs or config

**Problem:** API endpoint, workspace, or auth method locked in code.

```typescript
// ❌ BAD
const API_URL = 'https://api.example.com';  // Can't switch envs
const DEFAULT_WORKSPACE = 'production';     // What about staging?
```

**Consequence:** Can't test against staging; must fork CLI for each environment.

**Fix:** Use config file + env override.

```typescript
// ✓ GOOD
const config = new Conf();
const apiUrl = process.env.API_URL || config.get('apiUrl') || 'https://api.example.com';
const workspace = process.env.WORKSPACE || config.get('workspace') || 'default';
```

## 4. Overly chatty help text

**Problem:** --help shows 500 lines of prose nobody reads.

```typescript
// ❌ BAD
program
  .command('push')
  .description('Push a file to the knowledge base. This command uploads your document to...')
  .action(() => { });
```

**Consequence:** User scrolls past key info; examples buried at bottom.

**Fix:** Short description + examples.

```typescript
// ✓ GOOD
program
  .command('push <file>')
  .description('Upload solution to knowledge base')
  .example('skill push ./bug-fix.md --tag neo4j')
  .example('skill push ./pattern.md --tag backend --force')
  .action(async (file, opts) => { });
```

## 5. No idempotency in destructive operations

**Problem:** Running the same command twice deletes twice.

```typescript
// ❌ BAD
program
  .command('delete <id>')
  .action(async (id) => {
    await api.delete(`/solutions/${id}`);  // 2nd run → 404
    console.log('Deleted!');
  });
```

**Consequence:** Script fails if run twice (e.g., in CI retry); unpredictable state.

**Fix:** Check existence first or handle 404.

```typescript
// ✓ GOOD
program
  .command('delete <id>')
  .action(async (id) => {
    try {
      await api.delete(`/solutions/${id}`);
      console.log('Deleted!');
    } catch (error) {
      if (error.status === 404) {
        console.log('Already deleted (not found)');
      } else {
        throw error;
      }
    }
  });
```

## 6. Global state instead of passing context

**Problem:** Functions modify global variables; hard to test, state pollution.

```typescript
// ❌ BAD
let config = {};
function setupConfig(path) {
  config = loadConfig(path);  // Global
}
function deploy() {
  useConfig(config);  // Depends on global
}
```

**Consequence:** Tests interfere; parallel commands share state; bugs hard to isolate.

**Fix:** Pass state explicitly.

```typescript
// ✓ GOOD
function setupConfig(path) {
  return loadConfig(path);  // Return, don't mutate
}
async function deploy(config, options) {
  return useConfig(config);  // Pass as argument
}
```

## 7. Exit code always 0, even on error

**Problem:** Script always reports success (`echo $?` → 0).

```typescript
// ❌ BAD
program
  .command('build')
  .action(async () => {
    try {
      await build();
      console.log('Done!');
    } catch (error) {
      console.error('Build failed!');
      // No process.exit(1)
    }
  });
```

**Consequence:** CI thinks it passed; deploys broken code.

**Fix:** Exit with code 1 on error.

```typescript
// ✓ GOOD
program
  .command('build')
  .action(async () => {
    try {
      await build();
      console.log('Done!');
    } catch (error) {
      console.error('Build failed:', error.message);
      process.exit(1);  // Exit code 1
    }
  });

program.parse();
```

## 8. No SIGINT handler

**Problem:** Ctrl+C kills process, leaves temp files, unclosed connections.

```typescript
// ❌ BAD
async function uploadLarge(file) {
  const tempDir = createTempDir();
  await upload(file, tempDir);
  cleanup(tempDir);
  // If user hits Ctrl+C, cleanup never runs
}
```

**Consequence:** Temp files accumulate; database connections hang; orphaned locks.

**Fix:** Register signal handler.

```typescript
// ✓ GOOD
const tempDir = createTempDir();

process.on('SIGINT', () => {
  console.log('
Cleaning up...');
  cleanup(tempDir);
  process.exit(0);
});

async function uploadLarge(file) {
  await upload(file, tempDir);
  cleanup(tempDir);
}
```

## 9. Binary too large or takes minutes to start

**Problem:** Compiled binary is 100MB+ or startup is 5+ seconds.

```bash
# ❌ BAD
$ time skill --version
real	0m5.234s  # Unacceptably slow
$ ls -lh skill
-rw-r--r--  150M  skill  # Huge
```

**Fix:** Use --minify and --target node; strip debug symbols.

```bash
# ✓ GOOD
$ bun build src/cli.ts \
  --outfile skill \
  --target node \
  --minify-whitespace \
  --minify-syntax
$ strip skill  # Remove debug symbols
$ ls -lh skill
-rw-r--r--  8.2M  skill
```

## 10. Printing JSON to stdout by default

**Problem:** CLI is meant for human reading, outputs JSON, breaking scripts.

```typescript
// ❌ BAD
program
  .command('list')
  .action(async () => {
    const items = await fetch();
    console.log(JSON.stringify(items));  // Machine-only, useless to humans
  });
```

**Consequence:** Humans can't read output; scripts can't parse colorized text.

**Fix:** Pretty print by default, --json flag for scripting.

```typescript
// ✓ GOOD
program
  .command('list')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    const items = await fetch();
    if (opts.json) {
      console.log(JSON.stringify(items, null, 2));
    } else {
      displayTable(items);  // Colorized, human-readable
    }
  });
```
