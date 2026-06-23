# Telemetry Server — Clean Architecture (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `lib/insights/telemetry-server.ts` into `src/features/telemetry/` using clean architecture layers, with zero HTTP behavior change and all existing tests green.

**Architecture:** Feature-first folders (`domain` → `application` → `infrastructure` → `presentation`). New code compiles via `tsconfig.src.json` to `dist/features/` and `dist/server/`. Legacy `dist/lib/insights/telemetry-server.js` becomes a one-line runtime shim so `test/insights/telemetry-server.test.js` needs no edits.

**Tech Stack:** TypeScript (strict), Node.js 18+, `node:test`, `node:http`, CommonJS.

**Spec:** `docs/superpowers/specs/2026-06-11-clean-architecture-typescript-design.md`

---

## File map (created / modified)

| Path | Responsibility |
|------|----------------|
| `tsconfig.src.json` | Compile `src/` → `dist/` |
| `src/features/telemetry/domain/constants.ts` | Schema id, 50MB cap constant |
| `src/features/telemetry/domain/telemetry-payload.ts` | Types + `validateTelemetryPayload()` |
| `src/features/telemetry/infrastructure/file-storage.ts` | NDJSON append + size limit |
| `src/features/telemetry/infrastructure/http-body-reader.ts` | Read POST body with byte cap |
| `src/features/telemetry/infrastructure/server-config.ts` | Parse argv/env |
| `src/features/telemetry/application/health-check.ts` | `{ ok: true }` use case |
| `src/features/telemetry/application/ingest-telemetry.ts` | Validate + write use case |
| `src/features/telemetry/presentation/json-response.ts` | Write JSON HTTP response |
| `src/features/telemetry/presentation/routes.ts` | `handleTelemetryRequest()` |
| `src/features/telemetry/presentation/create-server.ts` | `createTelemetryServer()` |
| `src/features/telemetry/index.ts` | Public barrel exports |
| `src/server/telemetry-main.ts` | CLI entry for HTTP server |
| `test/features/telemetry/domain/telemetry-payload.test.js` | Domain unit tests |
| `test/features/telemetry/infrastructure/file-storage.test.js` | Storage tests |
| `test/features/telemetry/application/ingest-telemetry.test.js` | Use-case tests |
| `lib/insights/telemetry-server.ts` | **Replace** with runtime shim (Task 8) |
| `bin/telemetry-server.js` | Point to `dist/server/telemetry.js` |
| `package.json` | Add `build:src`, update `build` script |
| `scripts/verify-dist.js` | Add `dist/server/telemetry.js` check |

---

## Task 1: Build scaffold (`tsconfig.src.json` + npm scripts)

**Files:**
- Create: `tsconfig.src.json`
- Modify: `package.json` (scripts only)

- [ ] **Step 1: Create `tsconfig.src.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "lib": ["ES2022"],
    "types": ["node"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.test.ts"]
}
```

- [ ] **Step 2: Update `package.json` scripts**

Add / change:

```json
"build:src": "node ./node_modules/typescript/bin/tsc -p tsconfig.src.json",
"build:legacy": "node ./node_modules/typescript/bin/tsc -p tsconfig.build.json",
"build": "npm run build:src && npm run build:legacy",
"build:watch": "node ./node_modules/typescript/bin/tsc -p tsconfig.src.json --watch",
"telemetry:server": "node dist/server/telemetry.js"
```

Keep existing `prepack` pointing at `npm run build`.

- [ ] **Step 3: Create placeholder entry so build passes**

Create `src/server/telemetry-main.ts`:

```typescript
// Purpose: Telemetry HTTP server entry (placeholder until Task 7).
// Layer: presentation
// Depends on: nothing yet

process.stdout.write("telemetry-main: not implemented yet\n");
process.exit(1);
```

- [ ] **Step 4: Run build**

```bash
npm run build:src
```

Expected: exits 0, creates `dist/server/telemetry.js`.

- [ ] **Step 5: Commit**

```bash
git add tsconfig.src.json package.json src/server/telemetry-main.ts
git commit -m "chore: add src/ TypeScript build scaffold for clean architecture migration"
```

---

## Task 2: Domain layer — constants + payload validation

**Files:**
- Create: `src/features/telemetry/domain/constants.ts`
- Create: `src/features/telemetry/domain/telemetry-payload.ts`
- Create: `test/features/telemetry/domain/telemetry-payload.test.js`

- [ ] **Step 1: Write the failing test**

Create `test/features/telemetry/domain/telemetry-payload.test.js`:

```javascript
const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..", "..", "..");
const {
  TELEMETRY_SCHEMA_ID,
  DEFAULT_MAX_STORAGE_BYTES,
  validateTelemetryPayload,
} = require(path.join(repoRoot, "dist", "features", "telemetry", "domain", "telemetry-payload.js"));

function makePayload() {
  return {
    schema: "harness-insights-export-v1",
    generatedAt: "2026-06-07T00:00:00.000Z",
    anonymized: true,
    aggregate: {
      totalEvents: 1,
      skills: { verification: 1 },
      guardBlocks: {},
      guardPasses: {},
      tools: [],
      subagents: {},
    },
    fingerprint: "abc123",
  };
}

test("TELEMETRY_SCHEMA_ID matches harness insights export v1", () => {
  assert.equal(TELEMETRY_SCHEMA_ID, "harness-insights-export-v1");
});

test("DEFAULT_MAX_STORAGE_BYTES is 50 MB", () => {
  assert.equal(DEFAULT_MAX_STORAGE_BYTES, 50 * 1024 * 1024);
});

test("validateTelemetryPayload accepts valid export", () => {
  assert.equal(validateTelemetryPayload(makePayload()), true);
});

test("validateTelemetryPayload rejects empty object", () => {
  assert.equal(validateTelemetryPayload({}), false);
});

test("validateTelemetryPayload rejects wrong schema", () => {
  assert.equal(validateTelemetryPayload({ ...makePayload(), schema: "wrong" }), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run build:src
node --test test/features/telemetry/domain/telemetry-payload.test.js
```

Expected: FAIL — `Cannot find module ... telemetry-payload.js`

- [ ] **Step 3: Implement domain files**

Create `src/features/telemetry/domain/constants.ts`:

```typescript
// Purpose: Telemetry domain constants.
// Layer: domain
// Depends on: nothing

export const TELEMETRY_SCHEMA_ID = "harness-insights-export-v1";
export const DEFAULT_MAX_STORAGE_BYTES = 50 * 1024 * 1024;
```

Create `src/features/telemetry/domain/telemetry-payload.ts`:

```typescript
// Purpose: Telemetry export payload type and validation rules.
// Layer: domain
// Depends on: constants.ts

import { TELEMETRY_SCHEMA_ID } from "./constants";

export interface TelemetryExportPayload {
  schema?: string;
  generatedAt?: string;
  anonymized?: boolean;
  aggregate?: {
    totalEvents?: number;
    skills?: Record<string, number>;
    guardBlocks?: Record<string, number>;
    guardPasses?: Record<string, number>;
    tools?: Array<{ command: string; count: number; failures: number }>;
    subagents?: Record<string, number>;
  };
  fingerprint?: string;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function validateTelemetryPayload(payload: unknown): payload is TelemetryExportPayload {
  if (!isPlainObject(payload)) {
    return false;
  }
  if (payload.schema !== TELEMETRY_SCHEMA_ID) {
    return false;
  }
  if (typeof payload.generatedAt !== "string") {
    return false;
  }
  if (typeof payload.anonymized !== "boolean") {
    return false;
  }
  if (!isPlainObject(payload.aggregate)) {
    return false;
  }
  if (typeof payload.aggregate.totalEvents !== "number") {
    return false;
  }
  return true;
}

export { TELEMETRY_SCHEMA_ID, DEFAULT_MAX_STORAGE_BYTES } from "./constants";
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run build:src
node --test test/features/telemetry/domain/telemetry-payload.test.js
```

Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/telemetry/domain/ test/features/telemetry/domain/
git commit -m "feat(telemetry): add domain payload validation layer"
```

---

## Task 3: Infrastructure — file storage

**Files:**
- Create: `src/features/telemetry/infrastructure/file-storage.ts`
- Create: `test/features/telemetry/infrastructure/file-storage.test.js`

- [ ] **Step 1: Write the failing test**

Create `test/features/telemetry/infrastructure/file-storage.test.js`:

```javascript
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..", "..", "..");
const {
  defaultStoragePath,
  appendTelemetryExport,
} = require(path.join(repoRoot, "dist", "features", "telemetry", "infrastructure", "file-storage.js"));

function makePayload() {
  return {
    schema: "harness-insights-export-v1",
    generatedAt: "2026-06-07T00:00:00.000Z",
    anonymized: true,
    aggregate: { totalEvents: 1 },
    fingerprint: "abc123",
  };
}

test("defaultStoragePath points to harness-telemetry.ndjson", () => {
  const dir = path.join(os.tmpdir(), "telemetry-dir");
  assert.equal(defaultStoragePath(dir), path.join(dir, "harness-telemetry.ndjson"));
});

test("appendTelemetryExport writes one NDJSON line", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-storage-"));
  const payload = makePayload();
  const result = appendTelemetryExport(tempRoot, payload);
  const storagePath = defaultStoragePath(tempRoot);
  assert.ok(fs.existsSync(storagePath));
  const lines = fs.readFileSync(storagePath, "utf8").trim().split("\n");
  assert.equal(lines.length, 1);
  assert.equal(JSON.parse(lines[0]).fingerprint, "abc123");
  assert.equal(result.bytesWritten, Buffer.byteLength(`${JSON.stringify(payload)}\n`));
});

test("appendTelemetryExport throws when storage cap exceeded", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-storage-cap-"));
  const payload = makePayload();
  const encoded = `${JSON.stringify(payload)}\n`;
  const maxBytes = Buffer.byteLength(encoded);
  fs.mkdirSync(tempRoot, { recursive: true });
  fs.writeFileSync(defaultStoragePath(tempRoot), encoded, "utf8");
  assert.throws(
    () => appendTelemetryExport(tempRoot, payload, maxBytes),
    /Telemetry storage limit exceeded/
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run build:src
node --test test/features/telemetry/infrastructure/file-storage.test.js
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `file-storage.ts`**

Create `src/features/telemetry/infrastructure/file-storage.ts`:

```typescript
// Purpose: Append telemetry exports to NDJSON storage with size cap.
// Layer: infrastructure
// Depends on: domain/constants, domain/telemetry-payload

import fs from "node:fs";
import path from "node:path";
import { DEFAULT_MAX_STORAGE_BYTES } from "../domain/constants";
import type { TelemetryExportPayload } from "../domain/telemetry-payload";

export interface TelemetryWriteResult {
  storagePath: string;
  bytesWritten: number;
}

export function defaultStoragePath(storageDir: string): string {
  return path.join(storageDir, "harness-telemetry.ndjson");
}

export function appendTelemetryExport(
  storageDir: string,
  payload: TelemetryExportPayload,
  maxStorageBytes = DEFAULT_MAX_STORAGE_BYTES
): TelemetryWriteResult {
  fs.mkdirSync(storageDir, { recursive: true });
  const storagePath = defaultStoragePath(storageDir);
  const line = `${JSON.stringify(payload)}\n`;
  const existingSize = fs.existsSync(storagePath) ? fs.statSync(storagePath).size : 0;
  const lineBytes = Buffer.byteLength(line);

  if (existingSize + lineBytes > maxStorageBytes) {
    throw new Error(`Telemetry storage limit exceeded (${maxStorageBytes} bytes)`);
  }

  fs.appendFileSync(storagePath, line, "utf8");
  return { storagePath, bytesWritten: lineBytes };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run build:src
node --test test/features/telemetry/infrastructure/file-storage.test.js
```

Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/telemetry/infrastructure/file-storage.ts test/features/telemetry/infrastructure/
git commit -m "feat(telemetry): add NDJSON file storage infrastructure"
```

---

## Task 4: Application layer — ingest + health use cases

**Files:**
- Create: `src/features/telemetry/application/health-check.ts`
- Create: `src/features/telemetry/application/ingest-telemetry.ts`
- Create: `test/features/telemetry/application/ingest-telemetry.test.js`

- [ ] **Step 1: Write the failing test**

Create `test/features/telemetry/application/ingest-telemetry.test.js`:

```javascript
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..", "..", "..");
const { ingestTelemetryExport } = require(path.join(
  repoRoot,
  "dist",
  "features",
  "telemetry",
  "application",
  "ingest-telemetry.js"
));
const { defaultStoragePath } = require(path.join(
  repoRoot,
  "dist",
  "features",
  "telemetry",
  "infrastructure",
  "file-storage.js"
));

function makePayload() {
  return {
    schema: "harness-insights-export-v1",
    generatedAt: "2026-06-07T00:00:00.000Z",
    anonymized: true,
    aggregate: { totalEvents: 1 },
    fingerprint: "abc123",
  };
}

test("ingestTelemetryExport accepts valid payload", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-ingest-"));
  const result = ingestTelemetryExport(tempRoot, makePayload());
  assert.equal(result.ok, true);
  assert.equal(result.statusCode, 202);
  assert.ok(fs.existsSync(defaultStoragePath(tempRoot)));
});

test("ingestTelemetryExport rejects invalid payload without writing", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-ingest-invalid-"));
  const result = ingestTelemetryExport(tempRoot, { schema: "wrong" });
  assert.equal(result.ok, false);
  assert.equal(result.statusCode, 422);
  assert.ok(!fs.existsSync(defaultStoragePath(tempRoot)));
});

test("ingestTelemetryExport maps storage cap errors to 507", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-ingest-cap-"));
  const payload = makePayload();
  const encoded = `${JSON.stringify(payload)}\n`;
  const maxBytes = Buffer.byteLength(encoded);
  fs.mkdirSync(tempRoot, { recursive: true });
  fs.writeFileSync(defaultStoragePath(tempRoot), encoded, "utf8");
  const result = ingestTelemetryExport(tempRoot, payload, { maxStorageBytes: maxBytes });
  assert.equal(result.ok, false);
  assert.equal(result.statusCode, 507);
  assert.match(result.error || "", /Telemetry storage limit exceeded/);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run build:src
node --test test/features/telemetry/application/ingest-telemetry.test.js
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement application layer**

Create `src/features/telemetry/application/health-check.ts`:

```typescript
// Purpose: Health check use case for telemetry server.
// Layer: application
// Depends on: nothing

export function runHealthCheck(): { ok: true } {
  return { ok: true };
}
```

Create `src/features/telemetry/application/ingest-telemetry.ts`:

```typescript
// Purpose: Validate and persist a telemetry export.
// Layer: application
// Depends on: domain/telemetry-payload, infrastructure/file-storage

import { validateTelemetryPayload, type TelemetryExportPayload } from "../domain/telemetry-payload";
import { appendTelemetryExport } from "../infrastructure/file-storage";
import { DEFAULT_MAX_STORAGE_BYTES } from "../domain/constants";

export interface IngestTelemetryOptions {
  maxStorageBytes?: number;
}

export interface IngestTelemetryResult {
  ok: boolean;
  statusCode: number;
  error?: string;
  bytesWritten?: number;
  schema?: string;
  fingerprint?: string | null;
}

export function ingestTelemetryExport(
  storageDir: string,
  payload: unknown,
  options: IngestTelemetryOptions = {}
): IngestTelemetryResult {
  if (!validateTelemetryPayload(payload)) {
    return {
      ok: false,
      statusCode: 422,
      error: "Invalid telemetry export payload",
    };
  }

  try {
    const maxStorageBytes = options.maxStorageBytes ?? DEFAULT_MAX_STORAGE_BYTES;
    const record = appendTelemetryExport(storageDir, payload, maxStorageBytes);
    return {
      ok: true,
      statusCode: 202,
      schema: payload.schema,
      fingerprint: payload.fingerprint ?? null,
      bytesWritten: record.bytesWritten,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Telemetry ingest failed";
    const statusCode = message.startsWith("Telemetry storage limit exceeded") ? 507 : 400;
    return { ok: false, statusCode, error: message };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run build:src
node --test test/features/telemetry/application/ingest-telemetry.test.js
```

Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/telemetry/application/ test/features/telemetry/application/
git commit -m "feat(telemetry): add ingest and health application use cases"
```

---

## Task 5: Infrastructure — HTTP body reader

**Files:**
- Create: `src/features/telemetry/infrastructure/http-body-reader.ts`

- [ ] **Step 1: Implement `http-body-reader.ts`** (no separate test — covered in presentation tests)

```typescript
// Purpose: Read HTTP request body with a byte limit.
// Layer: infrastructure
// Depends on: node:http

import type { IncomingMessage } from "node:http";

export function readRequestBody(req: IncomingMessage, maxBodyBytes: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;

    req.on("data", (chunk) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      totalBytes += buffer.length;
      if (totalBytes > maxBodyBytes) {
        reject(new Error("Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(buffer);
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });

    req.on("error", (error) => reject(error));
  });
}
```

- [ ] **Step 2: Build**

```bash
npm run build:src
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/features/telemetry/infrastructure/http-body-reader.ts
git commit -m "feat(telemetry): add HTTP body reader infrastructure"
```

---

## Task 6: Presentation layer — routes + server factory

**Files:**
- Create: `src/features/telemetry/presentation/json-response.ts`
- Create: `src/features/telemetry/presentation/routes.ts`
- Create: `src/features/telemetry/presentation/create-server.ts`
- Create: `src/features/telemetry/index.ts`
- Create: `test/features/telemetry/presentation/routes.test.js`

- [ ] **Step 1: Write failing presentation test (port of legacy handler tests)**

Create `test/features/telemetry/presentation/routes.test.js` — copy the four handler tests from `test/insights/telemetry-server.test.js` but import from:

```javascript
const {
  DEFAULT_MAX_STORAGE_BYTES,
  handleTelemetryRequest,
  validateTelemetryPayload,
  defaultStoragePath,
} = require(path.join(repoRoot, "dist", "features", "telemetry", "index.js"));
```

Include the same four tests: validate payload, ingest stores, invalid rejects, storage cap 507, and DEFAULT_MAX_STORAGE_BYTES constant.

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run build:src
node --test test/features/telemetry/presentation/routes.test.js
```

Expected: FAIL.

- [ ] **Step 3: Implement presentation files**

Create `src/features/telemetry/presentation/json-response.ts`:

```typescript
// Purpose: Write JSON HTTP responses.
// Layer: presentation
// Depends on: node:http

import type { ServerResponse } from "node:http";

export function jsonResponse(
  res: ServerResponse,
  statusCode: number,
  body: Record<string, unknown>
): void {
  res.statusCode = statusCode;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(`${JSON.stringify(body, null, 2)}\n`);
}
```

Create `src/features/telemetry/presentation/routes.ts`:

```typescript
// Purpose: Map HTTP routes to telemetry use cases.
// Layer: presentation
// Depends on: application, infrastructure, json-response

import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { runHealthCheck } from "../application/health-check";
import { ingestTelemetryExport } from "../application/ingest-telemetry";
import { readRequestBody } from "../infrastructure/http-body-reader";
import { DEFAULT_MAX_STORAGE_BYTES } from "../domain/constants";
import { jsonResponse } from "./json-response";

export interface TelemetryServerOptions {
  routePath?: string;
  storageDir?: string;
  maxBodyBytes?: number;
  maxStorageBytes?: number;
}

export interface TelemetryIngestResult {
  accepted: boolean;
  statusCode: number;
  body: Record<string, unknown>;
}

export async function handleTelemetryRequest(
  req: IncomingMessage,
  res: ServerResponse,
  options: TelemetryServerOptions = {}
): Promise<TelemetryIngestResult> {
  const routePath = options.routePath || "/api/telemetry";
  const maxBodyBytes = options.maxBodyBytes || 1_048_576;
  const maxStorageBytes = options.maxStorageBytes || DEFAULT_MAX_STORAGE_BYTES;
  const storageDir = options.storageDir || path.join(process.cwd(), ".harness", "telemetry");
  const method = (req.method || "GET").toUpperCase();
  const urlPath = (req.url || "/").split("?")[0];

  if (urlPath === "/health") {
    if (method !== "GET") {
      jsonResponse(res, 405, { ok: false, error: "Method not allowed" });
      return { accepted: false, statusCode: 405, body: { ok: false, error: "Method not allowed" } };
    }
    const health = runHealthCheck();
    jsonResponse(res, 200, health);
    return { accepted: true, statusCode: 200, body: health };
  }

  if (urlPath !== routePath) {
    jsonResponse(res, 404, { ok: false, error: "Not found" });
    return { accepted: false, statusCode: 404, body: { ok: false, error: "Not found" } };
  }

  if (method !== "POST") {
    jsonResponse(res, 405, { ok: false, error: "Method not allowed" });
    return { accepted: false, statusCode: 405, body: { ok: false, error: "Method not allowed" } };
  }

  try {
    const rawBody = await readRequestBody(req, maxBodyBytes);
    const payload = JSON.parse(rawBody) as unknown;
    const result = ingestTelemetryExport(storageDir, payload, { maxStorageBytes });

    if (!result.ok) {
      jsonResponse(res, result.statusCode, { ok: false, error: result.error });
      return { accepted: false, statusCode: result.statusCode, body: { ok: false, error: result.error } };
    }

    const body = {
      ok: true,
      accepted: true,
      schema: result.schema,
      fingerprint: result.fingerprint ?? null,
      bytesWritten: result.bytesWritten,
    };
    jsonResponse(res, result.statusCode, body);
    return { accepted: true, statusCode: result.statusCode, body };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Telemetry ingest failed";
    const statusCode = message === "Request body too large" ? 413 : 400;
    jsonResponse(res, statusCode, { ok: false, error: message });
    return { accepted: false, statusCode, body: { ok: false, error: message } };
  }
}
```

Create `src/features/telemetry/presentation/create-server.ts`:

```typescript
// Purpose: Create Node HTTP server for telemetry routes.
// Layer: presentation
// Depends on: routes.ts

import { createServer } from "node:http";
import { handleTelemetryRequest, type TelemetryServerOptions } from "./routes";

export function createTelemetryServer(options: TelemetryServerOptions = {}) {
  return createServer((req, res) => {
    void handleTelemetryRequest(req, res, options);
  });
}
```

Create `src/features/telemetry/index.ts`:

```typescript
// Purpose: Public exports for telemetry feature.
// Layer: presentation
// Depends on: all telemetry layers

export { DEFAULT_MAX_STORAGE_BYTES, TELEMETRY_SCHEMA_ID } from "./domain/constants";
export { validateTelemetryPayload, type TelemetryExportPayload } from "./domain/telemetry-payload";
export { defaultStoragePath, appendTelemetryExport, type TelemetryWriteResult } from "./infrastructure/file-storage";
export { createTelemetryServer } from "./presentation/create-server";
export { handleTelemetryRequest, type TelemetryServerOptions, type TelemetryIngestResult } from "./presentation/routes";
```

- [ ] **Step 4: Run presentation tests**

```bash
npm run build:src
node --test test/features/telemetry/presentation/routes.test.js
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/telemetry/presentation/ src/features/telemetry/index.ts test/features/telemetry/presentation/
git commit -m "feat(telemetry): add presentation routes and server factory"
```

---

## Task 7: Server entry + config

**Files:**
- Create: `src/features/telemetry/infrastructure/server-config.ts`
- Modify: `src/server/telemetry-main.ts` (replace placeholder)

- [ ] **Step 1: Implement server config parser**

Create `src/features/telemetry/infrastructure/server-config.ts`:

```typescript
// Purpose: Parse telemetry server CLI flags and environment variables.
// Layer: infrastructure
// Depends on: nothing

import path from "node:path";

export interface TelemetryServerConfig {
  port: number;
  host: string;
  storageDir: string;
  routePath: string;
}

function readArg(argv: string[], flag: string, fallback: string): string {
  const index = argv.indexOf(flag);
  if (index === -1 || index + 1 >= argv.length) {
    return fallback;
  }
  return argv[index + 1];
}

export function parseTelemetryServerConfig(argv: string[] = process.argv): TelemetryServerConfig {
  return {
    port: Number(readArg(argv, "--port", process.env.HARNESS_TELEMETRY_PORT || "8787")),
    host: readArg(argv, "--host", process.env.HARNESS_TELEMETRY_HOST || "127.0.0.1"),
    storageDir: readArg(
      argv,
      "--storage-dir",
      process.env.HARNESS_TELEMETRY_STORAGE_DIR || path.join(process.cwd(), ".harness", "telemetry")
    ),
    routePath: readArg(argv, "--route", process.env.HARNESS_TELEMETRY_ROUTE || "/api/telemetry"),
  };
}
```

- [ ] **Step 2: Replace `src/server/telemetry-main.ts`**

```typescript
// Purpose: Start telemetry HTTP server from CLI.
// Layer: presentation
// Depends on: features/telemetry

import { createTelemetryServer } from "../features/telemetry/presentation/create-server";
import { parseTelemetryServerConfig } from "../features/telemetry/infrastructure/server-config";

const config = parseTelemetryServerConfig();
const server = createTelemetryServer({
  storageDir: config.storageDir,
  routePath: config.routePath,
});

server.listen(config.port, config.host, () => {
  process.stdout.write(
    `Telemetry backend listening on http://${config.host}:${config.port}${config.routePath}\n` +
      `Health check: http://${config.host}:${config.port}/health\n` +
      `Storage: ${config.storageDir}/harness-telemetry.ndjson\n`
  );
});

function shutdown(): void {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.on("unhandledRejection", (reason) => {
  process.stderr.write(`Unhandled rejection: ${reason}\n`);
  server.close(() => process.exit(1));
});
```

- [ ] **Step 3: Build and smoke test**

```bash
npm run build:src
npm run telemetry:server
```

Expected: prints listening message on port 8787. Ctrl+C to stop.

In another terminal:

```bash
curl http://127.0.0.1:8787/health
```

Expected: `{"ok":true}`

- [ ] **Step 4: Commit**

```bash
git add src/features/telemetry/infrastructure/server-config.ts src/server/telemetry-main.ts
git commit -m "feat(telemetry): add server entry and config parser"
```

---

## Task 8: Legacy shim + wire bin + full test suite

**Files:**
- Modify: `lib/insights/telemetry-server.ts` (replace body with shim)
- Modify: `bin/telemetry-server.js`
- Modify: `scripts/verify-dist.js`
- Modify: `test/run-tests.js` (if it lists test files — add new test glob if needed)

- [ ] **Step 1: Replace `lib/insights/telemetry-server.ts` with runtime shim**

Delete the old implementation. Replace entire file with:

```typescript
/**
 * Purpose: Backward-compat shim — implementation in src/features/telemetry/.
 * Layer: infrastructure (shim only)
 * Depends on: dist/features/telemetry (built by build:src)
 *
 * Remove this file in Phase 9 cleanup after user approval.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
module.exports = require("../../features/telemetry/index.js");
```

> **Why `module.exports`:** From `dist/lib/insights/telemetry-server.js`, `../../features/telemetry/index.js` resolves to `dist/features/telemetry/index.js` at runtime. `build` must run `build:src` before `build:legacy`.

- [ ] **Step 2: Update `bin/telemetry-server.js`**

```javascript
#!/usr/bin/env node
"use strict";

require("../dist/server/telemetry.js");
```

- [ ] **Step 3: Update `scripts/verify-dist.js`**

Add to `requiredPaths`:

```javascript
"dist/server/telemetry.js",
"dist/features/telemetry/index.js",
```

- [ ] **Step 4: Ensure `test/run-tests.js` runs new feature tests**

If tests are enumerated explicitly, add:

```javascript
"test/features/telemetry/domain/telemetry-payload.test.js",
"test/features/telemetry/infrastructure/file-storage.test.js",
"test/features/telemetry/application/ingest-telemetry.test.js",
"test/features/telemetry/presentation/routes.test.js",
```

If tests are glob-discovered, confirm new files are picked up automatically.

- [ ] **Step 5: Full build + test**

```bash
npm test
```

Expected: all tests PASS, including unchanged `test/insights/telemetry-server.test.js`.

- [ ] **Step 6: Commit**

```bash
git add lib/insights/telemetry-server.ts bin/telemetry-server.js scripts/verify-dist.js test/run-tests.js
git commit -m "feat(telemetry): wire legacy shim and dist/server entry"
```

---

## Task 9: User review gate (no code — wait for user)

- [ ] **Step 1: Manual smoke checklist for user**

```bash
npm run build
npm run telemetry:server
# separate terminal:
curl http://127.0.0.1:8787/health
curl -X POST http://127.0.0.1:8787/api/telemetry \
  -H "content-type: application/json" \
  -d '{"schema":"harness-insights-export-v1","generatedAt":"2026-06-11T00:00:00.000Z","anonymized":true,"aggregate":{"totalEvents":1}}'
```

- [ ] **Step 2: User reviews each layer and requests refactors**

Do **not** remove `lib/insights/telemetry-server.ts` shim until user explicitly approves (Phase 9).

- [ ] **Step 3: Document phase 1 complete in spec status**

Update `docs/superpowers/specs/2026-06-11-clean-architecture-typescript-design.md` status line to note Phase 1 shipped.

---

## Spec coverage self-review

| Spec requirement | Task |
|------------------|------|
| Feature-first `src/features/telemetry/` | Tasks 2–7 |
| domain → application → infrastructure → presentation | Tasks 2–6 |
| HTTP contract unchanged | Task 6 routes + Task 9 smoke |
| `dist/server/telemetry.js` entry | Tasks 1, 7 |
| Shim `dist/lib/insights/telemetry-server.js` | Task 8 |
| `npm test` green | Task 8 |
| Dual build `build:src` + `build:legacy` | Task 1 |
| No behavior change to payload schema | Task 2 validation copied verbatim |
| Step-by-step debug | 9 tasks, each committable |
| Shim removal only on user approval | Task 9 gate |

**Placeholder scan:** none found.

**Type consistency:** `TelemetryExportPayload`, `IngestTelemetryResult`, `TelemetryIngestResult` names aligned across layers.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-11-telemetry-clean-architecture.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration

2. **Inline Execution** — implement tasks in this session with checkpoints after each task for your review

**Which approach?**
