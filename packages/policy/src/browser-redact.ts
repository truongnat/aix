export interface BrowserRedactOptions {
  readonly stripCookies?: boolean;
  readonly stripAuthorization?: boolean;
  readonly maskPasswordFields?: boolean;
  readonly skipLoginScreenshots?: boolean;
}

export function redactBrowserInput(input: string, opts?: BrowserRedactOptions): string {
  let result = input;

  if (opts?.stripCookies !== false) {
    result = result.replace(/Cookie:\s*[^\r\n]+/gi, 'Cookie: ••••');
    result = result.replace(/set-cookie:\s*[^\r\n]+/gi, 'Set-Cookie: ••••');
  }

  if (opts?.stripAuthorization !== false) {
    result = result.replace(/Authorization:\s*[^\r\n]+/gi, 'Authorization: ••••');
    result = result.replace(/Proxy-Authorization:\s*[^\r\n]+/gi, 'Proxy-Authorization: ••••');
  }

  if (opts?.maskPasswordFields !== false) {
    result = result.replace(/(password[^=]*=\s*)([^&\s]+)/gi, '$1••••');
    result = result.replace(/(passwd[^=]*=\s*)([^&\s]+)/gi, '$1••••');
    result = result.replace(/<input[^>]*type=["']?password["']?[^>]*>/gi, (match) => {
      return match.replace(/\s+value=["'][^"']*["']/i, ' value="••••"');
    });
  }

  return result;
}

export function redactNetworkLog(log: string): string {
  return log
    .replace(/Cookie:\s*[^\r\n]+/gi, 'Cookie: ••••')
    .replace(/set-cookie:\s*[^\r\n]+/gi, 'Set-Cookie: ••••')
    .replace(/Authorization:\s*[^\r\n]+/gi, 'Authorization: ••••')
    .replace(/Proxy-Authorization:\s*[^\r\n]+/gi, 'Proxy-Authorization: ••••');
}

export function isLoginUrl(url: string): boolean {
  const loginPatterns = [
    /\/login\b/i,
    /\/signin\b/i,
    /\/sign-in\b/i,
    /\/auth\b/i,
    /\/authenticate\b/i,
    /\/logon\b/i,
    /\/log-in\b/i,
    /\?.*action=login/i,
    /\?.*action=signin/i,
  ];
  return loginPatterns.some(p => p.test(url));
}
