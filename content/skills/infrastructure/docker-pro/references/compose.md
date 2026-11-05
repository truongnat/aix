# Docker — Compose patterns

## Production-ready compose template

```yaml
# docker-compose.yml
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: runtime
    image: myapp/api:latest
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: "3000"
    env_file:
      - .env.production
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
    networks:
      - internal

  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d appdb"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - internal

volumes:
  pg_data:

secrets:
  db_password:
    file: ./secrets/db_password.txt

networks:
  internal:
    driver: bridge
```

## Dev override pattern

```yaml
# docker-compose.override.yml (auto-loaded in dev)
services:
  api:
    build:
      target: builder   # use builder stage with dev deps
    volumes:
      - ./src:/app/src  # live reload via bind mount
    environment:
      NODE_ENV: development
    command: npm run dev
```

## Profiles for optional services

```yaml
services:
  adminer:
    image: adminer
    profiles: ["dev-tools"]
    ports:
      - "8080:8080"
```

```bash
docker compose --profile dev-tools up
```

## Health check conditions

```yaml
depends_on:
  redis:
    condition: service_healthy
  db:
    condition: service_healthy
  migrations:
    condition: service_completed_successfully
```
