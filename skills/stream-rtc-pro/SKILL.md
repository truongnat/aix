---
name: stream-rtc-pro
description: |
  Production-grade realtime streaming and RTC: WebRTC architecture, signaling vs media planes, ICE/TURN/STUN, SFU/MCU topology, adaptive bitrate, simulcast/SVC, session lifecycle and reconnect — plus system model (two-plane design, ICE path, SFU adaptation loop), failure modes (ICE stuck, SDP glare, TURN exhaustion, jitter freezes, weak join auth), decision trade-offs (mesh vs SFU vs MCU, WebRTC vs broadcast fallback, simulcast vs SVC, UDP vs TCP TURN), and quality guardrails (standards-accurate SDP, privacy/recording, test matrix).

  Use this skill when building or reviewing WebRTC/RTC streaming, call/session lifecycle, media transport, scaling SFUs, or production QoS under loss and jitter.

  Combine with **`websocket-pro`** for signaling channels, **`performance-tuning-pro`** for latency and resource profiling, **`security-pro`** for tokens and recording consent, **`deployment-pro`** and **`network-infra-pro`** for TURN/SFU ops, **`nestjs-pro`** / **`nextjs-pro`** for signaling backends, and **`react-native-pro`** for mobile media lifecycle.

  Triggers: "webrtc", "rtc", "streaming", "rtp", "sfu", "mcu", "turn", "stun", "signaling", "jitter", "packet loss", "media edge case", "simulcast", "SVC", "Opus", "ICE restart", "getUserMedia".

metadata:
  short-description: Stream/RTC — signaling/media model, QoS, TURN/SFU, failure modes, guardrails
  content-language: en
  domain: realtime-media
  level: professional
---

# Stream and RTC (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use [WebRTC](https://w3c.github.io/webrtc-pc/), RTP/RTCP RFCs, and [MDN WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API) for standards truth; this skill encodes **production-grade realtime defaults**, **network-aware session design**, and **operational safety** — not vendor-SFU marketing. Confirm **topology** (P2P/SFU/MCU), **latency targets**, **NAT/firewall profile**, and **browser/device matrix**.

## Boundary

**`stream-rtc-pro`** owns **realtime media architecture**, **session/ICE semantics**, **QoS adaptation**, and **RTC-specific failure analysis**. **`websocket-pro`** owns **generic WebSocket** reliability patterns when signaling is transport-focused. **`performance-tuning-pro`** owns **broad profiling** when non-RTC dominates. **`api-design-pro`** leads when the work is **REST API design** without RTC session semantics.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`websocket-pro`** | Signaling transport, reconnect, backpressure |
| **`performance-tuning-pro`** | Profiling, tail latency, resource saturation |
| **`security-pro`** | AuthZ on join, DTLS/SRTP assumptions, recording consent |
| **`deployment-pro`** | TURN/SFU rollout, geo, autoscale |
| **`network-infra-pro`** | Firewalls, UDP/TCP paths, path MTU |
| **`nestjs-pro`** / **`nextjs-pro`** | Signaling/control servers |
| **`react-native-pro`** | Mobile RTC lifecycle |
| **`api-design-pro`** | Control APIs without RTC depth |

## When to use

- Realtime A/V architecture: rooms, calls, interactive streaming.
- Signaling flow, ICE negotiation, reconnect, renegotiation.
- QoS under loss/jitter/bandwidth collapse; simulcast/SVC policy.
- Scaling SFU systems and TURN strategy.

## When not to use

- **Only** generic WebSocket chat without WebRTC — **`websocket-pro`** may suffice.
- **VOD-only** CDN playback without RTC session — **`deployment-pro`** / **`caching-pro`**.
- **Deep codec implementation** inside encoders — vendor/hardware docs lead.

## Required inputs

- **Topology** and participant scale targets.
- **Latency** and quality SLO (or informal targets).
- **Client matrix** (browsers, mobile) and **network** assumptions (corp users?, mobile only?).

## Expected output

Follow **Suggested response format** strictly — system model through residual risks.

## Workflow

1. Confirm topology, NAT profile, codec policy, device matrix, and SLOs.
2. Apply summaries; open `references/`; use **`rtc-signaling-and-media-plane-system-model.md`** when separating signaling vs media failures.
3. Respond with **Suggested response format**; include **failure modes** for ICE, TURN, and security.

### Operating principles

1. **Signaling ≠ media** — Explicit state machine; recoverable transitions — **`rtc-signaling-and-media-plane-system-model.md`**.
2. **Hostile networks** — NAT, loss, jitter, collapse — **`edge-cases.md`**.
3. **Continuous adaptation** — Bitrate/resolution/layers — **`tips-and-tricks.md`**.
4. **Lifecycle rigor** — Join/reconnect/end deterministic — **`failure-modes-detection-mitigation.md`**.
5. **Security and privacy** — Auth signaling; consent for recording — **`security-pro`**.

### Stream/RTC tips and tricks (summary)

State machine, SFU default, simulcast/SVC, QoE metrics — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### RTC signaling and media plane — system model (summary)

Two planes, ICE/TURN, SFU adaptation loop — **`rtc-signaling-and-media-plane-system-model.md`**.

Details: [references/rtc-signaling-and-media-plane-system-model.md](references/rtc-signaling-and-media-plane-system-model.md)

### Stream/RTC edge cases (summary)

ICE races, TURN stress, mobile lifecycle, abuse — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision framework (summary)

Mesh/SFU/MCU, WebRTC vs broadcast, simulcast vs SVC, UDP vs TCP TURN — **`decision-framework-and-trade-offs.md`** + **`decision-tree.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Decision tree (summary)

Topology, signaling transport, TURN, codecs, broadcast fallback — **`decision-tree.md`**.

Details: [references/decision-tree.md](references/decision-tree.md)

### Anti-patterns (summary)

One-sided signaling state, no ICE restart, SDP in logs — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`websocket-pro`**, **`performance-tuning-pro`**, **`security-pro`**, **`deployment-pro`**, **`network-infra-pro`** — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions (summary)

Browser APIs, SFU pins, codec matrix — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Topology, scale, SLO, client matrix, NAT/firewall assumptions.
2. **Problem / goal** — Join failures, QoE, cost, security, or scale.
3. **System design** — Signaling vs media plane; ICE path — **`rtc-signaling-and-media-plane-system-model.md`**.
4. **Decision reasoning** — SFU vs mesh; TURN policy; codec ladder — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — State machine, ICE restart, adaptation policy — **`quality-validation-and-guardrails.md`** (no invented SDP).
6. **Trade-offs** — Latency vs cost; TCP TURN vs UDP; simulcast complexity.
7. **Failure modes** — Stuck ICE, glare, TURN overload, weak join auth — **`failure-modes-detection-mitigation.md`**.
8. **Residual risks** — Multi-device matrix; hand off to **`network-infra-pro`**, **`deployment-pro`**, **`security-pro`** as needed.

## Resources in this skill

| Topic | File |
|-------|------|
| **RTC signaling & media plane model** | [references/rtc-signaling-and-media-plane-system-model.md](references/rtc-signaling-and-media-plane-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Practical stream/RTC patterns | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions | [references/versions.md](references/versions.md) |

## Quick example

### 1 — Simple (common)

**Input:** Scalable WebRTC for 50k concurrent viewers with interactive audio.  
**Expected output:** Full **Suggested response format** — SFU + broadcast split if needed, TURN, adaptation, security — **`decision-tree.md`**.

### 2 — Tricky (edge case)

**Input:** Calls fail only on corporate Wi‑Fi.  
**Expected output:** TURN TCP/TLS 443, UDP diagnostics — **`network-infra-pro`** — **`failure-modes-detection-mitigation.md`**.

### 3 — Cross-skill

**Input:** iOS background kills audio.  
**Expected output:** Lifecycle + reconnect — **`react-native-pro`** — ICE restart policy — **`edge-cases.md`**.

## Checklist before calling the skill done

### Architecture

- [ ] Topology and **session lifecycle** explicit — **`quality-validation-and-guardrails.md`**.
- [ ] NAT/TURN/reconnect strategy documented — **`failure-modes-detection-mitigation.md`**.

### Quality and safety

- [ ] ≥1 **QoE** edge case + ≥1 **security** case addressed — **`edge-cases.md`**.
- [ ] Deliverable includes **concrete** signaling/media actions — **`tips-and-tricks.md`**.
- [ ] Residual risks: scale, multi-device — **`versions.md`**.

### Ops

- [ ] **TURN** cost/capacity if symmetric NAT likely — **`decision-tree.md`**.
- [ ] **Codec fallback** ladder for matrix — **`versions.md`**.
- [ ] **Recording/consent** if stored server-side — **`security-pro`**.
- [ ] **`integration-map.md`** used when infra or mobile dominates.
