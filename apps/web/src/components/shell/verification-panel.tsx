import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRuntimeStore } from "@/lib/runtime/store";
import { AlertTriangle, CheckCheck, RefreshCcw } from "lucide-react";

export function VerificationPanel() {
  const {
    session: { verificationResults },
    request,
    dispatch,
  } = useRuntimeStore();
  const isBusy = request.isHydrating || request.isDispatching;

  return (
    <Card className="min-h-0">
      <CardHeader>
        <CardTitle>Verification panel</CardTitle>
        <CardDescription>Decisions exposed directly from the verification contract.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {verificationResults.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-border/70 bg-secondary/30 p-6 text-sm text-muted-foreground">
            No verification findings yet. Start or verify a task to populate the repair and evidence loop.
          </div>
        ) : null}
        {verificationResults.map((result) => (
          <div key={result.verification_id} className="rounded-[24px] border border-border/60 bg-background/70 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={result.ok ? "success" : "danger"}>{result.ok ? "pass" : "action required"}</Badge>
                  <Badge variant="outline">{result.decision}</Badge>
                </div>
                <h3 className="mt-3 text-base font-semibold">{result.task_id}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{result.findings.join(" ")}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch({ type: "retry_task", taskId: result.task_id })}
                  disabled={isBusy || !result.retryable}
                >
                  <RefreshCcw className="size-4" />
                  Retry task
                </Button>
                <Button
                  size="sm"
                  onClick={() => dispatch({ type: "approve_repair", taskId: result.task_id })}
                  disabled={isBusy || result.ok}
                >
                  <CheckCheck className="size-4" />
                  Approve repair
                </Button>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-secondary/60 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="size-4 text-amber-600" />
                Evidence
              </div>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {result.evidence.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
