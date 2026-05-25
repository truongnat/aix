import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { applyGoalLifecycleAction, createSeedSession } from "../src/lib/runtime/engine";
import type { GoalLifecycleAction, RuntimeStoreSnapshot } from "../src/lib/runtime/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || "8787");
const SESSION_PATH = resolve(__dirname, ".runtime/session.json");

interface DispatchRequestBody {
  action: GoalLifecycleAction;
  expectedRunId: string;
}

function createSeedSnapshot(): RuntimeStoreSnapshot {
  return {
    session: createSeedSession(),
    persistence: {
      hydratedFromStorage: false,
      lastSavedAtMs: null,
    },
  };
}

async function ensureSessionFile(snapshot: RuntimeStoreSnapshot) {
  await mkdir(dirname(SESSION_PATH), { recursive: true });
  await writeFile(SESSION_PATH, JSON.stringify(snapshot, null, 2), "utf8");
}

async function loadSnapshot() {
  try {
    const raw = await readFile(SESSION_PATH, "utf8");
    return JSON.parse(raw) as RuntimeStoreSnapshot;
  } catch {
    const snapshot = createSeedSnapshot();
    await ensureSessionFile(snapshot);
    return snapshot;
  }
}

async function saveSnapshot(snapshot: RuntimeStoreSnapshot) {
  const nextSnapshot: RuntimeStoreSnapshot = {
    ...snapshot,
    persistence: {
      hydratedFromStorage: true,
      lastSavedAtMs: Date.now(),
    },
  };
  await ensureSessionFile(nextSnapshot);
  return nextSnapshot;
}

async function parseJsonBody<T>(request: Parameters<typeof createServer>[0]): Promise<T> {
  const chunks: Uint8Array[] = [];

  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return (raw ? JSON.parse(raw) : {}) as T;
}

function sendJson(response: Parameters<Parameters<typeof createServer>[0]>[1], status: number, body: unknown) {
  response.writeHead(status, {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS",
  });
  response.end(JSON.stringify(body));
}

// This dev server mirrors the future backend runtime contract so the frontend
// can exercise the remote transport path before the real service exists.
const server = createServer(async (request, response) => {
  if (!request.url) {
    sendJson(response, 400, { error: "Missing request URL." });
    return;
  }

  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  try {
    if (request.method === "GET" && request.url === "/api/runtime/session") {
      sendJson(response, 200, await loadSnapshot());
      return;
    }

    if (request.method === "GET" && request.url === "/api/runtime/health") {
      sendJson(response, 200, {
        ok: true,
        transport: "remote_runtime",
        sessionPath: SESSION_PATH,
      });
      return;
    }

    if (request.method === "POST" && request.url === "/api/runtime/dispatch") {
      const body = await parseJsonBody<DispatchRequestBody>(request);

      if (!body.action || !body.expectedRunId) {
        sendJson(response, 400, { error: "Dispatch requires action and expectedRunId." });
        return;
      }

      const currentSnapshot = await loadSnapshot();
      if (currentSnapshot.session.run.run_id !== body.expectedRunId) {
        sendJson(response, 409, {
          error: "Client run is stale. Hydrate a fresh snapshot before dispatching.",
        });
        return;
      }

      const session = applyGoalLifecycleAction(currentSnapshot.session, body.action);
      const snapshot = await saveSnapshot({
        session,
        persistence: currentSnapshot.persistence,
      });

      sendJson(response, 200, snapshot);
      return;
    }

    if (request.method === "POST" && request.url === "/api/runtime/reset") {
      const snapshot = await saveSnapshot(createSeedSnapshot());
      sendJson(response, 200, snapshot);
      return;
    }

    sendJson(response, 404, { error: "Runtime endpoint not found." });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "Runtime server failed.",
    });
  }
});

server.listen(PORT, () => {
  process.stdout.write(`Runtime server listening on http://localhost:${PORT}/api/runtime\n`);
});
