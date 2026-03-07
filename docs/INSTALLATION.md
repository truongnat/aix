# Installation Guide

**Date:** 2026-03-07  
**Version:** 1.1.0

---

## 📦 Installation Methods

Choose the installation method that works best for you:

1. [From crates.io](#from-cratesio) - Recommended for Rust developers
2. [From GitHub Releases](#from-github-releases) - Pre-built binaries
3. [Using Docker](#using-docker) - Containerized environment
4. [Using Homebrew](#using-homebrew-macos) - macOS package manager
5. [Using Installation Script](#using-installation-script) - One-line install
6. [From Source](#from-source) - Build yourself

---

## From crates.io

**Requirements:**
- Rust 1.70 or later
- Cargo

**Install:**

```bash
cargo install agentic-sdlc
```

**Verify:**

```bash
agentic-sdlc --version
```

**Update:**

```bash
cargo install agentic-sdlc --force
```

**Uninstall:**

```bash
cargo uninstall agentic-sdlc
```

---

## From GitHub Releases

**Download the latest binary for your platform:**

### Linux (x86_64)

```bash
curl -L https://github.com/user/agentic-sdlc/releases/latest/download/agentic-sdlc-linux-x86_64 -o agentic-sdlc
chmod +x agentic-sdlc
sudo mv agentic-sdlc /usr/local/bin/
```

### macOS (Intel)

```bash
curl -L https://github.com/user/agentic-sdlc/releases/latest/download/agentic-sdlc-macos-x86_64 -o agentic-sdlc
chmod +x agentic-sdlc
sudo mv agentic-sdlc /usr/local/bin/
```

### macOS (Apple Silicon)

```bash
curl -L https://github.com/user/agentic-sdlc/releases/latest/download/agentic-sdlc-macos-aarch64 -o agentic-sdlc
chmod +x agentic-sdlc
sudo mv agentic-sdlc /usr/local/bin/
```

### Windows (x86_64)

Download from: https://github.com/user/agentic-sdlc/releases/latest/download/agentic-sdlc-windows-x86_64.exe

Add to PATH or move to a directory in your PATH.

---

## Using Docker

**Pull the image:**

```bash
docker pull agentic-sdlc/agentic-sdlc:latest
```

**Run:**

```bash
# Show help
docker run agentic-sdlc/agentic-sdlc --help

# Execute workflow
docker run -v $(pwd):/workspace agentic-sdlc/agentic-sdlc execute workflow.md

# Interactive shell
docker run -it -v $(pwd):/workspace agentic-sdlc/agentic-sdlc sh
```

**Docker Compose:**

```yaml
version: '3.8'

services:
  agentic-sdlc:
    image: agentic-sdlc/agentic-sdlc:latest
    volumes:
      - .:/workspace
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    command: execute workflow.md
```

---

## Using Homebrew (macOS)

**Add tap:**

```bash
brew tap user/agentic-sdlc
```

**Install:**

```bash
brew install agentic-sdlc
```

**Update:**

```bash
brew upgrade agentic-sdlc
```

**Uninstall:**

```bash
brew uninstall agentic-sdlc
```

---

## Using Installation Script

**One-line install:**

```bash
curl -sSL https://raw.githubusercontent.com/user/agentic-sdlc/main/install.sh | sh
```

**What it does:**
1. Detects your platform (Linux/macOS, x86_64/aarch64)
2. Downloads the latest binary
3. Installs to `/usr/local/bin` or `~/.local/bin`
4. Adds to PATH if needed

**Verify:**

```bash
agentic-sdlc --version
```

---

## From Source

**Requirements:**
- Rust 1.70 or later
- Git

**Clone and build:**

```bash
# Clone repository
git clone https://github.com/user/agentic-sdlc.git
cd agentic-sdlc

# Build release binary
cargo build --release

# Install
cargo install --path .
```

**Or build and run directly:**

```bash
cargo run -- --help
```

---

## Platform-Specific Notes

### Linux

**Dependencies:**

```bash
# Debian/Ubuntu
sudo apt-get install -y ca-certificates git

# Fedora/RHEL
sudo dnf install -y ca-certificates git

# Arch
sudo pacman -S ca-certificates git
```

### macOS

**Xcode Command Line Tools:**

```bash
xcode-select --install
```

### Windows

**Visual Studio Build Tools:**

Download and install from: https://visualstudio.microsoft.com/downloads/

Select "Desktop development with C++"

---

## Verification

After installation, verify it works:

```bash
# Check version
agentic-sdlc --version

# Show help
agentic-sdlc --help

# Run example workflow
agentic-sdlc execute examples/hello_world.md
```

---

## Configuration

### Environment Variables

```bash
# LLM Provider API Keys
export OPENAI_API_KEY="your-key"
export ANTHROPIC_API_KEY="your-key"
export GOOGLE_API_KEY="your-key"

# AWS Credentials (for Bedrock)
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
export AWS_REGION="us-east-1"

# Azure OpenAI
export AZURE_OPENAI_API_KEY="your-key"
export AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com"

# Telemetry (optional)
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4317"
export OTEL_SERVICE_NAME="agentic-sdlc"
```

### Configuration Files

Create `.agents/` directory in your project:

```bash
mkdir -p .agents/{skills,roles,rules,memory}
```

---

## Troubleshooting

### Command not found

**Solution:**

```bash
# Check if binary is in PATH
which agentic-sdlc

# If not, add to PATH
export PATH="$PATH:/usr/local/bin"

# Or for user install
export PATH="$PATH:$HOME/.local/bin"
```

### Permission denied

**Solution:**

```bash
# Make binary executable
chmod +x /path/to/agentic-sdlc

# Or install with sudo
sudo mv agentic-sdlc /usr/local/bin/
```

### SSL certificate errors

**Solution:**

```bash
# Update CA certificates
# Debian/Ubuntu
sudo apt-get update && sudo apt-get install -y ca-certificates

# macOS
brew install ca-certificates
```

### Docker permission denied

**Solution:**

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again
```

---

## Updating

### crates.io

```bash
cargo install agentic-sdlc --force
```

### GitHub Releases

Download and replace the binary:

```bash
curl -L https://github.com/user/agentic-sdlc/releases/latest/download/agentic-sdlc-linux-x86_64 -o agentic-sdlc
chmod +x agentic-sdlc
sudo mv agentic-sdlc /usr/local/bin/
```

### Docker

```bash
docker pull agentic-sdlc/agentic-sdlc:latest
```

### Homebrew

```bash
brew upgrade agentic-sdlc
```

---

## Uninstalling

### crates.io

```bash
cargo uninstall agentic-sdlc
```

### Manual install

```bash
sudo rm /usr/local/bin/agentic-sdlc
# or
rm ~/.local/bin/agentic-sdlc
```

### Docker

```bash
docker rmi agentic-sdlc/agentic-sdlc
```

### Homebrew

```bash
brew uninstall agentic-sdlc
brew untap user/agentic-sdlc
```

---

## Next Steps

After installation:

1. **Read the documentation:**
   - [Getting Started](../README.md#getting-started)
   - [Workflow Guide](WORKFLOWS.md)
   - [Skills Guide](SKILLS.md)

2. **Try examples:**
   ```bash
   cd examples
   agentic-sdlc execute hello_world.md
   ```

3. **Create your first workflow:**
   ```bash
   agentic-sdlc init my-workflow
   ```

4. **Join the community:**
   - GitHub Discussions
   - Discord Server
   - Twitter

---

## Support

Need help?

- 📚 [Documentation](../README.md)
- 💬 [GitHub Discussions](https://github.com/user/agentic-sdlc/discussions)
- 🐛 [Report Issues](https://github.com/user/agentic-sdlc/issues)
- 📧 [Email Support](mailto:support@example.com)

---

**Version:** 1.1.0  
**Date:** 2026-03-07  
**Status:** Complete ✅

