import { GoalComposer } from "@/components/shell/goal-composer";
import { Header } from "@/components/shell/header";
import { Sidebar } from "@/components/shell/sidebar";
import { TaskBoard } from "@/components/shell/task-board";
import { TimelinePanel } from "@/components/shell/timeline-panel";
import { VerificationPanel } from "@/components/shell/verification-panel";
import { RuntimeStoreProvider } from "@/lib/runtime/store";

export function App() {
  return (
    <RuntimeStoreProvider>
      <div className="min-h-screen bg-[linear-gradient(180deg,#f3f7fb_0%,#eef3f8_24%,#e9eef3_100%)] text-foreground">
        <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-6">
          <Sidebar />
          <main className="flex min-h-0 flex-col gap-6">
            <Header />
            <GoalComposer />
            <section className="grid min-h-0 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <div className="grid min-h-0 gap-6">
                <TaskBoard />
                <VerificationPanel />
              </div>
              <TimelinePanel />
            </section>
          </main>
        </div>
      </div>
    </RuntimeStoreProvider>
  );
}
