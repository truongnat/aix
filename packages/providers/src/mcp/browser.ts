import type { McpServerDef } from '../types.js';

export interface BrowserMcpConfig {
  readonly type: 'chrome-devtools' | 'claude-in-chrome';
  readonly host?: string;
  readonly port?: number;
}

export function createBrowserMcpDef(config: BrowserMcpConfig): McpServerDef {
  if (config.type === 'chrome-devtools') {
    return {
      name: 'browser',
      transport: 'stdio',
      command: 'npx',
      args: ['@anthropic/claude-code-mcp-server', '--cdp-port', String(config.port ?? 9222)],
      env: {
        BROWSER_REDACT_COOKIES: '1',
        BROWSER_REDACT_AUTH: '1',
        BROWSER_REDACT_PASSWORDS: '1',
        BROWSER_SKIP_LOGIN_SCREENSHOTS: '1',
      },
    };
  }

  return {
    name: 'browser',
    transport: 'http',
    url: `http://${config.host ?? '127.0.0.1'}:${config.port ?? 3080}`,
    env: {
      BROWSER_REDACT_COOKIES: '1',
      BROWSER_REDACT_AUTH: '1',
      BROWSER_REDACT_PASSWORDS: '1',
      BROWSER_SKIP_LOGIN_SCREENSHOTS: '1',
    },
  };
}
