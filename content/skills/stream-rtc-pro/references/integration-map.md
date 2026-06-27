# Stream / RTC — integration map

| Skill | Combine when |
|-------|----------------|
| **`websocket-pro`** | Signaling channel reliability, reconnect, backpressure, message ordering. |
| **`performance-tuning-pro`** | End-to-end latency, CPU/GPU, thread scheduling, tail QoE. |
| **`security-pro`** | DTLS/SRTP assumptions, token handling, recording/consent, abuse cases. |
| **`deployment-pro`** | TURN geo, SFU autoscale, CDN for broadcast fallback, rollout. |
| **`network-infra-pro`** | UDP blocked paths, firewall allowlists, DNS/TLS to TURN/SFU edges. |
| **`nestjs-pro`** / **`nextjs-pro`** | Signaling/control REST or WebSocket backends, auth at join. |
| **`react-native-pro`** | Mobile capture/background lifecycle, native RTC modules. |
| **`api-design-pro`** | Pure HTTP control-plane API design without media semantics. |

**Boundary:** **`stream-rtc-pro`** owns **media path, session lifecycle, ICE/TURN topology, and QoS policy**; **`api-design-pro`** owns **generic HTTP API** shape when signaling is not the primary topic.
