import fs from 'fs';
import path from 'path';

export async function checkHarnessExist(coreRoot: string = path.join(process.cwd(), '.ai-harness')) {
    const harnessConfigPath = path.join(coreRoot, '.harness.json');

    try {
        await fs.promises.access(harnessConfigPath, fs.constants.F_OK);
        return true; // .harness.json exists
    } catch (err) {
        return false; // .harness.json does not exist
    }
}
