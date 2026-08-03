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
    delete document.documentElement.dataset.docsPlatform;
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
        hash: '#overview',
        search: '?token=secret',
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
      hash: '',
      search: '',
    });
    expect(JSON.stringify(event)).not.toContain('secret');
    expect(JSON.stringify(event)).not.toContain('private');
  });

  it('preserves the legacy docs feedback fields alongside structured context', async () => {
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
      hash: '#start',
      locale: 'en',
      pathname: '/en/realtime-media/video/quickstart',
      search: '?platform=web&token=secret',
      value: 'yes',
    });

    const config = initMock.mock.calls[0]?.[1];
    const event = config.before_send({
      event: 'docs_page_feedback',
      properties: captureMock.mock.calls[0]?.[1],
    });
    expect(event.properties).toEqual(
      expect.objectContaining({
        hash: '#start',
        search: '?platform=web&token=secret',
      }),
    );
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
      status: 'success',
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
      search_status: 'success',
    });
  });

  it('captures the canonical docs page view dimensions from registered context', async () => {
    vi.stubEnv('VITE_DEPLOY_VERSION', '253dabcc');
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');

    const { captureDocsPageViewed, registerDocsPageContext } = await import(
      './posthog'
    );

    registerDocsPageContext({
      contentId: 'realtime-media/video/get-started-sdk',
      contentKind: 'mdx',
      journeyStage: 'get-started',
      locale: 'en',
      navSection: 'get-started',
      navSectionTitle: 'Get started',
      pageType: 'task-guide',
      pathname: '/en/realtime-media/video/get-started-sdk',
      tab: 'realtime-media',
      title: 'Quickstart',
      version: 'current',
    });
    captureDocsPageViewed({ locale: 'en' });

    await vi.waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(1);
    });

    expect(captureMock).toHaveBeenCalledWith('docs_page_viewed', {
      content_id: 'realtime-media/video/get-started-sdk',
      content_kind: 'mdx',
      deploy_version: '253dabcc',
      docs_content_kind: 'mdx',
      docs_environment: 'development',
      docs_locale: 'en',
      docs_page_type: 'task-guide',
      docs_pathname: '/en/realtime-media/video/get-started-sdk',
      docs_platform: 'web',
      docs_product: 'video',
      docs_tab: 'realtime-media',
      environment: 'development',
      journey_stage: 'get-started',
      locale: 'en',
      nav_section: 'get-started',
      nav_section_title: 'Get started',
      page_type: 'task-guide',
      pathname: '/en/realtime-media/video/get-started-sdk',
      platform: 'web',
      product: 'video',
      tab: 'realtime-media',
      title: 'Quickstart',
      version: 'current',
    });
  });

  it('does not substitute legacy dimensions for missing canonical taxonomy', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');

    const { captureDocsPageViewed } = await import('./posthog');

    captureDocsPageViewed({ locale: 'en' });

    await vi.waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(1);
    });

    expect(captureMock).toHaveBeenCalledWith(
      'docs_page_viewed',
      expect.objectContaining({
        content_id: 'unknown',
        journey_stage: 'unknown',
        nav_section: 'unknown',
      }),
    );
  });

  it('reads the current docs platform from the pathname', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
    window.history.replaceState(
      {},
      '',
      '/en/realtime-media/video/get-started-sdk/android',
    );

    const { syncPlatformDataset } = await import('../platforms/preference');
    const { captureDocsSearchOpened } = await import('./posthog');

    syncPlatformDataset('ios');
    captureDocsSearchOpened({
      locale: 'en',
      mode: 'desktop',
      trigger: 'button',
    });

    await vi.waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(1);
    });

    expect(captureMock).toHaveBeenCalledWith(
      'docs_search_opened',
      expect.objectContaining({ docs_platform: 'android' }),
    );
  });

  it('reads the active default or preferred platform from the shared dataset', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
    window.history.replaceState(
      {},
      '',
      '/en/realtime-media/video/get-started-sdk',
    );

    const { syncPlatformDataset } = await import('../platforms/preference');
    const { captureDocsSearchOpened } = await import('./posthog');

    syncPlatformDataset('ios');
    captureDocsSearchOpened({
      locale: 'en',
      mode: 'desktop',
      trigger: 'button',
    });

    await vi.waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(1);
    });

    expect(captureMock).toHaveBeenCalledWith(
      'docs_search_opened',
      expect.objectContaining({ docs_platform: 'ios' }),
    );
  });

  it('keeps tab landing pages at the tab-level product classification', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
    const { captureDocsSearchOpened } = await import('./posthog');

    window.history.replaceState({}, '', '/en/realtime-media/overview');
    captureDocsSearchOpened({
      locale: 'en',
      mode: 'desktop',
      trigger: 'button',
    });
    await vi.waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(1);
    });

    window.history.replaceState({}, '', '/en/api-reference/sdks');
    captureDocsSearchOpened({
      locale: 'en',
      mode: 'desktop',
      trigger: 'button',
    });
    await vi.waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(2);
    });

    expect(captureMock.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({ docs_product: 'realtime-media' }),
    );
    expect(captureMock.mock.calls[1]?.[1]).toEqual(
      expect.objectContaining({ docs_product: 'api-reference' }),
    );
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

  it('keeps legacy feedback while skipping new structured events on Chinese pages', async () => {
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
    await vi.waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(1);
    });

    expect(captureMock).toHaveBeenCalledWith('docs_page_feedback', {
      hash: '',
      locale: 'zh-CN',
      pathname: '/zh-CN/ai/get-started/quickstart',
      search: '',
      value: 'no',
    });
  });
});
