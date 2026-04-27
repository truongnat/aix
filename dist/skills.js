#!/usr/bin/env node
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync, } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import degit from 'degit';
import inquirer from 'inquirer';
import matter from 'gray-matter';
import ora from 'ora';
import { spawnSync } from 'node:child_process';
import { installSkill } from './commands/installSkill.js';
// Simple CLI argument parser (replaces minimist)
function parseArgs(argv, options = {}) {
    const args = {};
    const positional = [];
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg.startsWith('--')) {
            const key = arg.slice(2);
            const isBoolean = options.boolean?.includes(key);
            const isString = options.string?.includes(key);
            if (isBoolean) {
                args[key] = true;
            }
            else if (isString || i + 1 < argv.length && !argv[i + 1].startsWith('-')) {
                args[key] = argv[++i];
            }
            else {
                args[key] = true;
            }
        }
        else if (arg.startsWith('-')) {
            const key = arg.slice(1);
            const isBoolean = options.boolean?.includes(key);
            const isString = options.string?.includes(key);
            if (isBoolean) {
                args[key] = true;
            }
            else if (isString || i + 1 < argv.length && !argv[i + 1].startsWith('-')) {
                args[key] = argv[++i];
            }
            else {
                args[key] = true;
            }
        }
        else {
            positional.push(arg);
        }
    }
    args._ = positional;
    return args;
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PKG_ROOT = resolve(__dirname, '..');
const DEFAULT_REPO = 'truongnat/skills';
const BUNDLE_DIR_SEGMENTS = ['.agents', 'devkit'];
const BUNDLE_MARKER = '.devkit-bundle';
const LEGACY_VENDOR_SEGMENTS = ['vendor', 'skills'];
const COMMAND_IDE_DIRS = {
    cursor: ['.cursor', 'commands'],
    claude: ['.claude', 'commands'],
};
// ─── helpers ────────────────────────────────────────────────────────────────
function bundlePath(projectDir) {
    return join(projectDir, ...BUNDLE_DIR_SEGMENTS);
}
function legacyBundlePath(projectDir) {
    return join(projectDir, ...LEGACY_VENDOR_SEGMENTS);
}
function elapsed(startMs) {
    const s = ((Date.now() - startMs) / 1000).toFixed(1);
    return chalk.dim(`(${s}s)`);
}
/** Levenshtein distance for fuzzy skill name matching. */
function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 0; j <= n; j++)
        dp[0][j] = j;
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    return dp[m][n];
}
function closestSkills(query, names, limit = 5) {
    return names
        .map((n) => ({ n, d: levenshtein(query, n) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, limit)
        .filter(({ d }) => d <= Math.max(5, query.length / 2))
        .map(({ n }) => n);
}
// ─── output helpers ──────────────────────────────────────────────────────────
function printLogo(version) {
    console.log(chalk.cyan(`
  ╔══════════════════════════════════════╗
  ║                                      ║
  ║   ${chalk.bold('devkit')}  ${chalk.dim(`v${version}`)}                    ║
  ║   AI skills bundle for Cursor/Claude ║
  ║                                      ║
  ╚══════════════════════════════════════╝
`));
}
function printHelp() {
    const repo = DEFAULT_REPO;
    console.log(`
${chalk.bold.cyan('devkit')} ${chalk.dim('— AI skills bundle installer')}

${chalk.bold('USAGE')}
  ${chalk.green(`npx github:${repo}`)} ${chalk.yellow('<command>')} ${chalk.dim('[options]')}

${chalk.bold('COMMANDS')}
  ${chalk.yellow('install')}    ${chalk.dim('(default)')}  Fetch bundle from GitHub and install to project
  ${chalk.yellow('update')}                Update existing bundle to latest
  ${chalk.yellow('add')} ${chalk.cyan('<skill>')}         Install a single skill by name
  ${chalk.yellow('uninstall')}             Remove all installed skills and bundle

${chalk.bold('INSTALL / UPDATE OPTIONS')}
  ${chalk.dim('--repo')}         ${chalk.dim('<user/repo>')}  Source repo  ${chalk.dim(`[default: ${repo}]`)}
  ${chalk.dim('--project-dir')} ${chalk.dim('<path>')}       Target project  ${chalk.dim('[default: cwd]')}
  ${chalk.dim('--yes, -y')}                  Skip interactive prompts
  ${chalk.dim('--help, -h')}                 Show this help

${chalk.bold('ADD OPTIONS')}
  ${chalk.dim('--all-ides')}     Install to cursor + claude + codex + antigravity
  ${chalk.dim('--project-dir')} ${chalk.dim('<path>')}       Target project

${chalk.bold('UNINSTALL OPTIONS')}
  ${chalk.dim('--force')}        Skip confirmation prompt
  ${chalk.dim('--nuclear')}      Also delete entire ${chalk.red('.cursor')} directory

${chalk.bold('EXAMPLES')}
  ${chalk.dim('# Install full bundle into current project')}
  ${chalk.green(`npx github:${repo}`)}

  ${chalk.dim('# Add a single skill')}
  ${chalk.green(`npx github:${repo} add react-pro`)}
  ${chalk.green(`npx github:${repo} add infrastructure-as-code-pro --all-ides`)}

  ${chalk.dim('# Update bundle')}
  ${chalk.green(`npx github:${repo} update`)}

  ${chalk.dim('# Uninstall')}
  ${chalk.green(`npx github:${repo} uninstall`)}
`);
}
// ─── core helpers ────────────────────────────────────────────────────────────
function parseCommandTargets(raw) {
    const { data } = matter(raw);
    const t = data.targets;
    let list = [];
    if (Array.isArray(t))
        list = t.map((x) => String(x).trim()).filter(Boolean);
    else if (typeof t === 'string')
        list = [t.trim()].filter(Boolean);
    if (list.length === 0)
        list = ['cursor', 'claude'];
    const allowed = new Set(Object.keys(COMMAND_IDE_DIRS));
    const filtered = [...new Set(list.filter((k) => allowed.has(k)))];
    return filtered.length > 0 ? filtered : ['cursor', 'claude'];
}
function collectCommandExcludePatterns(bundleDir) {
    const cmdRoot = join(bundleDir, 'commands');
    if (!existsSync(cmdRoot))
        return [];
    const out = [];
    for (const f of readdirSync(cmdRoot)) {
        if (!f.endsWith('.md'))
            continue;
        const text = readFileSync(join(cmdRoot, f), 'utf8');
        for (const ide of parseCommandTargets(text)) {
            const pair = COMMAND_IDE_DIRS[ide];
            out.push(`${pair[0]}/${pair[1]}/${f}`);
        }
    }
    return out;
}
function normalizeRepo(input) {
    const s = input.trim();
    if (!s)
        return DEFAULT_REPO;
    if (/^[\w.-]+\/[\w.-]+$/.test(s) && !s.includes('://'))
        return s;
    const m = s.match(/github\.com[:/]([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/i);
    if (!m)
        throw new Error(`Could not parse repo: ${input}`);
    return `${m[1]}/${m[2]}`;
}
function httpsCloneUrl(repo) {
    return `https://github.com/${repo}.git`;
}
async function fetchRepo(repo) {
    const temp = mkdtempSync(join(tmpdir(), 'skills-'));
    const url = httpsCloneUrl(repo);
    const spin = ora({ text: `Fetching ${chalk.cyan(repo)}…`, color: 'cyan' }).start();
    try {
        const emitter = degit(repo, { cache: false, force: true });
        await emitter.clone(temp);
        spin.succeed(`Fetched ${chalk.cyan(repo)}`);
        return temp;
    }
    catch {
        spin.warn('degit failed — falling back to git clone');
        console.log(chalk.dim(`  git clone --depth 1 ${url}`));
        const res = spawnSync('git', ['clone', '--depth', '1', '--quiet', url, temp], {
            stdio: ['ignore', 'ignore', 'pipe'],
        });
        if (res.status === 0) {
            console.log(chalk.green('  ✔ Cloned'));
            return temp;
        }
        const stderr = res.stderr?.toString().trim();
        throw new Error(`git clone failed${stderr ? `: ${stderr}` : ''}`);
    }
}
function shouldIgnore(rel) {
    const p = rel.replace(/\\/g, '/');
    return (p.startsWith('.git/') ||
        p.startsWith('.venv/') ||
        p.startsWith('knowledge-base/embeddings/') ||
        p.startsWith('.claude/worktrees/') ||
        p.includes('/__pycache__/') ||
        p.endsWith('.pyc') ||
        p.endsWith('.DS_Store') ||
        p.startsWith('node_modules/'));
}
function syncBundle(src, dest) {
    const spin = ora({ text: 'Syncing bundle…', color: 'blue' }).start();
    const srcSkills = existsSync(join(src, 'skills'))
        ? readdirSync(join(src, 'skills')).filter((f) => lstatSync(join(src, 'skills', f)).isDirectory())
        : [];
    const destSkills = existsSync(join(dest, 'skills'))
        ? readdirSync(join(dest, 'skills')).filter((f) => lstatSync(join(dest, 'skills', f)).isDirectory())
        : [];
    const customSkills = destSkills.filter((s) => !srcSkills.includes(s));
    // Snapshot for rollback
    const snapshotDir = `${dest}.snapshot-${Date.now()}`;
    const hasSnapshot = existsSync(dest);
    if (hasSnapshot)
        cpSync(dest, snapshotDir, { recursive: true });
    if (customSkills.length > 0) {
        const tempDir = join(dest, '.skills-backup');
        mkdirSync(tempDir, { recursive: true });
        for (const skill of customSkills) {
            cpSync(join(dest, 'skills', skill), join(tempDir, skill), { recursive: true });
        }
    }
    try {
        rmSync(dest, { recursive: true, force: true });
        cpSync(src, dest, {
            recursive: true,
            filter: (s, d) => {
                const rel = d.replace(dest, '').replace(/^[\\/]/, '');
                const ok = !shouldIgnore(rel);
                if (ok && existsSync(s) && lstatSync(s).isFile())
                    spin.text = chalk.dim(`  ${rel}`);
                return ok;
            },
        });
        writeFileSync(join(dest, BUNDLE_MARKER), '');
    }
    catch (err) {
        spin.fail(chalk.red('Bundle sync failed — restoring previous state'));
        if (hasSnapshot) {
            rmSync(dest, { recursive: true, force: true });
            cpSync(snapshotDir, dest, { recursive: true });
            console.log(chalk.yellow('  Previous bundle restored.'));
        }
        rmSync(snapshotDir, { recursive: true, force: true });
        throw err;
    }
    if (hasSnapshot)
        rmSync(snapshotDir, { recursive: true, force: true });
    if (customSkills.length > 0) {
        const tempDir = join(dest, '.skills-backup');
        for (const skill of customSkills) {
            const backupPath = join(tempDir, skill);
            if (existsSync(backupPath))
                cpSync(backupPath, join(dest, 'skills', skill), { recursive: true });
        }
        rmSync(tempDir, { recursive: true, force: true });
        spin.succeed(`Bundle synced ${chalk.dim(`(+${customSkills.length} custom skills preserved)`)}`);
    }
    else {
        spin.succeed('Bundle synced');
    }
}
function linkRules(bundleDir, project) {
    const rulesSrc = join(bundleDir, '.cursor', 'rules');
    const rulesDst = join(project, '.cursor', 'rules');
    if (!existsSync(rulesSrc))
        return;
    mkdirSync(rulesDst, { recursive: true });
    cpSync(rulesSrc, rulesDst, { recursive: true, force: true });
    for (const f of readdirSync(rulesSrc)) {
        if (!f.endsWith('.mdc'))
            continue;
        const s = join(rulesSrc, f);
        const d = join(rulesDst, f);
        try {
            rmSync(d, { force: true });
            symlinkSync(s, d, 'file');
        }
        catch { /* keep copied file */ }
    }
}
function loadInstallManifest(projectDir) {
    const path = join(projectDir, '.cursor', '.skills-install.json');
    if (!existsSync(path))
        return { version: 1, createdPaths: [] };
    try {
        const parsed = JSON.parse(readFileSync(path, 'utf8'));
        return Array.isArray(parsed.createdPaths) ? parsed : { version: 1, createdPaths: [] };
    }
    catch {
        return { version: 1, createdPaths: [] };
    }
}
function saveInstallManifest(projectDir, manifest) {
    const cursorDir = join(projectDir, '.cursor');
    if (!existsSync(cursorDir))
        mkdirSync(cursorDir, { recursive: true });
    writeFileSync(join(cursorDir, '.skills-install.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}
function registerCreatedPath(projectDir, manifest, absPath) {
    const rel = relative(projectDir, absPath).replace(/\\/g, '/');
    if (!manifest.createdPaths.includes(rel))
        manifest.createdPaths.push(rel);
}
function installCommands(bundleDir, project, manifest) {
    const cmdRoot = join(bundleDir, 'commands');
    if (!existsSync(cmdRoot))
        return;
    for (const f of readdirSync(cmdRoot)) {
        if (!f.endsWith('.md'))
            continue;
        const src = join(cmdRoot, f);
        const raw = readFileSync(src, 'utf8');
        for (const ide of parseCommandTargets(raw)) {
            const pair = COMMAND_IDE_DIRS[ide];
            const dstDir = join(project, pair[0], pair[1]);
            mkdirSync(dstDir, { recursive: true });
            const dst = join(dstDir, f);
            try {
                rmSync(dst, { force: true });
                symlinkSync(src, dst, 'file');
            }
            catch {
                cpSync(src, dst, { force: true });
            }
            registerCreatedPath(project, manifest, dst);
        }
    }
}
function installAllSkills(repoRoot, projectDir, mode, allIdes) {
    const skillsRoot = join(repoRoot, 'skills');
    const dirs = readdirSync(skillsRoot, { withFileTypes: true })
        .filter((d) => d.isDirectory() && existsSync(join(skillsRoot, d.name, 'SKILL.md')))
        .map((d) => join(skillsRoot, d.name));
    const spin = ora({ text: `Installing ${chalk.bold(String(dirs.length))} skills…`, color: 'cyan' }).start();
    const customSkills = getCustomSkills(projectDir, repoRoot);
    const backupDir = join(projectDir, '.skills-backup');
    if (customSkills.length > 0) {
        mkdirSync(backupDir, { recursive: true });
        for (const ide of ['.cursor', '.claude', '.agent', '.codex']) {
            const skillsDir = join(projectDir, ide, 'skills');
            if (!existsSync(skillsDir))
                continue;
            for (const skill of customSkills) {
                const skillPath = join(skillsDir, skill);
                if (existsSync(skillPath)) {
                    mkdirSync(join(backupDir, ide), { recursive: true });
                    cpSync(skillPath, join(backupDir, ide, skill), { recursive: true });
                }
            }
        }
    }
    let ok = 0, fail = 0;
    for (const dir of dirs) {
        try {
            installSkill({ skillDir: dir, projectDir, mode, force: true, allIdes, noGitIsolation: true });
            ok++;
        }
        catch {
            if (mode === 'symlink') {
                try {
                    installSkill({ skillDir: dir, projectDir, mode: 'copy', force: true, allIdes, noGitIsolation: true });
                    ok++;
                    continue;
                }
                catch {
                    fail++;
                }
            }
            else {
                fail++;
            }
        }
    }
    if (fail > 0) {
        spin.warn(chalk.yellow(`Installed ${ok}/${dirs.length} skills ${chalk.dim(`(${fail} failed)`)}`));
    }
    else {
        spin.succeed(`Installed ${chalk.bold.green(String(ok))} skills`);
    }
    if (customSkills.length > 0) {
        for (const ide of ['.cursor', '.claude', '.agent', '.codex']) {
            const skillsDir = join(projectDir, ide, 'skills');
            mkdirSync(skillsDir, { recursive: true });
            for (const skill of customSkills) {
                const backupPath = join(backupDir, ide, skill);
                if (existsSync(backupPath))
                    cpSync(backupPath, join(skillsDir, skill), { recursive: true });
            }
        }
        rmSync(backupDir, { recursive: true, force: true });
        console.log(chalk.dim(`  Preserved custom: ${customSkills.join(', ')}`));
    }
    return { ok, fail, total: dirs.length };
}
function getCustomSkills(projectDir, bundleDir) {
    const bundleSkills = existsSync(join(bundleDir, 'skills'))
        ? new Set(readdirSync(join(bundleDir, 'skills')).filter((f) => lstatSync(join(bundleDir, 'skills', f)).isDirectory()))
        : new Set();
    const custom = [];
    for (const ide of ['.cursor', '.claude', '.agent', '.codex']) {
        const skillsDir = join(projectDir, ide, 'skills');
        if (!existsSync(skillsDir))
            continue;
        for (const d of readdirSync(skillsDir, { withFileTypes: true })) {
            if (d.isDirectory() && existsSync(join(skillsDir, d.name, 'SKILL.md')) && !bundleSkills.has(d.name) && !custom.includes(d.name))
                custom.push(d.name);
        }
    }
    return custom;
}
const GIT_EXCLUDE_MARKER_START = '# skills-begin';
const GIT_EXCLUDE_MARKER_END = '# skills-end';
function ensureGitExcludeBlock(projectDir, patterns) {
    const excludePath = join(projectDir, '.git', 'info', 'exclude');
    if (!existsSync(join(projectDir, '.git', 'info')))
        return;
    const existing = existsSync(excludePath) ? readFileSync(excludePath, 'utf8') : '';
    const withoutBlock = existing
        .replace(new RegExp(`\\n?${GIT_EXCLUDE_MARKER_START}[\\s\\S]*?${GIT_EXCLUDE_MARKER_END}\\n?`, 'g'), '')
        .trimEnd();
    const block = [GIT_EXCLUDE_MARKER_START, ...patterns, GIT_EXCLUDE_MARKER_END].join('\n');
    writeFileSync(excludePath, `${withoutBlock}\n${block}\n`, 'utf8');
}
function cleanupGitExclude(projectDir) {
    const excludePath = join(projectDir, '.git', 'info', 'exclude');
    if (!existsSync(excludePath))
        return;
    const cleaned = readFileSync(excludePath, 'utf8')
        .replace(new RegExp(`\\n?${GIT_EXCLUDE_MARKER_START}[\\s\\S]*?${GIT_EXCLUDE_MARKER_END}\\n?`, 'g'), '')
        .trimEnd();
    writeFileSync(excludePath, `${cleaned}\n`, 'utf8');
}
function runToolsCmd(toolsJs, bundleDir, ...args) {
    if (!existsSync(toolsJs))
        return false;
    const res = spawnSync(process.execPath, [toolsJs, ...args], { cwd: bundleDir, stdio: 'pipe' });
    return res.status === 0;
}
function manualToolsCmdHint(projectDir, ...args) {
    const localTools = join(projectDir, 'dist', 'tools.js');
    if (existsSync(localTools))
        return `node dist/tools.js ${args.join(' ')}`;
    return `node .agents/devkit/dist/tools.js ${args.join(' ')}`;
}
function uninstall(projectDir, nuclear) {
    const cursorSkills = join(projectDir, '.cursor', 'skills');
    const skills = existsSync(cursorSkills)
        ? readdirSync(cursorSkills).filter((n) => n !== '.install-manifest')
        : [];
    const spin = ora({ text: `Removing ${skills.length} skills…`, color: 'red' }).start();
    for (const s of skills) {
        for (const ide of ['.cursor', '.claude', '.codex', '.agent']) {
            rmSync(join(projectDir, ide, 'skills', s), { recursive: true, force: true });
        }
    }
    cleanupGitExclude(projectDir);
    rmSync(join(projectDir, '.cursor', 'skills', '.install-manifest'), { recursive: true, force: true });
    if (nuclear) {
        rmSync(join(projectDir, '.cursor'), { recursive: true, force: true });
    }
    else {
        const tryCleanRules = (base) => {
            const src = join(base, '.cursor', 'rules');
            const dst = join(projectDir, '.cursor', 'rules');
            if (!existsSync(src) || !existsSync(dst))
                return;
            const removable = new Set(readdirSync(src).filter((f) => f.endsWith('.mdc')));
            for (const f of readdirSync(dst)) {
                if (!removable.has(f))
                    continue;
                try {
                    unlinkSync(join(dst, f));
                }
                catch {
                    rmSync(join(dst, f), { force: true });
                }
            }
        };
        tryCleanRules(bundlePath(projectDir));
        tryCleanRules(legacyBundlePath(projectDir));
        rmSync(bundlePath(projectDir), { recursive: true, force: true });
        rmSync(legacyBundlePath(projectDir), { recursive: true, force: true });
        const manifest = loadInstallManifest(projectDir);
        for (const relPath of manifest.createdPaths) {
            const abs = join(projectDir, relPath);
            try {
                unlinkSync(abs);
            }
            catch {
                rmSync(abs, { recursive: true, force: true });
            }
        }
        rmSync(join(projectDir, '.cursor', '.skills-install.json'), { force: true });
    }
    spin.succeed(chalk.green(`Uninstalled ${skills.length} skills`));
}
// ─── main ────────────────────────────────────────────────────────────────────
async function main() {
    const pkg = JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf8'));
    const argv = parseArgs(process.argv.slice(2), {
        boolean: ['full', 'skills-only', 'cursor-only', 'yes', 'force', 'nuclear', 'help', 'all-ides'],
        string: ['repo', 'project-dir'],
    });
    // Handle aliases manually
    if (argv.h)
        argv.help = argv.h;
    if (argv.y)
        argv.yes = argv.y;
    if (argv.help) {
        printHelp();
        return;
    }
    const rawCmd = argv._[0];
    const cmd = rawCmd === 'uninstall' ? 'uninstall'
        : rawCmd === 'update' ? 'update'
            : rawCmd === 'add' ? 'add'
                : 'install';
    const interactive = !argv.yes && process.stdin.isTTY;
    // ── install / update ──────────────────────────────────────────────────────
    if (cmd === 'install' || cmd === 'update') {
        printLogo(pkg.version);
        let repo = normalizeRepo(String(argv.repo || DEFAULT_REPO));
        let projectDir = resolve(String(argv['project-dir'] || process.cwd()));
        const allIdes = true;
        const t0 = Date.now();
        if (cmd === 'update' && !existsSync(bundlePath(projectDir))) {
            console.log(chalk.yellow('  No existing bundle found — switching to install mode.\n'));
        }
        if (interactive) {
            const { target } = await inquirer.prompt([{
                    type: 'list',
                    name: 'target',
                    message: 'Install target',
                    choices: [
                        { name: `Current project  ${chalk.dim(projectDir)}`, value: 'local' },
                        { name: `Global           ${chalk.dim(join(homedir(), '.agents'))}`, value: 'global' },
                    ],
                    default: 'local',
                }]);
            if (target === 'global') {
                projectDir = resolve(join(homedir(), '.agents'));
                mkdirSync(projectDir, { recursive: true });
            }
        }
        const temp = await fetchRepo(repo);
        try {
            // Show skill diff for updates
            if (cmd === 'update') {
                const bundle = bundlePath(projectDir);
                if (existsSync(bundle) && existsSync(join(bundle, 'package.json'))) {
                    const oldPkg = JSON.parse(readFileSync(join(bundle, 'package.json'), 'utf8'));
                    const newPkg = JSON.parse(readFileSync(join(temp, 'package.json'), 'utf8'));
                    if (oldPkg.version !== newPkg.version)
                        console.log(`  ${chalk.dim('version')}  ${chalk.yellow(oldPkg.version)} ${chalk.dim('→')} ${chalk.green(newPkg.version)}`);
                    const oldSkills = readdirSync(join(bundle, 'skills')).filter((f) => lstatSync(join(bundle, 'skills', f)).isDirectory());
                    const newSkills = readdirSync(join(temp, 'skills')).filter((f) => lstatSync(join(temp, 'skills', f)).isDirectory());
                    const added = newSkills.filter((s) => !oldSkills.includes(s));
                    const removed = oldSkills.filter((s) => !newSkills.includes(s));
                    if (added.length)
                        console.log(`  ${chalk.green('+')} ${added.join(', ')}`);
                    if (removed.length)
                        console.log(`  ${chalk.red('-')} ${removed.join(', ')}`);
                    if (!added.length && !removed.length && oldPkg.version === newPkg.version)
                        console.log(chalk.dim('  No skill changes detected.'));
                    console.log();
                }
            }
            const bundle = bundlePath(projectDir);
            syncBundle(temp, bundle);
            linkRules(bundle, projectDir);
            const manifest = loadInstallManifest(projectDir);
            installCommands(bundle, projectDir, manifest);
            saveInstallManifest(projectDir, manifest);
            const { ok, fail } = installAllSkills(bundle, projectDir, process.platform === 'win32' ? 'copy' : 'symlink', allIdes);
            // git exclude
            const cmdExcludes = collectCommandExcludePatterns(bundle);
            const rulesExcludes = [];
            const rulesSrc = join(bundle, '.cursor', 'rules');
            if (existsSync(rulesSrc)) {
                for (const f of readdirSync(rulesSrc)) {
                    if (f.endsWith('.mdc'))
                        rulesExcludes.push(`.cursor/rules/${f}`);
                }
            }
            const skillDirs = ['.cursor/skills/', '.claude/skills/', '.agent/skills/', '.codex/skills/'];
            ensureGitExcludeBlock(projectDir, ['.agents/devkit/', ...skillDirs, '.cursor/.skills-install.json', ...cmdExcludes, ...rulesExcludes]);
            // Rebuild index
            const toolsJs = join(bundle, 'dist', 'tools.js');
            const indexOk = runToolsCmd(toolsJs, bundle, 'build-skill-index');
            if (!indexOk && existsSync(toolsJs)) {
                console.log(chalk.yellow('  Skill index rebuild failed — run manually:'));
                console.log(chalk.dim(`  ${manualToolsCmdHint(projectDir, 'build-skill-index')}`));
            }
            // Verify
            const verifyOk = runToolsCmd(toolsJs, bundle, 'verify-bundle-install', '--project-dir', projectDir, '--skip-validate-skills');
            if (!verifyOk && existsSync(toolsJs)) {
                console.log(chalk.yellow('\n  Bundle verification failed — run for details:'));
                console.log(chalk.dim(`  ${manualToolsCmdHint(projectDir, 'verify-bundle-install', '--project-dir', '.')}`));
            }
            // Summary
            const ideList = allIdes ? 'cursor · claude · codex · antigravity' : 'cursor';
            console.log(`
${chalk.bold('  Done')} ${elapsed(t0)}

  ${chalk.green('✔')} ${chalk.bold(String(ok))} skills installed${fail > 0 ? chalk.red(` (${fail} failed)`) : ''}
  ${chalk.green('✔')} IDEs: ${chalk.cyan(ideList)}
  ${chalk.green('✔')} Bundle: ${chalk.dim(relative(process.cwd(), bundle))}
${indexOk ? `  ${chalk.green('✔')} Skill index rebuilt` : ''}
${verifyOk ? `  ${chalk.green('✔')} Install verified` : ''}
`);
        }
        finally {
            rmSync(temp, { recursive: true, force: true });
        }
        // ── add ───────────────────────────────────────────────────────────────────
    }
    else if (cmd === 'add') {
        const skillName = argv._[1];
        if (!skillName) {
            console.error(chalk.red('Error: skill name required'));
            console.error(chalk.dim(`Usage: npx github:${DEFAULT_REPO} add <skill-name>`));
            process.exit(1);
        }
        const projectDir = resolve(String(argv['project-dir'] || process.cwd()));
        const allIdes = Boolean(argv['all-ides']);
        const repo = normalizeRepo(String(argv.repo || DEFAULT_REPO));
        const t0 = Date.now();
        const localBundle = bundlePath(projectDir);
        let bundleRoot = null;
        let tempDir = null;
        if (existsSync(join(localBundle, 'skills', skillName, 'SKILL.md'))) {
            bundleRoot = localBundle;
        }
        else {
            const fetchSpin = ora({ text: `Fetching skill list from ${chalk.cyan(repo)}…`, color: 'cyan' }).start();
            fetchSpin.stop();
            tempDir = await fetchRepo(repo);
            bundleRoot = tempDir;
        }
        try {
            const skillDir = join(bundleRoot, 'skills', skillName);
            if (!existsSync(join(skillDir, 'SKILL.md'))) {
                const allNames = existsSync(join(bundleRoot, 'skills'))
                    ? readdirSync(join(bundleRoot, 'skills'))
                        .filter((f) => lstatSync(join(bundleRoot, 'skills', f)).isDirectory())
                    : [];
                const suggestions = closestSkills(skillName, allNames);
                console.error(chalk.red(`\n  Skill "${skillName}" not found.`));
                if (suggestions.length > 0) {
                    console.error(chalk.yellow('  Did you mean:'));
                    for (const s of suggestions)
                        console.error(`    ${chalk.cyan(s)}`);
                }
                else {
                    console.error(chalk.dim(`  Use: npx github:${DEFAULT_REPO} -- --help  to see available skills`));
                }
                process.exit(1);
            }
            const installSpin = ora({ text: `Installing ${chalk.bold(skillName)}…`, color: 'cyan' }).start();
            const { installName, targets } = installSkill({
                skillDir,
                projectDir,
                mode: process.platform === 'win32' ? 'copy' : 'symlink',
                force: true,
                allIdes,
                noGitIsolation: false,
            });
            installSpin.succeed(`Installed ${chalk.bold.green(installName)} ${elapsed(t0)}`);
            for (const [ide, target] of Object.entries(targets)) {
                console.log(`    ${chalk.dim(ide.padEnd(12))} ${chalk.dim(relative(projectDir, target))}`);
            }
            // Rebuild index
            const toolsJs = join(bundlePath(projectDir), 'dist', 'tools.js');
            if (existsSync(toolsJs)) {
                const indexSpin = ora({ text: 'Rebuilding skill index…', color: 'blue' }).start();
                const ok = runToolsCmd(toolsJs, bundlePath(projectDir), 'build-skill-index');
                if (ok)
                    indexSpin.succeed('Skill index rebuilt');
                else
                    indexSpin.warn(chalk.yellow(`Index rebuild failed — run: ${manualToolsCmdHint(projectDir, 'build-skill-index')}`));
            }
        }
        finally {
            if (tempDir)
                rmSync(tempDir, { recursive: true, force: true });
        }
        // ── uninstall ─────────────────────────────────────────────────────────────
    }
    else {
        let projectDir = resolve(String(argv['project-dir'] || process.cwd()));
        let force = Boolean(argv.force);
        let nuclear = Boolean(argv.nuclear);
        if (interactive) {
            const a = await inquirer.prompt([
                { type: 'input', name: 'projectDir', message: 'Project directory to uninstall from', default: projectDir },
                {
                    type: 'list', name: 'force', message: 'Confirmation',
                    choices: [
                        { name: 'Ask confirmation (safe)', value: false },
                        { name: 'Force remove (skip confirm)', value: true },
                    ], default: false,
                },
                {
                    type: 'list', name: 'nuclear',
                    message: chalk.red('NUCLEAR — delete entire .cursor directory?'),
                    choices: [
                        { name: 'No  (keep .cursor, remove skills only)', value: false },
                        { name: chalk.red('Yes (remove entire .cursor)'), value: true },
                    ], default: false,
                },
            ]);
            projectDir = resolve(a.projectDir);
            force = a.force;
            nuclear = a.nuclear;
        }
        if (!force && process.stdin.isTTY) {
            const { ok } = await inquirer.prompt([{
                    type: 'confirm', name: 'ok',
                    message: `Uninstall devkit from ${chalk.yellow(projectDir)}?`,
                    default: false,
                }]);
            if (!ok) {
                console.log(chalk.dim('Aborted.'));
                return;
            }
        }
        uninstall(projectDir, nuclear);
        if (nuclear)
            console.log(chalk.dim('  .cursor directory removed.'));
    }
}
main().catch((e) => {
    console.error(chalk.red(`\n  Error: ${e.message || String(e)}`));
    process.exit(1);
});
