import { describe, expect, it } from 'vitest';
import { getLLMText, source } from './source.server';

describe('fumadocs source loader', () => {
  it('resolves localized OpenAPI operation pages from the merged source', () => {
    const page = source.getPage(
      ['api-reference', 'api-ref', 'conversational-ai', 'join'],
      'en',
    );

    expect(page?.type).toBe('openapi');
    expect(page?.url).toBe('/en/api-reference/api-ref/conversational-ai/join');
    expect(page?.data._openapi?.method).toBe('post');
  });

  it('ignores internal proposal report JSON files when resolving docs pages', () => {
    const page = source.getPage(
      ['realtime-media', 'agora-analytics', 'product-overview'],
      'en',
    );

    expect(page?.type).toBe('docs');
    expect(page?.url).toBe(
      '/en/realtime-media/agora-analytics/product-overview',
    );
    expect(page?.data.title).toBe('Agora Analytics overview');
    expect(
      source.getPage(
        ['realtime-media', 'agora-analytics', '_proposal-report'],
        'en',
      ),
    ).toBeUndefined();
  });

  it('serializes the SDK catalog as concise machine-readable content', async () => {
    const page = source.getPage(['api-reference', 'sdks'], 'en');

    expect(page).toBeDefined();
    if (!page) {
      throw new Error('Expected the English SDK catalog page');
    }

    const markdown = await getLLMText(page);

    expect(markdown).not.toContain('<SdksCatalog />');
    expect(markdown).toContain('## SDK catalog');
    expect(markdown).toContain('### TypeScript');
    expect(markdown).toContain('#### Agora Agents SDK');
    expect(markdown).toContain('Version 2.3.1 (Latest)');
    expect(markdown).toContain(
      'https://www.npmjs.com/package/agora-agents/v/2.3.1',
    );
    expect(markdown).toContain('#### Video SDK');
    expect(markdown).toContain(
      'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.6.3_FULL.zip',
    );
    expect(markdown).toContain('Version 4.6.3 Lite (Latest)');
    expect(markdown).toContain(
      'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.6.3_LITE.zip',
    );
    expect(Buffer.byteLength(markdown)).toBeLessThan(50_000);
  });

  it('uses delivery-path-specific headings in runtime event Markdown', async () => {
    const page = source.getPage(
      ['ai', 'build', 'handle-runtime-events', 'get-runtime-events'],
      'en',
    );

    expect(page).toBeDefined();
    if (!page) {
      throw new Error('Expected the English runtime events page');
    }

    const markdown = await getLLMText(page);

    expect(markdown).toContain('### What you get with the client toolkit');
    expect(markdown).toContain('### What you need for the client toolkit');
    expect(markdown).toContain('### How to receive client toolkit events');
    expect(markdown).toContain('### What you get with webhooks');
    expect(markdown).toContain('### What you need for webhooks');
    expect(markdown).toContain('### How to receive webhook events');
  });
});
