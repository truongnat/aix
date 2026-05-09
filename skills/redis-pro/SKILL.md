---
name: redis-pro
description: Expert Redis development covering data structures, caching strategies, Pub/Sub, Lua scripting, and RediSearch/JSON modules.
metadata:
  short-description: Redis — Data Structures, Caching, Pub/Sub, Lua, RediSearch
  content-language: en
  domain: database
  level: professional
---

# Redis Pro

Expert-level orchestration of Redis as a database, cache, and message broker. Focuses on high-throughput, low-latency data structures and patterns.

## Boundary

**`redis-pro`** covers core data types (Strings, Lists, Sets, Hashes, Sorted Sets), advanced types (HyperLogLog, Bitmaps, Streams), Pub/Sub, Lua scripting, Caching strategies (Write-through, Cache-aside), and Redis Modules (RediSearch, RedisJSON). It does NOT cover general SQL or persistent-first databases (use `postgresql-pro` for that).

## When to use

- Implementing high-speed caching layers to reduce database load.
- Building real-time features like leaderboards (Sorted Sets) or chat (Pub/Sub).
- Designing distributed locks and rate limiters.
- Managing high-throughput event streams with Redis Streams.

## Workflow

1. **Data Structure Selection**: Choose the most efficient Redis type for the use case.
2. **Key Design**: Define a consistent and efficient key naming convention.
3. **Caching Strategy**: Implement expiration (TTL) and eviction policies.
4. **Logic Implementation**: Write Redis commands or Lua scripts for atomic operations.
5. **Testing**: Verify performance and atomicity with `redis-benchmark` and unit tests.
6. **Persistence Check**: Configure RDB/AOF based on durability requirements.

### Operating principles

- **Speed is Paramount**: Always choose the O(1) or O(log N) operation over O(N) where possible.
- **Memory Efficiency**: Redis is in-memory; design keys and values to minimize footprint.
- **Atomicity via Lua**: Use Lua scripts for complex operations that must be atomic.
- **Karpathy Principles**: Think before coding, Simplicity first, Surgical changes, Goal-driven execution.

## Suggested response format (STRICT)

Your response MUST follow this structure:

```xml
<Role>
Senior Redis Architect.
</Role>

<Pattern>
[Redis Pattern Description: Caching, Locking, Stream, etc.]
</Pattern>

<Implementation>
[Redis Commands or Lua Script Artifact]
</Implementation>

<Verification>
[Step-by-step verification plan: redis-cli examples]
</Verification>
```

## Resources in this skill

| Topic | Reference |
|-------|-----------|
| Redis Roadmap | [roadmap.sh/redis](https://roadmap.sh/redis) |
| Redis Documentation | [redis.io/documentation](https://redis.io/documentation) |
| Redis University | [university.redis.com](https://university.redis.com) |
| Redis Patterns | [redis.io/commands#generic](https://redis.io/commands#generic) |

## Quick example

**Pattern:** Atomic rate limiter using Lua.

```lua
local current = redis.call("INCR", KEYS[1])
if current == 1 then
    redis.call("EXPIRE", KEYS[1], ARGV[1])
end
if current > tonumber(ARGV[2]) then
    return 0
end
return 1
```

## Checklist before calling the skill done

- [ ] **Think Before Coding**: Data structure complexity and memory impact analyzed.
- [ ] **Simplicity First**: Built-in commands used over complex Lua scripts where possible.
- [ ] **Surgical Changes**: Only modified relevant keys or structures.
- [ ] **Goal-Driven Execution**: Verified with `redis-cli` and latency checks.
- [ ] Key expiration (TTL) and eviction policies correctly configured.
- [ ] Complex operations are atomic (using Lua or MULTI/EXEC).
- [ ] Memory usage monitored and optimized (e.g., using small hashes).
