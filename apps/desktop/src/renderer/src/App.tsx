import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { NavTab } from './components/Sidebar';
import { ChatCanvas } from './components/ChatCanvas';
import { InspectorDrawer } from './components/InspectorDrawer';
import type { DrawerTab } from './components/InspectorDrawer';
import { SkillsPage } from './pages/SkillsPage';
import { MemoryPage } from './pages/MemoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { StatusBar } from './components/StatusBar';
import type { DesktopSystemStatus, DesktopSessionSummary } from '@shared/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('chat');
  const [status, setStatus] = useState<DesktopSystemStatus | null>(null);
  const [sessions, setSessions] = useState<readonly DesktopSessionSummary[]>([]);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedArtifact, setSelectedArtifact] = useState<string | null>(null);
  const [drawerRequest, setDrawerRequest] = useState<{ tab: DrawerTab; seq: number } | undefined>(undefined);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(undefined);

  const refreshData = useCallback(() => {
    if (typeof window !== 'undefined' && window.aixAPI) {
      window.aixAPI.listSessions().then(setSessions).catch(console.error);
      window.aixAPI.getStatus().then(setStatus).catch(console.error);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleOpenArtifact = (art: string) => {
    setSelectedArtifact(art);
    setDrawerRequest((prev) => ({ tab: 'artifacts', seq: (prev?.seq ?? 0) + 1 }));
    setDrawerOpen(true);
  };

  const handleToggleDrawer = (tab: DrawerTab) => {
    if (drawerOpen && drawerRequest?.tab === tab) {
      setDrawerOpen(false);
      return;
    }
    setDrawerRequest((prev) => ({ tab, seq: (prev?.seq ?? 0) + 1 }));
    setDrawerOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-slate-200">
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} status={status} />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <div className={currentTab === 'chat' ? 'h-full flex flex-col' : 'hidden'}>
              <ErrorBoundary label="Agent Chat Canvas">
                <ChatCanvas
                  sessions={sessions}
                  onOpenArtifact={handleOpenArtifact}
                  onRefreshSessions={refreshData}
                  onSessionChange={(s) => setActiveSessionId(s ?? undefined)}
                  onToggleDrawer={handleToggleDrawer}
                  drawerTab={drawerOpen ? (drawerRequest?.tab ?? null) : null}
                  onNavigate={setCurrentTab}
                />
              </ErrorBoundary>
            </div>
            <ErrorBoundary label={currentTab}>
              {currentTab === 'skills' && <SkillsPage />}
              {currentTab === 'memory' && <MemoryPage />}
              {currentTab === 'settings' && <SettingsPage onConfigUpdated={refreshData} />}
            </ErrorBoundary>
          </main>
          {/* Right Inspector Drawer */}
          <ErrorBoundary label="Inspector Drawer">
            <InspectorDrawer
              isOpen={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              activeArtifactName={selectedArtifact}
              sessions={sessions}
              status={status}
              onRefreshData={refreshData}
              requestedTab={drawerRequest}
              activeSessionId={activeSessionId}
            />
          </ErrorBoundary>
        </div>

        {/* Global Bottom Status Bar */}
        <StatusBar status={status} onNavigate={setCurrentTab} />
      </div>
    </div>
  );
};

export default App;
