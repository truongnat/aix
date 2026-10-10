# CI/CD — Pipeline optimization

## Dependency caching

```yaml
# Node.js — setup-node has built-in caching
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: npm           # or 'yarn' or 'pnpm'

# Python
- uses: actions/setup-python@v5
  with:
    python-version: 3.12
    cache: pip

# Manual cache for anything else
- uses: actions/cache@v4
  with:
    path: ~/.cache/custom-tool
    key: ${{ runner.os }}-custom-${{ hashFiles('**/lockfile') }}
    restore-keys: |
      ${{ runner.os }}-custom-
```

## Docker layer caching

```yaml
- uses: docker/setup-buildx-action@v3

- uses: docker/build-push-action@v6
  with:
    context: .
    push: true
    tags: myimage:latest
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

## Matrix builds

```yaml
strategy:
  fail-fast: false   # don't cancel other matrix jobs on failure
  matrix:
    os: [ubuntu-latest, macos-latest]
    node: [18, 20, 22]
    exclude:
      - os: macos-latest
        node: 18  # skip specific combinations
```

## Parallelism patterns

```yaml
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps: [...]

  integration-tests:
    runs-on: ubuntu-latest
    steps: [...]

  lint:
    runs-on: ubuntu-latest
    steps: [...]

  # All three run in parallel; deploy waits for all
  deploy:
    needs: [unit-tests, integration-tests, lint]
```

## Concurrency cancellation

```yaml
concurrency:
  # Cancel previous runs on the same PR branch
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}
  # Keep running on main but cancel PR runs
```

## Path filters to skip unrelated jobs

```yaml
on:
  push:
    paths:
      - 'src/**'
      - 'package*.json'
    paths-ignore:
      - 'docs/**'
      - '**.md'
```

## Workflow timing measurement

```yaml
- name: Record start time
  id: start
  run: echo "time=$(date +%s)" >> $GITHUB_OUTPUT

- name: Report duration
  run: |
    duration=$(( $(date +%s) - ${{ steps.start.outputs.time }} ))
    echo "Duration: ${duration}s"
```
