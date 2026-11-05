import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import type { NavTab } from './components/Sidebar';
import { ChatCanvas } from './components/ChatCanvas';
import { InspectorDrawer } from './components/InspectorDrawer';
import { DashboardPage } from './pages/DashboardPage';
import { SpinePage } from './pages/SpinePage';
import { SkillsPage } from './pages/SkillsPage';
import { MemoryPage } from './pages/MemoryPage';
import { VerifyPage } from './pages/VerifyPage';
import { SettingsPage } from './pages/SettingsPage';
import { StatusBar } from './components/StatusBar';
import type { DesktopSystemStatus, DesktopSessionSummary } from '@shared/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('chat');
  const [status, setStatus] = useState<DesktopSystemStatus | null>(null);
  const [sessions, setSessions] = useState<readonly DesktopSessionSummary[]>([]);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedArtifact, setSelectedArtifact] = useState<string | null>(null);

  const refreshData = () => {
    if (typeof window !== 'undefined' && window.aixAPI) {
      window.aixAPI.listSessions().then(setSessions).catch(console.error);
      window.aixAPI.getStatus().then(setStatus).catch(console.error);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleOpenArtifact = (art: string) => {
    setSelectedArtifact(art);
    setDrawerOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090a0f] text-slate-200 select-none">
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} status={status} />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {currentTab === 'chat' && (
              <ChatCanvas
                sessions={sessions}
                onOpenArtifact={handleOpenArtifact}
                onRefreshSessions={refreshData}
              />
            )}
            {currentTab === 'dashboard' && (
              <DashboardPage status={status} sessions={sessions} onNavigate={setCurrentTab} />
            )}
            {currentTab === 'spine' && <SpinePage sessions={sessions} onRefreshSessions={refreshData} />}
            {currentTab === 'skills' && <SkillsPage />}
            {currentTab === 'memory' && <MemoryPage />}
            {currentTab === 'verify' && <VerifyPage sessions={sessions} />}
            {currentTab === 'settings' && <SettingsPage onConfigUpdated={refreshData} />}
          </main>

          {/* Right Inspector Drawer */}
          <InspectorDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            activeArtifactName={selectedArtifact}
            sessions={sessions}
            status={status}
            onRefreshData={refreshData}
          />
        </div>

        {/* Global Bottom Status Bar */}
        <StatusBar status={status} onNavigate={setCurrentTab} />
      </div>
    </div>
  );
};

export default App;
