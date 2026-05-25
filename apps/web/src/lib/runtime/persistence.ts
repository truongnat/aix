import type { RunSession } from "@/lib/runtime/types";

const STORAGE_KEY = "agentic-sdlc.local-control-room.session";
const STORAGE_VERSION = 1;

interface RuntimeSnapshot {
  version: number;
  saved_at_ms: number;
  session: RunSession;
}

export interface RuntimePersistenceState {
  hydratedFromStorage: boolean;
  lastSavedAtMs: number | null;
}

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isRunSession(value: unknown): value is RunSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Partial<RunSession>;
  return Boolean(
    session.run &&
      session.goalSpec &&
      session.goalAnalysis &&
      Array.isArray(session.tasks) &&
      Array.isArray(session.verificationResults),
  );
}

export function loadPersistedSession(): {
  session: RunSession | null;
  persistence: RuntimePersistenceState;
} {
  if (!isBrowser()) {
    return {
      session: null,
      persistence: {
        hydratedFromStorage: false,
        lastSavedAtMs: null,
      },
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        session: null,
        persistence: {
          hydratedFromStorage: false,
          lastSavedAtMs: null,
        },
      };
    }

    const parsed = JSON.parse(raw) as Partial<RuntimeSnapshot>;
    if (
      parsed.version !== STORAGE_VERSION ||
      typeof parsed.saved_at_ms !== "number" ||
      !isRunSession(parsed.session)
    ) {
      return {
        session: null,
        persistence: {
          hydratedFromStorage: false,
          lastSavedAtMs: null,
        },
      };
    }

    return {
      session: parsed.session,
      persistence: {
        hydratedFromStorage: true,
        lastSavedAtMs: parsed.saved_at_ms,
      },
    };
  } catch {
    return {
      session: null,
      persistence: {
        hydratedFromStorage: false,
        lastSavedAtMs: null,
      },
    };
  }
}

// Keep persistence logic isolated so the runtime store can swap this adapter
// for a real backend checkpoint service later without touching UI components.
export function persistSession(session: RunSession): RuntimePersistenceState {
  if (!isBrowser()) {
    return {
      hydratedFromStorage: false,
      lastSavedAtMs: null,
    };
  }

  const snapshot: RuntimeSnapshot = {
    version: STORAGE_VERSION,
    saved_at_ms: Date.now(),
    session,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));

  return {
    hydratedFromStorage: true,
    lastSavedAtMs: snapshot.saved_at_ms,
  };
}

export function clearPersistedSession(): RuntimePersistenceState {
  if (!isBrowser()) {
    return {
      hydratedFromStorage: false,
      lastSavedAtMs: null,
    };
  }

  window.localStorage.removeItem(STORAGE_KEY);

  return {
    hydratedFromStorage: false,
    lastSavedAtMs: null,
  };
}
