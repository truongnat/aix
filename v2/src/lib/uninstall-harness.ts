import fs from 'node:fs';

import { resolveInstallRoots, type InstallScope } from './install-targets';

export interface UninstallHarnessOptions {
    scope: InstallScope;
    cwd?: string;
    homeDir?: string;
}

export async function uninstallHarness(options: UninstallHarnessOptions): Promise<string[]> {
    const roots = resolveInstallRoots(options.scope, options.cwd, options.homeDir);
    const targets = [roots.coreRoot, roots.providerRoots.claude, roots.providerRoots.codex];
    const removed: string[] = [];

    for (const target of targets) {
        if (!fs.existsSync(target)) {
            continue;
        }

        await fs.promises.rm(target, { recursive: true, force: true });
        removed.push(target);
    }

    return removed;
}
