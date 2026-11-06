import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  BookOpen,
  ExternalLink,
  Copy,
  Check,
  Download,
  Loader2,
  FileText,
  ChevronRight,
} from 'lucide-react';
import type { DesktopSkillSummary, DesktopSkillDetail } from '@shared/api';
import type { SkillCategory, Provider } from '@x/core';
import { PageHeader } from '../components/ui/PageHeader';
import { Modal } from '../components/ui/Modal';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

const CATEGORIES: { slug: SkillCategory | 'all'; label: string }[] = [
  { slug: 'all', label: 'All Categories' },
  { slug: 'methodology', label: 'Methodology' },
  { slug: 'frontend', label: 'Frontend' },
  { slug: 'backend', label: 'Backend' },
  { slug: 'infrastructure', label: 'Infrastructure' },
  { slug: 'data', label: 'Data & Storage' },
  { slug: 'ai-agents', label: 'AI & Agents' },
  { slug: 'security', label: 'Security' },
  { slug: 'design', label: 'Design & UX' },
  { slug: 'business', label: 'Business' },
];

export const SkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<readonly DesktopSkillSummary[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<DesktopSkillDetail | null>(null);
  const [, setLoadingDetail] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Reference Content Viewer
  const [activeRefPath, setActiveRefPath] = useState<string | null>(null);
  const [activeRefContent, setActiveRefContent] = useState<string | null>(null);
  const [loadingRef, setLoadingRef] = useState<boolean>(false);

  // Provider Install State
  const [installingProvider, setInstallingProvider] = useState<Provider | null>(null);
  const [installStatus, setInstallStatus] = useState<string | null>(null);

  useEffect(() => {
    window.aixAPI.listSkills().then(setSkills);
  }, []);

  const filteredSkills = useMemo(() => {
    return skills.filter((s) => {
      const matchCat = selectedCategory === 'all' || s.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchCat;
      const matchText =
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.tags.some((t: string) => t.toLowerCase().includes(query));
      return matchCat && matchText;
    });
  }, [skills, selectedCategory, searchQuery]);

  const handleOpenDetail = async (name: string) => {
    setLoadingDetail(true);
    setActiveRefPath(null);
    setActiveRefContent(null);
    try {
      const detail = await window.aixAPI.getSkill(name);
      setSelectedSkill(detail ?? null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCopySkillCommand = (name: string) => {
    navigator.clipboard.writeText(`aix skills show ${name}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenReference = async (skillName: string, refFull: string) => {
    const filename = refFull.split('/').pop() ?? '';
    const relPath = `references/${filename}`;
    setActiveRefPath(filename);
    setLoadingRef(true);
    try {
      const content = await window.aixAPI.getSkillReference(skillName, relPath);
      setActiveRefContent(content ?? 'Reference content not found.');
    } catch (err: unknown) {
      setActiveRefContent(`Error reading reference: ${String(err)}`);
    } finally {
      setLoadingRef(false);
    }
  };

  const handleInstallToProvider = async (p: Provider) => {
    setInstallingProvider(p);
    setInstallStatus(null);
    try {
      const res = await window.aixAPI.installProvider(p);
      setInstallStatus(`Successfully installed to ${p}! (Written: ${res.written}, Skipped: ${res.skipped})`);
    } catch (err: unknown) {
      setInstallStatus(`Installation failed: ${String(err)}`);
    } finally {
      setInstallingProvider(null);
      setTimeout(() => setInstallStatus(null), 4000);
    }
  };

  return (
    <div className="min-w-0 p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Quick Installs */}
      <PageHeader
        title="Canonical Skill Library"
        description="Explore production-grade domain, methodology, and automation skills structured across 9 categories."
        actions={
          /* 1-Click Install to Providers */
          <div className="flex flex-wrap items-center gap-2">
            {(['claude', 'cursor', 'codex'] as Provider[]).map((prov) => (
              <button
                type="button"
                key={prov}
                disabled={installingProvider !== null}
                onClick={() => handleInstallToProvider(prov)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-medium transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {installingProvider === prov ? (
                  <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                ) : (
                  <Download className="w-3 h-3 text-slate-400" />
                )}
                Sync {prov.toUpperCase()}
              </button>
            ))}
          </div>
        }
        toolbar={
          <>
            <div className="relative">
              <label htmlFor="skill-search" className="sr-only">Search skills</label>
              <Search aria-hidden="true" className="pointer-events-none w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="skill-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills by name, trigger keywords, or technology..."
                className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors duration-150"
              />
            </div>

            {/* Category Pills */}
            <div role="group" aria-label="Filter skills by category" className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-3">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.slug}
                  aria-pressed={selectedCategory === cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-colors duration-150 ${
                    selectedCategory === cat.slug
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 hover:text-white border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </>
        }
      />

      {installStatus && (
        <div role="status" className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
          {installStatus}
        </div>
      )}

      {/* Skills Grid — tracks follow the pane width, not the window. */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-4">
        {skills.length > 0 && filteredSkills.length === 0 && (
          <p role="status" className="col-span-full text-center py-16 text-slate-400 text-sm border border-dashed border-white/10 rounded-2xl">
            No skills match this search or category.
          </p>
        )}
        {filteredSkills.map((skill) => (
          <button
            type="button"
            key={skill.id}
            onClick={() => handleOpenDetail(skill.name)}
            aria-label={`View documentation for skill ${skill.name}`}
            className="min-w-0 text-left w-full p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-blue-500/30 transition-colors duration-150 cursor-pointer flex flex-col justify-between gap-3 group"
          >
            <div className="space-y-2 w-full min-w-0">
              <div className="flex items-start justify-between gap-3">
                <span className="min-w-0 break-words font-bold text-sm text-white group-hover:text-blue-300 transition-colors duration-150">
                  {skill.name}
                </span>
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5">
                  {skill.category ?? 'uncategorized'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                {skill.description}
              </p>
            </div>

            <div className="w-full pt-3 border-t border-white/5 flex items-center justify-between gap-2 text-[11px] text-slate-400">
              <span>v{skill.version}</span>
              {skill.referencesCount > 0 ? (
                <span className="flex items-center gap-1 text-slate-300">
                  <BookOpen className="w-3 h-3" /> {skill.referencesCount} references
                </span>
              ) : (
                <span>Self-contained</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Skill Detail Modal */}
      <Modal
        open={selectedSkill !== null}
        onClose={() => setSelectedSkill(null)}
        title={selectedSkill?.name ?? 'Skill details'}
        maxWidth="max-w-4xl"
      >
        {selectedSkill && (
          <div className="space-y-6 text-xs">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  {selectedSkill.category}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopySkillCommand(selectedSkill.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 border border-blue-500/20 font-medium transition-colors duration-150"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied CLI Command' : 'Copy aix CLI Command'}
                </button>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed max-w-prose">{selectedSkill.description}</p>
            </div>

            {selectedSkill.references.length > 0 && (
              <section className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                <h3 className="font-semibold text-white">Bundled deep references</h3>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,14rem),1fr))] gap-2 text-slate-300">
                  {selectedSkill.references.map((ref: string) => {
                    const fname = ref.split('/').pop() ?? '';
                    return (
                      <button
                        type="button"
                        key={ref}
                        title={fname}
                        aria-pressed={activeRefPath === fname}
                        onClick={() => handleOpenReference(selectedSkill.name, ref)}
                        className="min-w-0 font-mono text-[11px] p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-blue-500/30 flex items-center justify-between gap-2 text-left group transition-colors duration-150"
                      >
                        <span className="flex min-w-0 items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                          <span className="truncate">{fname}</span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-blue-400" />
                      </button>
                    );
                  })}
                </div>

                {activeRefPath && (
                  <div className="p-4 rounded-xl bg-black/60 border border-blue-500/20 space-y-2 mt-3">
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
                      <span className="min-w-0 break-all font-mono text-blue-300 font-bold flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" /> {activeRefPath}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveRefPath(null)}
                        aria-label={`Close reference ${activeRefPath}`}
                        className="shrink-0 rounded px-1.5 py-0.5 text-slate-300 hover:text-white hover:bg-white/10 text-[11px] transition-colors duration-150"
                      >
                        Close
                      </button>
                    </div>
                    {loadingRef ? (
                      <div role="status" className="text-slate-400 py-4 text-center">Loading reference...</div>
                    ) : (
                      <pre className="font-mono text-[11px] text-slate-300 whitespace-pre-wrap break-words leading-relaxed max-h-60 overflow-y-auto overscroll-contain">
                        {activeRefContent}
                      </pre>
                    )}
                  </div>
                )}
              </section>
            )}

            <section className="space-y-2">
              <h3 className="font-semibold text-white">Skill instructions</h3>
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-slate-300 leading-relaxed text-xs break-words">
                <MarkdownRenderer content={selectedSkill.body} />
              </div>
            </section>
          </div>
        )}
      </Modal>
    </div>
  );
};
