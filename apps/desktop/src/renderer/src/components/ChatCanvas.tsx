import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  ArrowUp,
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
} from 'lucide-react';
import type {
  DesktopSessionSummary,
  DesktopHitlRequest,
  DesktopSpineEvent,
  DesktopAiConfig,
} from '@shared/api';
import type { Phase } from '@x/core';
import { MarkdownRenderer } from './MarkdownRenderer';
import { PIPELINE_STEPS } from './SpinePipelineVisualizer';
import { PROVIDERS } from '../pages/SettingsPage';
import type { DrawerTab } from './InspectorDrawer';
import type { NavTab } from './Sidebar';

type RunStatus = 'running' | 'done' | 'error' | 'stopped';
type StepStatus = 'pending' | 'active' | 'done' | 'failed' | 'stopped';

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
}

interface ChatCanvasProps {
  sessions: readonly DesktopSessionSummary[];
  onOpenArtifact: (artifact: string) => void;
  onRefreshSessions?: () => void;
  onSessionChange?: (sessionId: string) => void;
  onToggleDrawer: (tab: DrawerTab) => void;
  drawerTab: DrawerTab | null;
  onNavigate: (tab: NavTab) => void;
}

const QUICK_PROMPTS = [
  'Implement idempotency check for Stripe payment webhooks with TDD',
  'Investigate race condition in user session authentication token refresh',
  'Audit repository dependencies and verify security guardrails',
  'Add Playwright browser automation test flow for user checkout',
];

/** Backend phases cover the 8 spine steps in ranges: `run` spans Worktree → Review (steps 3–6). */
const PHASE_STEP_RANGE: Partial<Record<Phase, readonly [number, number]>> = {
  discuss: [0, 0],
  plan: [1, 1],
  run: [2, 5],
  verify: [6, 6],
  remember: [7, 7],
};

const DRAWER_TOGGLES: readonly { tab: DrawerTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { tab: 'artifacts', label: 'Artifacts', icon: FileCode2 },
  { tab: 'verify', label: 'Sandbox Verify', icon: ShieldCheck },
  { tab: 'kb', label: 'KB Server', icon: Server },
];

const formatClock = (ms: number) =>
  new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const formatElapsed = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
};

const modelLabelFor = (cfg: DesktopAiConfig | null) => {
  if (!cfg) return 'Loading model…';
  const p = PROVIDERS.find((x) => x.id === cfg.provider);
  return `${p?.icon ?? '◆'} ${p?.name ?? cfg.provider} · ${cfg.model}`;
};

function stepStatuses(msg: ChatMessage): StepStatus[] {
  const remembered = msg.artifacts?.includes('REMEMBER.md') ?? false;
  if (msg.status === 'done') {
    // The runner never emits `remember`; step 8 is done only if its artifact exists.
    return PIPELINE_STEPS.map((_, i) => (i < 7 || remembered ? 'done' : 'pending'));
  }
  const range = msg.phase ? PHASE_STEP_RANGE[msg.phase] : undefined;
  if (!range) return PIPELINE_STEPS.map(() => 'pending');
  const current: StepStatus =
    msg.status === 'error' ? 'failed' : msg.status === 'stopped' ? 'stopped' : 'active';
  return PIPELINE_STEPS.map((_, i) => (i < range[0] ? 'done' : i <= range[1] ? current : 'pending'));
}

const StepStatusIcon: React.FC<{ status: StepStatus }> = ({ status }) => {
  if (status === 'done') return <Check className="w-3 h-3 text-emerald-400" />;
  if (status === 'active') return <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />;
  if (status === 'failed') return <XCircle className="w-3 h-3 text-rose-400" />;
  if (status === 'stopped') return <CircleSlash className="w-3 h-3 text-amber-400" />;
  return <span className="w-1.5 h-1.5 rounded-full bg-white/15" />;
};

const SpineStepCards: React.FC<{ msg: ChatMessage; onOpenArtifact: (a: string) => void }> = ({
  msg,
  onOpenArtifact,
}) => {
  const statuses = stepStatuses(msg);
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
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
                <Icon className={`w-3.5 h-3.5 shrink-0 ${status === 'pending' ? 'text-slate-600' : 'text-slate-300'}`} />
                <span className={`text-[11px] font-medium truncate ${status === 'pending' ? 'text-slate-500' : 'text-slate-200'}`}>
                  {i + 1}. {step.name}
                </span>
              </span>
              <StepStatusIcon status={status} />
            </div>
            <div className="mt-0.5 pl-5 text-[10px] text-slate-500 truncate">
              {step.role}
              {artifact && <span className="text-blue-400/80"> · {artifact}</span>}
            </div>
          </button>
        );
      })}
    </div>
  );
};

const ReasoningBlock: React.FC<{ msg: ChatMessage; now: number }> = ({ msg, now }) => {
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
        onClick={() => setOpen((v) => !v)}
        className="w-full px-3 py-2 flex items-center gap-2 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <Brain className={`w-3.5 h-3.5 ${running ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`} />
        <span className="font-medium">{running ? 'Thinking' : 'Reasoning process'}</span>
        <span className="text-slate-600">·</span>
        <span className="font-mono tabular-nums">
          {running ? formatElapsed(elapsed) : `${formatElapsed(elapsed)} total`}
        </span>
        <span className="ml-auto font-mono text-[10px] text-slate-600">{logs.length} events</span>
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 max-h-48 overflow-y-auto font-mono text-[11px] space-y-0.5 border-t border-white/5">
          {logs.length === 0 && <div className="text-slate-600 pt-1">Waiting for first event…</div>}
          {logs.map((log, li) => (
            <div key={li} className="flex gap-2">
              <span className="text-slate-600 shrink-0">{log.timestamp}</span>
              <span className={log.message.startsWith('ERROR') ? 'text-rose-400' : 'text-slate-400'}>{log.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="px-1 py-px rounded border border-white/10 bg-white/5 font-mono text-[10px] text-slate-400">
    {children}
  </kbd>
);

export const ChatCanvas: React.FC<ChatCanvasProps> = ({
  onOpenArtifact,
  onRefreshSessions,
  onSessionChange,
  onToggleDrawer,
  drawerTab,
  onNavigate,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [runMode, setRunMode] = useState<'guided' | 'auto'>('guided');
  const [aiConfig, setAiConfig] = useState<DesktopAiConfig | null>(null);
  const [modelMenuOpen, setModelMenuOpen] = useState<boolean>(false);
  const [pendingHitl, setPendingHitl] = useState<DesktopHitlRequest | null>(null);
  const [hitlNote, setHitlNote] = useState<string>('');
  const [now, setNow] = useState<number>(Date.now());

  // Which run the stream belongs to; events from other (e.g. stopped) sessions are ignored.
  const runRef = useRef<{ msgId: string; sessionId: string | null; active: boolean } | null>(null);
  const stoppedSessionsRef = useRef(new Set<string>());
  const hitlCardRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const refreshRef = useRef(onRefreshSessions);
  refreshRef.current = onRefreshSessions;

  useEffect(() => {
    window.aixAPI.getAiConfig().then(setAiConfig).catch(console.error);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingHitl]);

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
    if (runRef.current) runRef.current.active = false;
    setIsRunning(false);
    setPendingHitl(null);
    setHitlNote('');
    patchRunMessage(msgId, (m) => ({ ...m, ...patch, endedAt: Date.now() }));
  };

  useEffect(() => {
    if (!window.aixAPI?.onSpineEvent) return;
    return window.aixAPI.onSpineEvent((event: DesktopSpineEvent) => {
      if (stoppedSessionsRef.current.has(event.sessionId)) return;
      const run = runRef.current;
      if (!run?.active || (run.sessionId !== null && run.sessionId !== event.sessionId)) return;
      const { msgId } = run;

      switch (event.type) {
        case 'log':
          patchRunMessage(msgId, (m) => ({
            ...m,
            logs: [...(m.logs ?? []), { message: event.message, timestamp: event.timestamp }],
          }));
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
            content: `**Task complete.** All phases passed their gates. Artifacts are in \`.aix/sessions/${event.sessionId}/\`.`,
            artifacts: event.artifacts,
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
    if (!prompt || isRunning) return;

    setInputPrompt('');
    setIsRunning(true);
    setPendingHitl(null);
    setNow(Date.now());

    const assistantId = crypto.randomUUID();
    runRef.current = { msgId: assistantId, sessionId: null, active: true };
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
    if (!run?.active) return;
    if (run.sessionId) {
      stoppedSessionsRef.current.add(run.sessionId);
      void window.aixAPI.abortSpine(run.sessionId);
    }
    // The backend stops at the next phase boundary; the UI releases immediately and ignores late events.
    finishRun(run.msgId, { status: 'stopped', content: '**Execution stopped by user.**' });
  };

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
      if (e.isComposing) return; // IME (e.g. Telex) commit, not a decision
      if (e.target instanceof HTMLButtonElement) return; // let the focused button handle its own Enter
      // Only when focus is nowhere or inside the gate card, so Enter in the drawer/composer never approves.
      const inCard = e.target instanceof Node && hitlCardRef.current?.contains(e.target);
      if (e.target !== document.body && !inCard) return;
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        void hitlDecisionRef.current('approve');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        void hitlDecisionRef.current('cancel');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pendingHitl]);

  const handleComposerKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void handleSendMessage(inputPrompt);
    }
  };

  const handleSelectModel = async (model: string) => {
    setModelMenuOpen(false);
    if (!aiConfig || model === aiConfig.model) return;
    // Same provider only: the stored API key belongs to the current provider.
    const next = { provider: aiConfig.provider, model, baseUrl: aiConfig.baseUrl };
    await window.aixAPI.setAiConfig(next);
    setAiConfig({ ...aiConfig, model });
    refreshRef.current?.();
  };

  const providerInfo = aiConfig ? PROVIDERS.find((p) => p.id === aiConfig.provider) : undefined;

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      {/* Session header */}
      <header className="h-12 border-b border-white/5 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-[12px] min-w-0">
          <span className="font-medium text-slate-200">Agent</span>
          <span className="text-slate-700">/</span>
          <span className="font-mono text-slate-500 truncate">{currentSessionId || 'new session'}</span>
        </div>
        {isRunning && (
          <span className="flex items-center gap-1.5 text-[11px] text-blue-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Running
          </span>
        )}
      </header>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-6 py-8 select-text">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto pt-16 space-y-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center">
                <Layers className="w-5 h-5 text-indigo-300" />
              </div>
              <h1 className="text-[22px] font-semibold tracking-tight text-white">What are we building today?</h1>
              <p className="text-[13px] text-slate-400 leading-relaxed max-w-lg">
                Every task runs through the 8-step spine: Discuss → Plan → Worktree → TDD → Code → Review → Verify →
                Remember.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void handleSendMessage(prompt)}
                  className="p-3 rounded-lg bg-surface hover:bg-white/[0.04] border border-white/5 hover:border-white/10 text-left text-[12px] text-slate-400 hover:text-slate-200 leading-snug transition-colors"
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
                  <div className="max-w-[85%] rounded-xl bg-white/[0.05] border border-white/5 px-4 py-2.5 text-[13px] text-slate-100 whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center shrink-0">
                    <Layers className="w-3.5 h-3.5 text-indigo-300" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Agent header */}
                    <div className="flex items-center gap-2 flex-wrap text-[11px] h-7">
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
                      <span className="text-slate-600 font-mono">{formatClock(msg.startedAt)}</span>
                    </div>

                    <ReasoningBlock msg={msg} now={now} />
                    <SpineStepCards msg={msg} onOpenArtifact={onOpenArtifact} />

                    {msg.content && (
                      <div
                        className={`text-[13px] leading-relaxed ${
                          msg.status === 'error' ? 'text-rose-200' : msg.status === 'stopped' ? 'text-amber-200' : 'text-slate-200'
                        }`}
                      >
                        <MarkdownRenderer content={msg.content} />
                      </div>
                    )}

                    {msg.artifacts && msg.artifacts.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {msg.artifacts.map((art) => (
                          <button
                            key={art}
                            type="button"
                            onClick={() => onOpenArtifact(art)}
                            className="px-2 py-1 rounded-md bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-slate-300 font-mono text-[11px] flex items-center gap-1.5 transition-colors"
                          >
                            <FileCode2 className="w-3 h-3 text-blue-400" />
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
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span className="text-[12px] font-semibold text-amber-200">Approval required</span>
                  <span className="text-[10px] font-mono text-amber-400/70 ml-auto">Tier {pendingHitl.tier} gate</span>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-[14px] font-medium text-white">{pendingHitl.question}</p>
                  <ul className="space-y-1">
                    {pendingHitl.options.map((opt) => (
                      <li key={opt.id} className="text-[12px] text-slate-400">
                        <span className="text-slate-200 font-medium">{opt.label}</span> — {opt.summary}
                      </li>
                    ))}
                  </ul>
                  <input
                    type="text"
                    autoFocus
                    value={hitlNote}
                    onChange={(e) => setHitlNote(e.target.value)}
                    placeholder="Optional guidance for Revise (e.g. use SQLite instead of Redis)…"
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => void handleHitlDecision('approve')}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-medium transition-colors"
                    >
                      Approve <CornerDownLeft className="w-3 h-3 opacity-70" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleHitlDecision('revise')}
                      className="px-3.5 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-200 text-[12px] font-medium transition-colors"
                    >
                      Request revise
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleHitlDecision('cancel')}
                      className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg text-rose-300 hover:bg-rose-500/10 text-[12px] font-medium transition-colors"
                    >
                      Cancel run <Kbd>Esc</Kbd>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <footer className="px-6 pb-5 pt-2 shrink-0">
        <div className="max-w-3xl mx-auto rounded-xl bg-surface border border-white/5 focus-within:border-white/15 transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder={isRunning ? 'Agent is running… press Stop to cancel' : 'Describe an engineering task…'}
            className="block w-full bg-transparent px-4 pt-3.5 pb-2 text-[13px] text-white placeholder:text-slate-600 focus:outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center gap-1.5 px-2.5 pb-2.5">
            {/* Model chip */}
            <div className="relative">
              <button
                type="button"
                disabled={isRunning || !aiConfig}
                onClick={() => setModelMenuOpen((v) => !v)}
                className="flex items-center gap-1 px-2 py-1 rounded-md border border-white/5 hover:bg-white/5 text-[11px] text-slate-300 disabled:opacity-50 transition-colors"
              >
                <span>{providerInfo?.icon ?? '◆'}</span>
                <span className="max-w-[220px] truncate">
                  {providerInfo?.name ?? aiConfig?.provider ?? 'Model'}
                  <span className="text-slate-500 font-mono"> · {aiConfig?.model ?? '…'}</span>
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>
              {modelMenuOpen && aiConfig && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setModelMenuOpen(false)} />
                  <div className="absolute bottom-full mb-1.5 left-0 z-40 w-72 rounded-lg border border-white/10 bg-surface-elevated shadow-2xl shadow-black/50 p-1">
                    <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-slate-500">
                      {providerInfo?.name ?? aiConfig.provider} models
                    </div>
                    {(providerInfo?.models ?? [aiConfig.model]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => void handleSelectModel(m)}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-white/5 text-[12px] font-mono text-slate-300"
                      >
                        {m}
                        {m === aiConfig.model && <Check className="w-3 h-3 text-blue-400" />}
                      </button>
                    ))}
                    <div className="my-1 border-t border-white/5" />
                    <button
                      type="button"
                      onClick={() => {
                        setModelMenuOpen(false);
                        onNavigate('settings');
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 text-[12px] text-slate-400"
                    >
                      <Settings2 className="w-3 h-3" /> Switch provider / API key…
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mode toggle */}
            <div className="flex items-center rounded-md border border-white/5 p-0.5 text-[11px]">
              {(['guided', 'auto'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  disabled={isRunning}
                  onClick={() => setRunMode(mode)}
                  className={`px-2 py-0.5 rounded transition-colors disabled:opacity-50 ${
                    runMode === mode ? 'bg-white/[0.08] text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {mode === 'guided' ? 'Guided' : 'Autonomous'}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-1">
              {DRAWER_TOGGLES.map(({ tab, label, icon: Icon }) => (
                <button
                  key={tab}
                  type="button"
                  title={label}
                  onClick={() => onToggleDrawer(tab)}
                  className={`p-1.5 rounded-md transition-colors ${
                    drawerTab === tab ? 'bg-white/[0.08] text-white' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
              <span className="w-px h-4 bg-white/5 mx-1" />
              {isRunning ? (
                <button
                  type="button"
                  onClick={handleStop}
                  title="Stop execution"
                  className="flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-md bg-white/[0.06] hover:bg-rose-500/15 border border-white/10 hover:border-rose-400/30 text-slate-200 hover:text-rose-200 text-[11px] font-medium transition-colors"
                >
                  <Square className="w-3 h-3 fill-current" /> Stop
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!inputPrompt.trim()}
                  onClick={() => void handleSendMessage(inputPrompt)}
                  title="Run (Enter)"
                  className="p-1.5 rounded-md bg-blue-600 hover:bg-blue-500 disabled:bg-white/[0.06] disabled:text-slate-600 text-white transition-colors"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="max-w-3xl mx-auto mt-1.5 px-1 flex items-center gap-3 text-[10px] text-slate-600">
          <span>
            <Kbd>Enter</Kbd> run · <Kbd>Shift+Enter</Kbd> newline
          </span>
          {pendingHitl && (
            <span className="text-amber-400/80">
              <Kbd>Enter</Kbd> approve · <Kbd>Esc</Kbd> cancel
            </span>
          )}
        </div>
      </footer>
    </div>
  );
};
