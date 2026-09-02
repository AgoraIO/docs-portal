import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    initMock.mockClear();
    captureMock.mockClear();
    delete document.documentElement.dataset.docsPlatform;
    window.sessionStorage.clear();
    window.history.replaceState(
      {},
      '',
      '/en/realtime-media/video/quickstart?platform=web&token=secret#start',
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
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

  it('uses the explicit deployment environment for preview events', async () => {
    vi.stubEnv('VITE_DEPLOY_ENVIRONMENT', 'preview');
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');

    const { captureDocsSearchOpened } = await import('./posthog');

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
      expect.objectContaining({
        docs_environment: 'preview',
      }),
    );
  });

  it('captures the canonical docs page view dimensions from registered context', async () => {
    vi.stubEnv('VITE_DEPLOY_VERSION', '253dabcc');
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');

    const { captureDocsPageViewed, registerDocsPageContext } = await import(
      './posthog'
    );

    registerDocsPageContext({
      canonicalProduct: 'video',
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
      expect(captureMock).toHaveBeenCalledTimes(2);
    });

    expect(captureMock).toHaveBeenNthCalledWith(1, 'docs_page_viewed', {
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
    expect(captureMock).toHaveBeenNthCalledWith(
      2,
      'docs_journey_step',
      expect.objectContaining({
        docs_locale: 'en',
        docs_page_type: 'task-guide',
        docs_pathname: '/en/realtime-media/video/get-started-sdk',
        docs_product: 'video',
        docs_tab: 'realtime-media',
        journey_entry: true,
        journey_to_page_type: 'task-guide',
        journey_to_pathname: '/en/realtime-media/video/get-started-sdk',
        journey_to_product: 'video',
        journey_to_tab: 'realtime-media',
      }),
    );
  });

  it('waits for matching registered context before capturing a queued page view', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');

    const { queueDocsPageView, registerDocsPageContext } = await import(
      './posthog'
    );

    queueDocsPageView({ pathname: '/en/ai/get-started/quickstart' });
    await Promise.resolve();
    expect(captureMock).not.toHaveBeenCalled();

    registerDocsPageContext({
      canonicalProduct: 'voice-agent',
      contentId: 'ai/get-started/quickstart',
      contentKind: 'mdx',
      journeyStage: 'get-started',
      locale: 'en',
      navSection: 'get-started',
      navSectionTitle: 'Get started',
      pageType: 'task-guide',
      pathname: '/en/ai/get-started/quickstart',
      tab: 'ai',
      title: 'Quickstart',
      version: 'current',
    });

    await vi.waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(2);
    });

    expect(captureMock).toHaveBeenNthCalledWith(
      1,
      'docs_page_viewed',
      expect.objectContaining({
        content_id: 'ai/get-started/quickstart',
        docs_product: 'ai',
        journey_stage: 'get-started',
        nav_section: 'get-started',
        product: 'voice-agent',
      }),
    );
    expect(captureMock).toHaveBeenNthCalledWith(
      2,
      'docs_journey_step',
      expect.objectContaining({
        journey_to_content_id: 'ai/get-started/quickstart',
        journey_to_journey_stage: 'get-started',
        journey_to_nav_section: 'get-started',
        journey_to_product: 'voice-agent',
      }),
    );
  });

  it('does not mark a queued page view captured before destination context exists', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');

    const { queueDocsPageView, registerDocsPageContext } = await import(
      './posthog'
    );

    queueDocsPageView({ pathname: '/en/ai/get-started/quickstart' });
    registerDocsPageContext({
      canonicalProduct: 'video',
      contentId: 'realtime-media/video/get-started-sdk',
      locale: 'en',
      pageType: 'task-guide',
      pathname: '/en/realtime-media/video/get-started-sdk',
      tab: 'realtime-media',
    });
    await Promise.resolve();
    expect(captureMock).not.toHaveBeenCalled();

    registerDocsPageContext({
      canonicalProduct: 'voice-agent',
      contentId: 'ai/get-started/quickstart',
      locale: 'en',
      pageType: 'task-guide',
      pathname: '/en/ai/get-started/quickstart',
      tab: 'ai',
    });

    await vi.waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(2);
    });
  });

  it('keeps legacy docs_product while publishing the canonical product', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
    window.history.replaceState({}, '', '/en/ai/get-started/quickstart');

    const { captureDocsPageViewed, registerDocsPageContext } = await import(
      './posthog'
    );

    registerDocsPageContext({
      canonicalProduct: 'voice-agent',
      contentId: 'ai/get-started/quickstart',
      journeyStage: 'get-started',
      locale: 'en',
      navSection: 'get-started',
      pageType: 'task-guide',
      pathname: '/en/ai/get-started/quickstart',
      tab: 'ai',
    });
    captureDocsPageViewed({ locale: 'en' });

    await vi.waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(2);
    });

    expect(captureMock).toHaveBeenNthCalledWith(
      1,
      'docs_page_viewed',
      expect.objectContaining({
        docs_product: 'ai',
        product: 'voice-agent',
      }),
    );
    expect(captureMock).toHaveBeenNthCalledWith(
      2,
      'docs_journey_step',
      expect.objectContaining({
        journey_to_journey_stage: 'get-started',
        journey_to_nav_section: 'get-started',
        journey_to_product: 'voice-agent',
      }),
    );
  });

  it('does not substitute legacy dimensions for missing canonical taxonomy', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');

    const { captureDocsPageViewed } = await import('./posthog');

    captureDocsPageViewed({ locale: 'en' });

    await vi.waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(2);
    });

    expect(captureMock).toHaveBeenNthCalledWith(
      1,
      'docs_page_viewed',
      expect.objectContaining({
        content_id: 'unknown',
        journey_stage: 'unknown',
        nav_section: 'unknown',
      }),
    );
  });

  it('does not reuse stale registered context for a different page view pathname', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');

    const { captureDocsPageViewed, registerDocsPageContext } = await import(
      './posthog'
    );

    registerDocsPageContext({
      canonicalProduct: 'voice-agent',
      contentId: 'ai/get-started/quickstart',
      contentKind: 'mdx',
      journeyStage: 'get-started',
      locale: 'en',
      navSection: 'get-started',
      navSectionTitle: 'Get started',
      pageType: 'task-guide',
      pathname: '/en/ai/get-started/quickstart',
      tab: 'ai',
      title: 'Quickstart',
      version: 'current',
    });
    captureDocsPageViewed({
      pathname: '/en/realtime-media/video/get-started-sdk',
    });

    await vi.waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(2);
    });

    expect(captureMock).toHaveBeenNthCalledWith(
      1,
      'docs_page_viewed',
      expect.objectContaining({
        content_id: 'unknown',
        content_kind: 'unknown',
        docs_content_kind: 'unknown',
        docs_pathname: '/en/realtime-media/video/get-started-sdk',
        docs_product: 'video',
        docs_tab: 'realtime-media',
        pathname: '/en/realtime-media/video/get-started-sdk',
        product: 'video',
        tab: 'realtime-media',
        title: 'unknown',
      }),
    );
  });

  it('tracks anonymous English page journeys without identifying a user', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');

    const { captureDocsPageViewed } = await import('./posthog');

    captureDocsPageViewed({ pathname: '/en/realtime-media/video' });

    await vi.waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(2);
    });

    expect(captureMock).toHaveBeenNthCalledWith(
      1,
      'docs_page_viewed',
      expect.objectContaining({
        docs_locale: 'en',
        docs_page_type: 'concept-explanation',
        docs_pathname: '/en/realtime-media/video',
        docs_product: 'video',
        docs_tab: 'realtime-media',
        pathname: '/en/realtime-media/video',
        product: 'video',
        tab: 'realtime-media',
      }),
    );
    expect(captureMock).toHaveBeenNthCalledWith(
      2,
      'docs_journey_step',
      expect.objectContaining({
        docs_locale: 'en',
        docs_page_type: 'concept-explanation',
        docs_pathname: '/en/realtime-media/video',
        docs_product: 'video',
        docs_tab: 'realtime-media',
        journey_entry: true,
        journey_to_page_type: 'concept-explanation',
        journey_to_pathname: '/en/realtime-media/video',
        journey_to_product: 'video',
        journey_to_tab: 'realtime-media',
      }),
    );
    expect(initMock.mock.calls[0]?.[1]).toMatchObject({
      person_profiles: 'never',
    });
  });

  it('captures the previous anonymous page when a session navigates between English docs', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');

    const { captureDocsPageViewed } = await import('./posthog');

    captureDocsPageViewed({ pathname: '/en/introduction' });
    await vi.waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(2);
    });
    captureMock.mockClear();

    captureDocsPageViewed({ pathname: '/en/ai/get-started/quickstart' });

    await vi.waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(2);
    });

    expect(captureMock).toHaveBeenNthCalledWith(
      2,
      'docs_journey_step',
      expect.objectContaining({
        journey_entry: false,
        journey_from_page_type: 'navigation-landing',
        journey_from_pathname: '/en/introduction',
        journey_from_product: 'introduction',
        journey_from_tab: 'introduction',
        journey_to_page_type: 'task-guide',
        journey_to_pathname: '/en/ai/get-started/quickstart',
        journey_to_product: 'ai',
        journey_to_tab: 'ai',
      }),
    );
  });

  it('does not emit anonymous journey events outside English docs', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');

    const { captureDocsPageViewed } = await import('./posthog');

    captureDocsPageViewed({ pathname: '/zh-CN/introduction' });

    await Promise.resolve();

    expect(captureMock).not.toHaveBeenCalled();
  });

  it('does not bridge an anonymous journey across non-English docs pages', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');

    const { captureDocsPageViewed } = await import('./posthog');

    captureDocsPageViewed({ pathname: '/en/introduction' });
    await vi.waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(2);
    });
    captureMock.mockClear();

    captureDocsPageViewed({ pathname: '/zh-CN/introduction' });
    await Promise.resolve();
    expect(captureMock).not.toHaveBeenCalled();

    captureDocsPageViewed({ pathname: '/en/ai/get-started/quickstart' });
    await vi.waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(2);
    });

    expect(captureMock).toHaveBeenNthCalledWith(
      2,
      'docs_journey_step',
      expect.objectContaining({
        journey_entry: true,
        journey_to_pathname: '/en/ai/get-started/quickstart',
      }),
    );
    expect(captureMock.mock.calls[1]?.[1]).not.toHaveProperty(
      'journey_from_pathname',
    );
  });

  it('fails closed when sessionStorage.getItem throws', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
    vi.stubGlobal('sessionStorage', {
      getItem: vi.fn(() => {
        throw new Error('storage denied');
      }),
      removeItem: vi.fn(),
      setItem: vi.fn(),
    });

    const { captureDocsPageViewed } = await import('./posthog');

    expect(() =>
      captureDocsPageViewed({ pathname: '/en/introduction' }),
    ).not.toThrow();

    await vi.waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(2);
    });
    expect(captureMock).toHaveBeenNthCalledWith(
      2,
      'docs_journey_step',
      expect.objectContaining({ journey_entry: true }),
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

  it('keeps legacy solutions pages at the solution-level product classification', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
    const { captureDocsSearchOpened } = await import('./posthog');

    window.history.replaceState(
      {},
      '',
      '/en/solutions/interactive-live-streaming/product-overview',
    );
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
      expect.objectContaining({
        docs_product: 'interactive-live-streaming',
      }),
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
