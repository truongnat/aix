export interface Option {
  readonly id: string;
  readonly label: string;
  readonly summary: string;
  readonly artifact?: string;
}

export interface DecisionRequest {
  readonly question: string;
  readonly options: readonly Option[];
  readonly tier: 0 | 1 | 2;
}

export interface DecisionResponse {
  readonly chosen: string;
  readonly note?: string;
}

export interface HitlChannel {
  ask(req: DecisionRequest): Promise<DecisionResponse>;
}

export function resolvePreviewTier(question: string, options: readonly Option[]): 0 | 1 | 2 {
  const hasArtifact = options.some(o => o.artifact !== undefined);
  if (hasArtifact) return 2;

  const lower = question.toLowerCase();
  const tier1Keywords = ['architecture', 'flow', 'layout', 'diagram', 'mermaid', 'structure'];
  const tier2Keywords = ['ui', 'visual', 'preview', 'interface', 'html', 'render'];

  if (tier2Keywords.some(k => lower.includes(k))) return 2;
  if (tier1Keywords.some(k => lower.includes(k))) return 1;

  return 0;
}
