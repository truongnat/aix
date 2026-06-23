import fs from 'node:fs';
import path from 'node:path';

import type { CommonRulesConfig } from '../rules/common-rules';
import { renderClaudeAdapter, renderClaudeSettings } from '../rules/render-claude-rules';
import { renderCodexAdapter, renderCodexRulesFile } from '../rules/render-codex-rules';
import type { SupportedProvider } from './install-targets';

interface InstallProviderRulesOptions {
    provider: SupportedProvider;
    providerRoot: string;
    coreRoot: string;
    adapterTemplatePath: string;
    commonRules: CommonRulesConfig;
    claudeSettingsBase?: Record<string, unknown>;
}

async function copyDirectoryContents(sourceRoot: string, destinationRoot: string): Promise<void> {
    await fs.promises.mkdir(destinationRoot, { recursive: true });

    const entries = await fs.promises.readdir(sourceRoot, { withFileTypes: true });
    for (const entry of entries) {
        const sourcePath = path.join(sourceRoot, entry.name);
        const destinationPath = path.join(destinationRoot, entry.name);

        if (entry.isDirectory()) {
            await copyDirectoryContents(sourcePath, destinationPath);
            continue;
        }

        await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true });
        await fs.promises.copyFile(sourcePath, destinationPath);
    }
}

export async function copyCoreRuleSources(sourceRulesRoot: string, coreRoot: string): Promise<string> {
    const sourceCoreRoot = path.join(sourceRulesRoot, 'core');
    const destinationRoot = path.join(coreRoot, 'rules', 'core');
    await copyDirectoryContents(sourceCoreRoot, destinationRoot);
    return destinationRoot;
}

export async function installProviderRules(options: InstallProviderRulesOptions): Promise<void> {
    const template = await fs.promises.readFile(options.adapterTemplatePath, 'utf8');
    await fs.promises.mkdir(options.providerRoot, { recursive: true });

    if (options.provider === 'claude') {
        const renderedAdapter = renderClaudeAdapter(template, options.commonRules.coreRuleFiles);
        await fs.promises.writeFile(path.join(options.providerRoot, 'CLAUDE.md'), renderedAdapter, 'utf8');
        const settings = renderClaudeSettings(options.claudeSettingsBase ?? {}, options.commonRules);
        await fs.promises.writeFile(
            path.join(options.providerRoot, 'settings.json'),
            `${JSON.stringify(settings, null, 2)}\n`,
            'utf8',
        );
        return;
    }

    const renderedAdapter = renderCodexAdapter(template, options.commonRules.coreRuleFiles);
    await fs.promises.writeFile(path.join(options.providerRoot, 'AGENTS.md'), renderedAdapter, 'utf8');
    await fs.promises.mkdir(path.join(options.providerRoot, 'rules'), { recursive: true });
    await fs.promises.writeFile(
        path.join(options.providerRoot, 'rules', 'default.rules'),
        renderCodexRulesFile(options.commonRules),
        'utf8',
    );
}
