import { describe, expect, it } from 'vitest';
import { getCnSearchFamily } from './cn-search-family';
import { buildCnSearchDocument } from './cn-search-strategy';

describe('CN search families', () => {
  it.each([
    ['/reference/faq/integration/set_log_file#native', 'docs', 'faq'],
    ['/zh-CN/reference/faq/account/billing_basis', 'docs', 'faq'],
    ['/reference/faq', 'docs', 'faq'],
    ['/reference/faq-not-a-category', 'docs', 'docs'],
    ['/reference/overview', 'docs', 'docs'],
    ['/realtime-media/rtc/guide', 'docs', 'docs'],
    ['/api-reference/rtc/android/method', 'docs', 'api'],
    ['/realtime-media/rtc/rest', 'openapi', 'api'],
  ] as const)(
    'classifies %s as %s/%s before indexing and when displaying',
    (url, docType, expected) => {
      expect(getCnSearchFamily({ pageUrl: url, docType })).toBe(expected);
      expect(
        buildCnSearchDocument({
          id: 'family',
          url,
          docType,
          pageTitle: '文档',
          sectionTitle: '文档',
          content: '正文',
          headingPath: ['文档'],
          locale: 'zh-CN',
          audience: ['developer'],
          status: 'published',
          hidden: false,
        }).searchFamily,
      ).toBe(expected);
    },
  );
});
