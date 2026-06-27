# Docker — versions

## Engine / BuildKit

- **BuildKit** features (`RUN --mount`) require compatible daemon; document min version.

## Base images

- Pin **digest** for reproducible builds; `latest` only for local dev.

## Compose

- **Compose file format** version vs `docker compose` v2 plugin behavior.

## Platform

- **`--platform`** / buildx for ARM64 vs AMD64 in CI.
