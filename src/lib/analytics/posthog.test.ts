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
    captureMock.mockReset();
    identifyMock.mockClear();
    resetMock.mockClear();
    identifiedUser = undefined;
    window.history.replaceState({}, '', '/en/introduction?platform=web#start');
  });

  it.each(['yes', 'no'] as const)(
    'records %s comments and page context through the outbound filter',
    async (helpfulness) => {
      vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
      vi.stubEnv('VITE_DOCS_REGION', 'cn');
      vi.stubEnv('VITE_DOCS_MEASUREMENT_ENABLED', 'true');
      const { captureDocsFeedbackSubmission } = await import('./posthog');
      captureMock.mockReturnValueOnce({
        event: 'docs_feedback_form_submitted',
      });
      const payload = {
        id: 'b323aa10-d0e6-40e8-a48b-301071409ddc',
        helpfulness,
        reasons: [],
        pagePath: '/realtime-media/rtc?token=secret#part',
        submittedAt: '2026-10-27T06:00:00.000Z',
        details: `  示例反馈\n${'补充说明'.repeat(400)}  `,
      };
      expect(await captureDocsFeedbackSubmission(payload)).toBe(true);
      const [name, properties, options] = captureMock.mock.calls[0];
      expect(name).toBe('docs_feedback_form_submitted');
      expect(properties).toMatchObject({
        event_id: 'b323aa10-d0e6-40e8-a48b-301071409ddc',
        feedback_id: 'b323aa10-d0e6-40e8-a48b-301071409ddc',
        value: helpfulness,
        response: [],
        comment: payload.details.trim(),
        has_comment: true,
        feedback_destination: 'analytics',
        canonical_path: '/zh-CN/realtime-media/rtc',
      });
      expect(options).toMatchObject({
        uuid: 'b323aa10-d0e6-40e8-a48b-301071409ddc',
        send_instantly: true,
      });
      expect(JSON.stringify(properties)).not.toMatch(/token=secret/);
      const filtered = initMock.mock.calls[0][1].before_send({
        event: name,
        properties: {
          ...properties,
          details: 'unknown-field-not-allowed',
          $current_url: 'https://docs.example/realtime-media/rtc?token=secret',
        },
      });
      expect(filtered.properties).toMatchObject({
        feedback_id: 'b323aa10-d0e6-40e8-a48b-301071409ddc',
        response: [],
        comment: payload.details.trim(),
        has_comment: true,
        feedback_destination: 'analytics',
      });
      expect(JSON.stringify(filtered)).not.toMatch(
        /unknown-field-not-allowed|token=secret/,
      );
    },
  );

  it('does not report success when collection is disabled or the SDK drops the submission', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
    vi.stubEnv('VITE_DOCS_REGION', 'cn');
    vi.stubEnv('VITE_DOCS_MEASUREMENT_ENABLED', 'false');
    const { captureDocsFeedbackSubmission } = await import('./posthog');
    const payload = {
      id: '2ab8097c-e9f7-46e2-9a82-aa143563b1cc',
      helpfulness: 'yes' as const,
      reasons: ['clear'],
      details: '',
      pagePath: '/realtime-media/rtc',
      submittedAt: '2026-10-27T06:00:00.000Z',
    };
    expect(await captureDocsFeedbackSubmission(payload)).toBe(false);
    expect(captureMock).not.toHaveBeenCalled();
    vi.stubEnv('VITE_DOCS_MEASUREMENT_ENABLED', 'true');
    expect(await captureDocsFeedbackSubmission(payload)).toBe(false);
  });

  it('keeps reason-only feedback optional and rejects empty or invalid submissions', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
    vi.stubEnv('VITE_DOCS_REGION', 'cn');
    vi.stubEnv('VITE_DOCS_MEASUREMENT_ENABLED', 'true');
    const { captureDocsFeedbackSubmission } = await import('./posthog');
    captureMock.mockReturnValue({ event: 'docs_feedback_form_submitted' });
    const payload = {
      id: 'feedback-1',
      helpfulness: 'yes' as const,
      reasons: ['clear'],
      details: '   ',
      pagePath: '/realtime-media/rtc',
      submittedAt: '2026-10-27T06:00:00.000Z',
    };
    expect(await captureDocsFeedbackSubmission(payload)).toBe(true);
    expect(captureMock.mock.calls[0][1]).toMatchObject({
      response: ['clear'],
      comment: '',
      has_comment: false,
      feedback_destination: 'analytics',
    });
    expect(
      await captureDocsFeedbackSubmission({ ...payload, reasons: [] }),
    ).toBe(false);
    expect(
      await captureDocsFeedbackSubmission({
        ...payload,
        reasons: ['incorrect_or_outdated'],
        details: '有文字也不能使用另一分支的原因',
      }),
    ).toBe(false);
    expect(captureMock).toHaveBeenCalledTimes(1);
  });

  it('bounds feedback comments and drops comments from unrelated events', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
    vi.stubEnv('VITE_DOCS_REGION', 'cn');
    vi.stubEnv('VITE_DOCS_MEASUREMENT_ENABLED', 'true');
    const { captureDocsFeedbackSubmission } = await import('./posthog');
    captureMock.mockReturnValueOnce({ event: 'docs_feedback_form_submitted' });
    const details = `第一行\n${'字'.repeat(2200)}`;
    expect(
      await captureDocsFeedbackSubmission({
        id: 'feedback-2',
        helpfulness: 'no',
        reasons: [],
        details,
        pagePath: '/realtime-media/rtc',
        submittedAt: '2026-10-27T06:00:00.000Z',
      }),
    ).toBe(true);
    expect(captureMock.mock.calls[0][1].comment).toBe(details.slice(0, 2000));
    const filter = initMock.mock.calls[0][1].before_send;
    const properties = { comment: details, page_title: 'not-allowed' };
    expect(
      filter({ event: 'docs_feedback_form_submitted', properties }).properties,
    ).toEqual({ comment: details.slice(0, 2000) });
    expect(
      filter({ event: 'docs_search_submitted', properties }).properties,
    ).toEqual({});
    expect(filter({ event: '$autocapture', properties }).properties).toEqual(
      {},
    );
  });

  it('does not initialize PostHog without a project key', async () => {
    const { initializePostHog } = await import('./posthog');

    initializePostHog();
    await Promise.resolve();

    expect(initMock).not.toHaveBeenCalled();
  });

  it('removes sensitive queries and SDK-added properties at the CN outbound boundary', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
    vi.stubEnv('VITE_DOCS_REGION', 'cn');
    vi.stubEnv('VITE_DOCS_MEASUREMENT_ENABLED', 'true');
    const { initializePostHog } = await import('./posthog');
    initializePostHog();
    await vi.waitFor(() => expect(initMock).toHaveBeenCalledTimes(1));
    const event = initMock.mock.calls[0][1].before_send({
      uuid: 'capture-1',
      event: 'docs_search_submitted',
      properties: {
        token: 'public-project-key',
        distinct_id: 'anonymous-id',
        event_id: 'search-event-1',
        journey_id: 'journey-1',
        query_redacted: 'token=customer-secret person@example.test',
        $current_url: 'https://docs.example/zh-CN/search?q=customer-secret',
        $referrer: 'https://private.example/path?token=customer-secret',
        $set_once: { email: 'person@example.test' },
        unknown_field: 'customer-secret',
      },
      $set: { email: 'person@example.test' },
    });
    expect(event.properties).toMatchObject({
      token: 'public-project-key',
      event_id: 'search-event-1',
      journey_id: 'journey-1',
      query_redacted: '[redacted]',
      $current_url: 'https://docs.example/zh-CN/search',
      $referrer: 'https://private.example',
    });
    expect(JSON.stringify(event)).not.toMatch(
      /customer-secret|person@example|unknown_field|\$set/,
    );
    const phoneEvent = initMock.mock.calls[0][1].before_send({
      event: 'docs_search_submitted',
      properties: { query_redacted: '+8613812345678', search_type: 'openapi' },
    });
    expect(phoneEvent.properties).toMatchObject({
      query_redacted: '[redacted]',
      search_type: 'openapi',
    });
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

  it('never sends CN measurement facts from the global build, even with the flag enabled', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
    vi.stubEnv('VITE_DOCS_REGION', 'global');
    vi.stubEnv('VITE_DOCS_MEASUREMENT_ENABLED', 'true');
    const { captureMeasurementEvent } = await import('./posthog');
    captureMeasurementEvent({ name: 'docs_journey_started', properties: {} });
    await Promise.resolve();
    expect(initMock).not.toHaveBeenCalled();
    expect(captureMock).not.toHaveBeenCalled();
  });

  it('keeps the existing English SDK event properties unchanged', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
    vi.stubEnv('VITE_DOCS_REGION', 'global');
    const { initializePostHog } = await import('./posthog');
    initializePostHog();
    await vi.waitFor(() => expect(initMock).toHaveBeenCalledTimes(1));
    const pageview = {
      event: '$pageview',
      properties: {
        $current_url: 'https://docs.example/en/introduction?platform=web#start',
      },
    };
    expect(initMock.mock.calls[0][1].before_send(pageview)).toBe(pageview);
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
