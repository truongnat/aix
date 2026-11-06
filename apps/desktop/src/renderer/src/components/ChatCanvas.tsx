import React, { useState, useEffect, useRef, useLayoutEffect, useId } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Square,
  Layers,
  Brain,
  ChevronDown,
  ChevronRight,
  Check,
  Loader2,
  XCircle,
  CircleSlash,
  FileCode2,
  ShieldCheck,
  Server,
  ShieldAlert,
  Settings2,
  CornerDownLeft,
  Plus,
} from 'lucide-react';
import type {
  DesktopSessionSummary,
  DesktopHitlRequest,
  DesktopSpineEvent,
  DesktopAiConfig,
  DesktopModelSource,
  DesktopChatMessage,
} from '@shared/api';
import type { Phase } from '@x/core';
import { MarkdownRenderer } from './MarkdownRenderer';
import { PIPELINE_STEPS } from './pipeline-steps';
import { PROVIDERS } from '../pages/SettingsPage';
import type { DrawerTab } from './InspectorDrawer';
import type { NavTab } from './Sidebar';
import { ConfirmDialog } from './ui/Modal';
import { Select } from './ui/Select';
import { sessionTitleFromTask, hasModelCredentials } from '@shared/desktop-logic';

type RunStatus = 'running' | 'done' | 'error' | 'stopped';
type StepStatus = 'pending' | 'active' | 'done' | 'failed' | 'stopped' | 'skipped';

interface ChatMessage {
  readonly id: string;
  readonly role: 'user' | 'assistant';
  readonly content: string;
  readonly startedAt: number;
  readonly endedAt?: number;
  readonly status?: RunStatus;
  readonly modelLabel?: string;
  readonly phase?: Phase;
  readonly logs?: readonly { message: string; timestamp: string }[];
  readonly artifacts?: readonly string[];
  readonly generatedFilesCount?: number;
  readonly activeNode?: string;
  readonly outputDir?: string;
}

interface ChatCanvasProps {
  sessions: readonly DesktopSessionSummary[];
  activeSessionId?: string | null;
  onOpenArtifact: (artifact: string) => void;
  onRefreshSessions?: () => void;
  onSessionChange?: (sessionId: string | null) => void;
  onToggleDrawer: (tab: DrawerTab) => void;
  drawerTab: DrawerTab | null;
  onNavigate: (tab: NavTab) => void;
  newChatRequest: number;
  configVersion: number;
}

const QUICK_PROMPTS = [
  'Create a Node.js todo CLI with JSON file storage',
  'Generate a standalone FastAPI service with a health endpoint',
  'Build a TypeScript utility package with usage examples',
  'Create a responsive React page for a personal reading list',
];


const DRAWER_TOGGLES: readonly { tab: DrawerTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { tab: 'artifacts', label: 'Artifacts', icon: FileCode2 },
  { tab: 'verify', label: 'Run tests / Verify', icon: ShieldCheck },
  { tab: 'kb', label: 'KB Server', icon: Server },
];

const formatClock = (ms: number) =>
  new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const formatElapsed = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
};

const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

const modelLabelFor = (cfg: DesktopAiConfig | null) => {
  if (!cfg) return 'Loading model…';
  const p = PROVIDERS.find((x) => x.id === cfg.provider);
  return `${p?.icon ?? '◆'} ${p?.name ?? cfg.provider} · ${cfg.model}`;
};

function stepStatuses(msg: ChatMessage): StepStatus[] {
  return PIPELINE_STEPS.map((step, index) => {
    if (step.id === 'worktree' || step.id === 'tdd') return 'skipped';
    if (index !== 6 && step.artifact && msg.artifacts?.includes(step.artifact)) return 'done';
    if (index === 4 && msg.status === 'done' && (msg.generatedFilesCount ?? 0) > 0) return 'done';
    const active = (index === 0 && msg.phase === 'discuss')
      || (index === 1 && msg.phase === 'plan')
      || (index === 4 && msg.activeNode === 'coder')
      || (index === 5 && msg.activeNode === 'reviewer');
    if (!active || msg.status === 'done') return 'pending';
    return msg.status === 'error' ? 'failed' : msg.status === 'stopped' ? 'stopped' : 'active';
  });
}

const StepStatusIcon: React.FC<{ status: StepStatus }> = ({ status }) => {
  if (status === 'done') return <Check className="w-3 h-3 text-emerald-400" />;
  if (status === 'active') return <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />;
  if (status === 'failed') return <XCircle className="w-3 h-3 text-rose-400" />;
  if (status === 'stopped') return <CircleSlash className="w-3 h-3 text-amber-400" />;
  if (status === 'skipped') return <CircleSlash className="w-3 h-3 text-slate-500" aria-label="Not executed" />;
  return <span className="w-1.5 h-1.5 rounded-full bg-white/15" />;
};

const SpineStepCards = React.memo<{ msg: ChatMessage; onOpenArtifact: (a: string) => void }>(({
  msg,
  onOpenArtifact,
}) => {
  const statuses = stepStatuses(msg);
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-1.5">
      {PIPELINE_STEPS.map((step, i) => {
        const Icon = step.icon;
        const status = statuses[i] ?? 'pending';
        const artifact = step.artifact && msg.artifacts?.includes(step.artifact) ? step.artifact : null;
        return (
          <button
            key={i}
            type="button"
            disabled={!artifact}
            onClick={() => artifact && onOpenArtifact(artifact)}
            title={artifact ? `Open ${artifact}` : undefined}
            className={`text-left px-2.5 py-2 rounded-lg border transition-colors ${
              status === 'active'
                ? 'border-blue-500/30 bg-blue-500/[0.06]'
                : status === 'failed'
                  ? 'border-rose-500/25 bg-rose-500/[0.04]'
                  : status === 'stopped'
                    ? 'border-amber-500/25 bg-amber-500/[0.04]'
                    : 'border-white/5 bg-white/[0.015]'
            } ${artifact ? 'hover:border-white/15 cursor-pointer' : 'cursor-default'}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 min-w-0">
                <Icon className={`w-3.5 h-3.5 shrink-0 ${status === 'pending' ? 'text-slate-500' : 'text-slate-300'}`} aria-hidden="true" />
                <span className={`text-[12px] font-medium truncate ${status === 'pending' ? 'text-slate-400' : 'text-slate-200'}`}>
                  {i + 1}. {step.name}
                </span>
              </span>
              <StepStatusIcon status={status} />
            </div>
            <div className="mt-0.5 pl-5 text-[11px] text-slate-400 truncate">
              {step.role}
              {artifact && <span className="text-blue-300"> · {artifact}</span>}
            </div>
          </button>
        );
      })}
    </div>
  );
});

const ReasoningBlock = React.memo<{ msg: ChatMessage; now: number }>(({ msg, now }) => {
  const running = msg.status === 'running';
  const [open, setOpen] = useState<boolean>(running);
  const logs = msg.logs ?? [];
  const elapsed = (msg.endedAt ?? now) - msg.startedAt;

  useEffect(() => {
    if (!running) setOpen(false);
  }, [running]);

  return (
    <div className="rounded-lg border border-white/5 bg-black/20">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-full min-h-9 px-3 py-2 flex items-center gap-2 text-[12px] text-slate-400 hover:text-slate-200 transition-colors"
      >
        {open ? <ChevronDown className="w-3 h-3" aria-hidden="true" /> : <ChevronRight className="w-3 h-3" aria-hidden="true" />}
        <Brain className={`w-3.5 h-3.5 ${running ? 'text-indigo-400 motion-safe:animate-pulse' : 'text-slate-400'}`} aria-hidden="true" />
        <span className="font-medium">{running ? 'Thinking' : 'Reasoning process'}</span>
        <span className="text-slate-500" aria-hidden="true">·</span>
        <span className="font-mono tabular-nums">
          {running ? formatElapsed(elapsed) : `${formatElapsed(elapsed)} total`}
        </span>
        <span className="ml-auto font-mono text-[11px] text-slate-400">{logs.length} events</span>
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 max-h-48 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-0.5 border-t border-white/5">
          {logs.length === 0 && <div className="text-slate-400 pt-1">Waiting for first event…</div>}
          {logs.map((log, li) => (
            <div key={li} className="flex gap-2">
              <span className="text-slate-400 shrink-0">{log.timestamp}</span>
              <span className={log.message.startsWith('ERROR') ? 'text-rose-400' : 'text-slate-400'}>{log.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="px-1 py-px rounded border border-white/10 bg-white/5 font-mono text-[11px] text-slate-300">
    {children}
  </kbd>
);

export const ChatCanvas: React.FC<ChatCanvasProps> = ({
  sessions,
  activeSessionId,
  onOpenArtifact,
  onRefreshSessions,
  onSessionChange,
  onToggleDrawer,
  drawerTab,
  onNavigate,
  newChatRequest,
  configVersion,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isStopping, setIsStopping] = useState<boolean>(false);
  const [confirmRequest, setConfirmRequest] = useState<{
    title: string; message: string; confirmLabel?: string; destructive?: boolean; action: () => void;
  } | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [runMode, setRunMode] = useState<'guided' | 'auto'>('guided');
  const [aiConfig, setAiConfig] = useState<DesktopAiConfig | null>(null);
  const [modelSources, setModelSources] = useState<readonly DesktopModelSource[]>([]);
  const [modelLoading, setModelLoading] = useState(true);
  const [modelMenuOpen, setModelMenuOpen] = useState<boolean>(false);
  const [pendingHitl, setPendingHitl] = useState<DesktopHitlRequest | null>(null);
  const [hitlNote, setHitlNote] = useState<string>('');
  const [now, setNow] = useState<number>(Date.now());

  // Which run the stream belongs to; events from other (e.g. stopped) sessions are ignored.
  const runRef = useRef<{ msgId: string; sessionId: string | null; title: string; active: boolean; stopping: boolean } | null>(null);
  const stoppedSessionsRef = useRef(new Set<string>());
  const hitlCardRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelTriggerRef = useRef<HTMLButtonElement>(null);
  const modelMenuId = useId();
  const hitlNoteId = useId();
  const refreshRef = useRef(onRefreshSessions);
  refreshRef.current = onRefreshSessions;

  useEffect(() => {
    let cancelled = false;
    setModelLoading(true);
    Promise.all([window.aixAPI.getAiConfig(), window.aixAPI.detectModelSources()])
      .then(([config, sources]) => {
        if (!cancelled) { setAiConfig(config); setModelSources(sources); }
      }).catch(console.error)
      .finally(() => { if (!cancelled) setModelLoading(false); });
    return () => { cancelled = true; };
  }, [configVersion]);
  useEffect(() => {
    if (activeSessionId !== undefined && activeSessionId !== currentSessionId) {
      setCurrentSessionId(activeSessionId);
    }
  }, [activeSessionId]);
  useEffect(() => {
    if (!currentSessionId) {
      setMessages([]);
      return;
    }
    // Starting a run already placed its live messages in the canvas.
    if (runRef.current?.active && runRef.current.sessionId === currentSessionId) return;
    let cancelled = false;
    setMessages([]);
    window.aixAPI.getSessionChat(currentSessionId).then((history) => {
      if (!cancelled) setMessages(history as unknown as ChatMessage[]);
    }).catch(console.error);
    return () => { cancelled = true; };
  }, [currentSessionId]);
  const handleScroll = () => {
    const el = timelineRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    setShowScrollBottom(!isAtBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: scrollBehavior() });
    setShowScrollBottom(false);
  };

  useEffect(() => {
    if (!showScrollBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: scrollBehavior() });
    }
  }, [messages, pendingHitl, showScrollBottom]);

  useEffect(() => {
    if (!isRunning) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [isRunning]);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [inputPrompt]);

  const patchRunMessage = (msgId: string, patch: (m: ChatMessage) => ChatMessage) =>
    setMessages((prev) => prev.map((m) => (m.id === msgId ? patch(m) : m)));

  const finishRun = (msgId: string, patch: Partial<ChatMessage>) => {
    const run = runRef.current;
    if (run) run.active = false;
    setIsRunning(false);
    setIsStopping(false);
    setPendingHitl(null);
    setHitlNote('');
    setMessages((prev) => {
      const updated = prev.map((m) => (m.id === msgId ? { ...m, ...patch, endedAt: Date.now() } : m));
      const targetSession = run?.sessionId || currentSessionId;
      if (targetSession) {
        window.aixAPI.saveSessionChat(targetSession, updated as unknown as readonly DesktopChatMessage[]).catch(console.error);
      }
      return updated;
    });
  };

  useEffect(() => {
    if (!window.aixAPI?.onSpineEvent) return;
    return window.aixAPI.onSpineEvent((event: DesktopSpineEvent) => {
      if (stoppedSessionsRef.current.has(event.sessionId)) return;
      const run = runRef.current;
      if (!run?.active || (run.sessionId !== null && run.sessionId !== event.sessionId)) return;
      if (run.stopping && !['complete', 'error', 'aborted'].includes(event.type)) return;
      const { msgId } = run;

      switch (event.type) {
        case 'log':
          patchRunMessage(msgId, (m) => ({
            ...m,
            logs: [...(m.logs ?? []), { message: event.message, timestamp: event.timestamp }].slice(-200),
          }));
          break;
        case 'artifacts':
          patchRunMessage(msgId, (m) => ({ ...m, artifacts: event.artifacts, generatedFilesCount: event.generatedFilesCount }));
          break;
        case 'node':
          patchRunMessage(msgId, (m) => ({ ...m, activeNode: event.node }));
          break;
        case 'phase':
          patchRunMessage(msgId, (m) => ({ ...m, phase: event.phase }));
          break;
        case 'hitl':
          setPendingHitl(event.request);
          break;
        case 'complete':
          finishRun(msgId, {
            status: 'done',
            content: `**Files generated.** ${event.generatedFilesCount} file(s) saved. Tests have not been run. Review the files, then open Inspector → Verify.`,
            artifacts: event.artifacts,
            generatedFilesCount: event.generatedFilesCount,
            outputDir: event.outputDir,
          });
          refreshRef.current?.();
          break;
        case 'error':
          finishRun(msgId, {
            status: 'error',
            content: `**Execution failed.**\n\n\`\`\`\n${event.error}\n\`\`\`\n\nCheck the AI provider configuration or the task prompt.`,
          });
          break;
        case 'aborted':
          finishRun(msgId, { status: 'stopped', content: '**Execution stopped.** The run was cancelled before completion.' });
          refreshRef.current?.();
          break;
      }
    });
  }, []);

  const handleSendMessage = async (text: string) => {
    const prompt = text.trim();
    if (!prompt || isRunning || !modelReady) return;

    setInputPrompt('');
    setIsRunning(true);
    setPendingHitl(null);
    setNow(Date.now());

    const assistantId = crypto.randomUUID();
    runRef.current = { msgId: assistantId, sessionId: null, title: sessionTitleFromTask(prompt), active: true, stopping: false };
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: prompt, startedAt: Date.now() },
      {
        id: assistantId,
        role: 'assistant',
        content: '',
        startedAt: Date.now(),
        status: 'running',
        modelLabel: modelLabelFor(aiConfig),
        logs: [],
      },
    ]);

    try {
      const { sessionId } = await window.aixAPI.startSpine(prompt, runMode);
      const run = runRef.current;
      if (run?.msgId === assistantId && run.active) {
        run.sessionId = sessionId;
        setCurrentSessionId(sessionId);
        onSessionChange?.(sessionId);
        if (run.stopping) {
          const accepted = await window.aixAPI.abortSpine(sessionId);
          if (!accepted) {
            run.stopping = false;
            setIsStopping(false);
            patchRunMessage(assistantId, (message) => ({
              ...message,
              content: '**Stop request was not accepted. The task is still running.**',
            }));
          }
        }
      } else {
        // Stopped before the session id came back: abort it and drop its late events.
        stoppedSessionsRef.current.add(sessionId);
        void window.aixAPI.abortSpine(sessionId);
      }
    } catch (err: unknown) {
      finishRun(assistantId, { status: 'error', content: `**Failed to launch task.**\n\n\`\`\`\n${String(err)}\n\`\`\`` });
    }
  };

  const handleStop = () => {
    const run = runRef.current;
    if (!run?.active || run.stopping) return;
    run.stopping = true;
    setIsStopping(true);
    patchRunMessage(run.msgId, (message) => ({ ...message, content: '**Stopping task… waiting for the engine to reach a safe cancellation point.**' }));
    if (run.sessionId) {
      void window.aixAPI.abortSpine(run.sessionId).then((accepted) => {
        if (accepted) return;
        run.stopping = false;
        setIsStopping(false);
        patchRunMessage(run.msgId, (message) => ({ ...message, content: '**Stop request was not accepted. The task is still running.**' }));
      }).catch((error: unknown) => {
        run.stopping = false;
        setIsStopping(false);
        patchRunMessage(run.msgId, (message) => ({ ...message, content: `**Could not stop task:** ${String(error)}` }));
      });
    }
  };

  const handleNewChat = () => {
    const beginNewChat = () => {
      setCurrentSessionId(null);
      setMessages([]);
      onSessionChange?.(null);
      textareaRef.current?.focus();
    };
    if (isRunning) {
      setConfirmRequest({
        title: 'Stop current task?',
        message: 'A task is currently running. Stop it and start a new task?',
        confirmLabel: 'Stop & start new',
        destructive: true,
        action: () => {
          handleStop();
          beginNewChat();
        },
      });
      return;
    }
    beginNewChat();
  };

  // Sidebar "Launch New Task" goes through the same reset/confirmation as the header button.
  const newChatRef = useRef(handleNewChat);
  newChatRef.current = handleNewChat;
  useEffect(() => {
    if (newChatRequest > 0) newChatRef.current();
  }, [newChatRequest]);

  const handleHitlDecision = async (decision: 'approve' | 'revise' | 'cancel') => {
    if (!pendingHitl) return;
    const reqId = pendingHitl.id;
    const note = hitlNote.trim() || undefined;
    setPendingHitl(null);
    setHitlNote('');
    await window.aixAPI.respondHitl(reqId, decision, note);
  };

  const hitlDecisionRef = useRef(handleHitlDecision);
  hitlDecisionRef.current = handleHitlDecision;

  useEffect(() => {
    if (!pendingHitl) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.isComposing) return;
      if (e.target instanceof HTMLButtonElement) return;

      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      const inCard = e.target instanceof Node && hitlCardRef.current?.contains(e.target);
      if (e.target !== document.body && !inCard) return;

      if (isInput) {
        if (e.key === 'Enter') {
          e.preventDefault();
          // Cmd/Ctrl+Enter explicitly approves even with text in note
          if (e.metaKey || e.ctrlKey) {
            void hitlDecisionRef.current('approve');
          } else if (hitlNote.trim() && pendingHitl.options.some(option => option.id === 'revise')) {
            // Plain Enter with text in note submits Revise
            void hitlDecisionRef.current('revise');
          } else {
            // Plain Enter with empty note approves
            void hitlDecisionRef.current('approve');
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          (e.target as HTMLElement).blur();
        }
        return;
      }

      // When focus is outside input:
      if (e.key === 'Enter') {
        e.preventDefault();
        void hitlDecisionRef.current('approve');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setConfirmRequest({
          title: 'Cancel this spine run?',
          message: 'The run stops at the next safe cancellation point.',
          confirmLabel: 'Cancel run',
          destructive: true,
          action: () => { void hitlDecisionRef.current('cancel'); },
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pendingHitl, hitlNote]);

  const handleComposerKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void handleSendMessage(inputPrompt);
    }
  };

  const handleSelectModel = async (source: DesktopModelSource, model: string) => {
    setModelMenuOpen(false);
    modelTriggerRef.current?.focus();
    if (!aiConfig || (source.provider === aiConfig.provider && model === aiConfig.model)) return;
    await window.aixAPI.setAiConfig({
      provider: source.provider,
      model,
      sourceId: source.id,
      baseUrl: source.provider === aiConfig.provider ? aiConfig.baseUrl : undefined,
      useSubscription: source.id === 'claude-code',
    });
    setAiConfig(await window.aixAPI.getAiConfig());
    refreshRef.current?.();
  };

  const activeProviderInfo = aiConfig ? PROVIDERS.find((p) => p.id === aiConfig.provider) : undefined;
  const modelReady = aiConfig !== null && hasModelCredentials(aiConfig, modelSources);
  const activeSession = sessions.find((session) => session.id === currentSessionId);
  const sessionOptions = sessions.map((session) => ({
    value: session.id,
    label: `${session.title}${session.isRunning ? ' · Running' : ''}`,
  }));
  // Keep a newly returned ID selectable while its list request is in flight.
  if (currentSessionId && !activeSession) {
    const run = runRef.current;
    sessionOptions.unshift({ value: currentSessionId,
      label: run?.sessionId === currentSessionId ? `${run.title}${run.active ? ' · Running' : ''}` : 'Loading session…' });
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full bg-background relative overflow-hidden">
      {/* Session header */}
      <header className="h-12 border-b border-white/5 px-5 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 text-[13px] min-w-0">
          <span className="font-medium text-slate-200">Agent</span>
          <span className="text-slate-500" aria-hidden="true">/</span>
          {sessionOptions.length > 0 ? (
            <Select
              className="min-w-0 w-[280px] text-sm"
              value={currentSessionId ?? ''}
              ariaLabel="Switch active session"
              disabled={isRunning}
              options={[
                { value: '', label: 'New task' },
                ...sessionOptions,
              ]}
              onChange={(id) => {
                if (!id) {
                  handleNewChat();
                } else {
                  setCurrentSessionId(id);
                  onSessionChange?.(id);
                }
              }}
              emptyLabel="No sessions"
            />
          ) : (
            <span className="text-slate-400 truncate">New task</span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {isRunning ? (
            <span className="flex items-center gap-1.5 text-[12px] text-blue-300">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 motion-safe:animate-pulse" aria-hidden="true" />
              Running
            </span>
          ) : (
            <button
              type="button"
              onClick={handleNewChat}
              title="Start a new task (Clear canvas)"
              className="flex items-center gap-1.5 min-h-8 px-3 rounded-md text-[12px] font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" /> New Task
            </button>
          )}
        </div>
      </header>

      {/* Timeline */}
      <div ref={timelineRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto px-5 py-6 select-text">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto pt-10 space-y-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center">
                <Layers className="w-5 h-5 text-indigo-300" aria-hidden="true" />
              </div>
              <h1 className="text-[22px] font-semibold tracking-tight text-white">What are we building today?</h1>
              <p className="text-[14px] text-slate-400 leading-relaxed max-w-lg">
                Discuss the goal, approve a plan, then generate new files in a session folder.
                Existing projects are not modified. Testing and recording lessons are manual steps.
              </p>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void handleSendMessage(prompt)}
                  className="p-3 rounded-lg bg-surface hover:bg-white/[0.04] border border-white/5 hover:border-white/10 text-left text-[13px] text-slate-400 hover:text-slate-200 leading-snug transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-8">
            {messages.map((msg) =>
              msg.role === 'user' ? (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[85%] min-w-0 break-words rounded-xl bg-white/[0.05] border border-white/5 px-4 py-2.5 text-[14px] text-slate-100 whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center shrink-0" aria-hidden="true">
                    <Layers className="w-3.5 h-3.5 text-indigo-300" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Agent header */}
                    <div className="flex items-center gap-2 flex-wrap text-[11px] min-h-7">
                      <span className="text-[13px] font-semibold text-white">aix</span>
                      {msg.modelLabel && (
                        <span className="px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.03] text-slate-300 font-mono text-[10px]">
                          {msg.modelLabel}
                        </span>
                      )}
                      {msg.phase && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 font-mono text-[10px] uppercase">
                          {msg.phase}
                        </span>
                      )}
                      <span className="text-slate-400 font-mono">{formatClock(msg.startedAt)}</span>
                    </div>

                    <ReasoningBlock msg={msg} now={now} />
                    <SpineStepCards msg={msg} onOpenArtifact={onOpenArtifact} />

                    {msg.content && (
                      <div
                        className={`text-[14px] leading-relaxed break-words ${
                          msg.status === 'error' ? 'text-rose-200' : msg.status === 'stopped' ? 'text-amber-200' : 'text-slate-200'
                        }`}
                      >
                        <MarkdownRenderer content={msg.content} />
                      </div>
                    )}
                    {msg.outputDir && (
                      <div className="space-y-1 text-xs text-slate-400">
                        <span>Files saved to</span>
                        <code className="block break-all select-text text-slate-300">{msg.outputDir}</code>
                      </div>
                    )}

                    {msg.artifacts && msg.artifacts.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {msg.artifacts.map((art) => (
                          <button
                            key={art}
                            type="button"
                            onClick={() => onOpenArtifact(art)}
                            className="min-h-8 px-2.5 rounded-md bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-slate-300 font-mono text-[12px] flex items-center gap-1.5 transition-colors"
                          >
                            <FileCode2 className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
                            {art}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}

            {/* Human-in-the-loop gate */}
            {pendingHitl && (
              <div ref={hitlCardRef} className="ml-10 rounded-xl border border-amber-400/30 bg-amber-500/[0.04] ring-4 ring-amber-500/[0.04] overflow-hidden">
                <div className="px-4 py-3 border-b border-amber-400/15 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  <span className="text-[13px] font-semibold text-amber-200">Approval required</span>
                  <span className="text-[11px] font-mono text-amber-300 ml-auto">Tier {pendingHitl.tier} gate</span>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-[14px] font-medium text-white">{pendingHitl.question}</p>
                  <ul className="space-y-1">
                    {pendingHitl.options.map((opt) => (
                      <li key={opt.id} className="text-[13px] text-slate-400 leading-relaxed">
                        <span className="text-slate-200 font-medium">{opt.label}</span> — {opt.summary}
                      </li>
                    ))}
                  </ul>
                  <div className="space-y-1.5">
                    <label htmlFor={hitlNoteId} className="block text-[12px] font-medium text-slate-300">
                      {pendingHitl.options.some(option => option.id === 'revise') ? 'Revision guidance' : 'Decision note'} <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <input
                      id={hitlNoteId}
                      type="text"
                      autoFocus
                      value={hitlNote}
                      onChange={(e) => setHitlNote(e.target.value)}
                      placeholder="e.g. use SQLite instead of Redis"
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400/50 transition-colors"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => void handleHitlDecision('approve')}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-medium transition-colors"
                    >
                      Approve <Kbd>⌘↵</Kbd>
                    </button>
                    {pendingHitl.options.some(option => option.id === 'revise') && (
                    <button
                      type="button"
                      onClick={() => void handleHitlDecision('revise')}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-200 text-[12px] font-medium transition-colors"
                    >
                      Request revise {hitlNote.trim() ? <Kbd>↵</Kbd> : null}
                    </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setConfirmRequest({
                        title: 'Cancel this spine run?',
                        message: 'The run stops at the next safe cancellation point.',
                        confirmLabel: 'Cancel run',
                        destructive: true,
                        action: () => { void handleHitlDecision('cancel'); },
                      })}
                      className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg text-rose-300 hover:bg-rose-500/10 text-[12px] font-medium transition-colors"
                    >
                      Cancel run
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {!isRunning && !modelLoading && !modelReady && (
        <div role="status" className="mx-4 mb-2 rounded-lg border border-amber-400/20 bg-amber-500/5 p-3 text-sm text-amber-200">
          Configure a model before starting a task.
          <button type="button" onClick={() => onNavigate('settings')} className="ml-2 underline underline-offset-2">Set up model</button>
        </div>
      )}
      {aiConfig?.provider === 'mock' && (
        <p className="px-5 pt-2 text-xs text-amber-200">Offline demo selected: output is labeled and is not a real implementation.</p>
      )}
      {/* Composer */}
      <footer className="relative px-4 pb-4 pt-2 shrink-0">
        {showScrollBottom && (
          <button
            type="button"
            onClick={scrollToBottom}
            aria-label="Scroll to newest messages"
            className="absolute -top-11 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 min-h-8 px-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-medium shadow-lg shadow-black/50 transition-colors"
          >
            <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" /> New updates
          </button>
        )}
        <div className="max-w-3xl mx-auto rounded-xl bg-surface border border-white/5 focus-within:border-white/15 transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            aria-label="Task prompt"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder={isRunning ? isStopping ? 'Stopping… waiting for cancellation point' : 'Agent is running… press Stop to cancel' : 'Describe an engineering task…'}
            className="block w-full bg-transparent px-4 pt-3.5 pb-2 text-[14px] text-white placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
          />
          <div className="flex flex-wrap items-center gap-1.5 px-2.5 pb-2.5">
            {/* Model picker: disclosure; closes on Escape (focus back to trigger) or when focus leaves it. */}
            <div
              className="relative min-w-0 max-w-full"
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setModelMenuOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key !== 'Escape' || !modelMenuOpen) return;
                // Keep Escape from also closing the Inspector or cancelling a HITL gate.
                e.preventDefault();
                e.stopPropagation();
                setModelMenuOpen(false);
                modelTriggerRef.current?.focus();
              }}
            >
              <button
                ref={modelTriggerRef}
                type="button"
                disabled={isRunning || !aiConfig}
                aria-expanded={modelMenuOpen}
                aria-controls={modelMenuId}
                onClick={() => setModelMenuOpen((v) => !v)}
                className="flex max-w-full items-center gap-1.5 min-h-8 px-2.5 rounded-md border border-white/5 hover:bg-white/5 text-[12px] text-slate-300 disabled:opacity-50 transition-colors"
              >
                <span className="sr-only">Model: </span>
                <span aria-hidden="true">{activeProviderInfo?.icon ?? '◆'}</span>
                <span className="min-w-0 max-w-[220px] truncate">
                  {activeProviderInfo?.name ?? aiConfig?.provider ?? 'Model'}
                  <span className="text-slate-400 font-mono"> · {aiConfig?.model ?? '…'}</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              </button>
              {modelMenuOpen && aiConfig && (
                <div
                  id={modelMenuId}
                  role="group"
                  aria-label="Available models"
                  tabIndex={-1}
                  className="absolute bottom-full mb-1.5 left-0 z-40 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-white/10 bg-surface-elevated shadow-2xl shadow-black/50 p-1 max-h-80 overflow-y-auto focus:outline-none"
                >
                  {modelSources.filter((s) => s.usable).map((source) => {
                    const headingId = `${modelMenuId}-${source.id}`;
                    return (
                      <div key={source.id} role="group" aria-labelledby={headingId}>
                        <div id={headingId} className="px-2 pt-2 pb-1 text-[11px] uppercase tracking-wider text-slate-400">
                          {source.name}
                        </div>
                        {source.models.map((m) => {
                          const selected = source.provider === aiConfig.provider && m === aiConfig.model;
                          return (
                            <button
                              key={`${source.id}-${m}`}
                              type="button"
                              aria-current={selected ? 'true' : undefined}
                              onClick={() => void handleSelectModel(source, m)}
                              className={`w-full flex items-center justify-between gap-2 min-h-8 px-2 rounded-md hover:bg-white/5 text-left text-[12px] font-mono transition-colors ${
                                selected ? 'text-blue-300' : 'text-slate-300'
                              }`}
                            >
                              <span className="truncate">{m}</span>
                              {selected && <Check className="w-3.5 h-3.5 shrink-0 text-blue-400" aria-hidden="true" />}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                  {modelSources.every((s) => !s.usable) && (
                    <div className="px-2 py-3 text-[12px] text-slate-400">No model sources detected — check AI Model Hub.</div>
                  )}
                  <div className="my-1 border-t border-white/5" />
                  <button
                    type="button"
                    onClick={() => {
                      setModelMenuOpen(false);
                      onNavigate('settings');
                    }}
                    className="w-full flex items-center gap-2 min-h-8 px-2 rounded-md hover:bg-white/5 text-[12px] text-slate-300 transition-colors"
                  >
                    <Settings2 className="w-3.5 h-3.5" aria-hidden="true" /> Switch provider / API key…
                  </button>
                </div>
              )}
            </div>

            {/* Mode toggle */}
            <div role="group" aria-label="Run mode" className="flex shrink-0 items-center rounded-md border border-white/5 p-0.5 text-[12px]">
              {(['guided', 'auto'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  disabled={isRunning}
                  aria-pressed={runMode === mode}
                  onClick={() => setRunMode(mode)}
                  className={`min-h-7 px-2.5 rounded transition-colors disabled:opacity-50 ${
                    runMode === mode ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode === 'guided' ? 'Guided' : 'Autonomous'}
                </button>
              ))}
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-1">
              <div role="group" aria-label="Inspector panels" className="flex items-center gap-0.5">
                {DRAWER_TOGGLES.map(({ tab, label, icon: Icon }) => (
                  <button
                    key={tab}
                    type="button"
                    title={label}
                    aria-label={label}
                    aria-pressed={drawerTab === tab}
                    onClick={() => onToggleDrawer(tab)}
                    className={`w-8 h-8 inline-flex items-center justify-center rounded-md transition-colors ${
                      drawerTab === tab ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
              <span className="w-px h-4 bg-white/5 mx-1" aria-hidden="true" />
              {isRunning ? (
                <button
                  type="button"
                  onClick={handleStop}
                  disabled={isStopping}
                  title={isStopping ? 'Waiting for the engine to stop' : 'Stop execution'}
                  aria-label={isStopping ? 'Waiting for execution to stop' : 'Stop execution'}
                  className="flex items-center gap-1.5 min-h-8 pl-2.5 pr-3 rounded-md bg-white/[0.06] hover:bg-rose-500/15 border border-white/10 hover:border-rose-400/30 text-slate-200 hover:text-rose-200 text-[12px] font-medium transition-colors"
                >
                  <Square className="w-3 h-3 fill-current" aria-hidden="true" /> {isStopping ? 'Stopping…' : 'Stop'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!inputPrompt.trim() || !modelReady}
                  onClick={() => void handleSendMessage(inputPrompt)}
                  title="Run prompt (Enter)"
                  aria-label="Send prompt"
                  className="w-8 h-8 inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-500 disabled:bg-white/[0.06] disabled:text-slate-400 text-white transition-colors"
                >
                  <ArrowUp className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>
        <p className="max-w-3xl mx-auto mt-2 text-xs text-slate-400">Output stays in a session folder. No project files are modified.</p>
        <div className="max-w-3xl mx-auto mt-1.5 px-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
          <span>
            <Kbd>Enter</Kbd> run · <Kbd>Shift+Enter</Kbd> newline
          </span>
          {pendingHitl && (
            <span className="text-amber-300">
              <Kbd>Enter</Kbd> approve · <Kbd>Esc</Kbd> cancel
            </span>
          )}
        </div>
      </footer>

      <ConfirmDialog
        open={confirmRequest !== null}
        title={confirmRequest?.title ?? ''}
        message={confirmRequest?.message ?? ''}
        confirmLabel={confirmRequest?.confirmLabel}
        destructive={confirmRequest?.destructive}
        onConfirm={() => {
          const action = confirmRequest?.action;
          setConfirmRequest(null);
          action?.();
        }}
        onCancel={() => setConfirmRequest(null)}
      />
    </div>
  );
};
