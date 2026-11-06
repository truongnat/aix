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
import { isLocalOrCustomEndpoint } from '@shared/desktop-logic';

interface ProviderCardInfo {
  readonly id: AiProviderId;
  readonly name: string;
  readonly icon: string;
}

/** Kept for status-bar model labels elsewhere in the app. */
export const PROVIDERS: readonly ProviderCardInfo[] = [
  { id: 'inferx', name: 'InferX DeepSeek', icon: '⚡' },
  { id: 'anthropic', name: 'Anthropic Claude', icon: '🟣' },
  { id: 'openai', name: 'OpenAI (or Compatible)', icon: '🟢' },
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
  if (source.id === 'openai-key' && source.name.includes('Gateway')) return <Server className="w-4 h-4 text-cyan-400" />;
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
  const [savedConfig, setSavedConfig] = useState<DesktopAiConfig | null>(null);

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
        setSavedConfig(cfg);
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

  const validateDraft = () => {
    if (!effectiveModel.trim()) {
      setSaveError('Enter a model name or choose a model above.');
      return false;
    }
    const localGateway = selectedSource?.provider === 'openai' && isLocalOrCustomEndpoint(baseUrl);
    if (selectedSource?.id.endsWith('-key') && !selectedSource.usable && !apiKey.trim() && !localGateway) {
      setSaveError(`Enter an API key for ${selectedSource.name}, or configure a local endpoint for OpenAI-compatible models.`);
      document.getElementById('settings-api-key')?.focus();
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!selectedSource || !validateDraft()) return;
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
      const [cfg, detected] = await Promise.all([window.aixAPI.getAiConfig(), window.aixAPI.detectModelSources()]);
      setSavedConfig(cfg);
      setSources(detected);
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
    if (!selectedSource || !validateDraft()) return;
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
    <div className="min-w-0 p-8 space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="AI Model Hub"
        description="Choose a model source. Use a CLI login, enter an API key, or configure an OpenAI-compatible endpoint."
      />

      {loadError && (
        <div role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {loadError}
        </div>
      )}

      {loading ? (
        <div role="status" className="py-16 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Detecting model sources…
        </div>
      ) : (
        <div className="space-y-3">
          {sources.map((source) => {
            const isSelected = selection?.sourceId === source.id;
            const ready = source.usable;
            const configurable = source.id.endsWith('-key');
            return (
              <section
                key={source.id}
                aria-label={`Model source ${source.name}`}
                className={`p-4 rounded-2xl border transition-colors duration-150 ${
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
                              : 'bg-white/5 text-slate-300 border-white/10'
                        }`}>
                          {ready ? 'Ready' : configurable ? 'Needs API key' : source.detected ? 'Limited' : 'Not found'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{source.authNote}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{source.note}</p>
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />}
                </div>

                {(ready || configurable) && source.models.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pl-11">
                    {source.models.map((model) => {
                      const active = selection?.sourceId === source.id && selection.model === model && !customModel.trim();
                      return (
                        <button
                          key={model}
                          type="button"
                          aria-pressed={active}
                          onClick={() => {
                            setCustomModel('');
                            if (selection?.sourceId !== source.id) setBaseUrl('');
                            if (selection?.sourceId !== source.id) setApiKey('');
                            setSelection({ sourceId: source.id, model });
                            setTestResult(null);
                            setSaveError(null);
                          }}
                          className={`max-w-full break-all px-3 py-1.5 rounded-lg text-xs font-mono transition-colors duration-150 border ${
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
                {isSelected && configurable && (
                  <div className="mt-4 space-y-1.5">
                    <label htmlFor="settings-api-key" className="text-xs font-semibold text-slate-300">API key</label>
                    <input id="settings-api-key" type="password" autoComplete="off" spellCheck={false}
                      value={apiKey} onChange={(event) => setApiKey(event.target.value)}
                      placeholder={savedConfig?.provider === source.provider && savedConfig.hasApiKey
                        ? 'Saved key — leave empty to keep it'
                        : ready ? 'Using configured key; enter a new key to replace it' : 'Paste your API key'}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-blue-500 transition-colors duration-150"
                    />
                    <p className="text-xs text-slate-400">Saved on this device. Existing keys are never displayed here.</p>
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
        <summary className="flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-300 cursor-pointer hover:text-white select-none transition-colors duration-150">
          <ChevronDown className="w-3.5 h-3.5 transition-transform duration-150 group-open:rotate-180" />
          Advanced — custom model and endpoint
        </summary>
        <div className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-3">
            <div className="space-y-1.5">
              <label htmlFor="settings-custom-model" className="text-xs font-semibold text-slate-300">Custom model name</label>
              <input
                id="settings-custom-model"
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder={selection?.model ?? 'model-id'}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors duration-150"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="settings-endpoint" className="text-xs font-semibold text-slate-300">Endpoint override</label>
              <input
                id="settings-endpoint"
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://proxy.example/v1/chat/completions"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors duration-150"
              />
            </div>
          </div>
        </div>
      </details>

      {/* Action bar: sticky inside the Settings scroll pane, so it never covers sidebar or Inspector. */}
      <div className="sticky bottom-4 z-20 p-3 rounded-2xl bg-surface-elevated/95 backdrop-blur border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1 basis-48 text-xs break-words" aria-live="polite">
          {selectedSource ? (
            <span className="text-slate-300">
              Using <span className="font-mono text-white break-all">{effectiveModel || '—'}</span>
              <span className="text-slate-400"> via {selectedSource.name}</span>
            </span>
          ) : (
            <span className="text-slate-400">Pick a model above</span>
          )}
          {savedSuccess && <span className="ml-2 text-emerald-400 font-semibold">Saved</span>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleTest}
            disabled={!selectedSource || testing || saving}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />} Test
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!selectedSource || saving || testing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors duration-150 shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
          </button>
        </div>
      </div>
    </div>
  );
};
