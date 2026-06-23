import type { CommonRulesConfig } from './common-rules';

type JsonObject = Record<string, unknown>;

function deepMerge(target: JsonObject, source: JsonObject): JsonObject {
    const out: JsonObject = { ...target };
    for (const [key, value] of Object.entries(source)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            const current =
                out[key] && typeof out[key] === 'object' && !Array.isArray(out[key])
                    ? (out[key] as JsonObject)
                    : {};
            out[key] = deepMerge(current, value as JsonObject);
        } else if (Array.isArray(value)) {
            const current = Array.isArray(out[key]) ? (out[key] as unknown[]) : [];
            out[key] = Array.from(new Set([...current, ...value]));
        } else {
            out[key] = value;
        }
    }
    return out;
}

export function renderClaudeAdapter(template: string, coreRuleFiles: string[]): string {
    const coreSection = `Read and follow these shared core rules:\n\n${coreRuleFiles
        .map((file) => `- \`.ai-harness/rules/core/${file}\``)
        .join('\n')}\n`;
    return template.replace('<!-- @core -->', coreSection);
}

export function renderClaudeSettings(
    baseFragment: JsonObject,
    commonRules: CommonRulesConfig,
): JsonObject {
    return deepMerge(baseFragment, {
        extraKnownMarketplaces: {
            'ai-engineering-harness': {
                source: {
                    source: 'github',
                    repo: 'truongnat/ai-engineering-harness',
                },
            },
        },
        permissions: {
            allow: commonRules.claudePermissions.allow,
            ask: commonRules.claudePermissions.ask,
            deny: commonRules.claudePermissions.deny,
        },
    });
}
