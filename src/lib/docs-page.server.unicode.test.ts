import { describe, expect, it } from 'vitest';
import { loadDocsPagePayload } from './docs-page.server';

describe('Unicode docs routes', () => {
  it('loads a page whose directories and filename contain Chinese characters', async () => {
    const payload = await loadDocsPagePayload('zh-CN', 'introduction', [
      'terms',
      '中文翻译',
      '固定用法',
      '固定用法-RTC',
    ]);

    expect(payload).toBeTruthy();
    expect(payload).not.toHaveProperty('redirectUrl');

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('Expected the Unicode docs route to load directly.');
    }

    expect(payload.contentPath).toBe(
      'zh-CN/introduction/terms/中文翻译/固定用法/固定用法-RTC.md',
    );
  });
});
