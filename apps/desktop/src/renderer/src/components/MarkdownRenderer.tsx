import React, { useState } from 'react';
import { Copy, Check, FileCode, CheckSquare, Square } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!content || !content.trim()) {
    return <div className="text-slate-500 text-xs italic py-8 text-center">No document content available.</div>;
  }

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = '';
  let codeIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';

    // Code blocks ```
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        const codeText = codeBuffer.join('\n');
        const currentIndex = codeIndex++;
        elements.push(
          <div key={`code-${i}`} className="my-4 rounded-xl overflow-hidden bg-[#050608] border border-white/10 shadow-lg group">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-white/[0.03] border-b border-white/5 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                {codeLanguage || 'text'}
              </span>
              <button
                type="button"
                onClick={() => handleCopyCode(codeText, currentIndex)}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-[10px]"
              >
                {copiedIndex === currentIndex ? (
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
            <pre className="p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-xl font-bold text-white tracking-tight mt-6 mb-3 pb-2 border-b border-white/10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          {line.slice(2)}
        </h1>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-base font-bold text-white tracking-tight mt-5 mb-2.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          {line.slice(3)}
        </h2>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-sm font-semibold text-slate-200 mt-4 mb-2 flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-slate-400" />
          {line.slice(4)}
        </h3>
      );
      continue;
    }

    // Task list items - [ ] or - [x]
    if (line.trim().startsWith('- [ ] ')) {
      elements.push(
        <div key={`task-${i}`} className="flex items-start gap-2 my-1 text-xs text-slate-300">
          <Square className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
          <span>{line.trim().slice(6)}</span>
        </div>
      );
      continue;
    }
    if (line.trim().startsWith('- [x] ') || line.trim().startsWith('- [X] ')) {
      elements.push(
        <div key={`task-${i}`} className="flex items-start gap-2 my-1 text-xs text-emerald-300 font-medium">
          <CheckSquare className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
          <span>{line.trim().slice(6)}</span>
        </div>
      );
      continue;
    }

    // Bullet list items
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      elements.push(
        <div key={`li-${i}`} className="flex items-start gap-2 my-1 text-xs text-slate-300 pl-2">
          <span className="text-blue-400 font-bold">•</span>
          <span>{line.trim().slice(2)}</span>
        </div>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <div key={`quote-${i}`} className="p-3 my-2.5 rounded-r-xl bg-blue-500/5 border-l-2 border-blue-500 text-xs text-blue-200 italic leading-relaxed">
          {line.slice(2)}
        </div>
      );
      continue;
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push(<hr key={`hr-${i}`} className="my-4 border-white/10" />);
      continue;
    }

    // Regular paragraph
    if (line.trim()) {
      elements.push(
        <p key={`p-${i}`} className="text-xs text-slate-300 my-1.5 leading-relaxed">
          {line}
        </p>
      );
    }
  }

  return <div className="space-y-0.5 selection:bg-blue-600 selection:text-white">{elements}</div>;
};
