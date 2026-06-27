---
name: go-pro
description: >-
  Expert Go (Golang) development covering concurrency, interface-driven design,
  testing, and cloud-native application patterns.
x-kind: domain
x-version: 0.1.0
x-roles: []
x-tags: []
x-compatible:
  - claude
  - cursor
  - codex
  - gemini
---

# Go Pro

Expert-level orchestration of high-performance Go applications. Focuses on simplicity, concurrency, and cloud-native reliability.

## Boundary

**`go-pro`** covers core Go language features (Goroutines, Channels, Interfaces, Generics), project structure (Standard Layout), testing, and performance profiling. It does NOT cover specific framework-heavy logic (use `echo-pro` or `gin-pro` if they exist).

## When to use

- Building high-performance microservices or infrastructure tools.
- Implementing complex concurrent logic using goroutines and channels.
- Refactoring Go code for better testability through interfaces.
- Optimizing CPU/Memory usage through profiling (`pprof`).

## Workflow

1. **Project Init**: Initialize with `go mod init`.
2. **Domain Modeling**: Define types and interfaces.
3. **Implementation**: Build logic using composition and interfaces.
4. **Concurrency**: Orchestrate tasks with goroutines and `sync`/`context` packages.
5. **Testing**: Write table-driven tests.
6. **Linting**: Enforce standards with `golangci-lint`.

### Operating principles

- **Simplicity over Complexity**: Prefer clear, readable code over clever abstractions.
- **Explicit Error Handling**: Treat errors as values; don't hide them.
- **Composition over Inheritance**: Use interfaces to define behavior.
- **Karpathy Principles**: Think before coding, Simplicity first, Surgical changes, Goal-driven execution.

## Suggested response format (STRICT)

Your response MUST follow this structure:

```xml
<Role>
Senior Go Engineer.
</Role>

<Feature>
[Go Component/Service Description]
</Feature>

<Implementation>
[Idiomatic, performant Go code Artifact]
</Implementation>

<Verification>
[Step-by-step verification plan with Table-driven tests]
</Verification>
```

## Resources in this skill

| Topic | Reference |
|-------|-----------|
| Go Roadmap | [roadmap.sh/go](https://roadmap.sh/go) |
| Effective Go | [go.dev/doc/effective_go](https://go.dev/doc/effective_go) |
| Go Project Layout | [github.com/golang-standards/project-layout](https://github.com/golang-standards/project-layout) |
| Go Concurrency | [go.dev/doc/articles/race_detector](https://go.dev/doc/articles/race_detector) |

## Quick example

**Feature:** Concurrent worker pool with context support.

```go
package main

import (
    "context"
    "fmt"
    "sync"
)

func worker(ctx context.Context, id int, wg *sync.WaitGroup) {
    defer wg.Done()
    select {
    case <-ctx.Done():
        return
    default:
        fmt.Printf("Worker %d working\n", id)
    }
}

func main() {
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()
    var wg sync.WaitGroup
    for i := 1; i <= 3; i++ {
        wg.Add(1)
        go worker(ctx, i, &wg)
    }
    wg.Wait()
}
```

## Checklist before calling the skill done

- [ ] **Think Before Coding**: Concurrency model and interface boundaries planned.
- [ ] **Simplicity First**: Idiomatic Go used; avoided unnecessary generics or complexity.
- [ ] **Surgical Changes**: Modified only necessary packages.
- [ ] **Goal-Driven Execution**: Verified with `go test` and `go vet`.
- [ ] Error handling is explicit and comprehensive.
- [ ] Context package used for cancellation and timeouts.
- [ ] Race conditions checked using `go test -race`.
