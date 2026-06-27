# RTC — signaling plane vs media plane

## Contents

1. [Two planes](#two-planes)
2. [ICE, STUN, and TURN](#ice-stun-and-turn)
3. [SFU topology at a glance](#sfu-topology-at-a-glance)
4. [Adaptation loop](#adaptation-loop)
5. [Where things break](#where-things-break)

Standards: [WebRTC](https://w3c.github.io/webrtc-pc/), [MDN WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API) — confirm **browser / native** matrix for API availability.

---

## Two planes

| Plane | Responsibility |
|-------|------------------|
| **Signaling** | SDP offer/answer, ICE candidates, session control — not the media path itself |
| **Media** | RTP/RTCP (often SRTP), congestion control, encoder/decoder |

They **fail independently**: signaling “connected” does not guarantee usable media — **`failure-modes-detection-mitigation.md`**.

---

## ICE, STUN, and TURN

**ICE** gathers candidates (host, srflx, relay). **STUN** helps discover server-reflexive candidates. **TURN** relays when direct paths fail.

**Implication:** corporate UDP block → **TCP/TLS 443** TURN paths and capacity planning — **`network-infra-pro`**, **`edge-cases.md`**.

---

## SFU topology at a glance

In **Selective Forwarding Unit (SFU)** mode, each sender sends upstream; SFU forwards selected layers to receivers — scales better than full mesh — **`decision-tree.md`**.

---

## Adaptation loop

Runtime feedback (loss, RTT, bandwidth estimate) drives **bitrate/resolution/layer** changes (simulcast/SVC policies).

**Implication:** define **QoE metrics** and **floor** quality for product acceptance — **`tips-and-tricks.md`**, **`performance-tuning-pro`**.

---

## Where things break

Common breakpoints: **ICE connectivity**, **renegotiation** during reconnect, **TURN capacity**, **codec negotiation**, **mobile lifecycle** — map symptoms to plane before “random codec tweak” — **`failure-modes-detection-mitigation.md`**.
