# dogfood-tiny-node-api

Minimal Node.js HTTP server used as an **end-to-end dogfood** target for `ai-engineering-harness` (v0.11.0 Step 3).

## Task (dogfood)

Add a `GET /health` endpoint that returns `200` and `{"status":"ok"}` without breaking the existing `GET /` response.

## Run

```bash
cd examples/dogfood-tiny-node-api
npm test
npm start
```

Manual check:

```bash
curl -s http://127.0.0.1:3000/health
```

## Harness workflow (recorded)

The `.harness/` directory documents a full loop:

`harness-start` → `harness-discuss` → `harness-plan` → approval → `harness-run` → `harness-verify` → `harness-ship` → `harness-remember`

See artifacts under [.harness/](.harness/) — especially [VERIFY.md](.harness/VERIFY.md) for real test evidence. Terminal summary: [TRANSCRIPT.md](TRANSCRIPT.md).

## Parent pack

This example lives inside [ai-engineering-harness](https://github.com/truongnat/ai-engineering-harness). Install the pack in your own repo with `npx ai-engineering-harness install`.
