import { describe, expect, it } from 'vitest';
import { DOCS_MAIN_SCROLL_RESTORATION_SELECTOR } from '@/lib/docs-scroll-restoration';
import { getRouter } from './router';

describe('getRouter', () => {
  it('lets TanStack Router restore and reset the docs main scroll region', () => {
    const router = getRouter();

    expect(router.options.scrollRestoration).toBe(true);
    expect(router.options.scrollToTopSelectors).toContain(
      DOCS_MAIN_SCROLL_RESTORATION_SELECTOR,
    );
  });
});
