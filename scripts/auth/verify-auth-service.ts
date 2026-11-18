import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';

// Contract substitutes only: never uses a real SSO client or PostHog project.
// Exercise the built Start/Nitro server and its existing sealed-cookie sessions.
const events: Array<{
  uuid: string;
  event: string;
  distinct_id: string;
  properties: Record<string, unknown>;
}> = [];
let tokenRequests = 0;
const upstream = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', 'http://fixture');
    if (url.pathname === '/api/v0/oauth/authorize') {
      assert.equal(url.searchParams.get('client_id'), 'fixture-docs');
      assert.equal(url.searchParams.has('client_secret'), false);
      assert.equal(url.searchParams.has('code_challenge'), false);
      const callback = new URL(url.searchParams.get('redirect_uri') || '');
      callback.searchParams.set('state', url.searchParams.get('state') || '');
      callback.searchParams.set('code', 'fixture-code');
      callback.searchParams.set('loginId', '00000000000000000000000000000001');
      response.writeHead(302, { Location: callback.href }).end();
      return;
    }
    let body = '';
    for await (const chunk of request) body += chunk;
    response.setHeader('Content-Type', 'application/json');
    if (url.pathname === '/api/v0/oauth/token') {
      const params = new URLSearchParams(body);
      assert.equal(params.get('client_secret'), 'fixture-secret');
      assert.equal(params.get('code'), 'fixture-code');
      assert.equal(params.has('loginId'), false);
      tokenRequests++;
      if (tokenRequests > 1) {
        response.writeHead(400).end('{"error":"invalid_grant"}');
        return;
      }
      response.end(
        JSON.stringify({
          access_token: 'fixture-access-token',
          token_type: 'Bearer',
          expires_in: 7199,
        }),
      );
    } else if (url.pathname === '/api/v0/customer/company/basic-info') {
      assert.equal(
        request.headers.authorization,
        'Bearer fixture-access-token',
      );
      response.end(
        JSON.stringify({
          accountUid: 'fixture-account',
          companyId: 456,
          email: 'omit@example.com',
        }),
      );
    } else if (url.pathname === '/capture/') {
      events.push(JSON.parse(body));
      response.end('{"status":1}');
    } else response.writeHead(404).end();
  } catch {
    response.writeHead(500).end('{"error":"Contract fixture failed"}');
  }
});

async function listen(server: Server) {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}`;
}
const upstreamOrigin = await listen(upstream);
const portReservation = createServer();
const docsOrigin = await listen(portReservation);
await new Promise<void>((resolve, reject) =>
  portReservation.close((error) => (error ? reject(error) : resolve())),
);
const app = spawn(process.execPath, ['.output/server/index.mjs'], {
  env: {
    ...process.env,
    HOST: '127.0.0.1',
    PORT: new URL(docsOrigin).port,
    DOCS_AUTH_ENV: 'local',
    DOCS_AUTH_ORIGIN: docsOrigin,
    SSO_ORIGIN: upstreamOrigin,
    SSO_RESOURCE_ORIGIN: upstreamOrigin,
    SSO_CLIENT_ID: 'fixture-docs',
    SSO_CLIENT_SECRET: 'fixture-secret',
    DOCS_AUTH_SESSION_PASSWORD: 'fixture-session-password-at-least-32-chars',
    DOCS_POSTHOG_HOST: upstreamOrigin,
    DOCS_POSTHOG_KEY: 'fixture-project',
  },
  stdio: 'ignore',
});

try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null)
      throw new Error('Built service exited before becoming ready');
    try {
      ready = (await fetch(`${docsOrigin}/api/health`)).ok;
    } catch {
      /* Startup not ready. */
    }
    if (ready) break;
    await delay(100);
  }
  assert(ready, 'Built service is ready');
  const anonymous = await fetch(`${docsOrigin}/api/userinfo`);
  assert.equal(anonymous.status, 401);
  assert.deepEqual(await anonymous.json(), { status: 'unauthenticated' });

  const flowId = randomUUID();
  const query = new URLSearchParams({
    target: 'rtm',
    flow_id: flowId,
    resource_type: 'sdk',
    resource_id: 'rtm',
    source_path: '/zh-CN/reference/sdks',
    anonymous_id: 'fixture-anonymous',
  });
  const login = await fetch(`${docsOrigin}/api/auth/login?${query}`, {
    redirect: 'manual',
  });
  assert.equal(login.status, 302);
  const binding = login.headers.get('set-cookie')?.split(';')[0];
  assert(binding);
  const authorization = await fetch(login.headers.get('location') || '', {
    redirect: 'manual',
  });
  assert.equal(authorization.status, 302);
  const callbackUrl = authorization.headers.get('location') || '';
  const callback = await fetch(callbackUrl, {
    redirect: 'manual',
    headers: { Cookie: binding },
  });
  assert.equal(callback.status, 302);
  assert.equal(
    callback.headers.get('location'),
    'https://console.shengwang.cn/product/RTM2?tab=config',
  );
  const session = callback.headers
    .getSetCookie()
    .find(
      (value) => value.startsWith('docs_session=') && !/max-age=0/i.test(value),
    )
    ?.split(';')[0];
  assert(session);
  const info = await fetch(`${docsOrigin}/api/userinfo`, {
    headers: { Cookie: session },
  });
  assert.equal(info.status, 200);
  const payload = await info.json();
  assert.deepEqual(payload.user, {
    accountUid: 'fixture-account',
    companyId: '456',
  });
  assert(!JSON.stringify(payload).includes('omit@example.com'));

  const retry = await fetch(callbackUrl, {
    redirect: 'manual',
    headers: { Cookie: session },
  });
  assert.equal(retry.status, 400);
  assert.equal(tokenRequests, 1);
  for (let i = 0; i < 200 && events.length < 3; i++) await delay(100);
  assert.equal(events.length, 3);
  assert.equal(new Set(events.map((event) => event.uuid)).size, 3);
  assert(events.every((event) => event.properties.flow_id === flowId));
  assert(events.every((event) => event.distinct_id === 'fixture-account'));
  assert(events.every((event) => event.properties.$geoip_disable === true));
  assert(events.some((event) => event.event === 'docs_account_auth_succeeded'));
  assert(events.some((event) => event.event === 'docs_console_redirected'));
  assert(!JSON.stringify(events).includes('fixture-access-token'));

  const logout = await fetch(`${docsOrigin}/api/logout`, {
    method: 'POST',
    headers: { Cookie: session, Origin: docsOrigin },
  });
  assert.equal(logout.status, 200);
  const cleared = logout.headers
    .getSetCookie()
    .find((value) => value.startsWith('docs_session='))
    ?.split(';')[0];
  assert(cleared);
  assert.equal(
    (
      await fetch(`${docsOrigin}/api/userinfo`, {
        headers: { Cookie: cleared },
      })
    ).status,
    401,
  );
  process.stdout.write(
    JSON.stringify({
      verified:
        'built Node service + framework cookie sessions + SSO/PostHog contract substitutes',
      flowId,
      tokenRequests,
      events: events.map((event) => event.event),
      logout: 'verified',
      realSso: 'not exercised',
    }) + '\n',
  );
} finally {
  app.kill('SIGTERM');
  await new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      app.kill('SIGKILL');
      resolve();
    }, 7000);
    app.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
  });
  await new Promise<void>((resolve) => upstream.close(() => resolve()));
}
