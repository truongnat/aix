import type { Phase, Role, Provider, SkillCategory } from '@x/core';

export interface DesktopSkillSummary {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly kind: 'domain' | 'process' | 'reference';
  readonly category?: SkillCategory | undefined;
  readonly tags: readonly string[];
  readonly roles: readonly Role[];
  readonly compatible: readonly Provider[];
  readonly version: string;
  readonly referencesCount: number;
}

export interface DesktopSkillDetail extends DesktopSkillSummary {
  readonly body: string;
  readonly bodyTokenEstimate: number;
  readonly references: readonly string[];
  readonly dir: string;
}

export interface DesktopMemoryRecord {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly kind: 'solution' | 'decision' | 'prompt-template' | 'evidence';
  readonly tags: readonly string[];
  readonly createdAt: string;
}

export interface DesktopSessionSummary {
  readonly id: string;
  readonly path: string;
  readonly title: string;
  readonly isRunning: boolean;
  readonly phase?: Phase | undefined;
  readonly artifacts: readonly string[];
  readonly updatedAt: string;
}

export interface DesktopVerificationResult {
  readonly ok: boolean;
  readonly exitCode: number;
  readonly command: string;
  readonly stdout: string;
  readonly stderr: string;
  readonly durationMs: number;
  readonly generatedFilesCount: number;
}

export interface DesktopSystemStatus {
  readonly appVersion: string;
  readonly nodeVersion: string;
  readonly platform: string;
  readonly cwd: string;
  readonly skillsCount: number;
  readonly memoryCount: number;
  readonly kbServiceOnline: boolean;
  readonly kbPort: number;
  readonly activeAiProvider: string;
  readonly activeAiModel: string;
}

export type AiProviderId = 'inferx' | 'anthropic' | 'openai' | 'groq' | 'ollama' | 'codex' | 'mock';

export interface DesktopChatMessage {
  readonly id: string;
  readonly role: 'user' | 'assistant' | 'system';
  readonly content: string;
  readonly startedAt?: number;
  readonly endedAt?: number;
  readonly timestamp?: string;
  readonly status?: 'running' | 'done' | 'error' | 'stopped';
  readonly modelLabel?: string;
  readonly phase?: Phase;
  readonly logs?: readonly { readonly message: string; readonly timestamp: string }[];
  readonly artifacts?: readonly string[];
  readonly generatedFilesCount?: number;
}

export interface DesktopAiConfig {
  readonly provider: AiProviderId;
  readonly model: string;
  readonly hasApiKey: boolean;
  readonly baseUrl?: string;
  readonly useSubscription?: boolean;
}

export interface DesktopModelSource {
  readonly id: 'claude-code' | 'codex' | 'antigravity' | 'gemini' | 'ollama' | 'anthropic-key' | 'openai-key' | 'groq-key' | 'inferx-key' | 'mock';
  readonly name: string;
  readonly provider: AiProviderId;
  readonly authNote: string;
  readonly detected: boolean;
  /** True when the app can route calls through this source today. */
  readonly usable: boolean;
  readonly note: string;
  readonly models: readonly string[];
}

export interface DesktopTestConnectionResult {
  readonly ok: boolean;
  readonly latencyMs: number;
  readonly message: string;
  readonly error?: string;
}

export interface DesktopKbStatus {
  readonly online: boolean;
  readonly port: number;
  readonly url: string;
  readonly error?: string;
}

export interface DesktopHitlOption {
  readonly id: string;
  readonly label: string;
  readonly summary: string;
}

export interface DesktopHitlRequest {
  readonly id: string;
  readonly question: string;
  readonly options: readonly DesktopHitlOption[];
  readonly tier: 0 | 1 | 2;
}

export type DesktopSpineEvent =
  | { readonly type: 'phase'; readonly sessionId: string; readonly phase: Phase }
  | { readonly type: 'log'; readonly sessionId: string; readonly message: string; readonly timestamp: string }
  | { readonly type: 'hitl'; readonly sessionId: string; readonly request: DesktopHitlRequest }
  | { readonly type: 'artifacts'; readonly sessionId: string; readonly artifacts: readonly string[]; readonly generatedFilesCount: number }
  | { readonly type: 'node'; readonly sessionId: string; readonly node: string }
  | { readonly type: 'complete'; readonly sessionId: string; readonly checkpointId: string; readonly artifacts: readonly string[]; readonly generatedFilesCount: number }
  | { readonly type: 'error'; readonly sessionId: string; readonly error: string }
  | { readonly type: 'aborted'; readonly sessionId: string };

export interface AixDesktopAPI {
  // System
  getStatus(): Promise<DesktopSystemStatus>;
  getAiConfig(): Promise<DesktopAiConfig>;
  detectModelSources(): Promise<readonly DesktopModelSource[]>;
  setAiConfig(config: { provider: AiProviderId; model: string; apiKey?: string; baseUrl?: string; useSubscription?: boolean; sourceId?: string }): Promise<{ ok: boolean }>;
  testAiConnection(config?: { provider: AiProviderId; model: string; apiKey?: string; baseUrl?: string; useSubscription?: boolean }): Promise<DesktopTestConnectionResult>;
  getKbStatus(): Promise<DesktopKbStatus>;


  // Skills
  listSkills(category?: SkillCategory): Promise<readonly DesktopSkillSummary[]>;
  getSkill(name: string): Promise<DesktopSkillDetail | undefined>;
  validateSkills(): Promise<{ valid: number; warnings: string[]; errors: string[] }>;
  getSkillReference(skillName: string, refPath: string): Promise<string | undefined>;
  installProvider(provider: Provider): Promise<{ ok: boolean; written: number; skipped: number }>;
  // Memory
  listMemories(): Promise<readonly DesktopMemoryRecord[]>;
  searchMemories(query: string): Promise<readonly DesktopMemoryRecord[]>;
  pushMemory(title: string, body: string, tags?: string[]): Promise<{ ok: boolean; id: string }>;
  deleteMemory(id: string): Promise<{ ok: boolean }>;
  toggleKbService(action: 'start' | 'stop'): Promise<{ ok: boolean; message: string }>;
  // Sessions & Spine
  listSessions(): Promise<readonly DesktopSessionSummary[]>;
  getSessionArtifact(sessionId: string, artifactName: string): Promise<string | undefined>;
  listSessionFiles(sessionId: string): Promise<readonly string[]>;
  readSessionFile(sessionId: string, path: string): Promise<string>;
  runVerify(sessionId: string, command: string): Promise<DesktopVerificationResult>;
  startSpine(task: string, mode?: 'auto' | 'guided'): Promise<{ sessionId: string }>;
  respondHitl(requestId: string, decision: 'approve' | 'revise' | 'cancel', note?: string): Promise<void>;
  abortSpine(sessionId: string): Promise<boolean>;
  getSessionChat(sessionId: string): Promise<readonly DesktopChatMessage[]>;
  saveSessionChat(sessionId: string, messages: readonly DesktopChatMessage[]): Promise<{ ok: boolean }>;
  onSpineEvent(callback: (event: DesktopSpineEvent) => void): () => void;
}

declare global {
  interface Window {
    aixAPI: AixDesktopAPI;
  }
}
