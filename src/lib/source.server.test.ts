import { describe, expect, it } from 'vitest';
import { getLLMText, getPlatformLLMText, source } from './source.server';

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

  it('preserves processed Markdown for Chinese pages', async () => {
    const page = source.getPage(['introduction'], 'zh-CN');

    expect(page).toBeDefined();
    if (!page || !('getText' in page.data)) {
      throw new Error('Expected the Chinese introduction page');
    }

    const processed = await page.data.getText('processed');

    await expect(
      getLLMText(page),
    ).resolves.toBe(`# ${page.data.title} (${page.url})

${processed}`);
  });

  it('links platform-specific Markdown variants from canonical pages', async () => {
    const page = source.getPage(
      [
        'realtime-media',
        'broadcast-streaming',
        'build',
        'manage-video-and-streaming',
        'configure-video-encoding',
      ],
      'en',
    );

    expect(page).toBeDefined();
    if (!page) {
      throw new Error('Expected the video encoding page');
    }

    const markdown = await getLLMText(page);

    expect(markdown).toContain('## Platform-specific versions');
    expect(markdown).toContain(`${page.url}/android.md`);
    expect(markdown).toContain(`${page.url}/ios.md`);
    expect(markdown).toContain(`${page.url}/web.md`);
  });

  it('percent-encodes escaped parentheses in machine-readable HTTP links', async () => {
    const page = source.getPage(
      [
        'realtime-media',
        'interactive-live-streaming',
        'build',
        'optimize-quality-and-connection',
        'best-practices-sound-quality',
      ],
      'en',
    );

    expect(page).toBeDefined();
    if (!page) {
      throw new Error('Expected the English iOS sound quality page');
    }

    const markdown = await getPlatformLLMText(page, 'ios');

    expect(markdown).not.toBeNull();
    expect(markdown).toContain('setaudioprofile%28_:%29');
    expect(markdown).not.toContain('setaudioprofile\\(_:\\)');
  });
});
