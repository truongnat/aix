# Multi-stage build for agentic-sdlc
# Produces a minimal runtime image with the compiled binary

# Build stage
FROM rust:1.75 as builder

WORKDIR /app

# Copy manifests
COPY Cargo.toml Cargo.lock ./

# Copy source code
COPY src ./src
COPY .agents ./.agents

# Build release binary
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy binary from builder
COPY --from=builder /app/target/release/agentic-sdlc /usr/local/bin/

# Create working directory
WORKDIR /workspace

# Set entrypoint
ENTRYPOINT ["agentic-sdlc"]
CMD ["--help"]
