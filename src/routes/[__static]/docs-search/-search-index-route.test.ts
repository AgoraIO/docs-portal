import { isNotFound } from '@tanstack/react-router';
import { describe, expect, it, vi } from 'vitest';
import { getDocsSearchIndexResponse } from './$';

vi.mock('@/lib/docs-page.server', () => ({
  loadDocsSearchIndex: vi.fn(async (locale: string) => [
    {
      title: locale === 'en' ? 'Cloud Recording' : '云端录制',
      url:
        locale === 'en'
          ? '/en/realtime-media/cloud-recording'
          : '/zh-CN/realtime-media/cloud-recording',
    },
  ]),
}));

describe('/__static/docs-search/$ route', () => {
  it('serves a generated docs search index when the static json file is absent', async () => {
    const response = await getDocsSearchIndexResponse('en.json');

    await expect(response.json()).resolves.toEqual([
      {
        title: 'Cloud Recording',
        url: '/en/realtime-media/cloud-recording',
      },
    ]);
  });

  it('rejects non-json and unsupported locale requests', async () => {
    for (const splat of ['en.txt', 'fr.json']) {
      try {
        await getDocsSearchIndexResponse(splat);
      } catch (error) {
        expect(isNotFound(error)).toBe(true);
        continue;
      }

      throw new Error(`expected ${splat} to reject with notFound`);
    }
  });
});
