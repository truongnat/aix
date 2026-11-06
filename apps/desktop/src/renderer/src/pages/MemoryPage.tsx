import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Tag,
  Clock,
  Sparkles,
  Trash2,
  Server,
  Power,
  Loader2,
} from 'lucide-react';
import type { DesktopMemoryRecord, DesktopSystemStatus } from '@shared/api';
import { PageHeader } from '../components/ui/PageHeader';
import { ConfirmDialog, Modal } from '../components/ui/Modal';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

// ponytail: length/line heuristic for showing "Read more"; measure the clamped element if short-but-wide notes get missed.
const isLongBody = (body: string): boolean => body.length > 280 || body.split('\n').length > 4;

const fieldClass =
  'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500 transition-colors duration-150';

export const MemoryPage: React.FC = () => {
  const [memories, setMemories] = useState<readonly DesktopMemoryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchQueryRef = useRef('');
  const memoryRequestIdRef = useRef(0);
  const [loadingMemories, setLoadingMemories] = useState<boolean>(true);
  const [memoryError, setMemoryError] = useState<string | null>(null);
  const [status, setStatus] = useState<DesktopSystemStatus | null>(null);
  const [togglingKb, setTogglingKb] = useState<boolean>(false);
  const [kbMessage, setKbMessage] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(() => new Set());

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newBody, setNewBody] = useState<string>('');
  const [newTags, setNewTags] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<DesktopMemoryRecord | null>(null);

  const loadMemories = (query = searchQueryRef.current) => {
    const requestId = ++memoryRequestIdRef.current;
    const request = query.trim()
      ? window.aixAPI.searchMemories(query.trim())
      : window.aixAPI.listMemories();
    setLoadingMemories(true);
    request
      .then((records) => {
        if (requestId !== memoryRequestIdRef.current) return;
        setMemories(records);
        setMemoryError(null);
      })
      .catch((error: unknown) => {
        if (requestId === memoryRequestIdRef.current) setMemoryError(`Could not load memories: ${String(error)}`);
      })
      .finally(() => {
        if (requestId === memoryRequestIdRef.current) setLoadingMemories(false);
      });
  };

  const loadData = () => {
    loadMemories();
    window.aixAPI.getStatus().then(setStatus).catch((error: unknown) => {
      setMemoryError(`Could not load service status: ${String(error)}`);
    });
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (query: string) => {
    searchQueryRef.current = query;
    setSearchQuery(query);
    loadMemories(query);
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((previous) => {
      const next = new Set(previous);
      if (!next.delete(id)) next.add(id);
      return next;
    });
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
    } catch (error: unknown) {
      setMemoryError(`Could not save memory: ${String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await window.aixAPI.deleteMemory(id);
      loadData();
    } catch (error: unknown) {
      setMemoryError(`Could not delete memory: ${String(error)}`);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleToggleKb = async () => {
    setTogglingKb(true);
    setKbMessage(null);
    const action = status?.kbServiceOnline ? 'stop' : 'start';
    try {
      const res = await window.aixAPI.toggleKbService(action);
      setKbMessage(res.message);
      setTimeout(loadData, 1500);
    } catch (error: unknown) {
      setKbMessage(`Could not ${action} KB service: ${String(error)}`);
    } finally {
      setTogglingKb(false);
      setTimeout(() => setKbMessage(null), 3500);
    }
  };

  return (
    <div className="min-w-0 p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & KB Service Controller */}
      <PageHeader
        title="Durable Memory Hub"
        description={<span>Tier 1 Markdown memory saved locally in <code className="text-slate-200">.aix/runtime/memory/</code>.</span>}
        actions={<>
          {/* KB Service Toggle */}
          <div className="flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span className="flex items-center gap-1.5 font-medium">
              <span
                className={`w-2 h-2 rounded-full ${
                  status?.kbServiceOnline ? 'bg-emerald-400 motion-safe:animate-pulse' : 'bg-slate-500'
                }`}
              />
              KB Service: {status?.kbServiceOnline ? 'Online' : 'Offline'}
            </span>
            <button
              type="button"
              disabled={togglingKb}
              onClick={handleToggleKb}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors duration-150 flex items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed ${
                status?.kbServiceOnline
                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20'
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
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition-colors duration-150 shadow-lg shadow-purple-600/20"
          >
            <Plus className="w-3.5 h-3.5" /> Record Memory
          </button>
        </>}
      />
      {kbMessage && (
        <div role="status" className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
          {kbMessage}
        </div>
      )}
      {memoryError && <div role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">{memoryError}</div>}

      {/* Search Bar */}
      <div className="relative">
        <label htmlFor="memory-search" className="sr-only">Search memories</label>
        <Search aria-hidden="true" className="pointer-events-none w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          id="memory-search"
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search durable memories, solutions, and architectural gotchas..."
          className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500 transition-colors duration-150"
        />
      </div>

      {/* Memory Cards Grid — tracks follow the pane width, not the window. */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,22rem),1fr))] gap-4">
        {loadingMemories && memories.length === 0 ? (
          <div role="status" className="col-span-full text-center py-16 text-slate-400 text-sm border border-dashed border-white/10 rounded-2xl">Loading memories…</div>
        ) : memories.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-400 text-sm border border-dashed border-white/10 rounded-2xl">
            {searchQuery.trim() ? 'No memories match this search.' : 'No memories saved yet. Create one using the button above.'}
          </div>
        ) : (
          memories.map((m) => {
            const expanded = expandedIds.has(m.id);
            const bodyId = `memory-note-${m.id}`;
            return (
              <article
                key={m.id}
                className="min-w-0 p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 flex flex-col justify-between gap-4 transition-colors duration-150 group"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 break-words font-bold text-sm leading-snug text-white">{m.title}</h3>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {m.kind}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(m)}
                        aria-label={`Delete memory: ${m.title}`}
                        title={`Delete memory: ${m.title}`}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-[color,background-color,opacity] duration-150 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div id={bodyId} className={`text-xs text-slate-300 leading-relaxed break-words ${expanded ? '' : 'line-clamp-4'}`}>
                    <MarkdownRenderer content={m.body} />
                  </div>
                  {isLongBody(m.body) && (
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={bodyId}
                      onClick={() => toggleExpanded(m.id)}
                      className="rounded text-xs font-medium text-purple-300 hover:text-purple-200 transition-colors duration-150"
                    >
                      {expanded ? 'Collapse' : 'Read more'}
                      <span className="sr-only">: {m.title}</span>
                    </button>
                  )}
                </div>

                <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-x-2 gap-y-1 flex-wrap min-w-0">
                    {m.tags.map((t: string) => (
                      <span key={t} className="flex items-center gap-0.5 break-all">
                        <Tag className="w-2.5 h-2.5 shrink-0" /> {t}
                      </span>
                    ))}
                  </div>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(m.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </article>
            );
          })
        )}
      </div>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Record Durable Lesson" maxWidth="max-w-lg">
        <form onSubmit={handleCreateMemory} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="memory-title" className="text-xs font-semibold text-slate-300">Title</label>
            <input
              id="memory-title"
              type="text"
              required
              data-autofocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. NestJS onModuleInit initialization order"
              className={fieldClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="memory-body" className="text-xs font-semibold text-slate-300">Body</label>
            <textarea
              id="memory-body"
              required
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Describe the problem, root cause, working fix, and key insight..."
              className={`${fieldClass} h-32 resize-y font-sans`}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="memory-tags" className="text-xs font-semibold text-slate-300">Tags (comma-separated)</label>
            <input
              id="memory-tags"
              type="text"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="nestjs, race-condition, initialization"
              className={fieldClass}
            />
          </div>

          <div className="pt-2 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {saving ? 'Saving...' : 'Save to Memory'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete memory record"
        message={`Delete "${deleteTarget?.title ?? ''}" permanently? This durable lesson will be removed from local memory.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => { if (deleteTarget) void handleDeleteMemory(deleteTarget.id); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
