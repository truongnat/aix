import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Loader2,
  AlertCircle,
  ThumbsUp,
  RotateCcw,
  XCircle,
  CheckCircle2,
  FileCode2,
  Terminal,
  Cpu,
  Brain,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type {
  DesktopSessionSummary,
  DesktopHitlRequest,
  DesktopSpineEvent,
  DesktopAiConfig,
  AiProviderId,
} from '@shared/api';
import type { Phase } from '@x/core';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessage {
  readonly id: string;
  readonly role: 'user' | 'assistant';
  readonly content: string;
  readonly timestamp: string;
  readonly phase?: Phase;
  readonly hitlRequest?: DesktopHitlRequest;
  readonly logs?: readonly { message: string; timestamp: string }[];
  readonly artifacts?: readonly string[];
}

interface ChatCanvasProps {
  sessions: readonly DesktopSessionSummary[];
  onOpenArtifact: (artifact: string) => void;
  onRefreshSessions?: () => void;
}

const QUICK_PROMPTS = [
  'Implement idempotency check for Stripe payment webhooks with TDD',
  'Investigate race condition in user session authentication token refresh',
  'Audit repository dependencies and verify security guardrails',
  'Add Playwright browser automation test flow for user checkout',
];

export const ChatCanvas: React.FC<ChatCanvasProps> = ({
  onOpenArtifact,
  onRefreshSessions,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [runMode, setRunMode] = useState<'guided' | 'auto'>('guided');
  const [activeModel, setActiveModel] = useState<{ provider: AiProviderId; model: string }>({
    provider: 'inferx',
    model: 'deepseek-v4.1-flash-1017-basic',
  });

  // HITL state
  const [pendingHitl, setPendingHitl] = useState<DesktopHitlRequest | null>(null);
  const [hitlNote, setHitlNote] = useState<string>('');

  // Expandable terminal logs
  const [showLogs, setShowLogs] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.aixAPI.getAiConfig().then((cfg: DesktopAiConfig) => {
      setActiveModel({ provider: cfg.provider, model: cfg.model });
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingHitl]);

  // Live Spine Event Listener
  useEffect(() => {
    if (!window.aixAPI?.onSpineEvent) return;
    const unsub = window.aixAPI.onSpineEvent((event: DesktopSpineEvent) => {
      if (event.type === 'log') {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (!last || last.role !== 'assistant') return prev;
          const updatedLogs = [...(last.logs ?? []), { message: event.message, timestamp: event.timestamp }];
          return [...prev.slice(0, -1), { ...last, logs: updatedLogs }];
        });
      } else if (event.type === 'phase') {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (!last || last.role !== 'assistant') return prev;
          return [...prev.slice(0, -1), { ...last, phase: event.phase }];
        });
      } else if (event.type === 'hitl') {
        setPendingHitl(event.request);
      } else if (event.type === 'complete') {
        setIsRunning(false);
        setPendingHitl(null);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (!last || last.role !== 'assistant') return prev;
          return [
            ...prev.slice(0, -1),
            {
              ...last,
              content: `### 🎉 Task Complete!\n\nAll phases completed with verified evidence. Artifacts generated in **\`.aix/sessions/${event.sessionId}/\`**:`,
              artifacts: event.artifacts,
            },
          ];
        });
        onRefreshSessions?.();
      } else if (event.type === 'error') {
        setIsRunning(false);
        setPendingHitl(null);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (!last || last.role !== 'assistant') return prev;
          return [
            ...prev.slice(0, -1),
            {
              ...last,
              content: `### ❌ Execution Error\n\n\`\`\`\n${event.error}\n\`\`\`\n\nPlease check your AI provider configuration or prompt.`,
            },
          ];
        });
      }
    });

    return unsub;
  }, [onRefreshSessions]);

  const handleSendMessage = async (text: string) => {
    const prompt = text.trim();
    if (!prompt || isRunning) return;

    setInputPrompt('');
    setIsRunning(true);
    setPendingHitl(null);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString(),
    };

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'Initializing the 8-step engineering spine pipeline...',
      timestamp: new Date().toLocaleTimeString(),
      phase: 'discuss',
      logs: [],
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    try {
      const { sessionId } = await window.aixAPI.startSpine(prompt, runMode);
      setCurrentSessionId(sessionId);
    } catch (err: unknown) {
      setIsRunning(false);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Failed to launch task: ${String(err)}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  const handleHitlDecision = async (decision: 'approve' | 'revise' | 'cancel') => {
    if (!pendingHitl) return;
    const reqId = pendingHitl.id;
    setPendingHitl(null);
    await window.aixAPI.respondHitl(reqId, decision, hitlNote.trim() || undefined);
    setHitlNote('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputPrompt);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#090a0f] relative overflow-hidden">
      {/* Top Session & Model Bar */}
      <header className="h-12 border-b border-white/5 px-6 flex items-center justify-between bg-[#0b0c14]/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            {activeModel.provider.toUpperCase()}:
          </span>
          <span className="font-mono text-slate-300">{activeModel.model}</span>
          {currentSessionId && (
            <span className="text-slate-600 font-mono text-[11px] ml-2">
              (Session: {currentSessionId})
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/5 rounded-lg p-1 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setRunMode('guided')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                runMode === 'guided'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Guided (HITL)
            </button>
            <button
              type="button"
              onClick={() => setRunMode('auto')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                runMode === 'auto'
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Autonomous
            </button>
          </div>
        </div>
      </header>

      {/* Message Stream Canvas */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          /* Empty State: Modern Onboarding Welcome */
          <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 mx-auto flex items-center justify-center shadow-xl shadow-blue-500/20">
              <Sparkles className="w-7 h-7 text-white" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                What are we building today?
              </h1>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                aix governs your task through the 8-step spine: Discuss → Plan → Worktree → TDD → Execute → Review → Verify → Remember.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-4 text-left">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-blue-500/30 text-xs text-slate-300 transition-all group"
                >
                  <span className="block font-semibold text-white group-hover:text-blue-400 transition-colors mb-1">
                    Preset #{idx + 1}
                  </span>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{prompt}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat Timeline Stream */
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-4xl mx-auto ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-1">
                  <Brain className="w-4 h-4 text-blue-400" />
                </div>
              )}

              <div
                className={`rounded-2xl p-4 space-y-3.5 max-w-3xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white/[0.03] border border-white/10 text-slate-200'
                }`}
              >
                {/* Header for assistant message */}
                {msg.role === 'assistant' && (
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[11px] text-slate-400">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      aix Harness Pipeline
                      {msg.phase && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono text-[10px] uppercase border border-blue-500/20">
                          {msg.phase}
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">{msg.timestamp}</span>
                  </div>
                )}

                {/* Body Content */}
                <div className="text-xs leading-relaxed">
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}
                </div>

                {/* Generated Artifacts Pills */}
                {msg.artifacts && msg.artifacts.length > 0 && (
                  <div className="pt-2 border-t border-white/5 flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-semibold">Inspect Artifacts:</span>
                    {msg.artifacts.map((art) => (
                      <button
                        key={art}
                        type="button"
                        onClick={() => onOpenArtifact(art)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-300 font-mono text-[11px] flex items-center gap-1.5 transition-all"
                      >
                        <FileCode2 className="w-3.5 h-3.5" />
                        {art}
                      </button>
                    ))}
                  </div>
                )}

                {/* Collapsible Live Terminal Log */}
                {msg.logs && msg.logs.length > 0 && (
                  <div className="rounded-xl bg-black/50 border border-white/5 overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        setShowLogs((prev) => ({ ...prev, [msg.id]: !prev[msg.id] }))
                      }
                      className="w-full px-3 py-1.5 bg-white/[0.02] flex items-center justify-between text-[11px] font-mono text-slate-400 hover:text-white"
                    >
                      <span className="flex items-center gap-1.5">
                        <Terminal className="w-3 h-3 text-blue-400" />
                        Execution Stream ({msg.logs.length} events)
                      </span>
                      {showLogs[msg.id] ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    {showLogs[msg.id] && (
                      <div className="p-3 max-h-40 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-1">
                        {msg.logs.map((log, li) => (
                          <div key={li} className="flex gap-2 text-slate-400">
                            <span className="text-slate-600 text-[10px]">{log.timestamp}</span>
                            <span className={log.message.startsWith('ERROR') ? 'text-rose-400 font-bold' : ''}>
                              {log.message}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Live In-Chat HITL Approval Card */}
        {pendingHitl && (
          <div className="max-w-3xl mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 p-5 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <AlertCircle className="w-5 h-5 text-amber-400 animate-pulse" />
              Human-In-The-Loop Approval Gate Required
            </div>

            <p className="text-xs text-white font-medium">{pendingHitl.question}</p>

            <div className="space-y-1 bg-black/30 p-3 rounded-xl border border-white/5">
              {pendingHitl.options.map((opt) => (
                <div key={opt.id} className="text-[11px] text-slate-300">
                  • <strong className="text-white">{opt.label}:</strong> {opt.summary}
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Revision / Guidance Note (optional):
              </label>
              <input
                type="text"
                value={hitlNote}
                onChange={(e) => setHitlNote(e.target.value)}
                placeholder="e.g. Please use SQLite instead of Redis for token storage..."
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleHitlDecision('approve')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all"
              >
                <ThumbsUp className="w-3.5 h-3.5" /> Approve & Advance
              </button>
              <button
                type="button"
                onClick={() => handleHitlDecision('revise')}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Request Revise
              </button>
              <button
                type="button"
                onClick={() => handleHitlDecision('cancel')}
                className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-all"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Modern Composer Bar at Bottom */}
      <footer className="p-4 border-t border-white/5 bg-[#0b0c14]/90 backdrop-blur-md shrink-0">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="relative rounded-2xl bg-white/[0.03] border border-white/10 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all shadow-xl">
            <textarea
              rows={2}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isRunning}
              placeholder="Type your engineering task (e.g. Implement feature, debug root cause, write test suite)..."
              className="w-full bg-transparent p-3.5 pr-14 text-xs text-white placeholder:text-slate-500 focus:outline-none resize-none"
            />
            <button
              type="button"
              disabled={!inputPrompt.trim() || isRunning}
              onClick={() => handleSendMessage(inputPrompt)}
              className="absolute right-3 bottom-3 p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:pointer-events-none text-white transition-all shadow-md shadow-blue-600/30"
            >
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Press <kbd className="px-1 py-0.5 rounded bg-white/5 font-mono text-[9px]">Enter</kbd> to run, <kbd className="px-1 py-0.5 rounded bg-white/5 font-mono text-[9px]">Shift+Enter</kbd> for newline
            </span>
            <span>Spine: 8 Steps Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
