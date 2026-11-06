import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Play,
  CheckCircle2,
  XCircle,
  FileCode,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import type { DesktopSessionSummary, DesktopVerificationResult } from '@shared/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Select } from '../components/ui/Select';

interface VerifyPageProps {
  sessions: readonly DesktopSessionSummary[];
}

export const VerifyPage: React.FC<VerifyPageProps> = ({ sessions }) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id ?? '');
  const [command, setCommand] = useState<string>('pnpm test');
  const [running, setRunning] = useState<boolean>(false);
  const [result, setResult] = useState<DesktopVerificationResult | null>(null);

  useEffect(() => {
    if (!sessions.some((session) => session.id === selectedSessionId)) {
      setSelectedSessionId(sessions[0]?.id ?? '');
    }
  }, [sessions, selectedSessionId]);

  const handleRunVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !command.trim()) return;
    setRunning(true);
    try {
      const res = await window.aixAPI.runVerify(selectedSessionId, command.trim());
      setResult(res);
    } catch (err: unknown) {
      setResult({
        ok: false,
        exitCode: 1,
        command: command.trim(),
        stdout: '',
        stderr: `Could not run or save verification evidence: ${String(err)}`,
        durationMs: 0,
        generatedFilesCount: 0,
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Generated-Code Test Runner"
        description={<span>Runs the selected command in the session's <code className="text-slate-300">generated/</code> working directory with your normal account permissions. This is not an OS sandbox; review generated scripts before running them.</span>}
      />

      {/* Execution Form Card */}
      <form onSubmit={handleRunVerify} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="verify-session" className="text-xs font-semibold text-slate-400">Target Session Output</label>
            <Select
              value={selectedSessionId}
              disabled={sessions.length === 0}
              ariaLabel="Target session output"
              options={sessions.map((s) => ({ value: s.id, label: s.id }))}
              onChange={setSelectedSessionId}
              emptyLabel="No sessions yet"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label htmlFor="verify-command" className="text-xs font-semibold text-slate-400">Test Command (in generated/)</label>
            <div className="flex gap-2">
              <input
                type="text"
                id="verify-command"
                required
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="e.g. pnpm test, node index.test.js"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={running || !selectedSessionId}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-600/25"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                {running ? 'Running...' : 'Execute'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {sessions.length === 0 && (
        <div role="status" className="p-5 rounded-xl border border-dashed border-white/10 text-slate-400 text-sm">
          No sessions are available yet. Run a generation task before trying a test command.
        </div>
      )}

      {/* Execution Terminal Result */}
      {result && (
        <div className="rounded-2xl bg-black/60 border border-white/10 overflow-hidden flex flex-col space-y-0 shadow-2xl">
          {/* Terminal Bar */}
          <div className="p-3.5 bg-white/[0.04] border-b border-white/10 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 font-semibold">{result.command}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="w-3.5 h-3.5" /> {result.durationMs}ms
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <FileCode className="w-3.5 h-3.5" /> {result.generatedFilesCount} files
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 ${
                  result.ok ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {result.ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                EXIT {result.exitCode}
              </span>
            </div>
          </div>

          {/* Terminal Output */}
          <div className="p-6 font-mono text-xs space-y-4 max-h-[500px] overflow-auto">
            {result.stdout && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-500">Standard Output:</span>
                <pre className="text-emerald-300/90 whitespace-pre-wrap leading-relaxed">{result.stdout}</pre>
              </div>
            )}

            {result.stderr && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-rose-500">Standard Error:</span>
                <pre className="text-rose-300/90 whitespace-pre-wrap leading-relaxed">{result.stderr}</pre>
              </div>
            )}

            {!result.stdout && !result.stderr && (
              <div className="text-slate-500">Command completed with no output.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
