import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import type { NavTab } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { SpinePage } from './pages/SpinePage';
import { SkillsPage } from './pages/SkillsPage';
import { MemoryPage } from './pages/MemoryPage';
import { VerifyPage } from './pages/VerifyPage';
import type { DesktopSystemStatus, DesktopSessionSummary } from '@shared/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [status, setStatus] = useState<DesktopSystemStatus | null>(null);
  const [sessions, setSessions] = useState<readonly DesktopSessionSummary[]>([]);

  useEffect(() => {
    // Only call Electron IPC if window.aixAPI is available
    if (typeof window !== 'undefined' && window.aixAPI) {
      window.aixAPI.getStatus().then(setStatus).catch(console.error);
      window.aixAPI.listSessions().then(setSessions).catch(console.error);
    }
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090a0f] text-slate-200">
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} status={status} />
      <main className="flex-1 overflow-y-auto">
        {currentTab === 'dashboard' && (
          <DashboardPage status={status} sessions={sessions} onNavigate={setCurrentTab} />
        )}
        {currentTab === 'spine' && <SpinePage sessions={sessions} />}
        {currentTab === 'skills' && <SkillsPage />}
        {currentTab === 'memory' && <MemoryPage />}
        {currentTab === 'verify' && <VerifyPage sessions={sessions} />}
      </main>
    </div>
  );
};

export default App;
