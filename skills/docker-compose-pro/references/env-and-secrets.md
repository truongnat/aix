# Environment & Secrets

## .env file

Docker Compose automatically reads a `.env` file in the same directory as `docker-compose.yml`. Variables defined there are available for interpolation in the compose file itself.

```bash
# .env — loaded automatically by docker compose
COMPOSE_PROJECT_NAME=personal-ai
API_PORT=3456
NEO4J_USER=neo4j
NEO4J_PASSWORD=changeme_in_production
MEILI_MASTER_KEY=masterkey_change_this
REDIS_PASSWORD=
NODE_ENV=development
```

```yaml
# docker-compose.yml — interpolation with ${VAR}
services:
  api:
    ports:
      - "${API_PORT:-3456}:3000"    # Default if not set: 3456
    environment:
      - NODE_ENV=${NODE_ENV}

  neo4j:
    environment:
      - NEO4J_AUTH=${NEO4J_USER}/${NEO4J_PASSWORD}
```

Important: The `.env` file provides values for `${VAR}` interpolation in the compose file. It does NOT automatically pass variables into containers. For that, use `environment:` or `env_file:`.

## env_file directive

Pass an entire file of variables into a container's environment:

```yaml
services:
  api:
    env_file:
      - .env                    # Base variables
      - .env.local              # Local overrides (gitignored)
    # Later files override earlier ones for duplicate keys

  neo4j:
    env_file:
      - .env.neo4j             # Service-specific env

  meilisearch:
    env_file:
      - .env.meili
```

### env_file vs environment

```yaml
services:
  api:
    # env_file: load from file (keeps compose file clean)
    env_file: .env

    # environment: explicit values (visible in compose file)
    environment:
      - NODE_ENV=production
      - API_PORT=3000
      # Reference .env interpolation
      - DATABASE_URL=bolt://neo4j:7687

    # Both can coexist — environment overrides env_file for same key
```

Use `env_file` when:
- Many variables (10+)
- Variables contain secrets
- Different envs need different files (.env.dev, .env.prod)

Use `environment` when:
- Few variables (< 5)
- Values are derived from other compose services
- Values are not secret

## Variable interpolation

### Syntax

```yaml
services:
  api:
    image: myapp/api:${VERSION:-latest}     # Default value if unset
    ports:
      - "${API_PORT:?API_PORT must be set}:3000"  # Error if unset
      - "${DEBUG_PORT:-9229}:9229"

    environment:
      - DB_HOST=${DB_HOST:-neo4j}           # Default to service name
      - LOG_LEVEL=${LOG_LEVEL:-info}
```

| Syntax | Behavior |
|--------|----------|
| `${VAR}` | Value of VAR, empty string if unset |
| `${VAR:-default}` | Value of VAR, or "default" if unset/empty |
| `${VAR-default}` | Value of VAR, or "default" if unset (empty is valid) |
| `${VAR:?error msg}` | Value of VAR, or exit with error if unset/empty |
| `${VAR?error msg}` | Value of VAR, or exit with error if unset |

### Variable precedence (highest to lowest)

1. Shell environment variables (exported before running compose)
2. `.env` file in project directory
3. `env_file` values
4. Default values in interpolation (`${VAR:-default}`)

```bash
# Shell export overrides .env file
export API_PORT=9999
docker compose up    # Uses 9999, not .env value
```

## Docker secrets

For production deployments, Docker secrets provide a more secure way to handle sensitive data:

### Compose file secrets (file-based)

```yaml
services:
  api:
    secrets:
      - neo4j_password
      - meili_master_key
    environment:
      - NEO4J_PASSWORD_FILE=/run/secrets/neo4j_password
      - MEILI_MASTER_KEY_FILE=/run/secrets/meili_master_key

secrets:
  neo4j_password:
    file: ./secrets/neo4j_password.txt    # Contains just the password
  meili_master_key:
    file: ./secrets/meili_master_key.txt
```

The secret file is mounted at `/run/secrets/<secret_name>` inside the container. Your application needs to read from the file path (many official images support `_FILE` suffix convention).

### Environment-based secrets (simpler)

```yaml
secrets:
  neo4j_password:
    environment: NEO4J_PASSWORD    # Read from host environment
```

## .env.example pattern

Always provide a template showing required variables without actual secret values:

```bash
# .env.example — commit this to git
# Copy to .env and fill in values: cp .env.example .env

# Project
COMPOSE_PROJECT_NAME=personal-ai
NODE_ENV=development

# API
API_PORT=3456
API_SECRET=generate_with_openssl_rand_hex_32

# Neo4j
NEO4J_USER=neo4j
NEO4J_PASSWORD=generate_a_strong_password
NEO4J_URI=bolt://neo4j:7687

# Meilisearch
MEILI_MASTER_KEY=generate_with_openssl_rand_hex_16
MEILI_URL=http://meilisearch:7700

# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=

# GitHub (for private repo access)
GITHUB_TOKEN=ghp_your_token_here
```

## Gitignoring .env

```gitignore
# .gitignore
.env
.env.local
.env.*.local
secrets/

# DO commit the example
!.env.example
```

## Generating random secrets

```bash
# Generate a 32-byte hex string (64 characters)
openssl rand -hex 32

# Generate a base64-encoded secret (44 characters)
openssl rand -base64 32

# Generate a URL-safe random string
openssl rand -base64 32 | tr '+/' '-_' | tr -d '='

# Quick setup script for initial .env
#!/bin/bash
cat > .env << EOF
COMPOSE_PROJECT_NAME=personal-ai
NODE_ENV=production
API_PORT=3456
API_SECRET=$(openssl rand -hex 32)
NEO4J_USER=neo4j
NEO4J_PASSWORD=$(openssl rand -hex 16)
MEILI_MASTER_KEY=$(openssl rand -hex 16)
EOF
echo ".env generated with random secrets"
```

## Per-environment configuration

### File structure

```
.
├── .env                          # Current environment (gitignored)
├── .env.example                  # Template (committed)
├── .env.development              # Dev defaults (can commit if no secrets)
├── .env.production               # Prod template (no real secrets)
├── docker-compose.yml            # Base configuration
├── docker-compose.dev.yml        # Dev overrides
└── docker-compose.prod.yml       # Prod overrides
```

### Selecting environment

```bash
# Development (default)
docker compose --env-file .env.development up -d

# Production
docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.prod.yml up -d

# Or use COMPOSE_ENV_FILE
export COMPOSE_ENV_FILE=.env.production
docker compose up -d
```

## Variable validation

Add a validation service that checks all required variables are set:

```yaml
services:
  validate-env:
    image: alpine
    profiles: ["setup"]
    env_file: .env
    command: >
      sh -c "
        missing=0;
        for var in NEO4J_PASSWORD MEILI_MASTER_KEY API_SECRET; do
          eval val=\$$var;
          if [ -z \"$$val\" ]; then
            echo \"ERROR: $$var is not set\";
            missing=1;
          fi;
        done;
        if [ $$missing -eq 1 ]; then exit 1; fi;
        echo 'All required variables are set';
      "
```

```bash
docker compose --profile setup run --rm validate-env
```

## Common mistakes

1. **Committing .env to git** — Use `.gitignore` and `.env.example`
2. **Using quotes in .env** — Docker .env files don't need quotes; `VAR="value"` includes the quotes literally in some versions
3. **Interpolation in env_file** — Variables in `env_file` are NOT interpolated; they're passed as literal strings
4. **Confusing compose interpolation with container env** — `${VAR}` in compose file reads from .env/shell; variables in `environment:` section go into the container
