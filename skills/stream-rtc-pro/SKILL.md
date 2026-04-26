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

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** topology, NAT profile, codec policy, device matrix, and SLOs. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

- Separate the **signaling plane** from the **media plane** before diagnosing failures.
- Anchor every recommendation to **topology, client matrix, and network reality**.
- Prefer the **simplest viable topology** that meets latency and scale needs.
- Treat reconnect, ICE restarts, and degraded networks as first-class design cases, not edge cleanup.
- Be explicit about what is **RTC-specific** versus what should move to WebSocket, infra, or security skills.

## Suggested response format

Use this structure for RTC work:

1. **Context and topology** — participants, media types, target latency, device/network constraints.
2. **System model** — signaling path, media path, session lifecycle, and adaptation logic.
3. **Priority risks or bottlenecks** — ICE, TURN, renegotiation, bitrate collapse, auth, or scaling.
4. **Recommended changes** — topology/config/flow fixes ordered by impact.
5. **Verification plan** — logs, stats, network scenarios, and success thresholds.
6. **Residual risks** — remaining edge cases or assumptions still unverified.

## Resources in this skill

- `references/rtc-signaling-and-media-plane-system-model.md` — signaling/media split and control loops.
- `references/decision-framework-and-trade-offs.md` — mesh vs SFU vs MCU and transport trade-offs.
- `references/failure-modes-detection-mitigation.md` — common RTC production failures and mitigations.
- `references/edge-cases.md` — NAT/firewall, device, and renegotiation edge conditions.
- `references/quality-validation-and-guardrails.md` — correctness and validation guardrails.

## Quick example

User asks: "Calls connect on home Wi‑Fi but fail for corporate users behind strict firewalls."

Response shape:
- Identify whether failure is in signaling, ICE gathering, or relay reachability.
- Review TURN availability, TCP/TLS relay fallback, and firewall assumptions.
- Propose the minimum operational fixes first: relay coverage, timeout tuning, join diagnostics.
- Validate with corp-network test scenarios and connection-state telemetry.

## Checklist before calling the skill done

- Topology, scale, and latency goals are explicit.
- Diagnosis separates signaling problems from media transport problems.
- Proposed fixes are tied to concrete RTC failure modes.
- Verification includes network-condition or device-matrix testing.
- Residual assumptions about infra or security are called out.
