import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TEMPLATES_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'templates');

export function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Fill `{{KEY}}` placeholders without regex-escaping pitfalls. */
function fill(template: string, values: Record<string, string>): string {
    return Object.entries(values).reduce(
        (acc, [key, value]) => acc.split(`{{${key}}}`).join(value),
        template,
    );
}

/**
 * Wrap an agent-generated body fragment in the minimal page shell.
 * The shell only provides <head> (offline Tailwind), the done banner, and the
 * callback glue (app.js). All layout and styling live in `bodyHtml`, which the
 * agent authors per `references/design-guide.md` — there is no fixed template.
 *
 * `bodyHtml` is trusted (agent-authored). `title` is escaped.
 */
export async function wrapBody(title: string, bodyHtml: string): Promise<string> {
    const shell = await readFile(path.join(TEMPLATES_DIR, 'shell.html'), 'utf8');
    return fill(shell, { TITLE: escapeHtml(title), BODY: bodyHtml });
}
