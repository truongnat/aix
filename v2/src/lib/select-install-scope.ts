import * as clack from '@clack/prompts';

import type { InstallScope } from './install-targets';

export async function selectInstallScope(): Promise<InstallScope> {
    const scope = await clack.select({
        message: 'Install core + provider surfaces in this repo or in your runtime home?',
        options: [
            {
                value: 'local',
                label: 'Local',
                hint: 'Write into this repository',
            },
            {
                value: 'global',
                label: 'Global',
                hint: 'Write into ~/.ai-harness, ~/.claude, ~/.codex',
            },
        ],
    });

    if (clack.isCancel(scope)) {
        clack.cancel('Installation canceled by user.');
        process.exit(0);
    }

    return scope as InstallScope;
}
