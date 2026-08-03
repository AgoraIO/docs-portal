import { beforeEach, describe, expect, it, vi } from 'vitest';

const initMock = vi.fn();
const captureMock = vi.fn();

vi.mock('posthog-js', () => ({
  default: {
    capture: captureMock,
    init: initMock,
  },
}));

describe('PostHog analytics', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    initMock.mockClear();
    captureMock.mockClear();
    window.history.replaceState(
      {},
      '',
      '/en/realtime-media/video/quickstart?platform=web&token=secret#start',
    );
  });

  it('does not initialize PostHog without a project key', async () => {
    const { initializePostHog } = await import('./posthog');

    initializePostHog();
    await Promise.resolve();

    expect(initMock).not.toHaveBeenCalled();
  });

  it('does not initialize PostHog in local development', async () => {
    vi.stubEnv('MODE', 'development');
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');

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
      disable_capture_url_hashes: true,
      disable_session_recording: true,
      mask_all_element_attributes: true,
      mask_all_text: true,
      person_profiles: 'never',
      persistence: 'localStorage+cookie',
      save_campaign_params: false,
    });
  });

  it('removes query strings and hashes from automatic URL properties', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');

    const { initializePostHog } = await import('./posthog');

    initializePostHog();
    await vi.waitFor(() => {
      expect(initMock).toHaveBeenCalledTimes(1);
    });

    const config = initMock.mock.calls[0]?.[1];
    const event = config.before_send({
      event: '$autocapture',
      properties: {
        $current_url:
          'https://docs.agora.io/en/introduction?token=secret#overview',
        $elements: [
          {
            attr__href: '/en/ai?credential=secret#quickstart',
            text: 'unchanged',
          },
        ],
        $referrer: 'https://example.com/search?q=private',
      },
    });

    expect(event.properties).toEqual({
      $current_url: 'https://docs.agora.io/en/introduction',
      $elements: [
        {
          attr__href: '/en/ai',
          text: 'unchanged',
        },
      ],
      $referrer: 'https://example.com/search',
    });
    expect(JSON.stringify(event)).not.toContain('secret');
    expect(JSON.stringify(event)).not.toContain('private');
  });

  it('captures English docs feedback without URL query or fragment data', async () => {
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
      docs_content_kind: 'unknown',
      docs_environment: 'development',
      docs_locale: 'en',
      docs_page_type: 'task-guide',
      docs_pathname: '/en/realtime-media/video/quickstart',
      docs_platform: 'web',
      docs_product: 'video',
      docs_tab: 'realtime-media',
      value: 'yes',
    });
    expect(JSON.stringify(captureMock.mock.calls[0])).not.toContain('#start');
    expect(JSON.stringify(captureMock.mock.calls[0])).not.toContain('secret');
  });

  it('adds registered English docs context to structured events', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');

    const { captureDocsSearchCompleted, registerDocsPageContext } =
      await import('./posthog');

    registerDocsPageContext({
      contentKind: 'mdx',
      locale: 'en',
      pageType: 'concept-explanation',
    });
    captureDocsSearchCompleted({
      locale: 'en',
      platformFilter: 'web',
      productScope: 'product:video',
      provider: 'algolia',
      queryLength: 14,
      resultCount: 3,
    });

    await vi.waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(1);
    });

    expect(captureMock).toHaveBeenCalledWith('docs_search_completed', {
      docs_content_kind: 'mdx',
      docs_environment: 'development',
      docs_locale: 'en',
      docs_page_type: 'concept-explanation',
      docs_pathname: '/en/realtime-media/video/quickstart',
      docs_platform: 'web',
      docs_product: 'video',
      docs_tab: 'realtime-media',
      platform_filter: 'web',
      product_scope: 'product:video',
      query_length: 14,
      result_count: 3,
      search_provider: 'algolia',
    });
  });

  it('strips query strings and fragments from tracked link targets', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');

    const { captureDocsLinkClicked } = await import('./posthog');

    captureDocsLinkClicked({
      href: 'https://console.agora.io/project/demo?token=secret#credentials',
      locale: 'en',
      source: 'article',
    });

    await vi.waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(1);
    });

    expect(captureMock).toHaveBeenCalledWith(
      'docs_link_clicked',
      expect.objectContaining({
        link_kind: 'console',
        link_source: 'article',
        target_host: 'console.agora.io',
        target_pathname: '/project/demo',
      }),
    );
    expect(JSON.stringify(captureMock.mock.calls[0])).not.toContain('secret');
    expect(JSON.stringify(captureMock.mock.calls[0])).not.toContain(
      'credentials',
    );
  });

  it('does not capture new structured events on Chinese pages', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
    window.history.replaceState({}, '', '/zh-CN/ai/get-started/quickstart');

    const { captureDocsPageFeedback, captureDocsSearchOpened } = await import(
      './posthog'
    );

    captureDocsSearchOpened({
      locale: 'zh-CN',
      mode: 'desktop',
      trigger: 'button',
    });
    captureDocsPageFeedback({
      locale: 'zh-CN',
      value: 'no',
    });
    await Promise.resolve();

    expect(captureMock).not.toHaveBeenCalled();
  });
});
