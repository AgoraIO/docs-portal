import { randomBytes, randomUUID } from 'node:crypto';
import { useSession as getCookieSession } from '@tanstack/react-start/server';
import type { DocsAuthConfig } from './config.server';
import { readDocsAuthConfig } from './config.server';
import {
  type AccountEvent,
  type AccountFlow,
  type AuthSession,
  type AuthTransaction,
  type ConsoleTarget,
  cnConsoleTargets,
  type DocsAccount,
} from './contracts';

const headers = {
  'Cache-Control': 'private, no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  Vary: 'Cookie',
};
const oauthState = /^[a-f0-9]{64}$/;
const identifier = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,99}$/;
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

type AuthFailureReason =
  | 'authorization_denied'
  | 'authorization_invalid_response'
  | 'upstream_unavailable'
  | 'upstream_rejected'
  | 'upstream_invalid_response'
  | 'session_write_failed';

class AuthUpstreamFailure extends Error {
  constructor(readonly reason: AuthFailureReason) {
    super('SSO request failed');
  }
}

function parseFlow(params: URLSearchParams): AccountFlow {
  const allowed = new Set([
    'flow_id',
    'target',
    'resource_type',
    'resource_id',
    'source_path',
    'platform',
    'version',
    'anonymous_id',
  ]);
  const input: Record<string, string> = {};
  for (const [key, value] of params) {
    if (!allowed.has(key) || key in input) throw new Error('Invalid flow');
    input[key] = value;
  }
  const target = input.target ?? 'home';
  if (!Object.hasOwn(cnConsoleTargets, target))
    throw new Error('Invalid target');
  const resourceType = input.resource_type ?? 'account';
  if (!['sdk', 'demo', 'account'].includes(resourceType))
    throw new Error('Invalid resource');
  if (input.flow_id && !uuid.test(input.flow_id))
    throw new Error('Invalid flow');
  for (const key of ['resource_id', 'platform', 'version']) {
    if (input[key] !== undefined && !identifier.test(input[key]))
      throw new Error('Invalid resource');
  }
  if (
    resourceType !== 'account' &&
    (!input.flow_id || !input.resource_id || !input.source_path)
  )
    throw new Error('Missing source');
  if (
    input.source_path !== undefined &&
    !/^\/zh-CN\/[A-Za-z0-9/_().-]{1,400}$/.test(input.source_path)
  )
    throw new Error('Invalid source');
  if (
    input.anonymous_id !== undefined &&
    !/^[A-Za-z0-9_-]{1,100}$/.test(input.anonymous_id)
  )
    throw new Error('Invalid anonymous identity');
  return {
    flowId: input.flow_id || randomUUID(),
    target: target as ConsoleTarget,
    resourceType: resourceType as AccountFlow['resourceType'],
    resourceId: input.resource_id,
    sourcePath: input.source_path,
    platform: input.platform,
    version: input.version,
    anonymousId: input.anonymous_id,
  };
}

function readAccount(payload: unknown): DocsAccount {
  if (
    !payload ||
    typeof payload !== 'object' ||
    !('accountUid' in payload) ||
    typeof payload.accountUid !== 'string' ||
    !identifier.test(payload.accountUid)
  )
    throw new Error('Invalid account');
  const rawCompanyId = 'companyId' in payload ? payload.companyId : undefined;
  if (
    rawCompanyId !== undefined &&
    rawCompanyId !== null &&
    !(
      typeof rawCompanyId === 'number' &&
      Number.isSafeInteger(rawCompanyId) &&
      rawCompanyId >= 0
    ) &&
    !(typeof rawCompanyId === 'string' && /^\d{1,20}$/.test(rawCompanyId))
  )
    throw new Error('Invalid company');
  return {
    accountUid: payload.accountUid,
    companyId:
      rawCompanyId && rawCompanyId !== '0' ? String(rawCompanyId) : null,
  };
}

function flowEvents(
  flow: AccountFlow,
  user: DocsAccount,
  targetUrl: string,
): AccountEvent[] {
  const properties = {
    flow_id: flow.flowId,
    locale: 'zh-CN',
    resource_type: flow.resourceType,
    resource_id: flow.resourceId,
    source_path: flow.sourcePath,
    platform: flow.platform,
    version: flow.version,
    console_target: flow.target,
    target_url: targetUrl,
    target_kind: flow.target === 'home' ? 'fallback' : 'service',
    account_uid: user.accountUid,
    company_id: user.companyId,
    auth_source: 'docs_oauth_callback',
    auth_type: 'unknown',
    $groups: user.companyId ? { cid: user.companyId } : {},
  };
  const event = (
    name: AccountEvent['event'],
    props: Record<string, unknown>,
  ): AccountEvent => ({
    uuid: randomUUID(),
    event: name,
    distinct_id: user.accountUid,
    timestamp: new Date().toISOString(),
    properties: props,
  });
  return [
    ...(flow.anonymousId
      ? [
          event('$identify', {
            $anon_distinct_id: flow.anonymousId,
            flow_id: flow.flowId,
          }),
        ]
      : []),
    event('docs_account_auth_succeeded', properties),
    // This records issuing a redirect, not actual Console arrival.
    event('docs_console_redirected', properties),
  ];
}

function failureEvent(
  flow: AccountFlow,
  stage: string,
  reason: AuthFailureReason,
): AccountEvent {
  return {
    uuid: randomUUID(),
    event: 'docs_account_auth_failed',
    distinct_id: flow.anonymousId || `docs_flow:${flow.flowId}`,
    timestamp: new Date().toISOString(),
    properties: {
      flow_id: flow.flowId,
      locale: 'zh-CN',
      resource_type: flow.resourceType,
      resource_id: flow.resourceId,
      source_path: flow.sourcePath,
      platform: flow.platform,
      version: flow.version,
      console_target: flow.target,
      target_kind: flow.target === 'home' ? 'fallback' : 'service',
      stage,
      reason,
      $process_person_profile: false,
    },
  };
}

export function createDocsAuthService(
  config: DocsAuthConfig,
  fetcher: typeof fetch = fetch,
) {
  const secure = config.docsOrigin.startsWith('https:');
  const prefix = secure ? '__Host-' : '';
  const sessionConfig = (name: string, maxAge: number) => ({
    name,
    password: config.sessionPassword,
    maxAge,
    sessionHeader: false as const,
    cookie: {
      httpOnly: true,
      secure,
      sameSite: 'lax' as const,
      path: '/',
      maxAge,
    },
  });
  const accountSession = () =>
    getCookieSession<{ session: AuthSession }>(
      sessionConfig(`${prefix}docs_session`, 7200),
    );
  const unavailable = () =>
    Response.json(
      { status: 'unknown', error: 'Account service unavailable' },
      { status: 503, headers },
    );
  const failed = (status = 400) =>
    Response.json(
      {
        error:
          'Sign-in could not be completed. Return to the documentation and try again.',
      },
      { status, headers },
    );
  async function fetchJson(url: URL, init: RequestInit) {
    let response: Response;
    try {
      response = await fetcher(url, {
        ...init,
        redirect: 'error',
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new AuthUpstreamFailure('upstream_unavailable');
    }
    if (!response.ok) throw new AuthUpstreamFailure('upstream_rejected');
    try {
      return await response.json();
    } catch {
      throw new AuthUpstreamFailure('upstream_invalid_response');
    }
  }

  // Delivery belongs to this request; no background queue or durable retry claim.
  // Reuse the event UUID if a response is lost and a bounded retry is needed.
  async function capture(events: AccountEvent[]) {
    const posthog = config.posthog;
    if (!posthog) return;
    await Promise.all(
      events.map(async (event) => {
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const response = await fetcher(new URL('/capture/', posthog.host), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                api_key: posthog.key,
                ...event,
                properties: {
                  ...event.properties,
                  $geoip_disable: true,
                  $is_server: true,
                },
              }),
              redirect: 'error',
              signal: AbortSignal.timeout(2000),
            });
            if (response.ok) return;
          } catch {
            // Retry only within the current callback, without leaking credentials.
          }
        }
        console.warn(
          '[docs-auth] Event delivery failed',
          event.event,
          event.uuid,
        );
      }),
    );
  }

  async function handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.origin !== config.docsOrigin) return failed();
    if (url.pathname === '/api/auth/login' && request.method === 'GET') {
      let flow: AccountFlow;
      try {
        flow = parseFlow(url.searchParams);
      } catch {
        return failed();
      }
      const state = randomBytes(32).toString('hex');
      try {
        const pending = await getCookieSession<{
          state: string;
          transaction: AuthTransaction;
        }>(sessionConfig(`${prefix}docs_oauth_${state.slice(0, 16)}`, 300));
        await pending.update({
          state,
          transaction: { flow, startedAt: Date.now() },
        });
        const authorize = new URL('/api/v0/oauth/authorize', config.ssoOrigin);
        authorize.search = new URLSearchParams({
          response_type: 'code',
          client_id: config.clientId,
          redirect_uri: `${config.docsOrigin}/api/oauth`,
          scope: 'basic_info',
          state,
        }).toString();
        return new Response(null, {
          status: 302,
          headers: { ...headers, Location: authorize.href },
        });
      } catch {
        return unavailable();
      }
    }
    if (url.pathname === '/api/oauth' && request.method === 'GET') {
      const params = url.searchParams;
      const state = params.get('state') || '';
      if (
        !oauthState.test(state) ||
        [...params.keys()].some(
          (key) =>
            ![
              'state',
              'code',
              'loginId',
              'error',
              'error_description',
            ].includes(key) || params.getAll(key).length !== 1,
        )
      )
        return failed();
      // CN SSO includes its session identifier in real authorization callbacks.
      // Accept it as optional metadata; it is not a docs account identity.
      if (
        params.has('loginId') &&
        !/^[a-f0-9]{32}$/i.test(params.get('loginId') || '')
      )
        return failed();
      const pending = await getCookieSession<{
        state: string;
        transaction: AuthTransaction;
      }>(sessionConfig(`${prefix}docs_oauth_${state.slice(0, 16)}`, 300));
      const transaction = pending.data.transaction;
      if (
        pending.data.state !== state ||
        !transaction ||
        Date.now() - transaction.startedAt >= 300_000 ||
        transaction.startedAt > Date.now()
      ) {
        await pending.clear();
        return failed();
      }
      let stage = 'authorization';
      try {
        const code = params.get('code');
        if (params.has('error') || !code || code.length > 2048) {
          await capture([
            failureEvent(
              transaction.flow,
              stage,
              params.has('error')
                ? 'authorization_denied'
                : 'authorization_invalid_response',
            ),
          ]);
          return failed();
        }
        stage = 'token_exchange';
        const token = await fetchJson(
          new URL('/api/v0/oauth/token', config.ssoOrigin),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              client_id: config.clientId,
              client_secret: config.clientSecret,
              code,
              redirect_uri: `${config.docsOrigin}/api/oauth`,
            }),
          },
        );
        if (
          typeof token.access_token !== 'string' ||
          !token.access_token ||
          token.token_type !== 'Bearer' ||
          !Number.isSafeInteger(token.expires_in) ||
          token.expires_in <= 0
        )
          throw new Error('Invalid token response');
        const expiresAt = Date.now() + Math.min(token.expires_in, 7200) * 1000;
        stage = 'userinfo';
        const user = readAccount(
          await fetchJson(
            new URL(
              '/api/v0/customer/company/basic-info',
              config.resourceOrigin,
            ),
            {
              headers: {
                Authorization: `Bearer ${token.access_token}`,
                Accept: 'application/json',
              },
            },
          ),
        );
        // Store only the minimal account profile in the framework's sealed cookie.
        // SSO tokens remain server-side and are discarded after this request.
        stage = 'session';
        const session = await accountSession();
        await session.clear();
        await session.update({ session: { user, expiresAt } });
        const targetUrl = new URL(
          cnConsoleTargets[transaction.flow.target],
          config.consoleOrigin,
        ).href;
        await capture(flowEvents(transaction.flow, user, targetUrl));
        return new Response(null, {
          status: 302,
          headers: { ...headers, Location: targetUrl },
        });
      } catch (error) {
        await capture([
          failureEvent(
            transaction.flow,
            stage,
            error instanceof AuthUpstreamFailure
              ? error.reason
              : stage === 'session'
                ? 'session_write_failed'
                : 'upstream_invalid_response',
          ),
        ]);
        return failed(502);
      } finally {
        await pending.clear();
      }
    }
    if (url.pathname === '/api/userinfo' && request.method === 'GET') {
      try {
        const session = await accountSession();
        const account = session.data.session;
        if (!account || account.expiresAt <= Date.now()) {
          await session.clear();
          return Response.json(
            { status: 'unauthenticated' },
            { status: 401, headers },
          );
        }
        return Response.json(
          {
            status: 'authenticated',
            user: account.user,
            expiresAt: new Date(account.expiresAt).toISOString(),
          },
          { headers },
        );
      } catch {
        return unavailable();
      }
    }
    if (url.pathname === '/api/logout' && request.method === 'POST') {
      if (
        request.headers.get('Origin') !== config.docsOrigin ||
        request.headers.get('Sec-Fetch-Site') === 'cross-site'
      )
        return failed(403);
      try {
        await (await accountSession()).clear();
        return Response.json({ status: 'unauthenticated' }, { headers });
      } catch {
        return unavailable();
      }
    }
    return Response.json({ error: 'Not found' }, { status: 404, headers });
  }
  return { handle };
}

const config = readDocsAuthConfig();
const service = config ? createDocsAuthService(config) : null;

export function handleDocsAuthRequest(request: Request): Promise<Response> {
  if (!service)
    return Promise.resolve(
      Response.json(
        { status: 'unknown', error: 'Account service unavailable' },
        { status: 503, headers },
      ),
    );
  return service.handle(request);
}
