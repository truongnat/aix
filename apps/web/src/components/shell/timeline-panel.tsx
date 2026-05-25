import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRuntimeStore } from "@/lib/runtime/store";

export function TimelinePanel() {
  const {
    session: { run },
  } = useRuntimeStore();

  return (
    <Card className="min-h-0">
      <CardHeader>
        <CardTitle>Execution timeline</CardTitle>
        <CardDescription>Audit events from the persisted `RunState` stream.</CardDescription>
      </CardHeader>
      <CardContent className="min-h-0">
        <ScrollArea className="h-[360px] pr-4">
          <div className="space-y-4">
            {run.audit_events.map((event, index) => (
              <div key={event.event_id} className="relative rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="absolute left-4 top-4 h-full w-px bg-border/70" aria-hidden={index === run.audit_events.length - 1} />
                <div className="relative ml-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{event.summary}</p>
                      <p className="text-xs text-muted-foreground">{event.event_type}</p>
                    </div>
                    <Badge variant="outline">{new Date(event.created_at_ms).toLocaleTimeString()}</Badge>
                  </div>
                  <pre className="overflow-x-auto rounded-xl bg-secondary/60 p-3 text-xs text-muted-foreground">
                    {JSON.stringify(event.payload, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
