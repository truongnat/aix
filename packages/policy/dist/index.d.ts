import { Result } from '@x/core';

interface Finding {
    readonly type: 'secret' | 'pii';
    readonly subtype: string;
    readonly span: readonly [number, number];
}
interface RedactResult {
    readonly clean: string;
    readonly findings: readonly Finding[];
}
declare function redact(input: string): RedactResult;

declare class PolicyEngine {
    redact(input: string): RedactResult;
    checkShell(command: string): Result<void>;
    auditSkillSource(dir: string): Result<void>;
}

declare function checkShell(command: string): Result<void>;
declare function auditSkillSource(dir: string): Result<void>;

interface BrowserRedactOptions {
    readonly stripCookies?: boolean;
    readonly stripAuthorization?: boolean;
    readonly maskPasswordFields?: boolean;
    readonly skipLoginScreenshots?: boolean;
}
declare function redactBrowserInput(input: string, opts?: BrowserRedactOptions): string;
declare function redactNetworkLog(log: string): string;
declare function isLoginUrl(url: string): boolean;

export { type BrowserRedactOptions, type Finding, PolicyEngine, type RedactResult, auditSkillSource, checkShell, isLoginUrl, redact, redactBrowserInput, redactNetworkLog };
