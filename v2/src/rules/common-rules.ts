export interface CommandPrefixPolicy {
    pattern: string[];
    decision: 'allow' | 'prompt' | 'forbidden';
    justification: string;
    match?: string[];
    notMatch?: string[];
}

export interface ClaudePermissionPolicy {
    allow: string[];
    ask: string[];
    deny: string[];
}

export interface CommonRulesConfig {
    coreRuleFiles: string[];
    commandPrefixPolicies: CommandPrefixPolicy[];
    claudePermissions: ClaudePermissionPolicy;
}

export function getCommonRulesConfig(): CommonRulesConfig {
    return {
        coreRuleFiles: [
            'blocking.md',
            'command-naming.md',
            'phase-guards.md',
            'sensitive-data.md',
            'session-memory.md',
            'tool-routing.md',
        ],
        commandPrefixPolicies: [
            {
                pattern: ['gh', 'pr', 'view'],
                decision: 'prompt',
                justification: 'Viewing pull requests requires approval',
                match: ['gh pr view 7888', 'gh pr view --repo openai/codex'],
                notMatch: ['gh pr --repo openai/codex view 7888'],
            },
            {
                pattern: ['rg'],
                decision: 'allow',
                justification: 'Fast code search is preferred over grep',
                match: ['rg install v2'],
                notMatch: ['grep install -R .'],
            },
            {
                pattern: ['printenv'],
                decision: 'forbidden',
                justification: 'Do not dump environment variables because they can expose secrets',
                match: ['printenv', 'printenv DATABASE_URL'],
                notMatch: ['printf "DATABASE_URL is configured\\n"'],
            },
            {
                pattern: ['env'],
                decision: 'forbidden',
                justification: 'Do not dump environment variables because they can expose secrets',
                match: ['env', 'env | sort'],
                notMatch: ['npx envinfo --system'],
            },
            {
                pattern: ['rm', '.env'],
                decision: 'forbidden',
                justification: 'Do not delete sensitive environment or secrets files without explicit approval',
                match: ['rm .env', 'rm .env.production'],
                notMatch: ['rm docs/tmp-note.md'],
            },
            {
                pattern: ['rm', '.env.local'],
                decision: 'forbidden',
                justification: 'Do not delete sensitive environment or secrets files without explicit approval',
                match: ['rm .env.local', 'rm .env.local.backup'],
                notMatch: ['rm local.env.example'],
            },
            {
                pattern: ['rm', '.envrc'],
                decision: 'forbidden',
                justification: 'Do not delete sensitive environment or secrets files without explicit approval',
                match: ['rm .envrc'],
                notMatch: ['rm docs/envrc-migration.md'],
            },
            {
                pattern: ['rm', '-rf', 'secrets'],
                decision: 'forbidden',
                justification: 'Do not delete sensitive environment or secrets files without explicit approval',
                match: ['rm -rf secrets', 'rm -rf secrets/cache'],
                notMatch: ['rm -rf test-fixtures'],
            },
        ],
        claudePermissions: {
            allow: ['Bash(rg *)', 'Bash(git diff *)'],
            ask: ['Bash(gh pr view *)'],
            deny: [
                'Read(./.env)',
                'Read(./.env.*)',
                'Read(./.env.local)',
                'Read(./.envrc)',
                'Read(./secrets/**)',
                'Read(./**/secrets/**)',
            ],
        },
    };
}
