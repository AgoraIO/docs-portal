import { afterEach, describe, expect, it, vi } from 'vitest';
import { scrollDocsHashTarget } from './docs-hash';

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
});
