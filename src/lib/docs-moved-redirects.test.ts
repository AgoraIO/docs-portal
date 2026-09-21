import { describe, expect, it } from 'vitest';
import { resolveMovedDocsRedirect } from './docs-moved-redirects';

describe('resolveMovedDocsRedirect', () => {
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
