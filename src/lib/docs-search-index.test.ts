import { describe, expect, it, vi } from 'vitest';
import {
  getStaticDocsSearchIndexPath,
  readStaticDocsSearchIndex,
} from './docs-search-index';

describe('docs-search-index', () => {
  it('builds locale search index paths', () => {
    expect(getStaticDocsSearchIndexPath('zh-CN')).toBe(
      '/__static/docs-search/zh-CN.json',
    );
    expect(getStaticDocsSearchIndexPath('en-US')).toBe(
      '/__static/docs-search/en.json',
    );
    expect(getStaticDocsSearchIndexPath('fr')).toBe('');
  });

  it('returns an empty list for unsupported locales without fetching', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(readStaticDocsSearchIndex('fr')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns an empty list for missing search indexes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      }),
    );

    await expect(readStaticDocsSearchIndex('zh-Hans')).resolves.toEqual([]);
    expect(fetch).toHaveBeenCalledWith('/__static/docs-search/zh-CN.json');
  });

  it('reads search index json when it exists', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => [{ title: 'Quickstart', url: '/en/ai/quickstart' }],
        ok: true,
        status: 200,
        statusText: 'OK',
      }),
    );

    await expect(readStaticDocsSearchIndex('en')).resolves.toEqual([
      {
        title: 'Quickstart',
        url: '/en/ai/quickstart',
      },
    ]);
  });
});
