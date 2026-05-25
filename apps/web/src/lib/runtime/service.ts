import { applyGoalLifecycleAction, createSeedSession } from "@/lib/runtime/engine";
import {
  clearPersistedSession,
  loadPersistedSession,
  persistSession,
} from "@/lib/runtime/persistence";
import type {
  GoalLifecycleAction,
  RuntimeServiceMetadata,
  RuntimeStoreSnapshot,
} from "@/lib/runtime/types";

export interface RuntimeService {
  readonly metadata: RuntimeServiceMetadata;
  hydrate(): Promise<RuntimeStoreSnapshot>;
  dispatch(
    snapshot: RuntimeStoreSnapshot,
    action: GoalLifecycleAction,
  ): Promise<RuntimeStoreSnapshot>;
  reset(): Promise<RuntimeStoreSnapshot>;
}

export class RuntimeServiceError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "RuntimeServiceError";
    this.status = status;
  }
}

interface RemoteDispatchRequest {
  action: GoalLifecycleAction;
  expectedRunId: string;
}

interface RuntimeServiceErrorShape {
  error?: string;
}

function configuredTransport(): RuntimeServiceMetadata["transport"] {
  if (import.meta.env.VITE_RUNTIME_TRANSPORT === "remote") {
    return "remote_runtime";
  }

  return "local_checkpoint";
}

function configuredBaseUrl() {
  return import.meta.env.VITE_RUNTIME_BASE_URL?.trim() || "/api/runtime";
}

function createLocalSnapshot(session = createSeedSession()): RuntimeStoreSnapshot {
  return {
    session,
    persistence: persistSession(session),
  };
}

function isRuntimeStoreSnapshot(value: unknown): value is RuntimeStoreSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const snapshot = value as Partial<RuntimeStoreSnapshot>;
  return Boolean(
    snapshot.session &&
      snapshot.persistence &&
      typeof snapshot.persistence.hydratedFromStorage === "boolean",
  );
}

async function parseRuntimeResponse(response: Response): Promise<RuntimeStoreSnapshot> {
  const parsed = (await response.json()) as RuntimeStoreSnapshot | RuntimeServiceErrorShape;

  if (!response.ok) {
    const message =
      "error" in parsed && typeof parsed.error === "string"
        ? parsed.error
        : `Runtime request failed with status ${response.status}.`;
    throw new RuntimeServiceError(message, response.status);
  }

  if (!isRuntimeStoreSnapshot(parsed)) {
    throw new Error("Runtime service returned an invalid snapshot payload.");
  }

  return parsed;
}

async function postJson<TBody>(url: string, body: TBody): Promise<RuntimeStoreSnapshot> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return parseRuntimeResponse(response);
}

class LocalCheckpointRuntimeService implements RuntimeService {
  readonly metadata: RuntimeServiceMetadata = {
    adapterId: "local-checkpoint-runtime",
    transport: "local_checkpoint",
    capabilities: ["hydrate", "persist", "dispatch", "reset"],
  };

  async hydrate(): Promise<RuntimeStoreSnapshot> {
    const persisted = loadPersistedSession();
    if (persisted.session) {
      return {
        session: persisted.session,
        persistence: persisted.persistence,
      };
    }

    return createLocalSnapshot();
  }

  async dispatch(
    snapshot: RuntimeStoreSnapshot,
    action: GoalLifecycleAction,
  ): Promise<RuntimeStoreSnapshot> {
    if (action.type === "reset_run") {
      return this.reset();
    }

    const session = applyGoalLifecycleAction(snapshot.session, action);
    return {
      session,
      persistence: persistSession(session),
    };
  }

  async reset(): Promise<RuntimeStoreSnapshot> {
    clearPersistedSession();
    return createLocalSnapshot();
  }
}

class RemoteRuntimeHttpService implements RuntimeService {
  private readonly baseUrl = configuredBaseUrl();

  readonly metadata: RuntimeServiceMetadata = {
    adapterId: "remote-runtime-http",
    transport: "remote_runtime",
    capabilities: ["hydrate", "dispatch", "reset"],
  };

  async hydrate(): Promise<RuntimeStoreSnapshot> {
    const response = await fetch(`${this.baseUrl}/session`);
    return parseRuntimeResponse(response);
  }

  async dispatch(
    snapshot: RuntimeStoreSnapshot,
    action: GoalLifecycleAction,
  ): Promise<RuntimeStoreSnapshot> {
    return postJson<RemoteDispatchRequest>(`${this.baseUrl}/dispatch`, {
      action,
      expectedRunId: snapshot.session.run.run_id,
    });
  }

  async reset(): Promise<RuntimeStoreSnapshot> {
    return postJson(`${this.baseUrl}/reset`, {});
  }
}

export function resolveRuntimeService(): RuntimeService {
  return configuredTransport() === "remote_runtime"
    ? new RemoteRuntimeHttpService()
    : new LocalCheckpointRuntimeService();
}
