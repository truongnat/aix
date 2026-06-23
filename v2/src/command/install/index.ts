import ora from 'ora'
import { checkHarnessExist } from '../../lib/check-harness-exist';
import {
    copyBuiltDist,
    copyCoreSkillSources,
    copyCoreToolSources,
    copyProviderSkillSources,
} from '../../lib/install-skill-surfaces';
import { copyCoreRuleSources, installProviderRules } from '../../lib/install-rule-surfaces';
import { resolveInstallRoots, type SupportedProvider } from '../../lib/install-targets';
import { selectInstallScope } from '../../lib/select-install-scope';
import { installCore } from '../../local';
import { selectProviders } from '../../lib/select-provider';
import { precheckProviders } from '../../lib/precheck-providers';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getCommonRulesConfig } from '../../rules/common-rules';
import fs from 'node:fs';

async function fakeRemoteGithub() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('1.0.1');
        }, 2000);
    });
}

export async function install() {
    const spinner = ora('Start install [Harness Engineer]...').start();

    // STEP 1: get remote version;
    spinner.info('Fetching remote version...');
    const remoteVersion = await fakeRemoteGithub() as string;
    spinner.succeed(`Fetched remote version: ${remoteVersion}`);

    // STEP 2: precheck which provider CLIs are already installed on this machine
    const providerStatuses = await precheckProviders();
    for (const provider of providerStatuses) {
        spinner.info(`${provider.label}: ${provider.installed ? 'detected' : 'not detected'} on this machine`);
    }

    // STEP 3: select provider install;
    const providers = await selectProviders();

    // STEP 4: select install scope;
    const scope = await selectInstallScope();
    const installRoots = resolveInstallRoots(scope);
    spinner.info(`Installing ${providers.join(', ')} with ${scope} scope`);
    spinner.info(`Core root: ${installRoots.coreRoot}`);

    // STEP 5: check harness existence for selected scope
    spinner.info('Check harness existence...');
    const isHarnessExist = await checkHarnessExist(installRoots.coreRoot);
    if (isHarnessExist) {
        spinner.fail('[Harness Engineer] is already installed');
        return;
    }
    spinner.succeed('No existing [Harness Engineer] found. Proceeding with installation.');

    // STEP 6: install core + provider skill surfaces
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const sourceSkillsRoot = path.resolve(currentDir, '../../core/skills');
    const sourceToolsRoot = path.resolve(currentDir, '../../core/tools');
    const sourceDistRoot = path.resolve(currentDir, '../../../../dist');
    const sourceRulesRoot = path.resolve(currentDir, '../../../../rules');
    const claudeAdapterTemplatePath = path.resolve(currentDir, '../../../../rules/providers/claude/CLAUDE.md');
    const codexAdapterTemplatePath = path.resolve(currentDir, '../../../../rules/providers/codex/AGENTS.md');
    const claudeSettingsBasePath = path.resolve(
        currentDir,
        '../../../../runtime/claude/settings.project.fragment.json',
    );
    const commonRules = getCommonRulesConfig();
    await installCore(installRoots.coreRoot);
    await copyCoreSkillSources(sourceSkillsRoot, installRoots.coreRoot);
    await copyCoreToolSources(sourceToolsRoot, installRoots.coreRoot);
    await copyBuiltDist(sourceDistRoot, installRoots.coreRoot);
    await copyCoreRuleSources(sourceRulesRoot, installRoots.coreRoot);
    spinner.succeed(`Installed core surfaces to ${installRoots.coreRoot}`);

    for (const provider of providers as SupportedProvider[]) {
        await copyProviderSkillSources(
            sourceSkillsRoot,
            provider,
            installRoots.providerRoots[provider],
            installRoots.coreRoot,
        );
        await installProviderRules({
            provider,
            providerRoot: installRoots.providerRoots[provider],
            coreRoot: installRoots.coreRoot,
            adapterTemplatePath:
                provider === 'claude' ? claudeAdapterTemplatePath : codexAdapterTemplatePath,
            commonRules,
            claudeSettingsBase:
                provider === 'claude'
                    ? (JSON.parse(
                          await fs.promises.readFile(claudeSettingsBasePath, 'utf8'),
                      ) as Record<string, unknown>)
                    : undefined,
        });
        spinner.succeed(`Installed ${provider} skills to ${installRoots.providerRoots[provider]}`);
    }
}

await install();
