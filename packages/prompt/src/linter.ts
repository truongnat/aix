import type { AssembledPrompt } from './assembler.js';

export interface LintIssue {
  readonly level: 'error' | 'warn';
  readonly message: string;
}

export function lintPrompt(p: AssembledPrompt): readonly LintIssue[] {
  const issues: LintIssue[] = [];

  if (!p.system.toLowerCase().includes('success') && !p.system.toLowerCase().includes('criteria')) {
    issues.push({ level: 'warn', message: 'System prompt may be missing success criteria' });
  }

  if (p.tokenEstimate > 4000) {
    issues.push({ level: 'warn', message: `Token estimate ${p.tokenEstimate} is high, consider trimming` });
  }

  const hasJson = p.system.toLowerCase().includes('json');
  const hasMarkdown = p.system.toLowerCase().includes('markdown');
  if (hasJson && hasMarkdown) {
    issues.push({ level: 'warn', message: 'Potential contradiction: both JSON and Markdown output formats mentioned' });
  }

  if (!p.system.toLowerCase().includes('output') && !p.system.toLowerCase().includes('respond')) {
    issues.push({ level: 'error', message: 'No output constraints found in system prompt' });
  }

  if (p.skillMetadata.length === 0) {
    issues.push({ level: 'warn', message: 'No skills are included in the prompt assembly' });
  }

  return issues;
}
