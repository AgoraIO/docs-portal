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
    window.sessionStorage.clear();
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
            text: 'masked by PostHog',
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
          text: 'masked by PostHog',
        },
      ],
      $referrer: 'https://example.com/search',
      hash: '',
      search: '',
    });
    expect(JSON.stringify(event)).not.toContain('secret');
    expect(JSON.stringify(event)).not.toContain('private');
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

  it('captures an anonymous English journey entry without identifying a user', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');

    const { captureDocsPageViewed } = await import('./posthog');

    captureDocsPageViewed({ pathname: '/en/realtime-media/video' });

    await vi.waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(2);
    });

    expect(captureMock).toHaveBeenNthCalledWith(1, 'docs_page_viewed', {
      docs_locale: 'en',
      docs_page_type: 'concept-explanation',
      docs_pathname: '/en/realtime-media/video',
      docs_product: 'video',
      docs_tab: 'realtime-media',
      page_type: 'concept-explanation',
      pathname: '/en/realtime-media/video',
      product: 'video',
      tab: 'realtime-media',
    });
    expect(captureMock).toHaveBeenNthCalledWith(2, 'docs_journey_step', {
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
    });
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

  it('does not emit structured journey events outside English docs', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');

    const { captureDocsPageViewed } = await import('./posthog');

    captureDocsPageViewed({ pathname: '/zh-CN/introduction' });

    await Promise.resolve();

    expect(captureMock).not.toHaveBeenCalled();
  });
});
