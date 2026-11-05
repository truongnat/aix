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
}

export interface AixDesktopAPI {
  // System
  getStatus(): Promise<DesktopSystemStatus>;

  // Skills
  listSkills(category?: SkillCategory): Promise<readonly DesktopSkillSummary[]>;
  getSkill(name: string): Promise<DesktopSkillDetail | undefined>;
  validateSkills(): Promise<{ valid: number; warnings: string[]; errors: string[] }>;

  // Memory
  listMemories(): Promise<readonly DesktopMemoryRecord[]>;
  searchMemories(query: string): Promise<readonly DesktopMemoryRecord[]>;
  pushMemory(title: string, body: string, tags?: string[]): Promise<{ ok: boolean; id: string }>;

  // Sessions & Spine
  listSessions(): Promise<readonly DesktopSessionSummary[]>;
  getSessionArtifact(sessionId: string, artifactName: string): Promise<string | undefined>;
  runVerify(sessionId: string, command: string): Promise<DesktopVerificationResult>;
}

declare global {
  interface Window {
    aixAPI: AixDesktopAPI;
  }
}
