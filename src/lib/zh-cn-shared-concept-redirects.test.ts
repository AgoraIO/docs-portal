import { describe, expect, it } from 'vitest';
import { loadDocsPagePayload } from './docs-page.server';

describe('zh-CN shared concept redirects', () => {
  it.each([
    'mcp-integrate',
    'skills-integrate',
  ] as const)('redirects product %s pages to the introduction canonical page', async (slug) => {
    const result = await loadDocsPagePayload('zh-CN', 'realtime-media', [
      'rtc',
      slug,
    ]);

    expect(result).toEqual({
      redirectUrl: `/zh-CN/introduction/${slug}`,
    });
  });

  it('serves the introduction MCP page as the canonical shared concept page', async () => {
    const result = await loadDocsPagePayload('zh-CN', 'introduction', [
      'mcp-integrate',
    ]);

    expect(result).toBeTruthy();
    expect(result).not.toHaveProperty('redirectUrl');

    if (!result || 'redirectUrl' in result) {
      throw new Error('Expected the introduction MCP page to load directly.');
    }

    expect(result.activePath).toBe('/zh-CN/introduction/mcp-integrate');
  });
});
