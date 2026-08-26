import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { OpenApiExamplesRail } from './OpenApiExamplesRail';

class MockIntersectionObserver {
  static instance: MockIntersectionObserver;
  callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instance = this;
  }
  observe() {}
  disconnect() {}
  unobserve() {}
  trigger(entry: Partial<IntersectionObserverEntry>) {
    this.callback(
      [entry as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

class MockResizeObserver {
  static instance: MockResizeObserver;
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instance = this;
  }
  observe() {}
  disconnect() {}
  unobserve() {}
  trigger() {
    this.callback([], this as unknown as ResizeObserver);
  }
}

describe('OpenApiExamplesRail', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('toggles stuck only when sentinel leaves above sticky top', () => {
    render(<OpenApiExamplesRail>Examples</OpenApiExamplesRail>);
    const rail = screen.getByTestId('openapi-examples-rail');
    expect(rail).toHaveAttribute('data-stuck', 'false');
    act(() =>
      MockIntersectionObserver.instance.trigger({
        isIntersecting: false,
        boundingClientRect: { top: 10 } as DOMRectReadOnly,
      }),
    );
    expect(rail).toHaveAttribute('data-stuck', 'true');
    act(() =>
      MockIntersectionObserver.instance.trigger({
        isIntersecting: false,
        boundingClientRect: { top: 100 } as DOMRectReadOnly,
      }),
    );
    expect(rail).toHaveAttribute('data-stuck', 'false');
  });

  it('falls back naturally without observers and does not constrain short code', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    vi.stubGlobal('ResizeObserver', undefined);
    render(
      <OpenApiExamplesRail>
        <div data-openapi-code-viewport>short</div>
      </OpenApiExamplesRail>,
    );
    const rail = screen.getByTestId('openapi-examples-rail');
    expect(rail).toHaveAttribute('data-stuck', 'false');
    expect(rail).toHaveAttribute('data-constrained', 'false');
  });

  it('constrains long active code when rail is stuck and available height is sufficient', async () => {
    render(
      <OpenApiExamplesRail>
        <div data-openapi-code-viewport>long</div>
      </OpenApiExamplesRail>,
    );
    const rail = screen.getByTestId('openapi-examples-rail') as HTMLElement;
    const viewport = screen.getByText('long') as HTMLElement;
    Object.defineProperties(rail, {
      scrollHeight: { configurable: true, value: 500 },
    });
    Object.defineProperties(viewport, {
      scrollHeight: { configurable: true, value: 1200 },
      clientHeight: { configurable: true, value: 300 },
    });
    Object.defineProperty(viewport, 'getClientRects', {
      value: () => [{ width: 100, height: 300 }],
    });
    act(() =>
      MockIntersectionObserver.instance.trigger({
        isIntersecting: false,
        boundingClientRect: { top: 0 } as DOMRectReadOnly,
      }),
    );
    act(() => MockResizeObserver.instance.trigger());
    await waitFor(() =>
      expect(rail).toHaveAttribute('data-constrained', 'true'),
    );
    expect(
      rail.style.getPropertyValue('--openapi-code-available-height'),
    ).toBeTruthy();
  });
});
