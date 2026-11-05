import React, { useState, useEffect } from 'react';
import {
  Brain,
  Search,
  Plus,
  Tag,
  Clock,
  Sparkles,
  X,
  Trash2,
  Server,
  Power,
  Loader2,
} from 'lucide-react';
import type { DesktopMemoryRecord, DesktopSystemStatus } from '@shared/api';

export const MemoryPage: React.FC = () => {
  const [memories, setMemories] = useState<readonly DesktopMemoryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [status, setStatus] = useState<DesktopSystemStatus | null>(null);
  const [togglingKb, setTogglingKb] = useState<boolean>(false);
  const [kbMessage, setKbMessage] = useState<string | null>(null);

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newBody, setNewBody] = useState<string>('');
  const [newTags, setNewTags] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const loadData = () => {
    window.aixAPI.listMemories().then(setMemories);
    window.aixAPI.getStatus().then(setStatus).catch(() => {});
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      window.aixAPI.listMemories().then(setMemories);
    } else {
      window.aixAPI.searchMemories(query).then(setMemories);
    }
  };

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;
    setSaving(true);
    try {
      const tags = newTags.split(',').map((t) => t.trim()).filter(Boolean);
      await window.aixAPI.pushMemory(newTitle, newBody, tags);
      setShowAddModal(false);
      setNewTitle('');
      setNewBody('');
      setNewTags('');
      loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this memory record?')) return;
    await window.aixAPI.deleteMemory(id);
    loadData();
  };

  const handleToggleKb = async () => {
    setTogglingKb(true);
    setKbMessage(null);
    const action = status?.kbServiceOnline ? 'stop' : 'start';
    try {
      const res = await window.aixAPI.toggleKbService(action);
      setKbMessage(res.message);
      setTimeout(loadData, 1500);
    } finally {
      setTogglingKb(false);
      setTimeout(() => setKbMessage(null), 3500);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & KB Service Controller */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Durable Memory Hub
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {memories.length} Entries
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tier 1 Markdown memory saved locally in <code className="text-slate-300">.aix/runtime/memory/</code>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* KB Service Toggle */}
          <div className="flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span className="flex items-center gap-1.5 font-medium">
              <span
                className={`w-2 h-2 rounded-full ${
                  status?.kbServiceOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                }`}
              />
              KB Service: {status?.kbServiceOnline ? 'Online' : 'Offline'}
            </span>
            <button
              disabled={togglingKb}
              onClick={handleToggleKb}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all flex items-center gap-1 ${
                status?.kbServiceOnline
                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {togglingKb ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Power className="w-3 h-3" />
              )}
              {status?.kbServiceOnline ? 'Stop' : 'Launch'}
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition-all shadow-lg shadow-purple-600/20"
          >
            <Plus className="w-3.5 h-3.5" /> Record Memory
          </button>
        </div>
      </div>

      {kbMessage && (
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
          {kbMessage}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search durable memories, solutions, and architectural gotchas..."
          className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-all"
        />
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {memories.length === 0 ? (
          <div className="col-span-2 text-center py-16 text-slate-500 text-sm border border-dashed border-white/10 rounded-2xl">
            No memories found matching your search. Create one using the button above.
          </div>
        ) : (
          memories.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 space-y-3 flex flex-col justify-between transition-all group shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white">{m.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {m.kind}
                    </span>
                    <button
                      onClick={() => handleDeleteMemory(m.id)}
                      className="p-1 rounded text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-4">
                  {m.body}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {m.tags.map((t: string) => (
                    <span key={t} className="flex items-center gap-0.5 text-slate-400">
                      <Tag className="w-2.5 h-2.5" /> {t}
                    </span>
                  ))}
                </div>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(m.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <form
            onSubmit={handleCreateMemory}
            className="bg-[#0f111a] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" /> Record Durable Lesson
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. NestJS onModuleInit initialization order"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Body</label>
              <textarea
                required
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                placeholder="Describe the problem, root cause, working fix, and key insight..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 resize-none font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Tags (comma-separated)</label>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="nestjs, race-condition, initialization"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save to Memory'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
