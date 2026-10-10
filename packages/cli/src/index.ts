import { Command } from 'commander';
import { registerSkillsCommand } from './commands/skills.js';
import { registerDoctorCommand } from './commands/doctor.js';
import { registerInstallCommand } from './commands/install.js';
import { registerRunCommand } from './commands/run.js';
import { registerVerifyCommand } from './commands/verify.js';
import { registerShipCommand } from './commands/ship.js';
import { registerMemoryCommand } from './commands/memory.js';
import { registerContextCommand } from './commands/context.js';
import { registerInitCommand } from './commands/init.js';
import { registerPluginCommand } from './commands/plugin.js';

const program = new Command();

program
  .name('aix')
  .description('AI Engineering Platform')
  .version('0.2.0');

registerSkillsCommand(program);
registerDoctorCommand(program);
registerInstallCommand(program);
registerRunCommand(program);
registerVerifyCommand(program);
registerShipCommand(program);
registerMemoryCommand(program);
registerContextCommand(program);
registerInitCommand(program);
registerPluginCommand(program);

export function run(args: string[]): void {
  program.parse(args, { from: 'user' });
}

import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const entryArg = process.argv[1];
const isMain = entryArg !== undefined
  && realpathSync(entryArg, { throwIfNoEntry: false }) === fileURLToPath(import.meta.url);
if (isMain) {
  program.parse(process.argv);
}

export { handleGitCheckIfDirty, setClackPrompts, setExecSync } from './commands/run.js';
