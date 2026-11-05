import React, { useState } from 'react';
import { Copy, Check, FileCode, CheckSquare, Square, ExternalLink } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

/**
 * Tokenizes and renders inline markdown safely into React nodes.
 * Supports: `code`, **bold**, *italic*, [link](url), and plain text.
 */
function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  // Regex for inline tokens:
  // Group 1: `code`
  // Group 2: **bold**
  // Group 3: *italic*
  // Group 4: [label](url) -> 5: label, 6: url
  const tokenRegex = /(`([^`]+)`)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(\[([^\]]+)\]\(([^)]+)\))/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    // Plain text before match
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // `inline code`
      elements.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 rounded-md bg-white/[0.07] border border-white/10 font-mono text-[11px] text-amber-300"
        >
          {match[2]}
        </code>
      );
    } else if (match[3]) {
      // **bold**
      elements.push(
        <strong key={key++} className="font-semibold text-white">
          {match[4]}
        </strong>
      );
    } else if (match[5]) {
      // *italic*
      elements.push(
        <em key={key++} className="italic text-slate-300">
          {match[6]}
        </em>
      );
    } else if (match[7]) {
      // [link](url)
      const label = match[8];
      const url = match[9];
      elements.push(
        <a
          key={key++}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline underline-offset-2 inline-flex items-center gap-0.5 font-medium"
        >
          {label}
          <ExternalLink className="w-2.5 h-2.5 opacity-60 inline" />
        </a>
      );
    }

    lastIndex = tokenRegex.lastIndex;
  }

  // Remaining text
  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return <>{elements}</>;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!content || !content.trim()) {
    return <div className="text-slate-500 text-xs italic py-6 text-center">No document content available.</div>;
  }

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = '';
  let codeIndex = 0;
  let tableBuffer: string[] = [];

  const flushTable = (keyPrefix: number) => {
    if (tableBuffer.length === 0) return;
    const rows = tableBuffer.map((r) =>
      r
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((cell) => cell.trim())
    );

    const header = rows[0] ?? [];
    // Row 1 is divider (|---|---|)
    const bodyRows = rows.slice(2);

    elements.push(
      <div key={`table-${keyPrefix}`} className="my-3 overflow-x-auto rounded-lg border border-white/10 bg-black/20">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              {header.map((col, ci) => (
                <th key={ci} className="py-2 px-3 font-semibold text-slate-200">
                  {renderInline(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {bodyRows.map((row, ri) => (
              <tr key={ri} className="hover:bg-white/[0.02] transition-colors">
                {row.map((cell, ci) => (
                  <td key={ci} className="py-2 px-3 text-slate-300">
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';

    // Code blocks ```
    if (line.startsWith('```')) {
      if (tableBuffer.length > 0) flushTable(i);
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
        codeBuffer = [];
      } else {
        inCodeBlock = false;
        const currentCode = codeBuffer.join('\n');
        const currentIndex = codeIndex++;
        const isCopied = copiedIndex === currentIndex;

        elements.push(
          <div
            key={`code-${i}`}
            className="my-3 rounded-xl border border-white/10 bg-[#06070a] overflow-hidden shadow-md group"
          >
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-white/[0.03] border-b border-white/5 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-mono">
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                {codeLanguage || 'text'}
              </span>
              <button
                type="button"
                onClick={() => handleCopyCode(currentCode, currentIndex)}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Copy code to clipboard"
                aria-label="Copy code block"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 text-[12px] font-mono text-slate-200 overflow-x-auto leading-relaxed whitespace-pre selection:bg-blue-600">
              <code>{currentCode}</code>
            </pre>
          </div>
        );
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Markdown Table rows
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      tableBuffer.push(line);
      continue;
    } else if (tableBuffer.length > 0) {
      flushTable(i);
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(
        <h1
          key={`h1-${i}`}
          className="text-lg font-bold text-white mt-5 mb-2 pb-1.5 border-b border-white/10 flex items-center gap-2"
        >
          {renderInline(line.slice(2))}
        </h1>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-base font-semibold text-slate-100 mt-4 mb-2 flex items-center gap-2">
          {renderInline(line.slice(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-sm font-semibold text-blue-300 mt-3 mb-1">
          {renderInline(line.slice(4))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="text-xs font-semibold text-slate-200 mt-2 mb-1 uppercase tracking-wider">
          {renderInline(line.slice(5))}
        </h4>
      );
      continue;
    }

    // Task list items - [ ] or - [x]
    if (line.trim().startsWith('- [ ] ')) {
      elements.push(
        <div key={`task-${i}`} className="flex items-start gap-2 py-0.5 text-xs text-slate-300">
          <Square className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
          <span>{renderInline(line.trim().slice(6))}</span>
        </div>
      );
      continue;
    }
    if (line.trim().startsWith('- [x] ') || line.trim().startsWith('- [X] ')) {
      elements.push(
        <div key={`task-done-${i}`} className="flex items-start gap-2 py-0.5 text-xs text-emerald-400">
          <CheckSquare className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
          <span className="line-through opacity-80">{renderInline(line.trim().slice(6))}</span>
        </div>
      );
      continue;
    }

    // Bullet list items
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      elements.push(
        <div key={`li-${i}`} className="flex items-start gap-2 py-0.5 text-xs text-slate-300 pl-2">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0" />
          <span className="leading-relaxed">{renderInline(line.trim().slice(2))}</span>
        </div>
      );
      continue;
    }

    // Numbered list items: 1. Item
    const numMatch = /^(\d+)\.\s+(.+)$/.exec(line.trim());
    if (numMatch) {
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-2 py-0.5 text-xs text-slate-300 pl-2">
          <span className="font-mono text-slate-500 text-[11px] shrink-0 mt-0.5">{numMatch[1]}.</span>
          <span className="leading-relaxed">{renderInline(numMatch[2] ?? '')}</span>
        </div>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="pl-3.5 py-1.5 my-2 border-l-2 border-blue-500/50 bg-blue-500/[0.03] text-xs text-slate-300 italic rounded-r-md"
        >
          {renderInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push(<hr key={`hr-${i}`} className="my-3 border-t border-white/10" />);
      continue;
    }

    // Regular paragraph
    if (line.trim()) {
      elements.push(
        <p key={`p-${i}`} className="text-xs text-slate-300 leading-relaxed py-0.5">
          {renderInline(line)}
        </p>
      );
    }
  }

  // Flush any trailing table
  if (tableBuffer.length > 0) {
    flushTable(lines.length);
  }

  return <div className="space-y-0.5 selection:bg-blue-600 selection:text-white">{elements}</div>;
};
