import type { CommandPrefixPolicy, CommonRulesConfig } from './common-rules';

function renderExamples(label: 'match' | 'not_match', examples?: string[]): string {
    if (!examples || examples.length === 0) {
        return `    ${label} = [],\n`;
    }

    const renderedExamples = examples.map((example) => `        "${example}",`).join('\n');
    return `    ${label} = [\n${renderedExamples}\n    ],\n`;
}

function renderPolicy(policy: CommandPrefixPolicy): string {
    return `prefix_rule(
    pattern = [${policy.pattern.map((segment) => `"${segment}"`).join(', ')}],
    decision = "${policy.decision}",
    justification = "${policy.justification}",
${renderExamples('match', policy.match)}${renderExamples('not_match', policy.notMatch)})`;
}

export function renderCodexAdapter(template: string, coreRuleFiles: string[]): string {
    const coreSection = `Read and follow these shared core rules:\n\n${coreRuleFiles
        .map((file) => `- \`.ai-harness/rules/core/${file}\``)
        .join('\n')}\n`;
    return template.replace('<!-- @core -->', coreSection);
}

export function renderCodexRulesFile(commonRules: CommonRulesConfig): string {
    return `${commonRules.commandPrefixPolicies.map(renderPolicy).join('\n\n')}\n`;
}
