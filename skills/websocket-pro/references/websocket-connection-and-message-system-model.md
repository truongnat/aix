# WebSocket — connection and message lifecycle model

## Contents

1. [Lifecycle](#lifecycle)
2. [Frames vs application messages](#frames-vs-application-messages)
3. [Backpressure and buffering](#backpressure-and-buffering)
4. [Scaling mental model](#scaling-mental-model)

Pair with **`tips-and-tricks.md`** and **`versions.md`** (library framing).

---

## Lifecycle

```
TCP connect → HTTP upgrade (101) → open → message exchange → close (code/reason)
```

**Close codes** and **ping/pong** semantics matter for proxies — **`edge-cases.md`**, **`failure-modes-detection-mitigation.md`**.

---

## Frames vs application messages

Libraries may **coalesce** or **split** frames — application handlers should not assume 1:1 message boundaries — **`edge-cases.md`**.

---

## Backpressure and buffering

Unbounded outbound queues → **memory** growth under slow clients — apply caps, drop policy, or flow control — **`failure-modes-detection-mitigation.md`**.

---

## Scaling mental model

Single process fan-out vs **pub/sub** cluster — **`decision-tree.md`** and **`integration-map.md`**.
