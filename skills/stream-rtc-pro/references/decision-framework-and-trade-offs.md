# Decision framework and trade-offs (stream / RTC)

## Contents

1. [Mesh vs SFU vs MCU](#mesh-vs-sfu-vs-mcu)
2. [WebRTC-first vs broadcast fallback](#webrtc-first-vs-broadcast-fallback)
3. [Simulcast vs SVC](#simulcast-vs-svc)
4. [UDP vs TCP TURN](#udp-vs-tcp-turn)

Use **`decision-tree.md`** for quick topology and TURN branches.

---

## Mesh vs SFU vs MCU

| Topology | Fit |
|----------|-----|
| **Mesh** | Tiny rooms, prototypes |
| **SFU** | Most multiparty realtime |
| **MCU** | Heavy server-side compositing / legacy interoperability |

**Trade-off:** mesh minimizes server compute until **N²** media paths dominate — **`rtc-signaling-and-media-plane-system-model.md`**.

---

## WebRTC-first vs broadcast fallback

| WebRTC interactive | HLS/DASH broadcast |
|--------------------|---------------------|
| Ultra-low latency talk | Mass one-to-many; higher latency OK |

**Trade-off:** operational complexity vs scale — **`deployment-pro`** for CDN path.

---

## Simulcast vs SVC

| **Simulcast** | **SVC** |
|---------------|---------|
| Wide interop | Fewer uplink streams when supported |

**Trade-off:** browser matrix and SFU feature flags — **`versions.md`**.

---

## UDP vs TCP TURN

UDP preferred for latency; **TCP/TLS 443** TURN as **firewall escape** at cost of head-of-line blocking — **`network-infra-pro`**.
