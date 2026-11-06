import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [newChatRequest, setNewChatRequest] = useState(0);
  const [configVersion, setConfigVersion] = useState(0);
  const initializedSessionRef = useRef(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return 240;
    try {
      const saved = localStorage.getItem('aix:sidebar-width');
      const n = saved ? Number(saved) : 240;
      return Number.isFinite(n) && n >= 180 && n <= 420 ? n : 240;
    } catch {
      return 240;
    }
  });

  const [drawerWidth, setDrawerWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return 440;
    try {
      const saved = localStorage.getItem('aix:drawer-width');
      const n = saved ? Number(saved) : 440;
      return Number.isFinite(n) && n >= 320 && n <= 800 ? n : 440;
    } catch {
      return 440;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('aix:sidebar-width', String(sidebarWidth));
    } catch {}
  }, [sidebarWidth]);

  useEffect(() => {
    try {
      localStorage.setItem('aix:drawer-width', String(drawerWidth));
    } catch {}
  }, [drawerWidth]);

  const handleSidebarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;
    const onMouseMove = (ev: MouseEvent) => {
      const nextWidth = Math.min(Math.max(startWidth + (ev.clientX - startX), 180), 420);
      setSidebarWidth(nextWidth);
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleDrawerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = drawerWidth;
    const onMouseMove = (ev: MouseEvent) => {
      const delta = startX - ev.clientX;
      const maxAllowed = Math.max(340, window.innerWidth - sidebarWidth - 280);
      const nextWidth = Math.min(Math.max(startWidth + delta, 320), Math.min(800, maxAllowed));
      setDrawerWidth(nextWidth);
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const sessionListRequestRef = useRef(0);
  const refreshData = useCallback(() => {
    if (typeof window !== 'undefined' && window.aixAPI) {
      const request = ++sessionListRequestRef.current;
      window.aixAPI.listSessions().then((listed) => {
        if (request === sessionListRequestRef.current) setSessions(listed);
      }).catch(console.error);
      window.aixAPI.getStatus().then(setStatus).catch(console.error);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);
  useEffect(() => {
    const first = sessions[0];
    if (!initializedSessionRef.current && first) {
      initializedSessionRef.current = true;
      setActiveSessionId(first.id);
    }
  }, [sessions]);

  useEffect(() => window.aixAPI.onSpineEvent((event) => {
    if (event.type === 'phase') {
      setSessions((listed) => listed.map((session) => session.id === event.sessionId
        ? { ...session, phase: event.phase, isRunning: true } : session));
    } else if (event.type === 'artifacts' || event.type === 'complete' || event.type === 'error' || event.type === 'aborted') {
      refreshData();
    }
  }), [refreshData]);

  const handleSessionChange = useCallback((id: string | null) => {
    initializedSessionRef.current = true;
    setActiveSessionId(id);
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
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onNewTask={() => {
          setCurrentTab('chat');
          initializedSessionRef.current = true;
          setNewChatRequest((request) => request + 1);
        }}
        status={status}
        width={sidebarWidth}
      />
      {/* Sidebar resizer */}
      <div
        role="separator"
        tabIndex={0}
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        aria-valuenow={sidebarWidth}
        aria-valuemin={180}
        aria-valuemax={420}
        onMouseDown={handleSidebarMouseDown}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setSidebarWidth((w) => Math.max(180, w - 16));
          if (e.key === 'ArrowRight') setSidebarWidth((w) => Math.min(420, w + 16));
        }}
        className="w-1 shrink-0 cursor-col-resize hover:bg-blue-500/50 active:bg-blue-500 transition-colors z-30 select-none relative focus-visible:outline-none focus-visible:bg-blue-500"
      />
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 min-h-0 min-w-0 flex overflow-hidden">
          <main className="flex-1 min-w-0 min-h-0 overflow-y-auto">
            <div className={currentTab === 'chat' ? 'h-full min-w-0 flex flex-col' : 'hidden'}>
              <ErrorBoundary label="Agent Chat Canvas">
                <ChatCanvas
                  sessions={sessions}
                  activeSessionId={activeSessionId}
                  onOpenArtifact={handleOpenArtifact}
                  onRefreshSessions={refreshData}
                  onSessionChange={handleSessionChange}
                  onToggleDrawer={handleToggleDrawer}
                  drawerTab={drawerOpen ? (drawerRequest?.tab ?? null) : null}
                  onNavigate={setCurrentTab}
                  newChatRequest={newChatRequest}
                  configVersion={configVersion}
                />
              </ErrorBoundary>
            </div>
            <ErrorBoundary label={currentTab}>
              {currentTab === 'skills' && <SkillsPage />}
              {currentTab === 'memory' && <MemoryPage />}
              {currentTab === 'settings' && <SettingsPage onConfigUpdated={() => {
                refreshData();
                setConfigVersion(version => version + 1);
              }} />}
            </ErrorBoundary>
          </main>
          {/* Drawer resizer */}
          {drawerOpen && (
            <div
              role="separator"
              tabIndex={0}
              aria-orientation="vertical"
              aria-label="Resize inspector drawer"
              aria-valuenow={drawerWidth}
              aria-valuemin={320}
              aria-valuemax={800}
              onMouseDown={handleDrawerMouseDown}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') setDrawerWidth((w) => Math.max(320, w - 16));
                if (e.key === 'ArrowLeft') setDrawerWidth((w) => Math.min(800, w + 16));
              }}
              className="w-1 shrink-0 cursor-col-resize hover:bg-blue-500/50 active:bg-blue-500 transition-colors z-30 select-none relative focus-visible:outline-none focus-visible:bg-blue-500"
            />
          )}
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
              width={drawerWidth}
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
