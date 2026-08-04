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
    delete window.posthog;
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
      capture_pageview: 'history_change',
      defaults: '2026-05-30',
      disable_session_recording: true,
      persistence: 'localStorage+cookie',
    });
  });

  it('captures docs feedback through the Securiti-managed PostHog client', async () => {
    window.posthog = {
      capture: captureMock,
    };
    const { captureDocsPageFeedback } = await import('./posthog');

    captureDocsPageFeedback({
      locale: 'en',
      value: 'yes',
    });

    expect(captureMock).toHaveBeenCalledWith('docs_page_feedback', {
      hash: '#start',
      locale: 'en',
      pathname: '/en/introduction',
      search: '?platform=web',
      value: 'yes',
    });
  });
});
