# Dogfood terminal transcript

Recorded workflow-artifact dogfood for v0.11.0 Step 3. Output is summarized; exact timings depend on your machine.

This demo does **not** run `npx ai-engineering-harness install` inside the example tree. It shows goal → plan → verify → ship artifacts with real test evidence.

## Run tests (required)

From the repository root:

```bash
cd examples/dogfood-tiny-node-api
npm test
```

Expected summary (Node test runner):

```text
# tests 2
# pass 2
# fail 0
```

Subtests:

- `GET /health returns 200 and ok JSON`
- `GET / still returns root response`

## Optional manual probe

```bash
npm start
```

In another terminal:

```bash
curl -s http://127.0.0.1:3000/health
```

Expected body:

```json
{"status":"ok"}
```

`curl` output is optional and not checked into `.harness/VERIFY.md`.

## Repository-level check

From the harness repo root (also runs dogfood tests via `test/run-tests.js`):

```bash
node validate.js
npm test
```

## What to read next

- [.harness/VERIFY.md](.harness/VERIFY.md) — `status: passed` with `npm test` exit code 0
- [.harness/PLAN.md](.harness/PLAN.md) — `status: approved` before run phase
- [.harness/SHIP.md](.harness/SHIP.md) — scope of what was and was not shipped
