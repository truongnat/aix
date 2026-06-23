import ora from 'ora'
import { isVersionChanged } from '../../versioning';

export async function install() {
    const spinner = ora('Start install [Harness Engineer]...').start();

    // STEP 1: check version change
    const isChanged = await isVersionChanged();
    spinner.succeed(`Checking [Harness Engineer] update: ${isChanged ? 'Update available' : 'Up to date'}`);

    // STEP 2: get remote version;

}

await install();