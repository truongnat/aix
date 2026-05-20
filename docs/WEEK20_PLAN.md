# Week 20: Maturity & Distribution (Gap #11)

**Date:** 2026-03-07  
**Priority:** 🟡 Medium  
**Status:** In Progress (0% → 100%)

---

## 📋 Overview

**Gap #11:** Maturity & Distribution

**Problem:**
- v1.0.1 nhưng early stage
- Không có binary distribution
- Branding inconsistency (agentic-sdlc vs agentic-sdlc)
- Không có crates.io publication
- Không có installation convenience

**Current Status:**
- ✅ Source code works
- ❌ No binary releases
- ❌ Not on crates.io
- ❌ No Docker image
- ❌ No Homebrew formula

**Goal:** Make project easy to install and use

---

## 🎯 Objectives

### 1. Branding Decision
- [ ] Decide: agentic-sdlc vs agentic-sdlc
- [ ] Update all references
- [ ] Update documentation
- [ ] Update README

### 2. crates.io Publication
- [ ] Prepare package metadata
- [ ] Add categories and keywords
- [ ] Publish to crates.io
- [ ] Verify installation

### 3. Binary Releases
- [ ] GitHub Actions workflow
- [ ] Build for multiple platforms
- [ ] Create release artifacts
- [ ] Automate versioning

### 4. Docker Image
- [ ] Create Dockerfile
- [ ] Multi-stage build
- [ ] Publish to Docker Hub
- [ ] Usage documentation

### 5. Installation Methods
- [ ] Homebrew formula (macOS)
- [ ] Installation script
- [ ] Documentation

---

## 🏗️ Architecture

### Distribution Channels

```
1. crates.io
   - cargo install agentic-sdlc
   
2. GitHub Releases
   - Download binary for your platform
   
3. Docker Hub
   - docker pull agentic-sdlc/agentic-sdlc
   
4. Homebrew (macOS)
   - brew install agentic-sdlc
   
5. Installation Script
   - curl -sSL install.sh | sh
```

---

## 📝 Implementation Plan

### Phase 1: Branding Decision (30 min)

**Decision:** Keep `agentic-sdlc` as primary name

**Rationale:**
- More descriptive
- Better SEO
- Clear purpose
- Professional

**Actions:**
- ✅ Binary name: `agentic-sdlc`
- ✅ Package name: `agentic-sdlc`
- ✅ Repository: `agentic-sdlc`
- ✅ Docker image: `agentic-sdlc/agentic-sdlc`

---

### Phase 2: crates.io Publication (1 hour)

**Files to modify:**
- `Cargo.toml` - Add metadata
- `README.md` - Add badges
- `LICENSE` - Ensure present

**Metadata:**
```toml
[package]
name = "agentic-sdlc"
version = "1.1.0"
edition = "2021"
authors = ["Your Name <email@example.com>"]
description = "Deterministic runtime for AI agent workflows with sandboxing, LLM providers, and observability"
license = "MIT OR Apache-2.0"
repository = "https://github.com/user/agentic-sdlc"
homepage = "https://github.com/user/agentic-sdlc"
documentation = "https://docs.rs/agentic-sdlc"
readme = "README.md"
keywords = ["ai", "agents", "workflow", "llm", "sdlc"]
categories = ["development-tools", "command-line-utilities"]

[package.metadata.docs.rs]
all-features = true
rustdoc-args = ["--cfg", "docsrs"]
```

**Publish:**
```bash
cargo publish --dry-run
cargo publish
```

---

### Phase 3: Binary Releases (2 hours)

**Files to create:**
- `.github/workflows/release.yml`

**Platforms:**
- Linux (x86_64)
- macOS (x86_64, aarch64)
- Windows (x86_64)

**Workflow:**
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            target: x86_64-unknown-linux-gnu
          - os: macos-latest
            target: x86_64-apple-darwin
          - os: macos-latest
            target: aarch64-apple-darwin
          - os: windows-latest
            target: x86_64-pc-windows-msvc
    
    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          target: ${{ matrix.target }}
      - run: cargo build --release --target ${{ matrix.target }}
      - uses: actions/upload-artifact@v3
        with:
          name: agentic-sdlc-${{ matrix.target }}
          path: target/${{ matrix.target }}/release/agentic-sdlc*
```

---

### Phase 4: Docker Image (1 hour)

**Files to create:**
- `Dockerfile`
- `.dockerignore`

**Dockerfile:**
```dockerfile
# Build stage
FROM rust:1.75 as builder

WORKDIR /app
COPY . .

RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/agentic-sdlc /usr/local/bin/

ENTRYPOINT ["agentic-sdlc"]
CMD ["--help"]
```

**Build and Publish:**
```bash
docker build -t agentic-sdlc/agentic-sdlc:latest .
docker push agentic-sdlc/agentic-sdlc:latest
```

---

### Phase 5: Homebrew Formula (1 hour)

**Files to create:**
- `homebrew/agentic-sdlc.rb`

**Formula:**
```ruby
class AgenticSdlc < Formula
  desc "Deterministic runtime for AI agent workflows"
  homepage "https://github.com/user/agentic-sdlc"
  url "https://github.com/user/agentic-sdlc/archive/v1.1.0.tar.gz"
  sha256 "..."
  license "MIT"

  depends_on "rust" => :build

  def install
    system "cargo", "install", *std_cargo_args
  end

  test do
    system "#{bin}/agentic-sdlc", "--version"
  end
end
```

**Publish:**
```bash
# Create tap repository
gh repo create homebrew-agentic-sdlc --public

# Add formula
cp homebrew/agentic-sdlc.rb homebrew-agentic-sdlc/Formula/

# Install
brew tap user/agentic-sdlc
brew install agentic-sdlc
```

---

### Phase 6: Installation Script (30 min)

**Files to create:**
- `install.sh`

**Script:**
```bash
#!/bin/bash
set -e

# Detect platform
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Linux)
    PLATFORM="x86_64-unknown-linux-gnu"
    ;;
  Darwin)
    if [ "$ARCH" = "arm64" ]; then
      PLATFORM="aarch64-apple-darwin"
    else
      PLATFORM="x86_64-apple-darwin"
    fi
    ;;
  *)
    echo "Unsupported OS: $OS"
    exit 1
    ;;
esac

# Download latest release
VERSION="$(curl -s https://api.github.com/repos/user/agentic-sdlc/releases/latest | grep tag_name | cut -d '"' -f 4)"
URL="https://github.com/user/agentic-sdlc/releases/download/$VERSION/agentic-sdlc-$PLATFORM"

echo "Installing agentic-sdlc $VERSION for $PLATFORM..."
curl -L "$URL" -o /usr/local/bin/agentic-sdlc
chmod +x /usr/local/bin/agentic-sdlc

echo "✅ agentic-sdlc installed successfully!"
agentic-sdlc --version
```

---

### Phase 7: Documentation (30 min)

**Files to update:**
- `README.md` - Add installation section
- `docs/INSTALLATION.md` - Detailed guide

**Installation Section:**
```markdown
## Installation

### From crates.io

```bash
cargo install agentic-sdlc
```

### From GitHub Releases

Download the latest binary for your platform:
- [Linux](https://github.com/user/agentic-sdlc/releases/latest)
- [macOS](https://github.com/user/agentic-sdlc/releases/latest)
- [Windows](https://github.com/user/agentic-sdlc/releases/latest)

### Using Docker

```bash
docker pull agentic-sdlc/agentic-sdlc:latest
docker run agentic-sdlc/agentic-sdlc --help
```

### Using Homebrew (macOS)

```bash
brew tap user/agentic-sdlc
brew install agentic-sdlc
```

### Using Installation Script

```bash
curl -sSL https://raw.githubusercontent.com/user/agentic-sdlc/main/install.sh | sh
```
```

---

## 📊 Success Metrics

### Functionality
- [ ] Published to crates.io
- [ ] Binary releases for 4 platforms
- [ ] Docker image published
- [ ] Homebrew formula works
- [ ] Installation script works

### Quality
- [ ] All installation methods tested
- [ ] Documentation complete
- [ ] Version numbers consistent
- [ ] Badges added to README

### Adoption
- [ ] Easy to install (< 5 minutes)
- [ ] Multiple installation options
- [ ] Clear documentation
- [ ] Professional presentation

---

## 🚀 Deliverables

### Code
- GitHub Actions workflow
- Dockerfile
- Homebrew formula
- Installation script

### Documentation
- Installation guide
- Platform-specific instructions
- Docker usage guide
- Troubleshooting

### Releases
- crates.io package
- GitHub releases (4 platforms)
- Docker image
- Homebrew tap

---

## 📅 Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 1. Branding | 0.5h | Decision made |
| 2. crates.io | 1h | Published |
| 3. Binary Releases | 2h | 4 platforms |
| 4. Docker | 1h | Image published |
| 5. Homebrew | 1h | Formula works |
| 6. Install Script | 0.5h | Script works |
| 7. Documentation | 0.5h | Docs complete |
| **Total** | **6.5h** | **Complete Gap #11** |

---

## 🎯 Acceptance Criteria

### Must Have
- ✅ Published to crates.io
- ✅ Binary releases for major platforms
- ✅ Docker image available
- ✅ Installation documentation
- ✅ Version consistency

### Nice to Have
- ⏳ Homebrew formula
- ⏳ Windows installer
- ⏳ Auto-update mechanism
- ⏳ Telemetry for usage stats

---

## 📚 References

- [crates.io Publishing Guide](https://doc.rust-lang.org/cargo/reference/publishing.html)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Homebrew Formula Cookbook](https://docs.brew.sh/Formula-Cookbook)

---

**Version:** 1.0  
**Date:** 2026-03-07  
**Status:** Planning Complete → Ready for Implementation

