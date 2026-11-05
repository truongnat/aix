# Failure modes — detection and mitigation (WebSocket)

## Contents

1. [Reconnect storms](#reconnect-storms)
2. [Proxy and LB timeouts](#proxy-and-lb-timeouts)
3. [Auth token leakage](#auth-token-leakage)
4. [Ordering and duplicates](#ordering-and-duplicates)

---

## Reconnect storms

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Thundering herd** on server restart | CPU spike, connection errors | Jittered backoff; server readiness gates — **`tips-and-tricks.md`** |

---

## Proxy and LB timeouts

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Idle disconnect** | Silent drops mid-session | App-level heartbeat; tune ingress timeouts — **`integration-map.md`** (`deployment-pro`) |

---

## Auth token leakage

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Token in query string** | Logs, referrer leaks | Short-lived ticket or post-handshake auth — **`decision-tree.md`**, **`security-pro`** |

---

## Ordering and duplicates

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **At-least-once delivery** | Dup events | Idempotent handlers + dedup keys — **`decision-tree.md`**, **`api-design-pro`** |
