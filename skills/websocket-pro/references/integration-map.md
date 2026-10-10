# WebSocket — integration map

| Skill | Combine when |
|-------|----------------|
| **`security-pro`** | AuthZ per event, rate limits, token leakage, CSRF on cookie auth upgrades. |
| **`performance-tuning-pro`** | Kernel tuning, GC pauses, event loop lag under fan-out. |
| **`stream-rtc-pro`** | WebRTC signaling often rides WebSocket — separate media from signaling concerns. |
| **`nestjs-pro` / `nextjs-pro`** | Framework gateway adapters, middleware order. |
| **`deployment-pro`** | Ingress idle timeouts, TLS termination, sticky sessions. |
| **`network-infra-pro`** | L4/L7 idle timeouts, TCP keepalive vs app heartbeat, path to upgrade. |
| **`api-design-pro`** | Idempotent command handlers, dedup keys for at-least-once delivery. |

**Boundary:** `websocket-pro` owns connection semantics; infra specifics split per deployment skill.
