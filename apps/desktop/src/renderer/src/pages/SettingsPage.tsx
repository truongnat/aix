import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Key,
  Globe,
  CheckCircle2,
  AlertCircle,
  Play,
  Save,
  Eye,
  EyeOff,
  Sparkles,
  Server,
  Zap,
} from 'lucide-react';
import type { DesktopAiConfig, AiProviderId, DesktopTestConnectionResult } from '@shared/api';

interface ProviderCardInfo {
  readonly id: AiProviderId;
  readonly name: string;
  readonly desc: string;
  readonly defaultModel: string;
  readonly models: readonly string[];
  readonly icon: string;
}

const PROVIDERS: readonly ProviderCardInfo[] = [
  {
    id: 'inferx',
    name: 'InferX DeepSeek',
    desc: 'DeepSeek V4.1 Flash 1017 reasoning endpoint (omp pre-configured).',
    defaultModel: 'deepseek-v4.1-flash-1017-basic',
    models: ['deepseek-v4.1-flash-1017-basic'],
    icon: '⚡',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    desc: 'Subscription & API. Industry-leading reasoning and coding craft.',
    defaultModel: 'claude-3-5-sonnet-20241022',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-7-sonnet'],
    icon: '🟣',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    desc: 'GPT-4o and o3 reasoning models for structured tasks.',
    defaultModel: 'gpt-4o',
    models: ['gpt-4o', 'gpt-4o-mini', 'o3-mini', 'o1-mini'],
    icon: '🟢',
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    desc: 'Ultra-fast inference for open-weight LPU models.',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    icon: '⚡',
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    desc: 'Run completely offline and private with DeepSeek or Llama.',
    defaultModel: 'deepseek-r1:latest',
    models: ['deepseek-r1:latest', 'qwen2.5-coder:latest', 'llama3.2:latest'],
    icon: '🦙',
  },
  {
    id: 'mock',
    name: 'Mock Simulation',
    desc: 'Zero-cost offline test harness. No API key required.',
    defaultModel: 'mock-engine-v1',
    models: ['mock-engine-v1'],
    icon: '🧪',
  },
];

interface SettingsPageProps {
  onConfigUpdated?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onConfigUpdated }) => {
  const [selectedProvider, setSelectedProvider] = useState<AiProviderId>('anthropic');
  const [model, setModel] = useState<string>('claude-3-5-sonnet-20241022');
  const [apiKey, setApiKey] = useState<string>('');
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [hasExistingKey, setHasExistingKey] = useState<boolean>(false);

  // Testing & Saving status
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<DesktopTestConnectionResult | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    window.aixAPI.getAiConfig().then((cfg: DesktopAiConfig) => {
      setSelectedProvider(cfg.provider);
      setModel(cfg.model);
      setHasExistingKey(cfg.hasApiKey);
      if (cfg.baseUrl) setBaseUrl(cfg.baseUrl);
    });
  }, []);

  const handleProviderSelect = (p: AiProviderId) => {
    setSelectedProvider(p);
    const providerInfo = PROVIDERS.find((item) => item.id === p);
    if (providerInfo) {
      setModel(providerInfo.defaultModel);
      if (p === 'inferx') {
        setBaseUrl('https://model.inferx.net/endpoints/v1');
      } else if (p === 'ollama') {
        setBaseUrl('http://127.0.0.1:11434/v1/chat/completions');
      } else {
        setBaseUrl('');
      }
    }
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await window.aixAPI.testAiConnection({
        provider: selectedProvider,
        model,
        apiKey: apiKey || undefined,
        baseUrl: baseUrl || undefined,
      });
      setTestResult(res);
    } catch (err: unknown) {
      setTestResult({
        ok: false,
        latencyMs: 0,
        message: 'Test failed',
        error: String(err),
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await window.aixAPI.setAiConfig({
      provider: selectedProvider,
      model,
      apiKey: apiKey || undefined,
      baseUrl: baseUrl || undefined,
    });
    setSavedSuccess(true);
    setHasExistingKey(Boolean(apiKey || hasExistingKey));
    setApiKey('');
    onConfigUpdated?.();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const currentProviderInfo = PROVIDERS.find((p) => p.id === selectedProvider);

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Cpu className="w-6 h-6 text-blue-400" /> AI Model & Engine Hub
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure the active AI intelligence powering the 8-step spine: Anthropic Claude, OpenAI, Groq, or local Ollama.
        </p>
      </div>

      {/* Provider Selector Cards */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Select AI Provider:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {PROVIDERS.map((p) => {
            const isSelected = selectedProvider === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleProviderSelect(p.id)}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <div>
                  <div className="text-2xl mb-2">{p.icon}</div>
                  <div className="font-bold text-sm text-white">{p.name}</div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">{p.desc}</p>
                </div>
                {isSelected && (
                  <span className="mt-3 text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Selected
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSaveConfig} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-5">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <span className="text-lg">{currentProviderInfo?.icon}</span>
            <span>Configure {currentProviderInfo?.name}</span>
          </div>
          {hasExistingKey && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> API Key Configured
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Model Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Model Name
            </label>
            <div className="space-y-2">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              >
                {currentProviderInfo?.models.map((m) => (
                  <option key={m} value={m} className="bg-[#0f111a] text-white">
                    {m}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Or type custom model name..."
                className="w-full bg-white/[0.02] border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-400 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* API Key Input */}
          {selectedProvider !== 'mock' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" /> API Secret Key
                </span>
                {hasExistingKey && !apiKey && (
                  <span className="text-[10px] text-slate-500 italic">Leave blank to keep existing key</span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    selectedProvider === 'inferx'
                      ? 'ix_... (Pre-configured from ~/.omp/agent/models.yml)'
                      : selectedProvider === 'anthropic'
                      ? 'sk-ant-api03-...'
                      : selectedProvider === 'openai'
                      ? 'sk-proj-...'
                      : selectedProvider === 'groq'
                      ? 'gsk_...'
                      : 'Optional for local Ollama'
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-white"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Custom Base URL (Ollama or Proxy) */}
          {(selectedProvider === 'ollama' || baseUrl) && (
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-purple-400" /> Custom API Base URL
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="e.g. http://127.0.0.1:11434/v1/chat/completions"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          )}
        </div>

        {/* Test Result Feedback Card */}
        {testResult && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
              testResult.ok
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}
          >
            {testResult.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 text-xs">
              <div className="font-bold">{testResult.message}</div>
              {testResult.error && <p className="text-[11px] font-mono text-rose-300">{testResult.error}</p>}
              {testResult.ok && (
                <span className="text-[10px] text-emerald-400 block font-mono">
                  Ping Latency: {testResult.latencyMs}ms
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <button
            type="button"
            disabled={testing}
            onClick={handleTestConnection}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 text-slate-300 font-medium text-xs transition-all border border-white/5"
          >
            <Zap className={`w-3.5 h-3.5 text-amber-400 ${testing ? 'animate-bounce' : ''}`} />
            {testing ? 'Testing Live Connection...' : 'Test Connection'}
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved & Activated!
              </span>
            )}
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-600/25"
            >
              <Save className="w-3.5 h-3.5" /> Save Configuration
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
