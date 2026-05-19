import { describe, expect, it } from 'vitest';
import { getStaticDocsPaths } from './docs-static-paths';

describe('getStaticDocsPaths', () => {
  it('collects sorted localized docs page paths only', () => {
    const paths = getStaticDocsPaths();

    expect(paths).toContain('/en/introduction/about-agora');
    expect(paths).toContain('/en/introduction');
    expect(paths).toContain('/zh-CN/ai/quick-start');
    expect(paths).not.toContain('/api/search');
    expect(paths).not.toContain('/llms.txt');
    expect(paths).toEqual([...paths].sort((a, b) => a.localeCompare(b)));
  });
});
