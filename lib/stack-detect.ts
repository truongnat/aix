type DomainId =
  | "frontend"
  | "backend"
  | "devops"
  | "mobile"
  | "data-ai"
  | "security"
  | "cloud"
  | "debugging";

interface ProjectAnalysisDomain {
  id: DomainId;
  confidence: number;
  evidence: string[];
}

interface ProjectAnalysisMeta {
  languages: string[];
  frameworks: string[];
  notes: string | null;
  domains: ProjectAnalysisDomain[];
}

interface ParsedProjectAnalysis {
  domains: DomainId[];
  meta: ProjectAnalysisMeta;
}

interface ProjectAnalysisInput {
  domains?: unknown;
  languages?: unknown;
  frameworks?: unknown;
  notes?: unknown;
}

interface StackScanResult {
  languages: string[];
  frameworks: string[];
  evidence: Record<string, string[]>;
  notes: string | null;
  domains: ProjectAnalysisDomain[];
}

const DOMAIN_LABELS: Record<DomainId, string> = {
  frontend: "Frontend",
  backend: "Backend",
  devops: "DevOps",
  mobile: "Mobile",
  "data-ai": "Data & AI",
  security: "Security",
  cloud: "Cloud",
  debugging: "Debugging",
};

const DOMAIN_IDS: DomainId[] = [
  "frontend",
  "backend",
  "devops",
  "mobile",
  "data-ai",
  "security",
  "cloud",
  "debugging",
];

function normalizeDomainSelection(values: string[]): DomainId[] {
  return [
    ...new Set(
      values
        .map((value) => value.trim())
        .filter((value): value is DomainId => DOMAIN_IDS.includes(value as DomainId))
    ),
  ];
}

function isKnownDomainId(value: string): value is DomainId {
  return normalizeDomainSelection([value]).length > 0;
}

function clampConfidence(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0.5;
  }
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

function coerceStringArray(value: unknown, limit = 12): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const result: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }
    const normalized = item.trim();
    if (normalized) {
      result.push(normalized);
    }
    if (result.length >= limit) {
      break;
    }
  }
  return result;
}

function parseDomainEntries(value: unknown): ProjectAnalysisDomain[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const entries: ProjectAnalysisDomain[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error("Each entry in analysis.domains must be an object.");
    }

    const raw = item as Record<string, unknown>;
    const id = typeof raw.id === "string" ? raw.id.trim() : "";
    if (!isKnownDomainId(id)) {
      continue;
    }

    entries.push({
      id,
      confidence: clampConfidence(raw.confidence),
      evidence: coerceStringArray(raw.evidence, 8),
    });
  }

  entries.sort(
    (a, b) => b.confidence - a.confidence || DOMAIN_LABELS[a.id].localeCompare(DOMAIN_LABELS[b.id])
  );
  return entries;
}

function parseProjectAnalysis(input: string | ProjectAnalysisInput): ParsedProjectAnalysis {
  let payload: unknown = input;
  if (typeof input === "string") {
    try {
      payload = JSON.parse(input);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Project analysis must be valid JSON: ${message}`);
    }
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Project analysis must be a JSON object.");
  }

  const analysis = payload as ProjectAnalysisInput;
  const domains = parseDomainEntries(analysis.domains);
  return {
    domains: normalizeDomainSelection(domains.map((domain) => domain.id)),
    meta: {
      languages: coerceStringArray(analysis.languages, 12),
      frameworks: coerceStringArray(analysis.frameworks, 12),
      notes:
        typeof analysis.notes === "string" && analysis.notes.trim() ? analysis.notes.trim() : null,
      domains,
    },
  };
}

function mergeStackSignals(ai: ProjectAnalysisInput, scan: StackScanResult): ProjectAnalysisInput {
  // AI domains win when present; scanner fills gaps
  const aiDomains =
    Array.isArray(ai.domains) && (ai.domains as unknown[]).length > 0
      ? ai.domains
      : scan.domains.map((d) => ({ id: d.id, confidence: d.confidence, evidence: d.evidence }));

  const aiFrameworks =
    Array.isArray(ai.frameworks) && (ai.frameworks as unknown[]).length > 0
      ? ai.frameworks
      : scan.frameworks;

  const aiLanguages =
    Array.isArray(ai.languages) && (ai.languages as unknown[]).length > 0
      ? ai.languages
      : scan.languages;

  const aiNotes =
    typeof ai.notes === "string" && (ai.notes as string).trim() ? ai.notes : scan.notes;

  return {
    domains: aiDomains,
    frameworks: aiFrameworks,
    languages: aiLanguages,
    notes: aiNotes,
  };
}

export {
  DOMAIN_LABELS,
  isKnownDomainId,
  mergeStackSignals,
  normalizeDomainSelection,
  parseProjectAnalysis,
};
export type {
  DomainId,
  ParsedProjectAnalysis,
  ProjectAnalysisDomain,
  ProjectAnalysisInput,
  ProjectAnalysisMeta,
  StackScanResult,
};
