# Bun Build Targets

## Single-file executable

Compile TypeScript CLI to a single executable for distribution:

```bash
# Build for Bun runtime (fast, smallest)
bun build src/cli.ts --outfile skill --target bun

# Build for Node.js (slower, broad compatibility)
bun build src/cli.ts --outfile skill --target node

# Add executable permissions
chmod +x skill

# Test locally
./skill --help
```

**Output:**
- `skill` — single 15-30MB file, includes all dependencies
- No runtime required (--target bun) or requires Node.js 18+ (--target node)

## Comparison: bun vs node target

| Aspect | `--target bun` | `--target node` |
|--------|----------------|-----------------|
| **Runtime required** | Yes (Bun ≥1.0) | No (Node.js 18+) |
| **File size** | 20-30MB | 25-35MB |
| **Startup speed** | Fast (~50ms) | Slower (~200ms) |
| **Compatibility** | Linux/macOS/Windows (if Bun available) | Broader (Node.js more installed) |
| **Best for** | Internal tools, team with Bun installed | Public tools, GitHub Releases |

## Publishing via npm

Make the CLI available as a global npm command:

```json
{
  "name": "@your-org/skill",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "skill": "./dist/cli.js"
  },
  "scripts": {
    "build": "bun build src/cli.ts --outfile dist/cli.js --target node",
    "prepublishOnly": "npm run build"
  }
}
```

Install globally:
```bash
npm install -g @your-org/skill
skill --help
```

## Publishing via GitHub Releases

Build for multiple platforms and upload:

```bash
#!/bin/bash
# build-releases.sh

set -e

# macOS (Apple Silicon + Intel)
bun build src/cli.ts --outfile skill-macos-arm64 --target node
bun build src/cli.ts --outfile skill-macos-x64 --target node

# Linux
bun build src/cli.ts --outfile skill-linux-x64 --target node

# Windows
bun build src/cli.ts --outfile skill-windows.exe --target node

# Checksums
shasum -a 256 skill-* > checksums.txt

# Upload to GitHub Release via gh cli
gh release create v1.0.0 skill-* checksums.txt
```

## Cross-compilation with Zig

For true platform-specific binaries (no runtime required):

```bash
# Install Zig
brew install zig  # macOS

# Build for Linux from macOS
bun build src/cli.ts \
  --outfile skill-linux \
  --target node \
  --platform linux \
  --arch x64
```

Note: Cross-compilation is experimental in Bun. For production, use GitHub Actions with matrix OS builds:

```yaml
name: Build Release Binaries
on:
  push:
    tags: ['v*']

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - uses: softprops/action-gh-release@v1
        with:
          files: |
            dist/skill-${{ matrix.os }}*
```

## Development workflow

Use npm link for local testing:

```bash
# In CLI project
bun build src/cli.ts --outfile dist/skill --target node
npm link

# In another project
skill --help  # Works globally

# Unlink when done
npm unlink -g @your-org/skill
```

## Binary size optimization

Minimize final output:

```bash
bun build src/cli.ts \
  --outfile skill \
  --target node \
  --minify-whitespace \
  --minify-syntax \
  --minify-identifiers
```

Typical size after minification: 5-8MB (vs 15-30MB unminified).

## Debugging built binary

Extract source map and inspect:

```bash
# Build with source map
bun build src/cli.ts \
  --outfile skill \
  --target node \
  --sourcemap=external

# Now skill.map contains references to original TypeScript
# Debuggers and stack traces use this for readable context
```

## Platform-specific notes

**macOS:**
- ARM64 (Apple Silicon) binaries don't run on Intel Macs
- Use universal binaries via Zig, or ship separate arm64/x64 builds

**Linux:**
- glibc vs musl: Bun targets glibc by default. For Alpine, use `--target node` without optimization
- Strip debug symbols: `strip skill` (reduces 20MB → 15MB)

**Windows:**
- Executables require .exe extension
- No native Bun runtime; --target node only
- Terminal ANSI colors may not render (use chalk's fallback mode)
