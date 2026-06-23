import * as fs from 'fs';
import { HARNESS_CONFIG_FILE } from '../constants';
import { IHarnessConfig } from '../types';
// package.json file format:

// FUNC_1: getLocalVersion
export async function getLocalVersion(): Promise<string> {
    const packageJson = JSON.parse(await fs.promises.readFile(HARNESS_CONFIG_FILE, 'utf8')) as IHarnessConfig;
    return packageJson.version;
}

export async function getRemoteVersion(): Promise<string> {
    // Simulate fetching the remote version from a server or API
    // In a real implementation, you would use an HTTP request to get the version
    return '1.0.1'; // Example remote version
}

// FUNC_2: isVersionChanged
export async function isVersionChanged(): Promise<boolean> {
    return (await getLocalVersion()) !== (await getRemoteVersion());
}