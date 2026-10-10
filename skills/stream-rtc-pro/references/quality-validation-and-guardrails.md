# Quality validation and guardrails (stream / RTC)

## Contents

1. [Standards and version honesty](#standards-and-version-honesty)
2. [Privacy and compliance](#privacy-and-compliance)
3. [Testing matrix](#testing-matrix)
4. [Review checklist](#review-checklist)

---

## Standards and version honesty

- **Do not invent** SDP attributes, proprietary SFU flags, or browser APIs — cite [WebRTC](https://w3c.github.io/webrtc-pc/) / vendor docs for the user’s **browser and SFU versions** — **`versions.md`**.
- Label **hypotheses** (“likely symmetric NAT”) vs **measured** (ICE candidate types from logs).

---

## Privacy and compliance

- **Recording**, **transcription**, and **retention** require explicit product/legal alignment — **`security-pro`**.
- Minimize **PII** in signaling logs; avoid full SDP dumps in prod.

---

## Testing matrix

- Exercise **corporate Wi‑Fi**, **UDP-blocked**, **mobile background**, and **codec fallback** paths before claiming production readiness — **`edge-cases.md`**.

---

## Review checklist

- [ ] Topology and explicit **session state machine** (join → negotiate → connected → reconnect → end).
- [ ] TURN strategy + **capacity/cost** when relays expected.
- [ ] ICE restart / reconnect policy documented.
- [ ] QoE metrics (join time, loss, RTT, freeze) named.
- [ ] Signaling **authZ** and media **consent/recording** stance when relevant.
