import { describe, expect, it } from 'vitest';
import { selectStaticDocsPrerenderPaths } from './prerender-pages';

describe('static docs prerender paths', () => {
  it('reserves the root output for the SPA shell and supports focused builds', () => {
    expect(
      selectStaticDocsPrerenderPaths(
        [
          '/',
          '/en/ai/get-started/quickstart',
          '/en/api-reference/api-ref/conversational-ai/join',
        ],
        ['/en/ai/get-started/quickstart', '/missing'],
      ),
    ).toEqual(['/en/ai/get-started/quickstart']);
  });
});
