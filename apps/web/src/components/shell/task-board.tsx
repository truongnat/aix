import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRuntimeStore } from "@/lib/runtime/store";
import { RotateCcw, ShieldCheck, StopCircle } from "lucide-react";

function statusVariant(status: string) {
  switch (status) {
    case "running":
      return "warning";
    case "completed":
      return "success";
    case "failed":
    case "blocked":
      return "danger";
    default:
      return "outline";
  }
}

export function TaskBoard() {
  const {
    session: { tasks, run },
    request,
    dispatch,
  } = useRuntimeStore();
  const isBusy = request.isHydrating || request.isDispatching;

  return (
    <Card className="min-h-0">
      <CardHeader>
        <CardTitle>Task board</CardTitle>
        <CardDescription>Atomic execution units derived from the verified plan.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.map((task, index) => (
          <div key={task.task_id} className="rounded-[24px] border border-border/60 bg-background/70 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant(task.status)}>{task.status}</Badge>
                  <Badge variant="outline">{task.phase}</Badge>
                </div>
                <div>
                  <h3 className="text-base font-semibold">{task.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{task.objective}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch({ type: "retry_task", taskId: task.task_id })}
                  disabled={
                    isBusy ||
                    (task.status !== "failed" &&
                      task.status !== "blocked" &&
                      task.status !== "verifying")
                  }
                >
                  <RotateCcw className="size-4" />
                  Retry
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    dispatch({
                      type: task.status === "running" ? "verify_task" : "start_task",
                      taskId: task.task_id,
                    })
                  }
                  disabled={isBusy || task.status === "completed" || task.status === "verifying"}
                >
                  <StopCircle className="size-4" />
                  {task.status === "running" ? "Verify" : "Run"}
                </Button>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Validation commands</p>
                <ul className="mt-2 space-y-2 text-sm">
                  {task.validation_commands.map((command) => (
                    <li key={command} className="rounded-xl bg-secondary/60 px-3 py-2 font-mono text-xs">
                      {command}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Done criteria</p>
                <ul className="mt-2 space-y-2 text-sm">
                  {task.done_criteria.map((criterion) => (
                    <li key={criterion} className="flex items-start gap-2">
                      <ShieldCheck className="mt-0.5 size-4 text-primary" />
                      <span>{criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {task.task_id === run.current_task_id ? (
              <p className="mt-4 text-xs font-medium uppercase tracking-[0.24em] text-primary">
                Current task
              </p>
            ) : null}
            {index < tasks.length - 1 ? <Separator className="mt-5" /> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
