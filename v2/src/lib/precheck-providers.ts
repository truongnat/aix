import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { HARNESS_PROVIDERS } from '../constants';
import { IHarnessProvider } from '../types';

const execFileAsync = promisify(execFile);

export interface IProviderInstallStatus extends IHarnessProvider {
    installed: boolean;
}

async function commandExists(command: string): Promise<boolean> {
    const checker = process.platform === 'win32' ? 'where' : 'which';
    try {
        await execFileAsync(checker, [command]);
        return true;
    } catch {
        return false;
    }
}

/**
 * Checks which provider CLIs (claude, codex, ...) are already installed
 * on the user's machine, before prompting them to select providers.
 */
export async function precheckProviders(): Promise<IProviderInstallStatus[]> {
    const providers = Object.values(HARNESS_PROVIDERS);
    return Promise.all(
        providers.map(async (provider) => ({
            ...provider,
            installed: await commandExists(provider.value),
        })),
    );
}
