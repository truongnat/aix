import { builtinModules, createRequire } from 'node:module';
import { cp, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const desktopRoot = resolve(scriptDir, '..');
const repoRoot = resolve(desktopRoot, '../..');
const serviceRoot = join(repoRoot, 'services', 'kb-server');
const outputRoot = join(desktopRoot, 'dist', 'kb-server');
const outputModules = join(outputRoot, 'node_modules');
const workspacePackages = new Map([
  ['@x/core', join(repoRoot, 'packages', 'core')],
  ['@x/policy', join(repoRoot, 'packages', 'policy')],
]);
const copiedPackages = new Set();
const builtinNames = new Set(builtinModules.flatMap((name) => [name, name.replace(/^node:/, '')]));

async function readPackage(packageRoot) {
  return JSON.parse(await readFile(join(packageRoot, 'package.json'), 'utf8'));
}

async function findPackageRoot(entryPath, expectedName) {
  let current = await realpath(entryPath);
  while (true) {
    const candidate = current.endsWith('.json') ? dirname(current) : current;
    try {
      const metadata = await readPackage(candidate);
      if (metadata.name === expectedName) return candidate;
    } catch {
      // Continue walking up from generated entry files or files without package metadata.
    }
    const parent = dirname(candidate);
    if (parent === candidate) break;
    current = parent;
  }
  throw new Error(`Could not find package root for ${expectedName} from ${entryPath}`);
}

async function locatePackage(packageName, fromRoot) {
  const workspaceRoot = workspacePackages.get(packageName);
  if (workspaceRoot) return workspaceRoot;

  try {
    const requireFromPackage = createRequire(join(fromRoot, 'package.json'));
    return findPackageRoot(requireFromPackage.resolve(packageName), packageName);
  } catch (resolutionError) {
    const storeEntry = join(repoRoot, 'node_modules', '.bun', 'node_modules', packageName);
    try {
      return findPackageRoot(storeEntry, packageName);
    } catch {
      throw resolutionError;
    }
  }
}

async function includePackage(packageName, fromRoot, optional = false) {
  if (builtinNames.has(packageName)) return;
  if (copiedPackages.has(packageName)) return;

  let sourceRoot;
  try {
    sourceRoot = await locatePackage(packageName, fromRoot);
  } catch (error) {
    if (optional) return;
    throw new Error(`Cannot resolve production dependency ${packageName}: ${String(error)}`);
  }

  const metadata = await readPackage(sourceRoot);
  const destination = join(outputModules, packageName);
  await mkdir(dirname(destination), { recursive: true });
  await cp(sourceRoot, destination, {
    recursive: true,
    dereference: true,
    filter: (sourcePath) => !relative(sourceRoot, sourcePath).split(sep).includes('node_modules'),
  });
  copiedPackages.add(packageName);

  const dependencies = Object.keys(metadata.dependencies ?? {});
  const optionalDependencies = Object.keys(metadata.optionalDependencies ?? {});
  for (const dependency of dependencies) {
    await includePackage(dependency, sourceRoot);
  }
  for (const dependency of optionalDependencies) {
    await includePackage(dependency, sourceRoot, true);
  }
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
await cp(join(serviceRoot, 'dist'), join(outputRoot, 'dist'), { recursive: true });
await cp(join(serviceRoot, 'package.json'), join(outputRoot, 'package.json'));
await mkdir(outputModules, { recursive: true });

const servicePackage = await readPackage(serviceRoot);
for (const dependency of Object.keys(servicePackage.dependencies ?? {})) {
  await includePackage(dependency, serviceRoot);
}

await writeFile(
  join(outputRoot, 'runtime-manifest.json'),
  JSON.stringify({ service: servicePackage.name, version: servicePackage.version, packages: [...copiedPackages].sort() }, null, 2),
  'utf8',
);
console.log(`Prepared KB runtime: ${copiedPackages.size} production packages at ${outputRoot}`);
