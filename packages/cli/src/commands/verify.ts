import { Command } from 'commander';
import { exec, type ExecException } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, realpath, stat, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative } from 'node:path';
import { promisify } from 'node:util';
import { SessionStore, sessionDir, sessionGeneratedDir } from '@x/engine';
import type { EngineState } from '@x/engine';
import { checkShell, redact, redactStrings } from '@x/policy';

const execute = promisify(exec);

export function registerVerifyCommand(program: Command): void {
  program
    .command('verify <session>')
    .description('Run an explicit verification command against a persisted session sandbox')
    .requiredOption('--command <command>', 'Trusted verification command to execute in generated/')
    .action(async (id: string, opts: { command: string }) => {
      try {
        await verifySession(id, opts.command);
      } catch (error) {
        console.error(redactStrings(`Verification failed: ${error instanceof Error ? error.message : String(error)}`));
        process.exitCode = 1;
      }
    });
}

async function hashOutputs(state: EngineState, cwd: string): Promise<Record<string, string>> {
  if (redact(cwd).findings.some(finding => finding.type === 'secret')) {
    throw new Error('Verification directory contains a recognized secret');
  }
  const hashes: Record<string, string> = {};
  for (const file of state.writtenFiles ?? []) {
    const path = await realpath(file);
    if (redact(path).findings.some(finding => finding.type === 'secret')) {
      throw new Error('Generated output path contains a recognized secret');
    }
    const name = relative(cwd, path);
    if (!name || name === '..' || name.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) || isAbsolute(name)) {
      throw new Error('Generated output is outside the session sandbox');
    }
    if (!(await stat(path)).isFile()) throw new Error('Generated output is not a regular file');
    hashes[name.replace(/\\/g, '/')] = createHash('sha256').update(await readFile(path)).digest('hex');
  }
  return hashes;
}

async function verifySession(id: string, command: string): Promise<void> {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(id)) throw new Error('Invalid session identifier');
  if (!command.trim()) throw new Error('A verification command is required');
  const policy = checkShell(command);
  if (!policy.ok) throw new Error(policy.error.message);

  const store = new SessionStore();
  const state = await store.load(id);
  if (!state || state.session.id !== id) throw new Error('Session not found');
  // Invalidate old evidence before even checking paths: missing output must not leave a PASS.
  await store.save({
    ...state,
    session: { ...state.session, evidence: state.session.evidence.filter(entry => entry.phase !== 'verify') },
    verification: {
      status: 'failed', command, cwd: sessionGeneratedDir(id), exitCode: 1,
      output: 'Verification command has not completed.',
      checkedAt: new Date().toISOString(), files: {},
    },
  });
  await writeFile(join(sessionDir(id), 'VERIFY.md'), '# Verification\n\nStatus: NOT RUN\n\nThe requested verification has not completed.\n', 'utf8');
  if (!state.tasks.length || state.tasks.some(task => task.status !== 'done')) {
    throw new Error('All planned tasks must finish generation before verification');
  }
  if (!state.writtenFiles?.length) throw new Error('Session has no generated output to verify');
  const cwd = await realpath(sessionGeneratedDir(id));
  const before = await hashOutputs(state, cwd);

  let result: { exitCode: number; output: string };
  try {
    const { stdout, stderr } = await execute(command, { cwd, encoding: 'utf8' });
    result = { exitCode: 0, output: `${stdout}${stderr}` };
  } catch (error) {
    const failure = error as ExecException & { stdout?: string; stderr?: string };
    result = {
      exitCode: typeof failure.code === 'number' ? failure.code : 1,
      output: `${failure.stdout ?? ''}${failure.stderr ?? ''}\n${failure.message}`,
    };
  }

  let after: Record<string, string> = {};
  let unchanged = false;
  let output = result.output;
  try {
    after = await hashOutputs(state, cwd);
    unchanged = JSON.stringify(before) === JSON.stringify(after);
  } catch (error) {
    output += `\n${error instanceof Error ? error.message : String(error)}`;
  }
  if (!unchanged) output += '\nGenerated output changed during verification; run checks again on stable output.';
  const passed = result.exitCode === 0 && unchanged;
  const verification = {
    status: passed ? 'passed' as const : 'failed' as const,
    command: redactStrings(command), cwd, exitCode: result.exitCode,
    output: redactStrings(output), checkedAt: new Date().toISOString(), files: after,
  };
  const updated: EngineState = {
    ...state,
    session: {
      ...state.session,
      phase: 'verify',
      evidence: [
        ...state.session.evidence.filter(entry => entry.phase !== 'verify'),
        {
          phase: 'verify', kind: passed ? 'artifact' : 'eval',
          summary: passed ? 'Explicit verification command passed on unchanged generated output' : 'Verification failed',
          at: verification.checkedAt,
          ref: join(sessionDir(id), 'VERIFY.md'),
        },
      ],
    },
    verification,
  };
  await writeFile(join(sessionDir(id), 'VERIFY.md'),
    `# Verification\n\nStatus: ${verification.status.toUpperCase()}\n\nCommand: ${verification.command}\n\nWorking directory: ${cwd}\n\nExit code: ${verification.exitCode}\n\nChecked at: ${verification.checkedAt}\n\n## Output\n\n\`\`\`text\n${verification.output}\n\`\`\`\n\n## Generated file SHA-256\n\n${Object.entries(after).map(([file, hash]) => `- ${file}: ${hash}`).join('\n')}\n\nThis records the supplied command's result, not independent proof of every acceptance criterion. No files were shipped or applied to project source.\n`,
  'utf8');
  await store.save(updated);
  if (verification.output.trim()) console.log(verification.output.trimEnd());
  console.log(`Verification ${passed ? 'passed' : 'failed'} — Session ${id}`);
  if (!passed) process.exitCode = 1;
}
