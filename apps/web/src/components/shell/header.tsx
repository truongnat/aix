import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRuntimeStore } from "@/lib/runtime/store";
import { Bell, Command, LoaderCircle, Pause, Play, RotateCcw, Search } from "lucide-react";

export function Header() {
  const {
    session: { run, goalAnalysis, tasks, verificationResults },
    persistence,
    request,
    service,
    dispatch,
  } = useRuntimeStore();
  const completedCount = tasks.filter((task) => task.status === "completed").length;
  const progressLabel = `${completedCount}/${tasks.length} tasks done`;
  const isPaused = run.status === "blocked";
  const persistenceLabel = persistence.lastSavedAtMs
    ? new Date(persistence.lastSavedAtMs).toLocaleTimeString()
    : "not saved yet";
  const isBusy = request.isHydrating || request.isDispatching;

  return (
    <header className="flex flex-col gap-4 rounded-[30px] border border-border/60 bg-background/75 p-5 shadow-sm backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Run status</Badge>
          <Badge variant="warning">{run.status}</Badge>
          <Badge variant="outline">{progressLabel}</Badge>
          <Badge variant={verificationResults.some((result) => !result.ok) ? "danger" : "success"}>
            {verificationResults.some((result) => !result.ok) ? "verification pending" : "verification clear"}
          </Badge>
          <Badge variant="outline">{service.transport}</Badge>
          {isBusy ? (
            <Badge variant="outline">
              <LoaderCircle className="size-3 animate-spin" />
              {request.isHydrating ? "hydrating" : request.pendingAction}
            </Badge>
          ) : null}
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Local control room for goal-driven delivery
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {goalAnalysis.summary}
        </p>
        <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
          {persistence.hydratedFromStorage ? "Resumed from local checkpoint" : "Running from fresh local session"} · saved {persistenceLabel}
        </p>
        {request.lastError ? (
          <p className="mt-2 text-sm text-red-600">{request.lastError}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-[220px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search runs, tasks, evidence..." />
        </div>
        <Button variant="outline">
          <Command className="size-4" />
          Command palette
        </Button>
        <Button
          variant="outline"
          onClick={() => dispatch({ type: isPaused ? "resume_run" : "pause_run" })}
          disabled={isBusy}
        >
          {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
          {isPaused ? "Resume run" : "Pause run"}
        </Button>
        <Button variant="outline" onClick={() => dispatch({ type: "force_replan" })} disabled={isBusy}>
          <RotateCcw className="size-4" />
          Force replan
        </Button>
        <Button variant="outline" onClick={() => dispatch({ type: "reset_run" })} disabled={isBusy}>
          Reset local run
        </Button>
        <Button size="icon" variant="ghost" aria-label="Notifications">
          <Bell className="size-5" />
        </Button>
      </div>
    </header>
  );
}
