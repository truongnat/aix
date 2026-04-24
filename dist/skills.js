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
import minimist from 'minimist';
import { spawnSync } from 'node:child_process';
import { installSkill } from './commands/installSkill.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PKG_ROOT = resolve(__dirname, '..');
const DEFAULT_REPO = 'truongnat/skills';
/** Installed bundle directory (single source of truth on disk). */
const BUNDLE_DIR_SEGMENTS = ['.agents', 'devkit'];
const BUNDLE_MARKER = '.devkit-bundle';
/** Legacy install path (uninstall + verify still honor). */
const LEGACY_VENDOR_SEGMENTS = ['vendor', 'skills'];
const COMMAND_IDE_DIRS = {
    cursor: ['.cursor', 'commands'],
    claude: ['.claude', 'commands'],
};
function bundlePath(projectDir) {
    return join(projectDir, ...BUNDLE_DIR_SEGMENTS);
}
function legacyBundlePath(projectDir) {
    return join(projectDir, ...LEGACY_VENDOR_SEGMENTS);
}
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
function printHelp() {
    console.log(`devkit / skills

Usage:
  npx github:${DEFAULT_REPO} [install|uninstall|update] [options]

Install/Update options:
  --repo <user/repo|https://github.com/...>
  --project-dir <path>
  --full
  --skills-only
  --cursor-only
  --yes

Uninstall options:
  --project-dir <path>
  --force
  --nuclear`);
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
    console.log(chalk.blue(`Source: ${url}`));
    const spin = ora(`Fetching bundle from ${repo}...`).start();
    try {
        const emitter = degit(repo, { cache: false, force: true });
        // degit doesn't have granular progress, so we just wait for it.
        await emitter.clone(temp);
        spin.succeed('Bundle fetched (via degit)');
        return temp;
    }
    catch {
        spin.info('degit failed, falling back to git clone --progress');
        // We want to see progress, but ora hides it. So we stop the spinner and use spawnSync with inherit.
        console.log(chalk.gray('Cloning repository...'));
        const res = spawnSync('git', ['clone', '--depth', '1', '--progress', url, temp], {
            stdio: 'inherit',
        });
        if (res.status === 0) {
            console.log(chalk.green('✔ Repository cloned'));
            return temp;
        }
        else {
            console.error(chalk.red('Failed to clone repository'));
            throw new Error('git clone failed');
        }
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
    const spin = ora('Cleaning bundle destination...').start();
    rmSync(dest, { recursive: true, force: true });
    spin.text = 'Syncing files to bundle...';
    cpSync(src, dest, {
        recursive: true,
        filter: (s, d) => {
            const rel = d.replace(dest, '').replace(/^[\\/]/, '');
            const ok = !shouldIgnore(rel);
            if (ok && existsSync(s) && lstatSync(s).isFile()) {
                spin.text = `Syncing: ${rel}`;
            }
            return ok;
        },
    });
    writeFileSync(join(dest, BUNDLE_MARKER), '');
    spin.succeed('Bundle synced to disk');
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
        catch {
            // Keep copied file from cpSync
        }
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
    if (!existsSync(cursorDir)) {
        mkdirSync(cursorDir, { recursive: true });
    }
    writeFileSync(join(projectDir, '.cursor', '.skills-install.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
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
        const ides = parseCommandTargets(raw);
        for (const ide of ides) {
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
    const spin = ora(`Installing ${dirs.length} skills...`).start();
    let ok = 0;
    let fail = 0;
    for (const dir of dirs) {
        try {
            installSkill({
                skillDir: dir,
                projectDir,
                mode,
                force: true,
                allIdes,
                noGitIsolation: true,
            });
            ok++;
        }
        catch {
            if (mode === 'symlink') {
                try {
                    installSkill({
                        skillDir: dir,
                        projectDir,
                        mode: 'copy',
                        force: true,
                        allIdes,
                        noGitIsolation: true,
                    });
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
    if (fail)
        spin.warn(chalk.yellow(`Installed ${ok}/${dirs.length} skills (${fail} failed)`));
    else
        spin.succeed(chalk.green(`Installed ${ok} skills`));
}
const GIT_EXCLUDE_MARKER_START = '# skills-begin';
const GIT_EXCLUDE_MARKER_END = '# skills-end';
function ensureGitExcludeBlock(projectDir, patterns) {
    const excludePath = join(projectDir, '.git', 'info', 'exclude');
    if (!existsSync(join(projectDir, '.git', 'info')))
        return;
    const existing = existsSync(excludePath) ? readFileSync(excludePath, 'utf8') : '';
    // Remove any existing skills block
    const withoutBlock = existing
        .replace(new RegExp(`\\n?${GIT_EXCLUDE_MARKER_START}[\\s\\S]*?${GIT_EXCLUDE_MARKER_END}\\n?`, 'g'), '')
        .trimEnd();
    const block = [GIT_EXCLUDE_MARKER_START, ...patterns, GIT_EXCLUDE_MARKER_END].join('\n');
    const content = `${withoutBlock}\n${block}\n`;
    writeFileSync(excludePath, content, 'utf8');
}
function cleanupGitExclude(projectDir, _skillNames) {
    const excludePath = join(projectDir, '.git', 'info', 'exclude');
    if (!existsSync(excludePath))
        return;
    const existing = readFileSync(excludePath, 'utf8');
    const cleaned = existing
        .replace(new RegExp(`\\n?${GIT_EXCLUDE_MARKER_START}[\\s\\S]*?${GIT_EXCLUDE_MARKER_END}\\n?`, 'g'), '')
        .trimEnd();
    writeFileSync(excludePath, `${cleaned}\n`, 'utf8');
}
function uninstall(projectDir, nuclear) {
    const cursorSkills = join(projectDir, '.cursor', 'skills');
    const skills = existsSync(cursorSkills)
        ? readdirSync(cursorSkills).filter((n) => n !== '.install-manifest')
        : [];
    const spin = ora('Uninstalling...').start();
    for (const s of skills) {
        rmSync(join(projectDir, '.cursor', 'skills', s), { recursive: true, force: true });
        rmSync(join(projectDir, '.claude', 'skills', s), { recursive: true, force: true });
        rmSync(join(projectDir, '.codex', 'skills', s), { recursive: true, force: true });
        rmSync(join(projectDir, '.agent', 'skills', s), { recursive: true, force: true });
    }
    cleanupGitExclude(projectDir, skills);
    rmSync(join(projectDir, '.cursor', 'skills', '.install-manifest'), { recursive: true, force: true });
    if (nuclear) {
        rmSync(join(projectDir, '.cursor'), { recursive: true, force: true });
    }
    else {
        const projRules = join(projectDir, '.cursor', 'rules');
        const tryCleanRules = (bundleBase) => {
            const vendorRules = join(bundleBase, '.cursor', 'rules');
            if (existsSync(vendorRules) && existsSync(projRules)) {
                const removable = new Set(readdirSync(vendorRules).filter((f) => f.endsWith('.mdc')));
                for (const f of readdirSync(projRules)) {
                    if (!removable.has(f))
                        continue;
                    const p = join(projRules, f);
                    try {
                        unlinkSync(p);
                    }
                    catch {
                        rmSync(p, { force: true });
                    }
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
    spin.succeed('Uninstall completed');
}
async function main() {
    const pkg = JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf8'));
    // Display logo
    console.log(chalk.cyan(`
  ╔════════════════════════════════════════════════════════════╗
  ║                                                            ║
  ║   ███╗   ██╗██╗ ██████╗██████╗ ███████╗██████╗             ║
  ║   ████╗  ██║██║██╔════╝██╔══██╗██╔════╝██╔══██╗            ║
  ║   ██╔██╗ ██║██║██║     ██████╔╝█████╗  ██████╔╝            ║
  ║   ██║╚██╗██║██║██║     ██╔══██╗██╔══╝  ██╔══██╗            ║
  ║   ██║ ╚████║██║╚██████╗██║  ██║███████╗██║  ██║            ║
  ║   ╚═╝  ╚═══╝╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝            ║
  ║                                                            ║
  ║                        devkit                             ║
  ║                                                            ║
  ╚════════════════════════════════════════════════════════════╝
  `));
    console.log(chalk.bold(`\n${pkg.name} v${pkg.version}\n`));
    const argv = minimist(process.argv.slice(2), {
        boolean: ['full', 'skills-only', 'cursor-only', 'yes', 'force', 'nuclear', 'help'],
        string: ['repo', 'project-dir'],
        alias: { h: 'help', y: 'yes' },
    });
    if (argv.help) {
        printHelp();
        return;
    }
    const rawCmd = argv._[0];
    const cmd = rawCmd === 'uninstall' ? 'uninstall' : rawCmd === 'update' ? 'update' : 'install';
    const interactive = !argv.yes && process.stdin.isTTY;
    if (cmd === 'install' || cmd === 'update') {
        let repo = normalizeRepo(String(argv.repo || DEFAULT_REPO));
        let projectDir = resolve(String(argv['project-dir'] || process.cwd()));
        let mode = 'full';
        let allIdes = true;
        if (cmd === 'update' && !existsSync(bundlePath(projectDir)) && mode === 'full') {
            console.log(chalk.yellow(`No bundle found at ${bundlePath(projectDir)}. Switching to 'install' mode.`));
        }
        if (interactive) {
            const a = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'target',
                    message: 'Install target',
                    choices: [
                        { name: 'Current project (local)', value: 'local' },
                        { name: 'Global (.agents)', value: 'global' },
                    ],
                    default: 'local',
                },
            ]);
            if (a.target === 'global') {
                projectDir = resolve(join(homedir(), '.agents'));
                mkdirSync(projectDir, { recursive: true });
            }
        }
        const temp = await fetchRepo(repo);
        try {
            if (cmd === 'update' && mode === 'full') {
                const bundle = bundlePath(projectDir);
                if (existsSync(bundle)) {
                    const oldPkg = JSON.parse(readFileSync(join(bundle, 'package.json'), 'utf8'));
                    const newPkg = JSON.parse(readFileSync(join(temp, 'package.json'), 'utf8'));
                    console.log(chalk.bold(`\nUpdating bundle: ${chalk.yellow(oldPkg.version)} -> ${chalk.green(newPkg.version)}`));
                    const oldSkills = readdirSync(join(bundle, 'skills')).filter((f) => lstatSync(join(bundle, 'skills', f)).isDirectory());
                    const newSkills = readdirSync(join(temp, 'skills')).filter((f) => lstatSync(join(temp, 'skills', f)).isDirectory());
                    const added = newSkills.filter((s) => !oldSkills.includes(s));
                    const removed = oldSkills.filter((s) => !newSkills.includes(s));
                    if (added.length > 0)
                        console.log(chalk.green(`  + New skills: ${added.join(', ')}`));
                    if (removed.length > 0)
                        console.log(chalk.red(`  - Removed skills: ${removed.join(', ')}`));
                    if (added.length === 0 && removed.length === 0 && oldPkg.version === newPkg.version) {
                        console.log(chalk.cyan('  No structural changes detected in skills.'));
                    }
                    console.log('');
                }
            }
            const bundle = bundlePath(projectDir);
            const s = ora('Syncing bundle...').start();
            syncBundle(temp, bundle);
            linkRules(bundle, projectDir);
            const manifest = loadInstallManifest(projectDir);
            installCommands(bundle, projectDir, manifest);
            saveInstallManifest(projectDir, manifest);
            s.succeed('Bundle synced');
            installAllSkills(bundle, projectDir, process.platform === 'win32' ? 'copy' : 'symlink', allIdes);
            const cmdExcludes = collectCommandExcludePatterns(bundle);
            const rulesExcludes = [];
            const rulesSrc = join(bundle, '.cursor', 'rules');
            if (existsSync(rulesSrc)) {
                for (const f of readdirSync(rulesSrc)) {
                    if (f.endsWith('.mdc'))
                        rulesExcludes.push(`.cursor/rules/${f}`);
                }
            }
            const skillDirs = ['.cursor/skills/', '.claude/skills/', '.agent/skills/'];
            if (allIdes)
                skillDirs.push('.codex/skills/');
            ensureGitExcludeBlock(projectDir, [
                '.agents/devkit/',
                ...skillDirs,
                '.cursor/.skills-install.json',
                ...cmdExcludes,
                ...rulesExcludes,
            ]);
            console.log(chalk.cyan('Verify: node .agents/devkit/dist/tools.js verify-bundle-install --project-dir .'));
        }
        finally {
            rmSync(temp, { recursive: true, force: true });
        }
    }
    else {
        let projectDir = resolve(String(argv['project-dir'] || process.cwd()));
        let force = Boolean(argv.force);
        let nuclear = Boolean(argv.nuclear);
        if (interactive) {
            const a = await inquirer.prompt([
                { type: 'input', name: 'projectDir', message: 'Project directory to uninstall from', default: projectDir },
                {
                    type: 'list',
                    name: 'force',
                    message: 'Confirmation behavior',
                    choices: [
                        { name: 'Ask confirmation (safe default)', value: false },
                        { name: 'Force remove without confirmation', value: true },
                    ],
                    default: force,
                },
                {
                    type: 'list',
                    name: 'nuclear',
                    message: chalk.red('NUCLEAR: delete entire .cursor directory?'),
                    choices: [
                        { name: 'No (keep .cursor except skills artifacts)', value: false },
                        { name: 'Yes (remove entire .cursor)', value: true },
                    ],
                    default: nuclear,
                },
            ]);
            projectDir = resolve(String(a.projectDir));
            force = Boolean(a.force);
            nuclear = Boolean(a.nuclear);
        }
        if (!force && process.stdin.isTTY) {
            const ans = await inquirer.prompt([
                { type: 'confirm', name: 'ok', message: `Uninstall from ${projectDir}?`, default: false },
            ]);
            if (!ans.ok)
                return;
        }
        uninstall(projectDir, nuclear);
    }
}
main().catch((e) => {
    console.error(chalk.red(e.message || String(e)));
    process.exit(1);
});
