# Authentication regression matrix

| Flow | Regression case | Expected result |
|---|---|---|
| Login | Wrong password, unknown account, lockout threshold | Same safe error shape; lockout/rate policy applies |
| Session | Expiry, rotation, concurrent refresh, logout | Old credential is invalidated as designed; refresh is bounded |
| MFA | Missing, invalid, replayed, recovery code reuse | Step-up cannot be bypassed; recovery is auditable |
| Authorization | Changed role/tenant during active session | Next protected action reflects current policy |
| Password reset | Expired token, replay, account enumeration | Token is single-use; response does not enumerate accounts |
| CSRF/origin | Cross-site state-changing request | Request is rejected unless trusted flow is satisfied |
| Secrets | Logs, URLs, client bundle, error messages | Credentials and tokens are absent or redacted |

Evidence should include clock assumptions, token/session identifiers as hashes, response status, audit event, and invalidation result. Never use real credentials in fixtures.
