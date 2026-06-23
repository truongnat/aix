# TypeScript & JSDoc Support

The `ai-engineering-harness` package includes TypeScript type definitions for the public API surface.

## Installation

```bash
npm install ai-engineering-harness
```

## TypeScript Support

TypeScript and IDE consumers automatically get type information from `index.d.ts`:

```typescript
// TypeScript
import type { InstallOptions, ValidationResult } from 'ai-engineering-harness';

async function run() {
  const options: InstallOptions = {
    target: '/path/to/project',
    dryRun: true,
    force: false
  };
  
  // Types are inferred automatically
}
```

The package root exports shared types only. Runtime entrypoints are available through explicit subpaths such as `ai-engineering-harness/cli-main`, `ai-engineering-harness/file-operations`, and `ai-engineering-harness/validate`.

## JSDoc Support

Runtime entrypoints include JSDoc comments for inline documentation:

```javascript
// JavaScript with JSDoc
const { main } = require('ai-engineering-harness/cli-main');

/**
 * Run the CLI with type hints from JSDoc
 * @type {(argv: string[], moduleFilename: string) => Promise<number>}
 */
const result = await main(process.argv, __filename);
```

## IDE Autocomplete

Most IDEs (VS Code, WebStorm, Sublime, etc.) provide autocomplete based on:

1. **TypeScript Definition File** (`index.d.ts`) — Primary source of truth for types
2. **JSDoc Comments** — Inline documentation visible on hover
3. **Parameter Types** — Full type checking for function arguments

## API Reference

### CLI Entry Point

```javascript
const { main } = require('ai-engineering-harness/cli-main');

// Run the CLI programmatically
const exitCode = await main(process.argv, __filename);
```

**Parameters:**
- `argv: string[]` - Command-line arguments (starting with node, script path)
- `moduleFilename: string` - `__filename` of calling module for pack detection

**Returns:** `Promise<number>` - Exit code (0 = success, 1 = error)

### File Operations

```javascript
const { ensureDirectory, writeFileWithDryRun } = require('ai-engineering-harness/file-operations');

// Create directory safely
ensureDirectory('./output', false); // Create
ensureDirectory('./output', true);  // Dry run

// Write file with options
writeFileWithDryRun('./output.md', 'content', {
  dryRun: false,
  force: true
}, (msg) => console.log(`[LOG] ${msg}`));
```

### Validation

```javascript
const {
  validateHarnessRepository,
  validateTargetProfile,
} = require('ai-engineering-harness/validate');

// Validate the harness repository
const harnessFailures = validateHarnessRepository(process.cwd());

// Validate a target profile
const targetFailures = validateTargetProfile('/path/to/project');
```

## Type Definitions

Shared types are exported from the package root in `index.d.ts`:

### `InstallOptions`

Options for harness installation.

```typescript
interface InstallOptions {
  dryRun?: boolean;           // Preview without writing
  force?: boolean;            // Overwrite existing files
  target?: string;            // Target repository path
  runtime?: string;           // claude | cursor | codex | gemini | manual
  scope?: string;             // global | project
  initHarness?: boolean;      // Initialize .harness/
  installCache?: boolean;     // Install .ai-harness/ cache
}
```

### `InstallResult`

Result of installing a single file.

```typescript
interface InstallResult {
  action: string;             // COPY | SKIP | WOULD_COPY | WOULD_SKIP
  relativePath: string;       // Path from target root
  reason: string;             // new | exists | overwrite
}
```

### `ValidationResult`

Result of validation check.

```typescript
interface ValidationResult {
  passed: boolean;            // Whether validation passed
  errors: ValidationError[];  // List of errors
  summary: {
    filesChecked: number;
    testsPassed: number;
    testsFailed: number;
  };
}
```

### `ProviderCommandSupport`

Command support for a specific provider.

```typescript
interface ProviderCommandSupport {
  id: string;                 // Command ID
  name: string;               // Display name
  native: boolean;            // Supports natively
  fallback: boolean;          // Supports via fallback rules
  invocation?: string;        // How to invoke
}
```

## Troubleshooting

### Types not showing up in IDE

1. Ensure `index.d.ts` is in the package root
2. Verify `package.json` has `"types": "./index.d.ts"`
3. Use the exported runtime subpaths (`/cli-main`, `/file-operations`, `/validate`) instead of deep imports
4. Restart your IDE's TypeScript server (Cmd+Shift+P → "TypeScript: Reload Projects")

### JSDoc comments not showing on hover

1. Ensure JSDoc comments precede function definitions
2. Check IDE supports JSDoc (most modern editors do)
3. Hover over the function name (not the call site)

### Need additional types?

Open an issue on [GitHub](https://github.com/truongnat/ai-engineering-harness/issues) with:
- The function or module you need types for
- Example usage code
- Use case

## Contributing

Type definitions are maintained in `index.d.ts` and JSDoc comments in the source files.

When adding new public APIs:

1. Add JSDoc comments with `@param`, `@returns`, `@example`
2. Update `index.d.ts` with the new root types or subpath module declarations
3. Update `package.json` `"exports"` when adding a new runtime entrypoint
4. Run tests to ensure backward compatibility

See [CONTRIBUTING.md](../CONTRIBUTING.md) for details.
