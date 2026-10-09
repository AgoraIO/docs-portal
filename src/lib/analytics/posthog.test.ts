import { beforeEach, describe, expect, it, vi } from 'vitest';

const initMock = vi.fn();
const captureMock = vi.fn();
let identifiedUser: string | undefined;
const identifyMock = vi.fn((id: string) => {
  identifiedUser = id;
});
const resetMock = vi.fn(() => {
  identifiedUser = undefined;
});

vi.mock('posthog-js', () => ({
  default: {
    capture: captureMock,
    init: initMock,
    get_property: () => identifiedUser,
    get_distinct_id: () => identifiedUser ?? 'anonymous-id',
    identify: identifyMock,
    reset: resetMock,
  },
}));

describe('PostHog analytics', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    initMock.mockClear();
    captureMock.mockClear();
    identifyMock.mockClear();
    resetMock.mockClear();
    identifiedUser = undefined;
    window.history.replaceState({}, '', '/en/introduction?platform=web#start');
  });

  it('does not initialize PostHog without a project key', async () => {
    const { initializePostHog } = await import('./posthog');

    initializePostHog();
    await Promise.resolve();

    expect(initMock).not.toHaveBeenCalled();
  });

  it('initializes PostHog for web analytics when a project key is configured', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
    vi.stubEnv('VITE_POSTHOG_HOST', 'https://example.posthog.test');

    const { initializePostHog } = await import('./posthog');

    initializePostHog();
    await vi.waitFor(() => {
      expect(initMock).toHaveBeenCalledTimes(1);
    });

    expect(initMock).toHaveBeenCalledWith('test-key', {
      api_host: 'https://example.posthog.test',
      autocapture: true,
      before_send: expect.any(Function),
      capture_pageview: 'history_change',
      defaults: '2026-05-30',
      disable_session_recording: true,
      persistence: 'localStorage+cookie',
    });
  });

  it('captures docs feedback with the current route properties', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');

    const { captureDocsPageFeedback } = await import('./posthog');

    captureDocsPageFeedback({
      locale: 'en',
      value: 'yes',
    });

    await vi.waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(1);
    });

    expect(captureMock).toHaveBeenCalledWith('docs_page_feedback', {
      hash: '#start',
      locale: 'en',
      pathname: '/en/introduction',
      search: '?platform=web',
      value: 'yes',
    });
  });

  it('keeps account identity across companies and never offers an identified account as an anonymous merge source', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
    const { captureAccountFlow, getDocsAnonymousId, synchronizeDocsAccount } =
      await import('./posthog');
    expect(await getDocsAnonymousId()).toBe('anonymous-id');
    const flow = {
      flowId: 'flow-1',
      target: 'rtm' as const,
      resourceType: 'sdk' as const,
      resourceId: 'signaling',
      platform: 'web',
      version: '2.2.6',
      sourcePath: '/zh-CN/reference/sdks',
    };
    await synchronizeDocsAccount({ accountUid: 'account-a', companyId: '456' });
    expect(await getDocsAnonymousId()).toBeUndefined();
    captureAccountFlow('docs_resource_action_started', flow, {
      accountUid: 'account-a',
      companyId: '456',
    });
    await synchronizeDocsAccount({ accountUid: 'account-a', companyId: '789' });
    captureAccountFlow('docs_resource_action_started', flow, {
      accountUid: 'account-a',
      companyId: '789',
    });
    await vi.waitFor(() => expect(captureMock).toHaveBeenCalledTimes(2));
    expect(identifyMock.mock.calls).toEqual([['account-a']]);
    expect(resetMock).not.toHaveBeenCalled();
    expect(
      captureMock.mock.calls.map(([, properties]) => properties.$groups),
    ).toEqual([{ cid: '456' }, { cid: '789' }]);
    await synchronizeDocsAccount({ accountUid: 'account-b', companyId: '789' });
    expect(resetMock).toHaveBeenCalledTimes(1);
    expect(identifyMock).toHaveBeenLastCalledWith('account-b');
    await synchronizeDocsAccount(null);
    expect(await getDocsAnonymousId()).toBe('anonymous-id');
    expect(resetMock).toHaveBeenCalledTimes(2);
  });

  it('clears a previous identified user before recording a resource action with no trusted current account', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
    identifiedUser = 'previous-account';
    const { captureAccountFlow, getDocsAnonymousId } = await import(
      './posthog'
    );
    captureAccountFlow(
      'docs_resource_action_started',
      { flowId: 'flow-2', target: 'rtm', resourceType: 'sdk' },
      null,
    );
    await vi.waitFor(() => expect(captureMock).toHaveBeenCalledTimes(1));
    expect(resetMock).toHaveBeenCalledTimes(1);
    expect(await getDocsAnonymousId()).toBe('anonymous-id');
  });

  it('filters SDK-added URLs, referrers, and unapproved properties from account flow events', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
    const { initializePostHog } = await import('./posthog');
    initializePostHog();
    await vi.waitFor(() => expect(initMock).toHaveBeenCalledTimes(1));
    const beforeSend = initMock.mock.calls[0][1].before_send;
    const timestamp = new Date('2026-10-09T08:00:00Z');
    expect(
      beforeSend({
        uuid: 'event-1',
        event: 'docs_account_login_clicked',
        timestamp,
        properties: {
          token: 'public-project-key',
          distinct_id: 'anonymous-id',
          flow_id: 'flow-1',
          source_path: '/zh-CN/reference/sdks',
          $current_url:
            'https://docs.example/zh-CN/reference/sdks?private=secret#value',
          $referrer: 'https://private.example/',
          $set_once: { email: 'private@example.test' },
          unapproved: 'value',
        },
        $set: { email: 'private@example.test' },
        $set_once: { $initial_current_url: 'https://private.example/' },
      }),
    ).toEqual({
      uuid: 'event-1',
      event: 'docs_account_login_clicked',
      timestamp,
      properties: {
        token: 'public-project-key',
        distinct_id: 'anonymous-id',
        flow_id: 'flow-1',
        source_path: '/zh-CN/reference/sdks',
      },
    });
    expect(
      beforeSend({
        uuid: 'identify-event',
        event: '$identify',
        properties: {
          token: 'public-project-key',
          distinct_id: 'account-a',
          $anon_distinct_id: 'anonymous-id',
          $referrer: 'https://private.example/',
        },
        $set_once: { $initial_current_url: 'https://private.example/' },
      }),
    ).toEqual({
      uuid: 'identify-event',
      event: '$identify',
      timestamp: undefined,
      properties: {
        token: 'public-project-key',
        distinct_id: 'account-a',
        $anon_distinct_id: 'anonymous-id',
      },
    });
  });
});
