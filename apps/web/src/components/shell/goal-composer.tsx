import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useRuntimeStore } from "@/lib/runtime/store";
import { ArrowRight, ShieldAlert } from "lucide-react";

export function GoalComposer() {
  const {
    session: { goalSpec, run },
    request,
    dispatch,
  } = useRuntimeStore();
  const [input, setInput] = useState(goalSpec.raw_input);
  const isBusy = request.isHydrating || request.isDispatching;

  useEffect(() => {
    setInput(goalSpec.raw_input);
  }, [goalSpec.raw_input]);

  return (
    <Card className="border-primary/15 bg-[radial-gradient(circle_at_top_left,rgba(40,196,255,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.94),rgba(245,247,250,0.94))]">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <Badge variant="secondary">/goal composer</Badge>
          <CardTitle className="mt-3 text-xl">Drive the loop from one explicit goal</CardTitle>
          <CardDescription className="mt-2 max-w-2xl">
            The local UI accepts a goal, normalizes it into runtime contracts, then pushes it through analysis, planning, implementation, and verification.
          </CardDescription>
        </div>
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <div className="flex items-center gap-2 font-medium">
            <ShieldAlert className="size-4" />
            Harness stays in control
          </div>
          <p className="mt-1 text-xs text-amber-800/80">Doctor, budget, dirty-tree, and verification gates stay outside the chat loop.</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea value={input} onChange={(event) => setInput(event.target.value)} />
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            onClick={() => {
              dispatch({ type: "submit_goal", input });
            }}
            disabled={isBusy || input.trim().length === 0}
          >
            Commit goal to run state
            <ArrowRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setInput(goalSpec.raw_input);
            }}
            disabled={isBusy}
          >
            Sync from run
          </Button>
          <Badge variant="warning">Phase: {run.current_phase}</Badge>
          <Badge variant="outline">Risk: {goalSpec.risk_level}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
