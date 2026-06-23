import * as clack from '@clack/prompts';

import type { InstallScope } from './install-targets';

export async function confirmUninstall(scope: InstallScope): Promise<void> {
    const confirmed = await clack.confirm({
        message: `Remove all ai-harness surfaces from ${scope} scope? This deletes .ai-harness, .claude, and .codex.`,
        initialValue: false,
    });

    if (clack.isCancel(confirmed) || !confirmed) {
        clack.cancel('Uninstall canceled by user.');
        process.exit(0);
    }
}
