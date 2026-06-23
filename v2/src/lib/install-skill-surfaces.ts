import fs from 'node:fs';
import path from 'node:path';

import type { SupportedProvider } from './install-targets';

function rewriteMarkdownToolReferences(content: string): string {
    return content.replace(/(?<![\w.-])tools\//g, '.ai-harness/tools/');
}

function rewriteProviderCodeReferences(
    content: string,
    destinationPath: string,
    coreRoot: string,
): string {
    const destinationDir = path.dirname(destinationPath);
    const relativeToolsRoot = path
        .relative(destinationDir, path.join(coreRoot, 'tools'))
        .split(path.sep)
        .join('/');

    return content.replace(
        /from\s+['"]((?:\.\.\/)+)tools\/([^'"]+)['"]/g,
        (_match, _prefix, toolPath: string) => `from '${relativeToolsRoot}/${toolPath}'`,
    );
}

function transformCopiedFile(
    sourcePath: string,
    destinationPath: string,
    provider: SupportedProvider | null,
    coreRoot: string | null,
    content: string,
): string {
    const extension = path.extname(sourcePath);

    if (extension === '.md') {
        return rewriteMarkdownToolReferences(content);
    }

    if (provider && coreRoot && (extension === '.ts' || extension === '.js')) {
        return rewriteProviderCodeReferences(content, destinationPath, coreRoot);
    }

    return content;
}

async function copyDirectoryContents(
    sourceRoot: string,
    destinationRoot: string,
    options?: {
        provider?: SupportedProvider | null;
        coreRoot?: string | null;
    },
): Promise<void> {
    await fs.promises.mkdir(destinationRoot, { recursive: true });

    const entries = await fs.promises.readdir(sourceRoot, { withFileTypes: true });
    for (const entry of entries) {
        const sourcePath = path.join(sourceRoot, entry.name);
        const destinationPath = path.join(destinationRoot, entry.name);

        if (entry.isDirectory()) {
            await copyDirectoryContents(sourcePath, destinationPath, options);
            continue;
        }

        await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true });
        const extension = path.extname(sourcePath);
        if (['.md', '.ts', '.js'].includes(extension)) {
            const rawContent = await fs.promises.readFile(sourcePath, 'utf8');
            const transformedContent = transformCopiedFile(
                sourcePath,
                destinationPath,
                options?.provider ?? null,
                options?.coreRoot ?? null,
                rawContent,
            );
            await fs.promises.writeFile(destinationPath, transformedContent, 'utf8');
            continue;
        }

        await fs.promises.copyFile(sourcePath, destinationPath);
    }
}

export async function copyCoreSkillSources(
    sourceSkillsRoot: string,
    coreRoot: string,
): Promise<string> {
    const destinationRoot = path.join(coreRoot, 'skills');
    await copyDirectoryContents(sourceSkillsRoot, destinationRoot);
    return destinationRoot;
}

export async function copyProviderSkillSources(
    sourceSkillsRoot: string,
    provider: SupportedProvider,
    providerRoot: string,
    coreRoot: string,
): Promise<string> {
    const destinationRoot = path.join(providerRoot, 'skills');
    await copyDirectoryContents(sourceSkillsRoot, destinationRoot, {
        provider,
        coreRoot,
    });
    return destinationRoot;
}

export async function copyCoreToolSources(
    sourceToolsRoot: string,
    coreRoot: string,
): Promise<string> {
    const destinationRoot = path.join(coreRoot, 'tools');
    await copyDirectoryContents(sourceToolsRoot, destinationRoot);
    return destinationRoot;
}

export async function copyBuiltDist(
    sourceDistRoot: string,
    coreRoot: string,
): Promise<string> {
    const destinationRoot = path.join(coreRoot, 'dist');
    await copyDirectoryContents(sourceDistRoot, destinationRoot);
    return destinationRoot;
}
