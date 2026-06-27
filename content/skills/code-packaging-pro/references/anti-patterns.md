# Code packaging — anti-patterns

## Secrets in Dockerfile / workflow

- Leak via layers or logs.
- **Fix:** Build-time secrets via OIDC/vault; never `ARG` password in final image.

## Fat final image

- Slow deploy, large attack surface.
- **Fix:** Multi-stage; slim base; no compilers in runtime.

## Unpinned `actions/checkout@v4` drift

- Supply chain surprise.
- **Fix:** Pin SHA or major with review policy — **`security-pro`**.

## Missing `.dockerignore`

- Slow builds, accidental secret context.
- **Fix:** Mirror `.gitignore` patterns + explicit allow.

## Duplicate releases / race on tag

- Two workflows publish same version → index errors.
- **Fix:** Single release workflow; concurrency group on release; idempotent guards — **`failure-modes-detection-mitigation.md`**.
