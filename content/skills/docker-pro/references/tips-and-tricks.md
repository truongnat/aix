# Docker — Tips and tricks

## Debugging containers

```bash
# Run shell in running container
docker exec -it <container> sh

# Run shell in stopped image (no CMD override)
docker run --rm -it --entrypoint sh <image>

# Inspect layers
docker image history --no-trunc <image>

# Copy file out of container
docker cp <container>:/app/logs/error.log ./error.log
```

## Useful build flags

```bash
# Verbose output (all layer output)
docker build --progress=plain .

# No cache (force full rebuild)
docker build --no-cache .

# Target a specific stage
docker build --target builder .

# Pass build secret
docker build --secret id=token,env=MY_TOKEN .
```

## Container resource limits

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
        reservations:
          memory: 256M
```

## Tini / dumb-init for signal handling

```dockerfile
# Alpine
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]

# Or use --init flag at runtime
docker run --init myapp
```

## Prune and cleanup

```bash
# Remove all stopped containers, dangling images, unused networks
docker system prune -f

# Remove all unused images (not just dangling)
docker system prune -af

# Remove unused volumes
docker volume prune -f
```

## Registry operations

```bash
# Tag for registry
docker tag myapp:latest registry.example.com/myapp:1.2.3

# Login and push
echo $TOKEN | docker login registry.example.com -u user --password-stdin
docker push registry.example.com/myapp:1.2.3

# Multi-arch push
docker buildx build --platform linux/amd64,linux/arm64 \
  -t registry.example.com/myapp:latest --push .
```
