# Docker — Image optimization

## Layer caching rules

1. Instructions are cached until a file/arg changes — order matters.
2. `COPY` invalidates cache for all subsequent layers when any copied file changes.
3. Split dependency install from source copy:

```dockerfile
# Cache-friendly order
COPY package*.json ./      # rarely changes
RUN npm ci                 # cached until package*.json changes
COPY src/ ./src/           # changes often — cache broken here only
RUN npm run build
```

## Choosing a base image

| Base | Size | Use case |
|------|------|---------|
| `ubuntu:24.04` | ~80 MB | Max compatibility, not recommended for prod |
| `node:20-slim` | ~80 MB | Node with fewer packages |
| `node:20-alpine` | ~40 MB | Node on musl libc — watch for native modules |
| `gcr.io/distroless/nodejs20` | ~35 MB | No shell, minimal attack surface |
| `scratch` | 0 MB | Static binaries (Go, Rust) only |

## apt/apk optimization

```dockerfile
# apt-get: no recommends, clean cache in same layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# apk: no cache
RUN apk add --no-cache curl ca-certificates
```

## npm/yarn install optimization

```dockerfile
# npm ci: reproducible, uses lockfile
RUN npm ci --omit=dev

# BuildKit cache mount (doesn't add to image)
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
```

## Analyzing image size

```bash
docker image ls <image>
docker image history <image>
docker run --rm -it wagoodman/dive <image>  # interactive layer viewer
```

## Multi-platform builds

```bash
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 \
  -t myimage:latest --push .
```
