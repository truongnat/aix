export interface DesktopRuntimeConfig {
  readonly provider: string;
  readonly model: string;
  readonly apiKey?: string;
  readonly baseUrl?: string;
}

export function isCurrentSpineSession(activeSessionId: string, eventSessionId: string): boolean {
  return activeSessionId.length > 0 && activeSessionId === eventSessionId;
}

export function providerEnvironmentFor(config: DesktopRuntimeConfig): Record<string, string> {
  const environment: Record<string, string> = {
    AIX_PROVIDER: config.provider,
    AIX_MODEL: config.model,
  };
  if (config.apiKey) environment['AIX_API_KEY'] = config.apiKey;
  if (config.baseUrl) environment['AIX_API_URL'] = config.baseUrl;
  return environment;
}
