import os from 'node:os';
import path from 'node:path';

export type InstallScope = 'local' | 'global';
export type SupportedProvider = 'claude' | 'codex';

export interface InstallRoots {
    scope: InstallScope;
    coreRoot: string;
    providerRoots: Record<SupportedProvider, string>;
}

export function resolveInstallRoots(
    scope: InstallScope,
    cwd: string = process.cwd(),
    homeDir: string = os.homedir(),
): InstallRoots {
    const baseRoot = scope === 'global' ? homeDir : cwd;

    return {
        scope,
        coreRoot: path.join(baseRoot, '.ai-harness'),
        providerRoots: {
            claude: path.join(baseRoot, '.claude'),
            codex: path.join(baseRoot, '.codex'),
        },
    };
}
