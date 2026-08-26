import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenApiExamplesRail } from './OpenApiExamplesRail';

class MockIntersectionObserver {
  static instance: MockIntersectionObserver;
  static instances: MockIntersectionObserver[] = [];
  disconnect = vi.fn();
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    this.callback = callback;
    this.options = options;
    MockIntersectionObserver.instance = this;
    MockIntersectionObserver.instances.push(this);
  }
  observe() {}
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
  static instances: MockResizeObserver[] = [];
  disconnect = vi.fn();
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instance = this;
    MockResizeObserver.instances.push(this);
  }
  observe() {}
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
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ width: 1000 }),
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('selects only the visible active viewport', async () => {
    render(
      <OpenApiExamplesRail>
        <div aria-hidden="true" data-openapi-code-viewport hidden>
          hidden
        </div>
        <div data-openapi-code-viewport data-state="inactive">
          inactive
        </div>
        <div data-openapi-code-viewport>active</div>
      </OpenApiExamplesRail>,
    );
    const active = screen.getByText('active') as HTMLElement;
    const inactive = screen.getByText('inactive') as HTMLElement;
    const hidden = screen.getByText('hidden') as HTMLElement;
    for (const viewport of [active, inactive, hidden]) {
      Object.defineProperty(viewport, 'getClientRects', {
        value: () => [{ width: 100, height: 200 }],
      });
    }
    Object.defineProperties(active, {
      clientHeight: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 900 },
    });
    Object.defineProperties(inactive, {
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 10_000 },
    });
    const rail = screen.getByTestId('openapi-examples-rail') as HTMLElement;
    Object.defineProperty(rail, 'scrollHeight', {
      configurable: true,
      value: 700,
    });
    act(() =>
      MockIntersectionObserver.instance.trigger({
        isIntersecting: false,
        boundingClientRect: { top: 0 } as DOMRectReadOnly,
      }),
    );
    await waitFor(() =>
      expect(rail).toHaveAttribute('data-constrained', 'true'),
    );
    expect(active).toHaveAttribute('data-openapi-code-viewport-active');
    expect(inactive).not.toHaveAttribute('data-openapi-code-viewport-active');
  });

  it('uses exact available-height formula and threshold', async () => {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 900,
    });
    render(
      <OpenApiExamplesRail>
        <div data-openapi-code-viewport>active</div>
      </OpenApiExamplesRail>,
    );
    const rail = screen.getByTestId('openapi-examples-rail') as HTMLElement;
    const viewport = screen.getByText('active') as HTMLElement;
    Object.defineProperty(viewport, 'getClientRects', {
      value: () => [{ width: 100, height: 200 }],
    });
    Object.defineProperties(rail, {
      scrollHeight: { configurable: true, value: 700 },
    });
    Object.defineProperties(viewport, {
      clientHeight: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 900 },
    });
    act(() =>
      MockIntersectionObserver.instance.trigger({
        isIntersecting: false,
        boundingClientRect: { top: 0 } as DOMRectReadOnly,
      }),
    );
    await waitFor(() =>
      expect(rail).toHaveAttribute('data-constrained', 'true'),
    );
    expect(rail.style.getPropertyValue('--openapi-rail-available-height')).toBe(
      '836px',
    );
    expect(rail.style.getPropertyValue('--openapi-code-available-height')).toBe(
      '336px',
    );
  });

  it('does not constrain when code fits or available space is below eight lines', async () => {
    const { unmount } = render(
      <OpenApiExamplesRail>
        <div data-openapi-code-viewport>fits</div>
      </OpenApiExamplesRail>,
    );
    const rail = screen.getByTestId('openapi-examples-rail') as HTMLElement;
    const viewport = screen.getByText('fits') as HTMLElement;
    Object.defineProperty(viewport, 'getClientRects', {
      value: () => [{ width: 100, height: 200 }],
    });
    Object.defineProperty(rail, 'scrollHeight', {
      configurable: true,
      value: 700,
    });
    Object.defineProperties(viewport, {
      clientHeight: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 200 },
    });
    act(() =>
      MockIntersectionObserver.instance.trigger({
        isIntersecting: false,
        boundingClientRect: { top: 0 } as DOMRectReadOnly,
      }),
    );
    await waitFor(() => expect(rail).toHaveAttribute('data-stuck', 'true'));
    expect(rail).toHaveAttribute('data-constrained', 'false');
    unmount();
  });

  it('disconnects observers and cancels pending resize frame on unmount', () => {
    const cancel = vi.spyOn(window, 'cancelAnimationFrame');
    const { unmount } = render(
      <OpenApiExamplesRail>Examples</OpenApiExamplesRail>,
    );
    unmount();
    expect(MockIntersectionObserver.instance.disconnect).toHaveBeenCalled();
    expect(MockResizeObserver.instance.disconnect).toHaveBeenCalled();
    expect(cancel).toHaveBeenCalled();
    cancel.mockRestore();
  });

  it('toggles stuck only when sentinel leaves above sticky top', () => {
    render(<OpenApiExamplesRail>Examples</OpenApiExamplesRail>);
    const rail = screen.getByTestId('openapi-examples-rail');
    expect(rail).toHaveAttribute('data-stuck', 'false');
    expect(MockIntersectionObserver.instance.options?.rootMargin).toBe(
      '-48px 0px 0px 0px',
    );
    const sentinel = document.querySelector(
      '[data-openapi-examples-rail-sentinel]',
    );
    expect(sentinel?.parentElement).not.toBe(rail);
    act(() =>
      MockIntersectionObserver.instance.trigger({
        isIntersecting: false,
        boundingClientRect: { top: 10 } as DOMRectReadOnly,
      }),
    );
    expect(rail).toHaveAttribute('data-stuck', 'true');
    act(() =>
      MockIntersectionObserver.instance.trigger({
        isIntersecting: true,
        boundingClientRect: { top: 100 } as DOMRectReadOnly,
      }),
    );
    expect(rail).toHaveAttribute('data-stuck', 'false');
  });

  it('requires both non-intersection and a sentinel above the sticky top', () => {
    render(<OpenApiExamplesRail>Examples</OpenApiExamplesRail>);
    const rail = screen.getByTestId('openapi-examples-rail');
    act(() =>
      MockIntersectionObserver.instance.trigger({
        isIntersecting: true,
        boundingClientRect: { top: 10 } as DOMRectReadOnly,
      }),
    );
    expect(rail).toHaveAttribute('data-stuck', 'false');
    act(() =>
      MockIntersectionObserver.instance.trigger({
        isIntersecting: false,
        boundingClientRect: { top: 100 } as DOMRectReadOnly,
      }),
    );
    expect(rail).toHaveAttribute('data-stuck', 'false');
    act(() =>
      MockIntersectionObserver.instance.trigger({
        isIntersecting: false,
        boundingClientRect: { top: 10 } as DOMRectReadOnly,
      }),
    );
    expect(rail).toHaveAttribute('data-stuck', 'true');
  });

  it('allows constraints only when the operation layout is desktop width', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const { unmount } = render(
      <OpenApiExamplesRail>
        <div data-openapi-code-viewport>wide</div>
      </OpenApiExamplesRail>,
      { container: host },
    );
    const rail = screen.getByTestId('openapi-examples-rail') as HTMLElement;
    const viewport = screen.getByText('wide') as HTMLElement;
    Object.defineProperty(host, 'getBoundingClientRect', {
      value: () => ({ width: 500 }),
    });
    Object.defineProperty(viewport, 'getClientRects', {
      value: () => [{ width: 100, height: 200 }],
    });
    Object.defineProperties(rail, {
      scrollHeight: { configurable: true, value: 500 },
    });
    Object.defineProperties(viewport, {
      clientHeight: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 1200 },
    });
    act(() =>
      MockIntersectionObserver.instance.trigger({
        isIntersecting: false,
        boundingClientRect: { top: 0 } as DOMRectReadOnly,
      }),
    );
    await waitFor(() => expect(rail).toHaveAttribute('data-stuck', 'true'));
    expect(rail).toHaveAttribute('data-constrained', 'false');
    unmount();
    host.remove();
  });

  it('does not constrain without a measurable wide layout parent', async () => {
    render(
      <OpenApiExamplesRail>
        <div data-openapi-code-viewport>narrow</div>
      </OpenApiExamplesRail>,
    );
    const rail = screen.getByTestId('openapi-examples-rail') as HTMLElement;
    const viewport = screen.getByText('narrow') as HTMLElement;
    Object.defineProperty(
      rail.parentElement?.parentElement,
      'getBoundingClientRect',
      {
        value: () => ({ width: 0 }),
      },
    );
    Object.defineProperty(viewport, 'getClientRects', {
      value: () => [{ width: 100, height: 200 }],
    });
    Object.defineProperties(rail, {
      scrollHeight: { configurable: true, value: 500 },
    });
    Object.defineProperties(viewport, {
      clientHeight: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 1200 },
    });
    act(() =>
      MockIntersectionObserver.instance.trigger({
        isIntersecting: false,
        boundingClientRect: { top: 0 } as DOMRectReadOnly,
      }),
    );
    await waitFor(() => expect(rail).toHaveAttribute('data-stuck', 'true'));
    expect(rail).toHaveAttribute('data-constrained', 'false');
  });

  it('uses the root font size when matching the 59rem wide-layout breakpoint', async () => {
    const previousFontSize = document.documentElement.style.fontSize;
    document.documentElement.style.fontSize = '20px';
    const originalGetComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      const style = originalGetComputedStyle(element);
      if (element === document.documentElement) {
        return {
          getPropertyValue: () => '20px',
        } as unknown as CSSStyleDeclaration;
      }
      return style;
    });

    const host = document.createElement('div');
    document.body.append(host);
    Object.defineProperty(host, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ width: 1200 }),
    });
    render(
      <OpenApiExamplesRail>
        <div data-openapi-code-viewport>wide</div>
      </OpenApiExamplesRail>,
      { container: host },
    );
    const rail = screen.getByTestId('openapi-examples-rail') as HTMLElement;
    const viewport = screen.getByText('wide') as HTMLElement;
    Object.defineProperty(viewport, 'getClientRects', {
      value: () => [{ width: 100, height: 200 }],
    });
    Object.defineProperties(rail, {
      scrollHeight: { configurable: true, value: 500 },
    });
    Object.defineProperties(viewport, {
      clientHeight: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 1200 },
    });
    act(() =>
      MockIntersectionObserver.instance.trigger({
        isIntersecting: false,
        boundingClientRect: { top: 0 } as DOMRectReadOnly,
      }),
    );
    await waitFor(() =>
      expect(rail).toHaveAttribute('data-constrained', 'true'),
    );
    host.remove();
    document.documentElement.style.fontSize = previousFontSize;
  });

  it('does not treat a 1000px parent as wide when the root font size is 20px', async () => {
    const previousFontSize = document.documentElement.style.fontSize;
    document.documentElement.style.fontSize = '20px';
    const originalGetComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      const style = originalGetComputedStyle(element);
      if (element === document.documentElement) {
        return {
          getPropertyValue: () => '20px',
        } as unknown as CSSStyleDeclaration;
      }
      return style;
    });
    const host = document.createElement('div');
    document.body.append(host);
    Object.defineProperty(host, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ width: 1000 }),
    });
    render(
      <OpenApiExamplesRail>
        <div data-openapi-code-viewport>not-wide</div>
      </OpenApiExamplesRail>,
      { container: host },
    );
    const rail = screen.getByTestId('openapi-examples-rail') as HTMLElement;
    const viewport = screen.getByText('not-wide') as HTMLElement;
    Object.defineProperty(viewport, 'getClientRects', {
      value: () => [{ width: 100, height: 200 }],
    });
    Object.defineProperties(rail, {
      scrollHeight: { configurable: true, value: 500 },
    });
    Object.defineProperties(viewport, {
      clientHeight: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 1200 },
    });
    act(() =>
      MockIntersectionObserver.instance.trigger({
        isIntersecting: false,
        boundingClientRect: { top: 0 } as DOMRectReadOnly,
      }),
    );
    await waitFor(() => expect(rail).toHaveAttribute('data-stuck', 'true'));
    expect(rail).toHaveAttribute('data-constrained', 'false');
    host.remove();
    document.documentElement.style.fontSize = previousFontSize;
  });

  it('syncs a custom sticky top into CSS and IO threshold', () => {
    render(<OpenApiExamplesRail stickyTop={72}>Examples</OpenApiExamplesRail>);
    const rail = screen.getByTestId('openapi-examples-rail');
    expect(rail).toHaveStyle('--openapi-examples-sticky-top: 72px');
    act(() =>
      MockIntersectionObserver.instance.trigger({
        isIntersecting: false,
        boundingClientRect: { top: 72 } as DOMRectReadOnly,
      }),
    );
    expect(rail).toHaveAttribute('data-stuck', 'true');
  });

  it('recalculates when wrapping state changes', async () => {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 900,
    });
    render(
      <OpenApiExamplesRail>
        <div data-wrap-lines="false">
          <div data-openapi-code-viewport>active</div>
        </div>
      </OpenApiExamplesRail>,
    );
    const rail = screen.getByTestId('openapi-examples-rail') as HTMLElement;
    const viewport = screen.getByText('active') as HTMLElement;
    Object.defineProperty(viewport, 'getClientRects', {
      value: () => [{ width: 100, height: 200 }],
    });
    Object.defineProperties(rail, {
      scrollHeight: { configurable: true, value: 700 },
    });
    Object.defineProperties(viewport, {
      clientHeight: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 900 },
    });
    act(() =>
      MockIntersectionObserver.instance.trigger({
        isIntersecting: false,
        boundingClientRect: { top: 0 } as DOMRectReadOnly,
      }),
    );
    await waitFor(() =>
      expect(rail).toHaveAttribute('data-constrained', 'true'),
    );
    const wrapper = screen.getByText('active').parentElement as HTMLElement;
    wrapper.setAttribute('data-wrap-lines', 'true');
    act(() => MockResizeObserver.instance.trigger());
    expect(rail.style.getPropertyValue('--openapi-code-available-height')).toBe(
      '336px',
    );
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
