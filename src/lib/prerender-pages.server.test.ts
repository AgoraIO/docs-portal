import { describe, expect, it } from 'vitest';
import { getDocsPrerenderPaths } from './prerender-pages.server';

describe('getDocsPrerenderPaths', () => {
  it('seeds prerender paths from ordinary docs and openapi paths', () => {
    const paths = getDocsPrerenderPaths();

    expect(paths).toContain('/');
    expect(paths).toContain('/en/ai/custom-llm');
    expect(paths.length).toBeGreaterThan(100);
  });
});
