import { describe, expect, it } from 'vitest';
import { resolveMovedDocsRedirect } from './docs-moved-redirects';

describe('resolveMovedDocsRedirect', () => {
  it.each(['ppt-transcoding', 'status-page'])(
    'redirects old Solutions %s routes to Realtime Media',
    (product) => {
      expect(
        resolveMovedDocsRedirect('zh-CN', 'solutions', [
          product,
          'build',
          'quick-start',
        ]),
      ).toBe(`/zh-CN/realtime-media/${product}/build/quick-start`);
    },
  );

  it.each([
    [
      'ppt-transcoding/billing',
      '/zh-CN/realtime-media/ppt-transcoding/reference/billing',
    ],
    [
      'status-page/overview/release-notes',
      '/zh-CN/realtime-media/status-page/reference/release-notes',
    ],
  ])(
    'keeps legacy Solutions alias %s mapped to its canonical page',
    (path, target) => {
      expect(
        resolveMovedDocsRedirect('zh-CN', 'solutions', path.split('/')),
      ).toBe(target);
    },
  );

  it('redirects the old Introduction PPT migration route to Realtime Media', () => {
    expect(
      resolveMovedDocsRedirect('zh-CN', 'introduction', [
        'ppt-transcoding',
        'get-started',
        'quick-start',
      ]),
    ).toBe('/zh-CN/realtime-media/ppt-transcoding/get-started/quick-start');
  });

  it('redirects merged Cloud Recording quickstart language pages to the shared quickstart', () => {
    for (const slug of [
      'cloud-recording/get-started/quick-start-go',
      'cloud-recording/get-started/quick-start-java',
      'cloud-recording/get-started/quick-start-nodejs',
    ]) {
      expect(
        resolveMovedDocsRedirect('zh-CN', 'realtime-media', slug.split('/')),
      ).toBe('/zh-CN/realtime-media/cloud-recording/get-started/quick-start');
    }
  });
});
