# WebSocket — runtime and infra versions

## Browser `WebSocket`

- Subprotocol support; binary type handling; `bufferedAmount` backpressure semantics.

## Node libraries (`ws`, etc.)

- Major versions differ on API (`perMessageDeflate`, `ping` behavior); check against your Node LTS.

## Reverse proxies

- **Nginx**, **Envoy**, **ALB** idle timeouts — must exceed or align with app heartbeat interval.

## HTTP/2 and WebSocket

- Confirm path from client through CDN to origin supports upgrade end-to-end.
