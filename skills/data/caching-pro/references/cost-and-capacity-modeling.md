# Cost and capacity modeling

Decide whether cache **earns its keep**: RAM, CPU, network, ops time.

## Dimensions

- **Memory** — Key cardinality × average payload × replication factor.
- **Network** — Cross-AZ Redis chatter; serialization size (JSON vs compact binary).
- **CPU** — Compression, serialization on hot path.
- **Eviction trade-off** — Larger cache = fewer misses but higher cost; **hit ratio vs $**.

## Compare to fixing origin

- **Index / query optimization** may reduce need for cache — **`postgresql-pro`**, **`sql-data-access-pro`**.
- **Read replica** vs **cache** — different cost curves; replicas help scale reads but add replication lag consistency concerns.

## Capacity planning

- Peak RPS × payload × hit ratio → bandwidth.
- Growth of **key space** — unbounded IDs → memory cliff — **`anti-patterns.md`**.

## Output

Rough **order-of-magnitude** table for RFCs: “cache adds ~X GB RAM, saves ~Y% DB CPU.”
