import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createSeedSession } from "@/lib/runtime/engine";
import { resolveRuntimeService, RuntimeServiceError } from "@/lib/runtime/service";
import type {
  GoalLifecycleAction,
  RuntimeRequestState,
  RuntimeServiceMetadata,
  RuntimeStoreSnapshot,
  RunSession,
} from "@/lib/runtime/types";
import type { Dispatch, ReactNode } from "react";

interface RuntimeStoreValue {
  session: RunSession;
  persistence: RuntimeStoreSnapshot["persistence"];
  request: RuntimeRequestState;
  service: RuntimeServiceMetadata;
  dispatch: Dispatch<GoalLifecycleAction>;
}

const RuntimeStoreContext = createContext<RuntimeStoreValue | null>(null);
const runtimeService = resolveRuntimeService();

function createInitialSnapshot(): RuntimeStoreSnapshot {
  return {
    session: createSeedSession(),
    persistence: {
      hydratedFromStorage: false,
      lastSavedAtMs: null,
    },
  };
}

function createInitialRequestState(): RuntimeRequestState {
  return {
    isHydrating: true,
    isDispatching: false,
    pendingAction: null,
    lastError: null,
  };
}

function requestIdleState(lastError: string | null = null): RuntimeRequestState {
  return {
    isHydrating: false,
    isDispatching: false,
    pendingAction: null,
    lastError,
  };
}

export function RuntimeStoreProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState(createInitialSnapshot);
  const [request, setRequest] = useState(createInitialRequestState);
  const snapshotRef = useRef(snapshot);

  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const nextSnapshot = await runtimeService.hydrate();
        if (cancelled) {
          return;
        }
        setSnapshot(nextSnapshot);
        setRequest(requestIdleState());
      } catch (error) {
        if (cancelled) {
          return;
        }
        setRequest(
          requestIdleState(
            error instanceof Error ? error.message : "Failed to hydrate runtime service.",
          ),
        );
      }
    }

    hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  const dispatch: Dispatch<GoalLifecycleAction> = (action) => {
    setRequest((current) => ({
      ...current,
      isDispatching: true,
      pendingAction: action.type,
      lastError: null,
    }));

    void runtimeService
      .dispatch(snapshotRef.current, action)
      .then((nextSnapshot) => {
        setSnapshot(nextSnapshot);
        setRequest(requestIdleState());
      })
      .catch(async (error) => {
        if (error instanceof RuntimeServiceError && error.status === 409) {
          try {
            const refreshedSnapshot = await runtimeService.hydrate();
            setSnapshot(refreshedSnapshot);
            setRequest(
              requestIdleState(
                "Runtime state changed elsewhere. The latest snapshot was reloaded automatically.",
              ),
            );
            return;
          } catch (hydrateError) {
            setRequest(
              requestIdleState(
                hydrateError instanceof Error
                  ? hydrateError.message
                  : "Runtime dispatch conflicted and refresh failed.",
              ),
            );
            return;
          }
        }

        setRequest(
          requestIdleState(
            error instanceof Error ? error.message : "Runtime dispatch failed.",
          ),
        );
      });
  };

  const value = useMemo(
    () => ({
      session: snapshot.session,
      persistence: snapshot.persistence,
      request,
      service: runtimeService.metadata,
      dispatch,
    }),
    [request, snapshot],
  );

  return <RuntimeStoreContext.Provider value={value}>{children}</RuntimeStoreContext.Provider>;
}

export function useRuntimeStore() {
  const context = useContext(RuntimeStoreContext);
  if (!context) {
    throw new Error("useRuntimeStore must be used within RuntimeStoreProvider");
  }
  return context;
}
