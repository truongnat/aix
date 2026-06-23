# Runtime Command Catalog Refactoring Roadmap

## Current State (v1.1.x)

Split complete. `lib/runtime-command-catalog.js` is a thin facade re-exporting:

- `lib/catalog/provider-command-metadata.js` — constants, provider matrix, query helpers
- `lib/catalog/command-rendering.js` — surface building and file rendering
- `lib/catalog/command-installation.js` — install/merge/write helpers

Re-run `node scripts/split-catalog.js` only when restoring from the pre-split monolith in git history.

### Previous monolith layout (reference)

### Section 1: Constants & Metadata (~130 lines)
- `COMMAND_NAMESPACE`, `CACHE_DIR`, `RUNTIME_COMMANDS_DIR`, `PROMPT_TEMPLATES_DIR`
- `PACK_PLUGIN_PATHS`
- `PROVIDER_COMMAND_SUPPORT` (comprehensive provider capability matrix)
- `WORKFLOW_COMMANDS`, `CLI_DIAGNOSTIC_COMMANDS`, `CANONICAL_COMMANDS`, `SLASH_COMMANDS`

### Section 2: Provider Query Functions (~25 lines)
- `providerCommandSupport(providerId)`
- `providerInvocationFor(providerId, commandId)`
- `formatProviderUseLine(providerId)`

### Section 3: Command Surface Building (~50 lines)
- `buildCommandSurface(installedProviderEntrypoints)`
- `readInstalledCommandSurface(targetRoot)`
- `formatCommandSupportForPlan(providerIds)`

### Section 4: Rendering Functions (~110 lines)
- `activationMarkdown()`
- `renderRuntimeCommandFile(spec)`
- `renderClaudeCommandFileFromSpec(spec)`
- `renderAgentsCommandAliasesSection()`
- `renderGeminiCommandsReadme()`
- `buildManifest(providerEntrypoints)`

### Section 5: Installation Functions (~276 lines)
- `writeFile(targetRoot, relativePath, content, options)`
- `installPromptTemplates(targetRoot, options)`
- `installRuntimeCommandCatalog(targetRoot, options)`
- `mergeManifestProviders(targetRoot, runtime, paths, options)`
- `providerCommandPathsForRuntime(runtime, scope)`
- `installClaudeNativeCommands(targetRoot, packRoot, options)`
- `installCursorHarnessFallback(targetRoot, options)`
- `appendAgentsCommandAliases(agentsPath, options)`
- `installGeminiHarnessFallback(targetRoot, options)`
- `installProviderNativeCommands(runtime, scope, targetRoot, packRoot, options)`
- `installProviderFallbackCommands(runtime, scope, targetRoot, packRoot, options)`
- `installProviderCommandSurface(runtime, scope, targetRoot, packRoot, options)`

### Section 6: Utility Functions (~30 lines)
- `runtimeCommandCatalogPathsForPlan(providerId, scope)`
- `fileReferencesActivation(filePath)`

---

## Planned Refactoring for v1.1.0

### Goal
Split into 3 focused modules while maintaining backward-compatible exports.

### Module 1: `lib/provider-command-metadata.js` (~180 lines)
**Purpose:** Provider capabilities and command definitions

**Exports:**
- Constants: `COMMAND_NAMESPACE`, `CACHE_DIR`, `RUNTIME_COMMANDS_DIR`, `PROMPT_TEMPLATES_DIR`
- Metadata: `PACK_PLUGIN_PATHS`, `PROVIDER_COMMAND_SUPPORT`, `WORKFLOW_COMMANDS`, `CLI_DIAGNOSTIC_COMMANDS`, `CANONICAL_COMMANDS`, `SLASH_COMMANDS`
- Functions: `providerCommandSupport()`, `providerInvocationFor()`, `formatProviderUseLine()`, `providerCommandPathsForRuntime()`, `runtimeCommandCatalogPathsForPlan()`

**Dependencies:** `provider-rule-renderer.js`

### Module 2: `lib/command-rendering.js` (~220 lines)
**Purpose:** Generate command files, manifests, and activation markdown

**Exports:**
- `activationMarkdown()`, `renderRuntimeCommandFile()`, `renderClaudeCommandFileFromSpec()`, `renderAgentsCommandAliasesSection()`, `renderGeminiCommandsReadme()`, `buildCommandSurface()`, `readInstalledCommandSurface()`, `formatCommandSupportForPlan()`, `buildManifest()`

**Dependencies:** `provider-command-metadata.js`

### Module 3: `lib/command-installation.js` (~200 lines)
**Purpose:** Install commands, templates, and manifests to target projects

**Exports:**
- `writeFile()`, `installPromptTemplates()`, `installRuntimeCommandCatalog()`, `mergeManifestProviders()`, `installClaudeNativeCommands()`, `installCursorHarnessFallback()`, `appendAgentsCommandAliases()`, `installGeminiHarnessFallback()`, `installProviderNativeCommands()`, `installProviderFallbackCommands()`, `installProviderCommandSurface()`, `fileReferencesActivation()`

**Dependencies:** `provider-command-metadata.js`, `command-rendering.js`, `file-operations.js`

### Module 4: `lib/runtime-command-catalog.js` (refactored to ~80 lines)
**Purpose:** Entry point for backward compatibility

**Exports:** Re-exports all 40+ functions and constants from modules 1-3

**Dependencies:** `provider-command-metadata.js`, `command-rendering.js`, `command-installation.js`

---

## Benefits of Refactoring

✅ **Testability:** Render functions can be tested independently from installation  
✅ **Maintainability:** Provider metadata is isolated and easier to update  
✅ **Reusability:** Command rendering can be used by other tools  
✅ **Clarity:** Clear separation of concerns reduces cognitive load  
✅ **Scaling:** Easier to add new provider integration layers  

---

## Current Code Organization

The module is already well-structured with clear section boundaries (marked with `// ============================================================================` comments). This provides a clear roadmap for the v1.1.0 refactoring without requiring immediate changes.

## Migration Path

1. **v1.0.x (Current):** Keep monolithic with clear section markers (DONE)
2. **v1.1.0 (Planned):**
   - Extract `provider-command-metadata.js`
   - Extract `command-rendering.js`
   - Extract `command-installation.js`
   - Update `runtime-command-catalog.js` to re-export (backward compatible)
   - Verify all tests pass
   - Update import paths in callers (if any exist outside tests)
3. **v1.2.0+:** Consider further splitting (e.g., separate provider adapters)

---

## Current Status

✅ Section markers added  
✅ Module boundaries documented  
✅ Refactoring roadmap created  
✅ All 80 tests passing  

**Ready for v1.1.0 refactoring when prioritized.**
