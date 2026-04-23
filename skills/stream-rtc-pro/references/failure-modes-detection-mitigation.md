# Failure modes — detection and mitigation (stream / RTC)

## Contents

1. [Connectivity and ICE](#connectivity-and-ice)
2. [Signaling state](#signaling-state)
3. [QoS and adaptation](#qos-and-adaptation)
4. [Infrastructure and scale](#infrastructure-and-scale)
5. [Security and abuse](#security-and-abuse)

---

## Connectivity and ICE

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Stuck in checking** | No relay path; corp Wi‑Fi | TURN with TCP/TLS; ICE restart policy — **`edge-cases.md`** |
| **Dropped candidates** | Intermittent connects | Trickle ICE ordering; buffer until remoteDescription — **`edge-cases.md`** |
| **TURN exhaustion** | Mass join failures | Capacity + regional redundancy; monitor relay bitrate — **`edge-cases.md`** |

---

## Signaling state

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **SDP glare / offer collision** | Renegotiation loops | Polite peer / role rules; single negotiation owner — **`edge-cases.md`** |
| **Zombie participants** | Count mismatch | Presence + teardown on disconnect; heartbeat — **`edge-cases.md`** |

---

## QoS and adaptation

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Frozen video with low loss** | Jitter buffer spikes | Jitter metrics; pacing; SFU forwarding policy — **`performance-tuning-pro`** |
| **Codec mismatch** | One-way audio | Negotiation order + fallback ladder — **`versions.md`** |

---

## Infrastructure and scale

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **SFU hot shard** | Regional latency | Geo routing; autoscale signals — **`deployment-pro`** |
| **Mesh at scale** | CPU melt | Move to SFU — **`decision-tree.md`** |

---

## Security and abuse

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Weak room join** | Open token URLs | AuthZ on signaling; short-lived tokens — **`security-pro`** |
| **Recording without consent** | Legal exposure | Consent UX + storage policy — **`security-pro`** |
