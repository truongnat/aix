import { Command } from 'commander';
import { registerSkillsCommand } from './commands/skills.js';
import { registerDoctorCommand } from './commands/doctor.js';
import { registerInstallCommand } from './commands/install.js';
import { registerRunCommand } from './commands/run.js';
import { registerVerifyCommand } from './commands/verify.js';
import { registerMemoryCommand } from './commands/memory.js';
import { registerKbCommand } from './commands/kb.js';
import { registerContextCommand } from './commands/context.js';
import { registerEvalCommand } from './commands/eval.js';

const program = new Command();

program
  .name('aix')
  .description('AI Engineering Platform')
  .version('0.1.0');

registerSkillsCommand(program);
registerDoctorCommand(program);
registerInstallCommand(program);
registerRunCommand(program);
registerVerifyCommand(program);
registerMemoryCommand(program);
registerKbCommand(program);
registerContextCommand(program);
registerEvalCommand(program);

export async function run(args: string[]): Promise<void> {
  await program.parseAsync(args, { from: 'user' });
}

const isMain = process.argv[1]?.replace(/\\/g, '/').endsWith('/dist/index.js') ?? false;
if (isMain) {
  void program.parseAsync(process.argv).catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}

export { handleGitCheckIfDirty, revisePhase, setClackPrompts, setExecSync } from './commands/run.js';
