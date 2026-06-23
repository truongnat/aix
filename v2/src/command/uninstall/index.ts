import ora from 'ora';

import { confirmUninstall } from '../../lib/confirm-uninstall';
import { selectInstallScope } from '../../lib/select-install-scope';
import { uninstallHarness } from '../../lib/uninstall-harness';

export async function uninstall() {
    const spinner = ora('Start uninstall [Harness Engineer]...').start();

    spinner.stop();
    const scope = await selectInstallScope();
    await confirmUninstall(scope);
    spinner.start(`Removing harness surfaces from ${scope} scope...`);

    const removed = await uninstallHarness({ scope });
    if (removed.length === 0) {
        spinner.succeed(`Nothing to remove in ${scope} scope.`);
        return;
    }

    spinner.succeed(`Removed ${removed.length} harness surface(s) from ${scope} scope.`);
    for (const target of removed) {
        console.log(`Removed: ${target}`);
    }
}

await uninstall();
