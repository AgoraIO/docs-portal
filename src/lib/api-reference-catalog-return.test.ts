import { describe, expect, it } from 'vitest';
import {
  createApiCatalogReturn,
  normalizeApiCatalogReturn,
  readApiCatalogReturn,
  withApiCatalogReturn,
} from './api-reference-catalog-return';

describe('API catalog return context', () => {
  it('retains the catalog filters and existing product anchor across an SDK entry', () => {
    const source = new URL(
      'https://docs.test/api-reference/api?product=conversational-ai&platform=ios&apiType=client',
    );
    const context = createApiCatalogReturn(source, 'conversational-ai');
    expect(context).toBe(
      '/zh-CN/api-reference/api?product=conversational-ai&platform=ios&apiType=client#api-reference-product-conversational-ai',
    );
    if (!context) throw new Error('Expected a catalog return context');
    const destination = new URL(
      withApiCatalogReturn(
        '/zh-CN/api-reference/conversational-ai/ios/overview#methods',
        context,
      ),
      source,
    );
    expect(destination.hash).toBe('#methods');
    expect(readApiCatalogReturn(destination.search)).toBe(context);
  });

  it.each([
    'https://evil.test/api-reference/api',
    '//evil.test/api-reference/api',
    '/zh-CN/ai',
    '/api-reference/api?redirect=https://evil.test',
    '/api-reference/api#unexpected',
    '/api-reference/api?apiType=wrong',
  ])('rejects a return value outside the catalog contract: %s', (href) => {
    expect(normalizeApiCatalogReturn(href)).toBeUndefined();
  });

  it('leaves external SDK references unchanged', () => {
    const href =
      'https://im.shengwang.cn/docs/sdk/android/api_reference_overview.html';
    expect(withApiCatalogReturn(href, '/zh-CN/api-reference/api')).toBe(href);
  });
});
