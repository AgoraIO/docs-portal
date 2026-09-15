import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const consumePendingSearchLandingMock = vi.hoisted(() => vi.fn());
const clearPendingSearchLandingMock = vi.hoisted(() => vi.fn());
const captureDocsSearchLandingEngagedMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/analytics/search-attribution', () => ({
  clearPendingSearchLanding: clearPendingSearchLandingMock,
  consumePendingSearchLanding: consumePendingSearchLandingMock,
}));

vi.mock('@/lib/analytics/posthog', () => ({
  captureDocsSearchLandingEngaged: captureDocsSearchLandingEngagedMock,
}));

import { DocsSearchLandingEngagement } from './DocsSearchLandingEngagement';

const pendingLanding = {
  createdAt: 1_000,
  href: '/en/target',
  queryAttemptId: 'attempt-1',
  searchSessionId: 'session-1',
};

describe('DocsSearchLandingEngagement', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    consumePendingSearchLandingMock.mockReset();
    clearPendingSearchLandingMock.mockReset();
    captureDocsSearchLandingEngagedMock.mockReset();
    consumePendingSearchLandingMock.mockReturnValue(pendingLanding);
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: false,
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 2000,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 500,
    });
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 0,
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not emit without a matching pending landing', () => {
    consumePendingSearchLandingMock.mockReturnValue(null);

    render(<DocsSearchLandingEngagement locale="en" pathname="/en/target" />);

    act(() => vi.advanceTimersByTime(20_000));

    expect(captureDocsSearchLandingEngagedMock).not.toHaveBeenCalled();
  });

  it('emits once after ten seconds of visible time and a scroll', () => {
    render(<DocsSearchLandingEngagement locale="en" pathname="/en/target" />);

    act(() => vi.advanceTimersByTime(10_000));
    expect(captureDocsSearchLandingEngagedMock).not.toHaveBeenCalled();

    Object.defineProperty(window, 'scrollY', { value: 300, writable: true });
    act(() => fireEvent.scroll(window));

    expect(captureDocsSearchLandingEngagedMock).toHaveBeenCalledOnce();
    expect(captureDocsSearchLandingEngagedMock).toHaveBeenCalledWith({
      codeCopied: false,
      dwellTimeMs: 10_000,
      href: '/en/target',
      locale: 'en',
      nextPageClicked: false,
      queryAttemptId: 'attempt-1',
      scrollDepth: 0.2,
      searchSessionId: 'session-1',
    });
    expect(clearPendingSearchLandingMock).toHaveBeenCalledOnce();

    act(() => fireEvent.scroll(window));
    expect(captureDocsSearchLandingEngagedMock).toHaveBeenCalledOnce();
  });

  it('does not emit while the document is hidden', () => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true,
    });

    render(<DocsSearchLandingEngagement locale="en" pathname="/en/target" />);

    act(() => vi.advanceTimersByTime(20_000));
    Object.defineProperty(window, 'scrollY', { value: 300, writable: true });
    act(() => fireEvent.scroll(window));

    expect(captureDocsSearchLandingEngagedMock).not.toHaveBeenCalled();
  });
});
