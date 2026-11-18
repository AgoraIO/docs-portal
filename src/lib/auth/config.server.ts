export type DocsAuthConfig = {
  docsOrigin: string;
  ssoOrigin: string;
  resourceOrigin: string;
  consoleOrigin: string;
  clientId: string;
  clientSecret: string;
  sessionPassword: string;
  posthog?: { host: string; key: string };
};

function origin(value: string, allowHttp = false) {
  const url = new URL(value);
  if (
    (url.protocol !== 'https:' && !(allowHttp && url.protocol === 'http:')) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  )
    throw new Error('Invalid service origin');
  return url.origin;
}

export function readDocsAuthConfig(
  env: Record<string, string | undefined> = process.env,
): DocsAuthConfig | null {
  try {
    const {
      DOCS_AUTH_ORIGIN,
      SSO_CLIENT_ID,
      SSO_CLIENT_SECRET,
      DOCS_AUTH_SESSION_PASSWORD,
    } = env;
    if (
      !DOCS_AUTH_ORIGIN ||
      !SSO_CLIENT_ID ||
      !SSO_CLIENT_SECRET ||
      !DOCS_AUTH_SESSION_PASSWORD ||
      DOCS_AUTH_SESSION_PASSWORD.length < 32
    )
      return null;
    const local = env.DOCS_AUTH_ENV === 'local';
    const staging = env.DOCS_AUTH_ENV === 'staging';
    if (
      env.DOCS_AUTH_ENV &&
      !['local', 'staging', 'production'].includes(env.DOCS_AUTH_ENV)
    )
      return null;
    const docsOrigin = origin(DOCS_AUTH_ORIGIN, local);
    if (
      local &&
      !['localhost', '127.0.0.1', '[::1]'].includes(
        new URL(docsOrigin).hostname,
      )
    )
      return null;
    const posthogHost = env.DOCS_POSTHOG_HOST;
    const posthogKey = env.DOCS_POSTHOG_KEY;
    if (Boolean(posthogHost) !== Boolean(posthogKey)) return null;
    return {
      docsOrigin,
      ssoOrigin: origin(
        env.SSO_ORIGIN ||
          (staging
            ? 'https://sso-staging.shengwang.cn'
            : 'https://sso.shengwang.cn'),
        local,
      ),
      resourceOrigin: origin(
        env.SSO_RESOURCE_ORIGIN ||
          (staging
            ? 'http://sso-open.staging.shengwang.cn'
            : 'https://sso-open.shengwang.cn'),
        local || staging,
      ),
      consoleOrigin: origin(
        env.DOCS_CONSOLE_ORIGIN || 'https://console.shengwang.cn',
        local,
      ),
      clientId: SSO_CLIENT_ID,
      clientSecret: SSO_CLIENT_SECRET,
      sessionPassword: DOCS_AUTH_SESSION_PASSWORD,
      posthog:
        posthogHost && posthogKey
          ? {
              host: origin(posthogHost, local),
              key: posthogKey,
            }
          : undefined,
    };
  } catch {
    return null;
  }
}
