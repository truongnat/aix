import React from 'react';

interface PageHeaderProps {
  readonly title: string;
  readonly description?: React.ReactNode;
  readonly actions?: React.ReactNode;
  /** Optional content pinned inside the sticky surface, under the title row (e.g. search & filters). */
  readonly toolbar?: React.ReactNode;
}

/**
 * Sticky page header. Content scrolls underneath it; shared by all pages so
 * every tab keeps its title (and toolbar) visible.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions, toolbar }) => (
  <div className="sticky top-0 z-30 -mx-8 -mt-8 px-8 py-4 mb-6 bg-[#08090d]/90 backdrop-blur-xl border-b border-white/5">
    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-white truncate">{title}</h1>
        {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
    {toolbar && <div className="max-w-7xl mx-auto mt-4">{toolbar}</div>}
  </div>
);
