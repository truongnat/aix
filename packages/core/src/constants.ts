export const PHASES = ['start', 'discuss', 'plan', 'run', 'verify', 'ship', 'remember'] as const;

export const SKILL_KINDS = ['domain', 'process', 'reference'] as const;

export const PROVIDERS = ['claude', 'cursor', 'codex', 'gemini'] as const;

export const ROLES = ['planner', 'coder', 'reviewer', 'architect'] as const;

export const SKILL_BODY_MAX_TOKENS = 5000;

export const SKILL_NAME_MAX = 64;

export const SKILL_DESC_MAX = 1024;

export const SCOPE = '@x';
