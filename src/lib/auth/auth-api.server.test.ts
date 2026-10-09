// @vitest-environment node
import { requestHandler } from '@tanstack/react-start/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createDocsAuthService,
  handleDocsAuthRequest,
} from './auth-api.server';
import { type DocsAuthConfig, readDocsAuthConfig } from './config.server';
import type { AccountEvent } from './contracts';

afterEach(() => vi.restoreAllMocks());

function acceptCookies(response: Response, jar = new Map<string, string>()) {
  for (const header of response.headers.getSetCookie()) {
    const pair = header.split(';')[0];
    const index = pair.indexOf('=');
    const name = pair.slice(0, index);
    if (!pair.slice(index + 1) || /max-age=0/i.test(header)) jar.delete(name);
    else jar.set(name, pair);
  }
  return jar;
}

function fixture() {
  const config: DocsAuthConfig = {
    docsOrigin: 'https://docs.example',
    ssoOrigin: 'https://sso.example',
    resourceOrigin: 'https://sso-open.example',
    consoleOrigin: 'https://console.shengwang.cn',
    clientId: 'docs-test',
    clientSecret: 'fixture-client-secret',
    sessionPassword: 'fixture-session-password-at-least-32-chars',
    posthog: { host: 'https://events.example', key: 'fixture-project' },
  };
  const sent: AccountEvent[] = [];
  const usedCodes = new Set<string>();
  const fetcher = vi
    .fn<typeof fetch>()
    .mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.endsWith('/api/v0/oauth/token')) {
        const code = new URLSearchParams(String(init?.body)).get('code') || '';
        if (usedCodes.has(code))
          return Response.json({ error: 'invalid_grant' }, { status: 400 });
        usedCodes.add(code);
        return Response.json({
          access_token: 'fixture-access-token',
          token_type: 'Bearer',
          expires_in: 7199,
        });
      }
      if (url.endsWith('/api/v0/customer/company/basic-info'))
        return Response.json({
          accountUid: 'account-123',
          companyId: 456,
          email: 'private@example.com',
        });
      sent.push(JSON.parse(String(init?.body)));
      return Response.json({ status: 1 });
    });
  const createHandler = (options = config) =>
    requestHandler((request) =>
      createDocsAuthService(options, fetcher).handle(request),
    );
  const handle = createHandler();
  async function call(
    path: string,
    jar = new Map<string, string>(),
    init: RequestInit = {},
  ) {
    return handle(
      new Request(`${config.docsOrigin}${path}`, {
        ...init,
        headers: { Cookie: [...jar.values()].join('; '), ...init.headers },
      }),
      {},
    );
  }
  async function login(query = '') {
    const response = await call(`/api/auth/login?${query}`);
    expect(response.status).toBe(302);
    const authorize = new URL(response.headers.get('Location') || '');
    const state = authorize.searchParams.get('state');
    const jar = acceptCookies(response);
    return {
      response,
      authorize,
      jar,
      path: `/api/oauth?state=${state}&code=${state}`,
    };
  }
  return { config, sent, fetcher, createHandler, call, login };
}

describe('Docs confidential OAuth with existing framework sessions', () => {
  it('binds the SDK flow to a sealed cookie and exposes only trusted minimal identity', async () => {
    const f = fixture();
    const flowId = '00000000-0000-4000-8000-000000000001';
    const attempt = await f.login(
      `target=rtm&flow_id=${flowId}&resource_type=sdk&resource_id=rtm&source_path=/zh-CN/reference/sdks&anonymous_id=anonymous-123`,
    );
    expect(attempt.authorize.origin).toBe(f.config.ssoOrigin);
    expect(attempt.authorize.searchParams.get('redirect_uri')).toBe(
      `${f.config.docsOrigin}/api/oauth`,
    );
    expect(attempt.authorize.searchParams.get('scope')).toBe('basic_info');
    expect(attempt.authorize.searchParams.has('client_secret')).toBe(false);
    expect(attempt.authorize.searchParams.has('code_challenge')).toBe(false);
    const binding = attempt.response.headers.getSetCookie().join('');
    expect(binding).toMatch(/__Host-docs_oauth_/);
    expect(binding).toMatch(/HttpOnly/);
    expect(binding).toMatch(/Secure/);
    expect(binding).toMatch(/SameSite=Lax/);
    expect(binding).not.toContain(flowId);
    const callback = await f.call(
      `${attempt.path}&loginId=00000000000000000000000000000001`,
      attempt.jar,
    );
    expect(callback.status).toBe(302);
    expect(callback.headers.get('Location')).toBe(
      'https://console.shengwang.cn/product/RTM2?tab=config',
    );
    acceptCookies(callback, attempt.jar);
    expect([...attempt.jar.keys()]).toEqual(['__Host-docs_session']);
    const info = await f.createHandler()(
      new Request(`${f.config.docsOrigin}/api/userinfo`, {
        headers: { Cookie: [...attempt.jar.values()].join('; ') },
      }),
      {},
    );
    expect(info.status).toBe(200);
    expect(await info.json()).toMatchObject({
      status: 'authenticated',
      user: { accountUid: 'account-123', companyId: '456' },
    });
    expect([...attempt.jar.values()].join('')).not.toMatch(
      /account-123|fixture-access-token/,
    );
    const exchange = new URLSearchParams(
      String(f.fetcher.mock.calls[0][1]?.body),
    );
    expect(exchange.get('client_secret')).toBe('fixture-client-secret');
    expect(exchange.has('loginId')).toBe(false);
    expect(f.fetcher.mock.calls[1][1]?.headers).toMatchObject({
      Authorization: 'Bearer fixture-access-token',
    });
    expect(f.sent).toHaveLength(3);
    expect(
      f.sent.find((event) => event.event === 'docs_account_auth_succeeded'),
    ).toMatchObject({
      distinct_id: 'account-123',
      properties: {
        flow_id: flowId,
        company_id: '456',
        auth_type: 'unknown',
        $groups: { cid: '456' },
        $geoip_disable: true,
        $is_server: true,
      },
    });
    expect(JSON.stringify(f.sent)).not.toMatch(
      /fixture-access-token|fixture-client-secret|private@example|console_landed/,
    );
    expect(info.headers.get('Cache-Control')).toBe('private, no-store');
    expect((await f.call(attempt.path, attempt.jar)).status).toBe(400);
    expect(f.sent).toHaveLength(3);
  });

  it('rejects altered, misbound, and expired OAuth cookies before exchanging code', async () => {
    const f = fixture();
    const first = await f.login();
    const second = await f.login();
    expect((await f.call(first.path, second.jar)).status).toBe(400);
    const firstName = [...first.jar.keys()][0];
    const swapped = new Map([
      [
        firstName,
        `${firstName}=${[...second.jar.values()][0].split('=').slice(1).join('=')}`,
      ],
    ]);
    expect((await f.call(first.path, swapped)).status).toBe(400);
    const changed = new Map([[firstName, `${firstName}=tampered`]]);
    expect((await f.call(first.path, changed)).status).toBe(400);
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 300_001);
    expect((await f.call(first.path, first.jar)).status).toBe(400);
    expect(f.fetcher).not.toHaveBeenCalled();
  });

  it('uses SSO one-use codes for concurrent callbacks instead of shared process state', async () => {
    const f = fixture();
    const attempt = await f.login();
    const results = await Promise.all([
      f.call(attempt.path, attempt.jar),
      f.call(attempt.path, attempt.jar),
    ]);
    expect(results.map((response) => response.status).sort()).toEqual([
      302, 502,
    ]);
    expect(
      f.sent.filter((event) => event.event === 'docs_account_auth_succeeded'),
    ).toHaveLength(1);
  });

  it('accepts mapped targets and rejects untrusted redirect or source parameters', async () => {
    const f = fixture();
    for (const query of [
      'target=https://evil.example',
      'target=rtm&target=home',
      'redirect_uri=https://evil.example',
      'source_path=//evil.example',
      'anonymous_id=person%40example.com',
      'resource_type=sdk&resource_id=rtm',
    ])
      expect((await f.call(`/api/auth/login?${query}`)).status).toBe(400);
    const attempt = await f.login();
    expect(
      (await f.call(`${attempt.path}&code=another`, attempt.jar)).status,
    ).toBe(400);
    expect(
      (await f.call(`${attempt.path}&loginId=invalid`, attempt.jar)).status,
    ).toBe(400);
    expect(f.fetcher).not.toHaveBeenCalled();
  });

  it('does not establish a new session on upstream failure or untrusted account identity', async () => {
    const f = fixture();
    const attempt = await f.login(
      'flow_id=00000000-0000-4000-8000-000000000002&target=rtm&resource_type=sdk&resource_id=signaling&source_path=/zh-CN/reference/sdks&platform=web&version=2.2.6',
    );
    f.fetcher.mockRejectedValueOnce(
      new Error('upstream fixture-client-secret'),
    );
    const failed = await f.call(attempt.path, attempt.jar);
    expect(failed.status).toBe(502);
    expect(await failed.text()).not.toContain('fixture-client-secret');
    acceptCookies(failed, attempt.jar);
    expect(attempt.jar.size).toBe(0);
    expect((await f.call('/api/userinfo', attempt.jar)).status).toBe(401);
    expect(f.sent[0]).toMatchObject({
      event: 'docs_account_auth_failed',
      properties: {
        stage: 'token_exchange',
        reason: 'upstream_unavailable',
        platform: 'web',
        version: '2.2.6',
        resource_id: 'signaling',
      },
    });
    const second = await f.login();
    f.fetcher
      .mockResolvedValueOnce(
        Response.json({
          access_token: 'token',
          token_type: 'Bearer',
          expires_in: 100,
        }),
      )
      .mockResolvedValueOnce(
        Response.json({ companyId: 456, userUid: 'person@example.com' }),
      );
    expect((await f.call(second.path, second.jar)).status).toBe(502);
    expect(f.sent.at(-1)?.properties.reason).toBe('upstream_invalid_response');
  });

  it('requires same-origin logout and clears the current browser cookie', async () => {
    const f = fixture();
    const attempt = await f.login();
    acceptCookies(await f.call(attempt.path, attempt.jar), attempt.jar);
    expect(
      (
        await f.call('/api/logout', attempt.jar, {
          method: 'POST',
          headers: { Origin: 'https://evil.example' },
        })
      ).status,
    ).toBe(403);
    expect((await f.call('/api/userinfo', attempt.jar)).status).toBe(200);
    const logout = await f.call('/api/logout', attempt.jar, {
      method: 'POST',
      headers: { Origin: f.config.docsOrigin },
    });
    expect(logout.status).toBe(200);
    acceptCookies(logout, attempt.jar);
    expect(attempt.jar.size).toBe(0);
    expect((await f.call('/api/userinfo', attempt.jar)).status).toBe(401);
  });

  it('bounds the session by token expiry and rejects an invalid seal or session header', async () => {
    const f = fixture();
    const attempt = await f.login();
    f.fetcher.mockResolvedValueOnce(
      Response.json({
        access_token: 'token',
        token_type: 'Bearer',
        expires_in: 1,
      }),
    );
    acceptCookies(await f.call(attempt.path, attempt.jar), attempt.jar);
    const copied = [...attempt.jar.values()].join('; ');
    const otherKey = f.createHandler({
      ...f.config,
      sessionPassword: 'different-fixture-password-at-least-32-chars',
    });
    expect(
      (
        await otherKey(
          new Request(`${f.config.docsOrigin}/api/userinfo`, {
            headers: { Cookie: copied },
          }),
          {},
        )
      ).status,
    ).toBe(401);
    expect(
      (
        await f.call('/api/userinfo', new Map(), {
          headers: {
            'x-__host-docs_session-session': copied
              .split('=')
              .slice(1)
              .join('='),
          },
        })
      ).status,
    ).toBe(401);
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 2000);
    const info = await f.call('/api/userinfo', attempt.jar);
    expect(info.status).toBe(401);
    expect(await info.json()).toEqual({ status: 'unauthenticated' });
  });

  it('retries a failed receiver in the callback with the original event UUID', async () => {
    const f = fixture();
    const attempt = await f.login();
    const original = f.fetcher.getMockImplementation();
    if (!original) throw new Error('Missing fixture');
    const deliveries: AccountEvent[] = [];
    f.fetcher.mockImplementation(async (input, init) => {
      if (String(input).endsWith('/capture/')) {
        deliveries.push(JSON.parse(String(init?.body)));
        return Response.json({}, { status: 503 });
      }
      return original(input, init);
    });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect((await f.call(attempt.path, attempt.jar)).status).toBe(302);
    expect(deliveries).toHaveLength(6);
    const success = deliveries.filter(
      (event) => event.event === 'docs_account_auth_succeeded',
    );
    expect(success).toHaveLength(3);
    expect(new Set(success.map((event) => event.uuid)).size).toBe(1);
  });

  it('uses private credentials and returns unknown when the service is unconfigured', async () => {
    expect(readDocsAuthConfig({ VITE_SSO_CLIENT_SECRET: 'secret' })).toBeNull();
    expect(
      (
        await handleDocsAuthRequest(
          new Request('https://docs.example/api/userinfo'),
        )
      ).status,
    ).toBe(503);
    const env = {
      DOCS_AUTH_ORIGIN: 'https://docs.example',
      SSO_CLIENT_ID: 'docs',
      SSO_CLIENT_SECRET: 'test-secret',
      DOCS_AUTH_SESSION_PASSWORD: 'fixture-session-password-at-least-32-chars',
    };
    expect(readDocsAuthConfig(env)).toMatchObject({
      ssoOrigin: 'https://sso.shengwang.cn',
      resourceOrigin: 'https://sso-open.shengwang.cn',
    });
    expect(
      readDocsAuthConfig({ ...env, DOCS_AUTH_ORIGIN: 'http://docs.example' }),
    ).toBeNull();
    expect(
      readDocsAuthConfig({ ...env, DOCS_AUTH_SESSION_PASSWORD: 'short' }),
    ).toBeNull();
    expect(
      readDocsAuthConfig({ ...env, DOCS_AUTH_ENV: 'staging' }),
    ).toMatchObject({
      ssoOrigin: 'https://sso-staging.shengwang.cn',
      resourceOrigin: 'http://sso-open.staging.shengwang.cn',
    });
  });
});
