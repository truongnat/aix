import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  BookOpen,
  X,
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
  useEffect(() => {
    if (!selectedSkill) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedSkill(null);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [selectedSkill]);


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
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Quick Installs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Canonical Skill Library
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {skills.length} Skills
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Explore production-grade domain, methodology, and automation skills structured across 9 categories.
          </p>
        </div>

        {/* 1-Click Install to Providers */}
        <div className="flex items-center gap-2">
          {(['claude', 'cursor', 'codex'] as Provider[]).map((prov) => (
            <button
              key={prov}
              disabled={installingProvider !== null}
              onClick={() => handleInstallToProvider(prov)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 text-xs font-medium transition-all"
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
      </div>

      {installStatus && (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
          {installStatus}
        </div>
      )}

      {/* Search & Category Pills */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills by name, trigger keywords, or technology..."
            className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white/[0.02] hover:bg-white/[0.06] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill) => (
          <button
            type="button"
            key={skill.id}
            onClick={() => handleOpenDetail(skill.name)}
            aria-label={`View documentation for skill ${skill.name}`}
            className="text-left w-full p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer flex flex-col justify-between group space-y-3 shadow-sm"
          >
            <div className="space-y-2 w-full">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                  {skill.name}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                  {skill.category ?? 'uncategorized'}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {skill.description}
              </p>
            </div>

            <div className="w-full pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
              <span>v{skill.version}</span>
              {skill.referencesCount > 0 ? (
                <span className="flex items-center gap-1 text-slate-300">
                  <BookOpen className="w-3 h-3" /> {skill.referencesCount} references
                </span>
              ) : (
                <span className="text-slate-400">Self-contained</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="skill-modal-title"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        >
          <div className="bg-surface-elevated border border-white/10 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 id="skill-modal-title" className="text-xl font-bold text-white">{selectedSkill.name}</h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {selectedSkill.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedSkill.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSkill(null)}
                aria-label="Close skill details"
                title="Close (Esc)"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopySkillCommand(selectedSkill.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 font-medium transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied CLI Command' : 'Copy aix CLI Command'}
                </button>
              </div>

              {selectedSkill.references.length > 0 && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                  <span className="font-semibold text-white block">Bundled Deep References (Click to Read):</span>
                  <div className="grid grid-cols-2 gap-2 text-slate-400">
                    {selectedSkill.references.map((ref: string) => {
                      const fname = ref.split('/').pop() ?? '';
                      return (
                        <button
                          key={ref}
                          onClick={() => handleOpenReference(selectedSkill.name, ref)}
                          className="font-mono text-[11px] truncate p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-blue-500/30 flex items-center justify-between text-left group transition-all"
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <FileText className="w-3.5 h-3.5 text-blue-400" />
                            {fname}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400" />
                        </button>
                      );
                    })}
                  </div>

                  {activeRefPath && (
                    <div className="p-4 rounded-xl bg-black/60 border border-blue-500/20 space-y-2 mt-3">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="font-mono text-blue-400 font-bold flex items-center gap-1.5">
                          <ExternalLink className="w-3.5 h-3.5" /> {activeRefPath}
                        </span>
                        <button
                          onClick={() => setActiveRefPath(null)}
                          className="text-slate-500 hover:text-white text-[11px]"
                        >
                          Close
                        </button>
                      </div>
                      {loadingRef ? (
                        <div className="text-slate-500 py-4 text-center">Loading reference...</div>
                      ) : (
                        <pre className="font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                          {activeRefContent}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <span className="font-semibold text-white block">Skill Instructions:</span>
                <pre className="p-4 rounded-xl bg-black/40 border border-white/5 text-slate-300 font-mono whitespace-pre-wrap leading-relaxed text-[11px]">
                  {selectedSkill.body}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
