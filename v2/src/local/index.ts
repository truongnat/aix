import fs from 'fs';
import path from 'path';

import { HARNESS_CONFIG_FILE } from '../constants';
import { config } from '../lib/config';

export async function installCore(coreRoot: string) {
    try {
        await fs.promises.access(coreRoot);
        console.log(`Core folder '${coreRoot}' already exists. Skipping creation.`);
    } catch (err) {
        await fs.promises.mkdir(coreRoot, { recursive: true });
        console.log(`Core folder '${coreRoot}' created successfully.`);
    }

    await fs.promises.writeFile(
        path.join(coreRoot, HARNESS_CONFIG_FILE),
        JSON.stringify(config, null, 2),
        'utf-8',
    );
}
