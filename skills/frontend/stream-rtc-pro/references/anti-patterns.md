# Stream / RTC — anti-patterns

## Signaling state in only one peer

- Reconnect leaves orphan sessions.
- **Fix:** Authoritative session store; idempotent join.

## No ICE restart path

- Network change kills call forever.
- **Fix:** `restartIce`, full re-offer policy documented.

## Unlimited simulcast layers

- Upstream bandwidth explodes.
- **Fix:** Cap layers per subscriber class; adapt on RTT/loss.

## Trusting client-side bitrate

- Malicious or buggy clients harm others.
- **Fix:** Server-side caps; per-participant budgets on SFU.

## Logging raw SDP in production

- May contain sensitive network info at scale.
- **Fix:** Truncate/hash; structured metrics instead.

## Skipping consent flows

- Privacy/regulatory failure.
- **Fix:** Explicit capture permissions; document retention.
