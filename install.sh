#!/bin/bash
# Installation script for agentic-sdlc
# Usage: curl -sSL https://raw.githubusercontent.com/user/agentic-sdlc/main/install.sh | sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect platform
OS="$(uname -s)"
ARCH="$(uname -m)"

echo "🚀 Installing agentic-sdlc..."
echo ""

# Determine platform
case "$OS" in
  Linux)
    if [ "$ARCH" = "x86_64" ]; then
      PLATFORM="x86_64-unknown-linux-gnu"
    else
      echo -e "${RED}❌ Unsupported architecture: $ARCH${NC}"
      echo "Supported: x86_64"
      exit 1
    fi
    ;;
  Darwin)
    if [ "$ARCH" = "arm64" ]; then
      PLATFORM="aarch64-apple-darwin"
    elif [ "$ARCH" = "x86_64" ]; then
      PLATFORM="x86_64-apple-darwin"
    else
      echo -e "${RED}❌ Unsupported architecture: $ARCH${NC}"
      exit 1
    fi
    ;;
  *)
    echo -e "${RED}❌ Unsupported OS: $OS${NC}"
    echo "Supported: Linux, macOS"
    exit 1
    ;;
esac

echo "📦 Platform: $PLATFORM"

# Get latest version
echo "🔍 Fetching latest version..."
VERSION="$(curl -s https://api.github.com/repos/user/agentic-sdlc/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')"

if [ -z "$VERSION" ]; then
  echo -e "${RED}❌ Failed to fetch latest version${NC}"
  exit 1
fi

echo "📥 Downloading agentic-sdlc $VERSION..."

# Download URL
URL="https://github.com/user/agentic-sdlc/releases/download/$VERSION/agentic-sdlc-$PLATFORM"

# Determine install location
if [ -w "/usr/local/bin" ]; then
  INSTALL_DIR="/usr/local/bin"
else
  INSTALL_DIR="$HOME/.local/bin"
  mkdir -p "$INSTALL_DIR"
  
  # Add to PATH if not already there
  if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo -e "${YELLOW}⚠️  Adding $INSTALL_DIR to PATH${NC}"
    echo "export PATH=\"\$PATH:$INSTALL_DIR\"" >> "$HOME/.bashrc"
    echo "export PATH=\"\$PATH:$INSTALL_DIR\"" >> "$HOME/.zshrc" 2>/dev/null || true
  fi
fi

# Download binary
TEMP_FILE=$(mktemp)
if curl -L "$URL" -o "$TEMP_FILE" 2>/dev/null; then
  chmod +x "$TEMP_FILE"
  mv "$TEMP_FILE" "$INSTALL_DIR/agentic-sdlc"
  echo -e "${GREEN}✅ agentic-sdlc installed successfully!${NC}"
  echo ""
  echo "📍 Installed to: $INSTALL_DIR/agentic-sdlc"
  echo ""
  
  # Verify installation
  if command -v agentic-sdlc >/dev/null 2>&1; then
    echo "🎉 Installation verified:"
    agentic-sdlc --version
  else
    echo -e "${YELLOW}⚠️  Please restart your shell or run:${NC}"
    echo "   export PATH=\"\$PATH:$INSTALL_DIR\""
  fi
  
  echo ""
  echo "📚 Get started:"
  echo "   agentic-sdlc --help"
else
  echo -e "${RED}❌ Failed to download binary${NC}"
  echo "URL: $URL"
  rm -f "$TEMP_FILE"
  exit 1
fi
