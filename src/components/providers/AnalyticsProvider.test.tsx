import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnalyticsProvider } from './AnalyticsProvider';

const {
  captureDocsCodeCopiedMock,
  captureDocsLinkClickedMock,
  initializePostHogMock,
  queueDocsPageViewMock,
} = vi.hoisted(() => ({
  captureDocsCodeCopiedMock: vi.fn(),
  captureDocsLinkClickedMock: vi.fn(),
  initializePostHogMock: vi.fn(),
  queueDocsPageViewMock: vi.fn(),
}));

vi.mock('@/lib/analytics/posthog', () => ({
  captureDocsCodeCopied: captureDocsCodeCopiedMock,
  captureDocsLinkClicked: captureDocsLinkClickedMock,
  initializePostHog: initializePostHogMock,
  queueDocsPageView: queueDocsPageViewMock,
}));

describe('AnalyticsProvider route page-view lifecycle', () => {
  let originalPushState: typeof window.history.pushState;
  let originalReplaceState: typeof window.history.replaceState;
  let frameId = 0;
  let frames: Array<{ callback: FrameRequestCallback; id: number }> = [];

  function runAnimationFrames() {
    const callbacks = frames;
    frames = [];

    for (const { callback } of callbacks) {
      callback(performance.now());
    }
  }

  beforeEach(() => {
    originalPushState = window.history.pushState;
    originalReplaceState = window.history.replaceState;
    frameId = 0;
    frames = [];
    captureDocsCodeCopiedMock.mockReset();
    captureDocsLinkClickedMock.mockReset();
    initializePostHogMock.mockReset();
    queueDocsPageViewMock.mockReset();
    window.history.replaceState({}, '', '/en/introduction');
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frameId += 1;
      frames.push({ callback, id: frameId });
      return frameId;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      frames = frames.filter((frame) => frame.id !== id);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
  });

  it('queues the initial pathname after the scheduled frame', () => {
    render(
      <AnalyticsProvider>
        <main />
      </AnalyticsProvider>,
    );

    expect(queueDocsPageViewMock).not.toHaveBeenCalled();

    act(runAnimationFrames);

    expect(queueDocsPageViewMock).toHaveBeenCalledOnce();
    expect(queueDocsPageViewMock).toHaveBeenCalledWith({
      pathname: '/en/introduction',
    });
  });

  it('queues pushState and replaceState pathnames', () => {
    render(
      <AnalyticsProvider>
        <main />
      </AnalyticsProvider>,
    );
    act(runAnimationFrames);
    queueDocsPageViewMock.mockClear();

    act(() => {
      window.history.pushState({}, '', '/en/ai/get-started/quickstart');
    });
    act(runAnimationFrames);

    expect(queueDocsPageViewMock).toHaveBeenCalledWith({
      pathname: '/en/ai/get-started/quickstart',
    });
    queueDocsPageViewMock.mockClear();

    act(() => {
      window.history.replaceState({}, '', '/en/realtime-media/video');
    });
    act(runAnimationFrames);

    expect(queueDocsPageViewMock).toHaveBeenCalledWith({
      pathname: '/en/realtime-media/video',
    });
  });

  it('queues popstate pathnames', () => {
    render(
      <AnalyticsProvider>
        <main />
      </AnalyticsProvider>,
    );
    act(runAnimationFrames);

    act(() => {
      window.history.pushState({}, '', '/en/ai/get-started/quickstart');
    });
    act(runAnimationFrames);
    queueDocsPageViewMock.mockClear();

    act(() => {
      originalReplaceState.call(window.history, {}, '', '/en/introduction');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    act(runAnimationFrames);

    expect(queueDocsPageViewMock).toHaveBeenCalledOnce();
    expect(queueDocsPageViewMock).toHaveBeenCalledWith({
      pathname: '/en/introduction',
    });
  });

  it('deduplicates same-path route changes', () => {
    render(
      <AnalyticsProvider>
        <main />
      </AnalyticsProvider>,
    );
    act(runAnimationFrames);
    queueDocsPageViewMock.mockClear();

    act(() => {
      window.history.pushState({}, '', '/en/introduction?tab=overview');
    });
    act(runAnimationFrames);

    expect(queueDocsPageViewMock).not.toHaveBeenCalled();
  });

  it('restores patched history methods and cancels pending frames on cleanup', () => {
    const { unmount } = render(
      <AnalyticsProvider>
        <main />
      </AnalyticsProvider>,
    );

    expect(window.history.pushState).not.toBe(originalPushState);
    expect(window.history.replaceState).not.toBe(originalReplaceState);

    unmount();
    act(runAnimationFrames);

    expect(window.history.pushState).toBe(originalPushState);
    expect(window.history.replaceState).toBe(originalReplaceState);
    expect(queueDocsPageViewMock).not.toHaveBeenCalled();
  });
});
