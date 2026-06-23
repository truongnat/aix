import { spawn } from 'node:child_process';

/**
 * Open a URL in the user's default browser, cross-platform.
 * Returns false if no opener is available (e.g. headless/CI), so callers
 * can fall back to a terminal prompt instead of hanging.
 */
export function openBrowser(url: string): boolean {
    const platform = process.platform;
    let command: string;
    let args: string[];

    if (platform === 'darwin') {
        command = 'open';
        args = [url];
    } else if (platform === 'win32') {
        command = 'cmd';
        args = ['/c', 'start', '', url];
    } else {
        command = 'xdg-open';
        args = [url];
    }

    try {
        const child = spawn(command, args, { stdio: 'ignore', detached: true });
        child.on('error', () => {
            /* swallow: caller decides on fallback via canOpenBrowser() */
        });
        child.unref();
        return true;
    } catch {
        return false;
    }
}

/**
 * Best-effort check for whether a GUI browser can be opened at all.
 * On Linux without a display, browser previews are not viable.
 */
export function canOpenBrowser(): boolean {
    if (process.env.CI) return false;
    if (process.platform === 'linux' && !process.env.DISPLAY && !process.env.WAYLAND_DISPLAY) {
        return false;
    }
    return true;
}
