import { describe, expect, it } from 'vitest';
import { cnKbManifest } from './cn-kb-manifest';

describe('CN KB manifest', () => {
  it('covers the representative document shapes', () => {
    const routes = cnKbManifest.map((entry) => entry.route);

    expect(routes).toEqual([
      '/zh-CN/introduction/quickstart',
      '/zh-CN/ai/overview/product-overview',
      '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi',
      '/zh-CN/reference/faq/product/call_api_in_browser',
      '/zh-CN/realtime-media/rtc/get-started/quick-start',
    ]);
  });

  it('contains no duplicate routes and every entry has a query fixture', () => {
    const routes = cnKbManifest.map((entry) => entry.route);

    expect(new Set(routes).size).toBe(routes.length);
    expect(cnKbManifest.every((entry) => entry.reason.length > 0)).toBe(true);
    expect(cnKbManifest.every((entry) => entry.sourcePath.endsWith('.mdx'))).toBe(true);
    expect(cnKbManifest.every((entry) => entry.queryIds.length > 0)).toBe(true);
  });
});
