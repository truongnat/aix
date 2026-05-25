import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRuntimeStore } from "@/lib/runtime/store";
import { Bot, CheckCircle2, Flag, Pause, Play, ShieldCheck, Sparkles } from "lucide-react";

const navItems = [
  { label: "Goal Thread", hint: "Current run", icon: Flag },
  { label: "Timeline", hint: "Audit + events", icon: Sparkles },
  { label: "Tasks", hint: "Execution units", icon: CheckCircle2 },
  { label: "Harness", hint: "Gates + policy", icon: ShieldCheck },
];

export function Sidebar() {
  const {
    session: { run, goalSpec, tasks, verificationResults },
    request,
    service,
    dispatch,
  } = useRuntimeStore();
  const completedCount = tasks.filter((task) => task.status === "completed").length;
  const isPaused = run.status === "blocked";
  const isBusy = request.isHydrating || request.isDispatching;

  return (
    <aside className="flex min-h-0 flex-col gap-5">
      <Card className="overflow-hidden bg-[linear-gradient(160deg,rgba(15,23,42,0.94),rgba(18,52,86,0.92))] text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge className="bg-white/12 text-white" variant="outline">
              Local Control Room
            </Badge>
            <Bot className="size-5 text-cyan-200" />
          </div>
          <CardTitle className="text-white">Agentic SDLC</CardTitle>
          <CardDescription className="text-slate-200">
            Goal-driven execution with a visible harness layer and resumable state.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/70">Active run</p>
            <p className="mt-2 text-sm font-medium">{run.run_id}</p>
            <p className="mt-1 text-sm text-slate-200">{goalSpec.normalized_goal}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="border-white/15 bg-white/10 text-white" variant="outline">
                {completedCount}/{tasks.length} tasks complete
              </Badge>
              <Badge
                className="border-white/15 bg-white/10 text-white"
                variant="outline"
              >
                {verificationResults.filter((result) => !result.ok).length} active findings
              </Badge>
              <Badge className="border-white/15 bg-white/10 text-white" variant="outline">
                adapter: {service.adapterId}
              </Badge>
            </div>
          </div>
          <Button
            className="w-full justify-between bg-white text-slate-900 hover:bg-cyan-50"
            onClick={() => dispatch({ type: isPaused ? "resume_run" : "pause_run" })}
            disabled={isBusy}
          >
            {isPaused ? "Resume run" : "Pause run"}
            {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Navigation</CardTitle>
          <CardDescription>UI shell for the LangGraph rebuild direction.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className="flex w-full items-center justify-between rounded-2xl border border-transparent bg-secondary/50 px-4 py-3 text-left transition hover:border-border hover:bg-secondary"
                type="button"
              >
                <span className="flex items-center gap-3">
                  <span className="rounded-xl bg-background p-2 shadow-sm">
                    <Icon className="size-4 text-foreground" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="block text-xs text-muted-foreground">{item.hint}</span>
                  </span>
                </span>
                <Badge variant={index === 0 ? "success" : "outline"}>{index === 0 ? "Live" : "Soon"}</Badge>
              </button>
            );
          })}
        </CardContent>
      </Card>
    </aside>
  );
}
