import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Play,
  Save,
  Zap,
  Server,
  KeyRound,
  FlaskConical,
  Sparkles,
  AlertCircle,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import type { DesktopAiConfig, AiProviderId, DesktopModelSource, DesktopTestConnectionResult } from '@shared/api';
import { PageHeader } from '../components/ui/PageHeader';

interface ProviderCardInfo {
  readonly id: AiProviderId;
  readonly name: string;
  readonly icon: string;
}

/** Kept for status-bar model labels elsewhere in the app. */
export const PROVIDERS: readonly ProviderCardInfo[] = [
  { id: 'inferx', name: 'InferX DeepSeek', icon: '⚡' },
  { id: 'anthropic', name: 'Anthropic Claude', icon: '🟣' },
  { id: 'openai', name: 'OpenAI', icon: '🟢' },
  { id: 'groq', name: 'Groq Cloud', icon: '⚡' },
  { id: 'ollama', name: 'Ollama (Local)', icon: '🦙' },
  { id: 'codex', name: 'Codex (ChatGPT)', icon: '🧩' },
  { id: 'mock', name: 'Mock Simulation', icon: '🧪' },
];

interface Selection {
  readonly sourceId: DesktopModelSource['id'];
  readonly model: string;
}

const sourceIcon = (source: DesktopModelSource): React.ReactNode => {
  if (source.provider === 'ollama') return <Server className="w-4 h-4 text-emerald-400" />;
  if (source.provider === 'mock') return <FlaskConical className="w-4 h-4 text-slate-400" />;
  if (source.id.endsWith('-key')) return <KeyRound className="w-4 h-4 text-amber-400" />;
  if (source.id === 'antigravity' || source.id === 'gemini') return <Sparkles className="w-4 h-4 text-blue-400" />;
  return <Zap className="w-4 h-4 text-emerald-400" />;
};

function matchSavedSelection(cfg: DesktopAiConfig, sources: readonly DesktopModelSource[]): Selection | null {
  let sourceId: DesktopModelSource['id'] | null = null;
  if (cfg.useSubscription && cfg.provider === 'anthropic') sourceId = 'claude-code';
  else if (cfg.provider === 'codex') sourceId = 'codex';
  else if (cfg.provider === 'ollama') sourceId = 'ollama';
  else if (cfg.provider === 'mock') sourceId = 'mock';
  else if (['anthropic', 'openai', 'groq', 'inferx'].includes(cfg.provider)) sourceId = `${cfg.provider}-key` as DesktopModelSource['id'];
  if (!sourceId || !sources.some((s) => s.id === sourceId)) return null;
  return { sourceId, model: cfg.model };
}

interface SettingsPageProps {
  onConfigUpdated?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onConfigUpdated }) => {
  const [sources, setSources] = useState<readonly DesktopModelSource[]>([]);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Advanced overrides (rarely needed — everything is auto-detected).
  const [customModel, setCustomModel] = useState<string>('');
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');

  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<DesktopTestConnectionResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([window.aixAPI.getAiConfig(), window.aixAPI.detectModelSources()])
      .then(([cfg, detected]) => {
        if (cancelled) return;
        setSources(detected);
        setSelection(matchSavedSelection(cfg, detected));
        if (cfg.baseUrl) setBaseUrl(cfg.baseUrl);
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(`Could not detect model sources: ${String(error)}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const selectedSource = sources.find((s) => s.id === selection?.sourceId) ?? null;
  const effectiveModel = customModel.trim() || selection?.model || '';

  const handleSave = async () => {
    if (!selectedSource) return;
    setSaving(true);
    setSaveError(null);
    try {
      await window.aixAPI.setAiConfig({
        provider: selectedSource.provider,
        model: effectiveModel,
        apiKey: apiKey || undefined,
        baseUrl: baseUrl || undefined,
        sourceId: selectedSource.id,
      });
      setSavedSuccess(true);
      setApiKey('');
      onConfigUpdated?.();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error: unknown) {
      setSaveError(`Could not save configuration: ${String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!selectedSource) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await window.aixAPI.testAiConnection({
        provider: selectedSource.provider,
        model: effectiveModel,
        apiKey: apiKey || undefined,
        baseUrl: baseUrl || undefined,
        useSubscription: selectedSource.id === 'claude-code',
      });
      setTestResult(res);
    } catch (err: unknown) {
      setTestResult({ ok: false, latencyMs: 0, message: 'Test failed', error: String(err) });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-3xl mx-auto pb-28">
      <PageHeader
        title="AI Model Hub"
        description="Model sources detected on this machine. Pick a model — CLI logins work without any API key."
      />

      {loadError && (
        <div role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Detecting model sources…
        </div>
      ) : (
        <div className="space-y-3">
          {sources.map((source) => {
            const isSelected = selection?.sourceId === source.id;
            const ready = source.usable;
            return (
              <section
                key={source.id}
                aria-label={`Model source ${source.name}`}
                className={`p-4 rounded-2xl border transition-all ${
                  isSelected ? 'bg-blue-600/[0.07] border-blue-500/50 shadow-lg shadow-blue-500/10' : 'bg-white/[0.02] border-white/5'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`mt-0.5 p-2 rounded-lg shrink-0 border ${ready ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                      {sourceIcon(source)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">{source.name}</span>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          ready
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : source.detected
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-white/5 text-slate-500 border-white/10'
                        }`}>
                          {ready ? 'Ready' : source.detected ? 'Limited' : 'Not found'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">{source.authNote}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{source.note}</p>
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />}
                </div>

                {ready && source.models.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pl-11">
                    {source.models.map((model) => {
                      const active = selection?.sourceId === source.id && selection.model === model && !customModel.trim();
                      return (
                        <button
                          key={model}
                          type="button"
                          onClick={() => {
                            setCustomModel('');
                            setSelection({ sourceId: source.id, model });
                            setTestResult(null);
                            setSaveError(null);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                            active
                              ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20'
                              : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/10'
                          }`}
                        >
                          {model}
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {testResult && (
        <div
          role="status"
          className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
            testResult.ok ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}
        >
          {testResult.ok ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
          <div className="min-w-0">
            <span className="font-semibold block">{testResult.message}</span>
            {testResult.error && <span className="break-words opacity-80">{testResult.error}</span>}
          </div>
        </div>
      )}
      {saveError && (
        <div role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {saveError}
        </div>
      )}

      {/* Advanced overrides */}
      <details className="group rounded-2xl bg-white/[0.02] border border-white/5">
        <summary className="flex items-center gap-2 px-4 py-3 text-xs font-semibold text-slate-400 cursor-pointer hover:text-white select-none">
          <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
          Advanced — custom model, endpoint, API key
        </summary>
        <div className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500">Custom model name</label>
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder={selection?.model ?? 'model-id'}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500">Endpoint override</label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://proxy.example/v1/chat/completions"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500">API key (only for key-based providers)</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Leave empty to use CLI subscription / environment"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </details>

      {/* Action bar */}
      <div className="fixed bottom-10 left-[240px] right-0 z-40">
        <div className="max-w-3xl mx-auto px-8">
          <div className="p-3 rounded-2xl bg-surface-elevated/95 backdrop-blur border border-white/10 shadow-2xl flex items-center justify-between gap-4">
            <div className="min-w-0 text-xs">
              {selectedSource ? (
                <span className="text-slate-300">
                  Using <span className="font-mono text-white">{effectiveModel || '—'}</span>
                  <span className="text-slate-500"> via {selectedSource.name}</span>
                </span>
              ) : (
                <span className="text-slate-500">Pick a model above</span>
              )}
              {savedSuccess && <span className="ml-2 text-emerald-400 font-semibold">Saved</span>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleTest}
                disabled={!selectedSource || testing || saving}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-medium transition-colors disabled:opacity-50"
              >
                {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />} Test
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!selectedSource || saving || testing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
