import * as clack from '@clack/prompts';
import { serveOnce } from './server';
import { openBrowser, canOpenBrowser } from './open-browser';
import { wrapBody } from './render';

export interface Choice {
    id: string;
    label: string;
}

export interface AskVisualQuestionOptions {
    title: string;
    /**
     * Agent-generated HTML for the whole choice page body, authored per
     * `references/design-guide.md`. Must contain a clickable element with
     * `data-choice="<id>"` for each choice (the engine's app.js wires these).
     */
    bodyHtml: string;
    /** Structured choices, used to validate ids and to drive the terminal fallback. Max 3. */
    choices: Choice[];
    /** Force the terminal fallback even if a browser is available. */
    preferTerminal?: boolean;
    timeoutMs?: number;
    /**
     * Local image files to embed via `<img src="/local/<name>">`, keyed by name
     * (e.g. `{ 'before.png': '/abs/path/before.png' }`). PNG/JPEG/GIF/WEBP/SVG only.
     */
    images?: Record<string, string>;
}

export interface ConfirmVisualResultOptions {
    title: string;
    /**
     * Agent-generated HTML for the whole confirmation page body, authored per
     * `references/design-guide.md`. Must contain `#confirm` and `#reject`
     * elements (the engine's app.js wires these).
     */
    bodyHtml: string;
    preferTerminal?: boolean;
    timeoutMs?: number;
    /**
     * Local image files to embed via `<img src="/local/<name>">`, keyed by name
     * (e.g. `{ 'before.png': '/abs/path/before.png' }`). PNG/JPEG/GIF/WEBP/SVG only.
     */
    images?: Record<string, string>;
}

export interface ConfirmResult {
    confirmed: boolean;
    reason?: string;
}

/**
 * Render agent-authored choice HTML in a browser preview and resolve with the
 * id the user picks. Falls back to a terminal selection when no browser.
 */
export async function askVisualQuestion(opts: AskVisualQuestionOptions): Promise<string> {
    if (opts.choices.length < 2) {
        throw new Error('askVisualQuestion needs at least 2 choices');
    }
    if (opts.choices.length > 3) {
        throw new Error(
            `askVisualQuestion supports at most 3 choices, got ${opts.choices.length}. Narrow the decision before asking.`,
        );
    }

    if (opts.preferTerminal || !canOpenBrowser()) {
        return askInTerminal(opts.title, opts.choices);
    }

    const html = await wrapBody(opts.title, opts.bodyHtml);
    const { done, getUrl } = serveOnce<{ id: string }>({
        html,
        timeoutMs: opts.timeoutMs,
        localFiles: opts.images,
    });
    const url = await getUrl();
    openBrowser(url);
    clack.log.info(`Opened a preview in your browser. If it didn't open, visit:\n${url}`);
    const result = await done;

    const validIds = new Set(opts.choices.map((c) => c.id));
    if (!validIds.has(result.id)) {
        throw new Error(`preview returned an unknown choice id: ${result.id}`);
    }
    return result.id;
}

/**
 * Render agent-authored confirmation HTML in a browser preview and resolve with
 * the user's confirm/reject decision. Falls back to a terminal prompt.
 */
export async function confirmVisualResult(
    opts: ConfirmVisualResultOptions,
): Promise<ConfirmResult> {
    if (opts.preferTerminal || !canOpenBrowser()) {
        return confirmInTerminal(opts.title);
    }

    const html = await wrapBody(opts.title, opts.bodyHtml);
    const { done, getUrl } = serveOnce<{ confirmed: boolean; reason?: string }>({
        html,
        timeoutMs: opts.timeoutMs,
        localFiles: opts.images,
    });
    const url = await getUrl();
    openBrowser(url);
    clack.log.info(`Opened a preview in your browser. If it didn't open, visit:\n${url}`);
    const result = await done;
    return { confirmed: result.confirmed, reason: result.reason };
}

async function askInTerminal(title: string, choices: Choice[]): Promise<string> {
    const choice = await clack.select({
        message: title,
        options: choices.map((c) => ({ value: c.id, label: c.label })),
    });
    if (clack.isCancel(choice)) {
        throw new Error('selection cancelled');
    }
    return choice as string;
}

async function confirmInTerminal(title: string): Promise<ConfirmResult> {
    const confirmed = await clack.confirm({ message: `${title} — does this match?` });
    if (clack.isCancel(confirmed)) {
        throw new Error('confirmation cancelled');
    }
    if (confirmed) return { confirmed: true };
    const reason = await clack.text({ message: 'What does not match?' });
    if (clack.isCancel(reason)) {
        throw new Error('confirmation cancelled');
    }
    return { confirmed: false, reason: reason as string };
}
