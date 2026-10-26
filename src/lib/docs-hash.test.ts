import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getDocsHashHref,
  scrollDocsHashTarget,
  scrollDocsHashTargetAfterLayout,
} from './docs-hash';

describe('getDocsHashHref', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('keeps ordinary anchors without a platform unchanged', () => {
    window.history.replaceState(
      {},
      '',
      '/zh-CN/ai/release-notes?from=overview',
    );
    document.body.innerHTML = '<h2 id="release">Release</h2>';
    expect(getDocsHashHref('#release')).toBe('#release');
  });

  it('preserves explicit platform paths and unrelated query values', () => {
    window.history.replaceState(
      {},
      '',
      '/realtime-media/rtm/reference/release-notes/web?from=guide%23code&view=all#old',
    );
    document.body.innerHTML =
      '<section data-platform-panel="web"><h2 id="224-版-2">2.2.4</h2></section>';
    expect(getDocsHashHref('#224-%E7%89%88-2')).toBe(
      '/realtime-media/rtm/reference/release-notes/web?from=guide%23code&view=all&platform=web#224-%E7%89%88-2',
    );
  });

  it('uses the target platform when a stale platform suffix disagrees', () => {
    window.history.replaceState(
      {},
      '',
      '/zh-CN/realtime-media/rtm/reference/release-notes/android?platform=android&view=all',
    );
    document.body.innerHTML =
      '<section data-platform-panel="web"><h2 id="224-版-2">2.2.4</h2></section>';
    expect(getDocsHashHref('#224-版-2')).toBe(
      '/zh-CN/realtime-media/rtm/reference/release-notes/web?platform=web&view=all#224-%E7%89%88-2',
    );
  });
});

describe('scrollDocsHashTarget', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('uses document scroll when the desktop content wrapper is not scrollable', () => {
    document.body.innerHTML = `
      <div data-testid="docs-main-desktop-scroll">
        <h2 id="target-heading">Target heading</h2>
      </div>
    `;
    const scrollWrapper = document.querySelector<HTMLElement>(
      '[data-testid="docs-main-desktop-scroll"]',
    );
    const heading = document.getElementById('target-heading');
    const windowScrollTo = vi.fn();
    const wrapperScrollTo = vi.fn();

    if (!scrollWrapper || !heading) {
      throw new Error('expected hash scroll fixture nodes');
    }

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 40,
    });
    Object.defineProperty(window, 'scrollTo', {
      configurable: true,
      value: windowScrollTo,
      writable: true,
    });
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 40,
    });
    Object.defineProperty(scrollWrapper, 'scrollTo', {
      configurable: true,
      value: wrapperScrollTo,
    });
    vi.spyOn(heading, 'getBoundingClientRect').mockReturnValue({
      bottom: 328,
      height: 28,
      left: 0,
      right: 800,
      top: 300,
      width: 800,
      x: 0,
      y: 300,
      toJSON: () => ({}),
    });

    expect(
      scrollDocsHashTarget('#target-heading', {
        behavior: 'auto',
        updateHistory: false,
      }),
    ).toBe(true);
    expect(wrapperScrollTo).not.toHaveBeenCalled();
    expect(windowScrollTo).toHaveBeenCalledWith({
      behavior: 'auto',
      top: 244,
    });
  });

  it('clears the sticky shell header when it is taller than the base offset', () => {
    document.body.innerHTML = `
      <header data-testid="docs-shell-header" style="position: sticky"></header>
      <div data-testid="docs-main-desktop-scroll">
        <h2 id="target-heading">Target heading</h2>
      </div>
    `;
    const header = document.querySelector<HTMLElement>(
      '[data-testid="docs-shell-header"]',
    );
    const heading = document.getElementById('target-heading');
    const windowScrollTo = vi.fn();

    if (!header || !heading) {
      throw new Error('expected hash scroll fixture nodes');
    }

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 40,
    });
    Object.defineProperty(window, 'scrollTo', {
      configurable: true,
      value: windowScrollTo,
      writable: true,
    });
    vi.spyOn(header, 'getBoundingClientRect').mockReturnValue({
      bottom: 131,
      height: 131,
      left: 0,
      right: 800,
      top: 0,
      width: 800,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    vi.spyOn(heading, 'getBoundingClientRect').mockReturnValue({
      bottom: 328,
      height: 28,
      left: 0,
      right: 800,
      top: 300,
      width: 800,
      x: 0,
      y: 300,
      toJSON: () => ({}),
    });

    expect(
      scrollDocsHashTarget('#target-heading', {
        behavior: 'auto',
        updateHistory: false,
      }),
    ).toBe(true);
    expect(windowScrollTo).toHaveBeenCalledWith({
      behavior: 'auto',
      top: 185,
    });
  });

  it('uses the desktop content wrapper only when it is configured as a scroll container', () => {
    document.body.innerHTML = `
      <div data-testid="docs-main-desktop-scroll" style="overflow-y: auto">
        <h2 id="target-heading">Target heading</h2>
      </div>
    `;
    const scrollWrapper = document.querySelector<HTMLElement>(
      '[data-testid="docs-main-desktop-scroll"]',
    );
    const heading = document.getElementById('target-heading');
    const windowScrollTo = vi.fn();
    const wrapperScrollTo = vi.fn();

    if (!scrollWrapper || !heading) {
      throw new Error('expected hash scroll fixture nodes');
    }

    Object.defineProperty(window, 'scrollTo', {
      configurable: true,
      value: windowScrollTo,
      writable: true,
    });
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 0,
    });
    Object.defineProperty(scrollWrapper, 'scrollTop', {
      configurable: true,
      value: 20,
      writable: true,
    });
    Object.defineProperty(scrollWrapper, 'scrollTo', {
      configurable: true,
      value: wrapperScrollTo,
    });
    vi.spyOn(scrollWrapper, 'getBoundingClientRect').mockReturnValue({
      bottom: 500,
      height: 400,
      left: 0,
      right: 800,
      top: 100,
      width: 800,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    });
    vi.spyOn(heading, 'getBoundingClientRect').mockReturnValue({
      bottom: 328,
      height: 28,
      left: 0,
      right: 800,
      top: 300,
      width: 800,
      x: 0,
      y: 300,
      toJSON: () => ({}),
    });

    expect(
      scrollDocsHashTarget('#target-heading', {
        behavior: 'auto',
        updateHistory: false,
      }),
    ).toBe(true);
    expect(windowScrollTo).not.toHaveBeenCalled();
    expect(wrapperScrollTo).toHaveBeenCalledWith({
      behavior: 'auto',
      top: 196,
    });
  });

  it('prefers the rendered heading when multiple platforms share an anchor id', () => {
    document.body.innerHTML = `
      <section hidden aria-hidden="true">
        <h3 id="v422">Android v4.2.2</h3>
      </section>
      <section>
        <h3 id="v422">Web v4.2.2</h3>
      </section>
    `;
    const heading = document.querySelectorAll<HTMLElement>('#v422')[1];
    const windowScrollTo = vi.fn();

    if (!heading) {
      throw new Error('expected visible hash fixture heading');
    }

    Object.defineProperty(window, 'scrollTo', {
      configurable: true,
      value: windowScrollTo,
      writable: true,
    });
    const clientRect = {
      bottom: 328,
      height: 28,
      left: 0,
      right: 800,
      top: 300,
      width: 800,
      x: 0,
      y: 300,
      toJSON: () => ({}),
    } as DOMRect;
    vi.spyOn(heading, 'getClientRects').mockReturnValue({
      0: clientRect,
      item: () => clientRect,
      length: 1,
    } as unknown as DOMRectList);
    vi.spyOn(heading, 'getBoundingClientRect').mockReturnValue({
      bottom: 328,
      height: 28,
      left: 0,
      right: 800,
      top: 300,
      width: 800,
      x: 0,
      y: 300,
      toJSON: () => ({}),
    });

    expect(
      scrollDocsHashTarget('#v422', {
        behavior: 'auto',
        updateHistory: false,
      }),
    ).toBe(true);
    expect(windowScrollTo).toHaveBeenCalledWith({
      behavior: 'auto',
      top: 204,
    });
  });
});

describe('scrollDocsHashTargetAfterLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) =>
      window.setTimeout(() => callback(performance.now()), 16),
    );
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((frame) =>
      window.clearTimeout(frame),
    );
    window.history.replaceState(null, '', '/zh-CN/ai/release-notes');
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 0,
    });
  });

  afterEach(() => {
    window.dispatchEvent(new Event('pointerdown'));
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it.each([120, 6000])(
    'reaches a subsection when content appears after %d ms',
    async (delay) => {
      const scrollTo = vi.fn();
      vi.spyOn(window, 'scrollTo').mockImplementation(scrollTo);
      Object.defineProperty(window, 'scrollY', {
        configurable: true,
        value: 0,
      });

      scrollDocsHashTargetAfterLayout('#%E9%97%AE%E9%A2%98', {
        behavior: 'auto',
      });
      await vi.advanceTimersByTimeAsync(delay);
      document.body.innerHTML = `
      <div role="region" data-state="closed">
        <h3 id="问题">问题</h3>
      </div>
    `;
      const heading = document.getElementById('问题') as HTMLElement;
      vi.spyOn(heading, 'getBoundingClientRect').mockReturnValue({
        top: 2400,
        bottom: 2428,
        height: 28,
        left: 0,
        right: 390,
        width: 390,
        x: 0,
        y: 2400,
        toJSON: () => ({}),
      });
      await vi.advanceTimersByTimeAsync(200);
      heading.parentElement?.setAttribute('data-state', 'open');
      await vi.advanceTimersByTimeAsync(300);

      expect(scrollTo).toHaveBeenLastCalledWith({
        behavior: 'auto',
        top: 2304,
      });
    },
  );

  it('waits for an expanding page to allow the requested scroll position', async () => {
    document.body.innerHTML = '<h3 id="target">Target</h3>';
    const heading = document.getElementById('target') as HTMLElement;
    let scrollY = 0;
    let pageHeight = 800;
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      get: () => scrollY,
    });
    vi.spyOn(
      document.documentElement,
      'scrollHeight',
      'get',
    ).mockImplementation(() => pageHeight);
    vi.spyOn(window, 'scrollTo').mockImplementation((options) => {
      scrollY = Math.min(
        (options as ScrollToOptions).top ?? 0,
        pageHeight - 800,
      );
    });
    vi.spyOn(heading, 'getBoundingClientRect').mockImplementation(
      () => ({ top: 1000 - scrollY, height: 28 }) as DOMRect,
    );
    const animation = window.setInterval(() => {
      pageHeight += 100;
      if (pageHeight === 2000) window.clearInterval(animation);
    }, 16);

    scrollDocsHashTargetAfterLayout('#target', { behavior: 'auto' });
    await vi.advanceTimersByTimeAsync(400);

    expect(heading.getBoundingClientRect().top).toBe(96);
  });

  it.each([
    'wheel',
    'touchstart',
    'pointerdown',
    'keydown',
    'pagehide',
    'navigation',
  ])(
    'does not pull readers back after %s while content is loading',
    async (interaction) => {
      const scrollTo = vi
        .spyOn(window, 'scrollTo')
        .mockImplementation(() => {});
      scrollDocsHashTargetAfterLayout('#target', { behavior: 'auto' });
      await vi.advanceTimersByTimeAsync(50);

      if (interaction === 'navigation') {
        window.history.replaceState(null, '', '/zh-CN/introduction');
      } else {
        window.dispatchEvent(new Event(interaction));
      }
      document.body.innerHTML = '<h3 id="target">Target</h3>';
      await vi.advanceTimersByTimeAsync(200);

      expect(scrollTo).not.toHaveBeenCalled();
    },
  );

  it('follows the newest hash request when content arrives', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    scrollDocsHashTargetAfterLayout('#old', { behavior: 'auto' });
    await vi.advanceTimersByTimeAsync(50);
    scrollDocsHashTargetAfterLayout('#new', { behavior: 'auto' });
    document.body.innerHTML = '<h3 id="old">Old</h3><h3 id="new">New</h3>';
    for (const [id, top] of [
      ['old', 1000],
      ['new', 2000],
    ] as const) {
      const heading = document.getElementById(id) as HTMLElement;
      vi.spyOn(heading, 'getBoundingClientRect').mockReturnValue({
        top,
        height: 28,
      } as DOMRect);
    }
    await vi.advanceTimersByTimeAsync(200);

    expect(scrollTo).toHaveBeenCalledWith({ behavior: 'auto', top: 1904 });
    expect(scrollTo).not.toHaveBeenCalledWith({ behavior: 'auto', top: 904 });
  });

  it('expires unmatched hash requests instead of scrolling much later', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    scrollDocsHashTargetAfterLayout('#missing', { behavior: 'auto' });
    await vi.advanceTimersByTimeAsync(31_000);
    document.body.innerHTML = '<h3 id="missing">Late unrelated content</h3>';
    await vi.advanceTimersByTimeAsync(200);

    expect(scrollTo).not.toHaveBeenCalled();
  });
});
