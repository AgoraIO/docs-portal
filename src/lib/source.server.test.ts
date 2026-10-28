import { describe, expect, it } from 'vitest';
import { getLLMText, getPlatformLLMText, source } from './source.server';

describe('fumadocs source loader', () => {
  it.each(['canonical', 'android'] as const)(
    'cleans versioned %s exports while retaining their documentation identity',
    async (variant) => {
      const page = source.getPage(
        ['introduction', 'versioning-demo', 'new', 'configure'],
        'en',
      );
      if (page?.type !== 'docs') {
        throw new Error('Expected the versioned guide page');
      }
      const processed = `<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="android" platform="android" />
<Tabs items={['Java']}>
<Tab>

\`\`\`java
if (ready) {
  connect();
}
\`\`\`

</Tab>
</Tabs>
<_PlatformProcessedMarker close="true" />
<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="android" platform="web" />
Web instructions only.
<_PlatformProcessedMarker close="true" />`;
      const versionedPage = {
        ...page,
        data: { ...page.data, getText: async () => processed },
      };
      const markdown =
        variant === 'canonical'
          ? await getLLMText(versionedPage)
          : await getPlatformLLMText(versionedPage, variant);

      expect(markdown).toContain('**Java**');
      expect(markdown).toContain('```java\nif (ready) {\n  connect();\n}\n```');
      expect(markdown).not.toMatch(/<\/?(?:Tabs|Tab|_Platform)/);
      expect(markdown).not.toContain('Web instructions only.');
      expect(markdown).toContain(
        'Documentation family: Guide demo (test-guides).',
      );
      expect(markdown).toContain('Documentation version: New docs (v2).');
      expect(markdown).toContain('/llms/doc-versions-test-guides-v2.txt');
      expect(markdown?.match(/Documentation version:/g)).toHaveLength(1);
    },
  );

  it('exports Start with AI as clean Markdown with labeled installation alternatives', async () => {
    const page = source.getPage(['introduction', 'start-with-ai'], 'en');
    if (!page) throw new Error('Expected the Start with AI page');

    const markdown = await getLLMText(page);

    expect(markdown).not.toMatch(
      /<\/?(?:Tabs|TabsList|TabsTrigger|TabsContent)\b/,
    );
    expect(markdown).toContain('**macOS and Linux**');
    expect(markdown).toContain('**Windows (PowerShell)**');
    expect(markdown).toContain(
      '```bash\ncurl -fsSL https://dl.agora.io/cli/install.sh | sh\nagora --help\n```',
    );
    expect(markdown).toContain(
      '```powershell\nirm https://dl.agora.io/cli/install.ps1 | iex\nagora --help\n```',
    );
    expect(markdown).toContain('**Manual installation**');
    expect(markdown).toContain(
      'git clone https://github.com/AgoraIO/skills.git ~/agora-skills',
    );
  });
  it.each(['en', 'zh-CN'])(
    'cleans %s platform exports after selecting the requested platform',
    async (locale) => {
      const processed = `<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="android" />
<Tabs items={['Java']}>
<Tab>

\`\`\`java
if (ready) {
  connect();
}
\`\`\`

</Tab>
</Tabs>
<_PlatformProcessedMarker close="true" />
<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="web" />
Web instructions only.
<_PlatformProcessedMarker close="true" />`;
      const page = {
        data: { getText: async () => processed, title: 'Quickstart' },
        path: `${locale}/test.mdx`,
        url: `/${locale}/test`,
      } as unknown as Parameters<typeof getPlatformLLMText>[0];
      const markdown = await getPlatformLLMText(page, 'android');
      expect(markdown).toContain('**Java**');
      expect(markdown).toContain('```java\nif (ready) {\n  connect();\n}\n```');
      expect(markdown).not.toContain('Web instructions only.');
      expect(markdown).not.toMatch(/<\/?(?:Tabs|Tab|_Platform)/);
    },
  );

  it('keeps RTC extensions and notes within their platform markdown', async () => {
    const page = source.getPage(
      ['realtime-media', 'rtc', 'reference', 'release-notes'],
      'en',
    );
    expect(page).toBeDefined();
    if (!page) return;

    const unreal = await getPlatformLLMText(page, 'unreal');
    const web = await getPlatformLLMText(page, 'web');
    expect(unreal).toContain('All 4.x SDKs support using wildcard tokens.');
    expect(unreal).not.toMatch(
      /All 4\.x SDKs support using wildcard tokens\.[\s\S]{0,40}\\:::/,
    );
    expect(unreal).not.toMatch(/For one `RtcConnection`[\s\S]{0,120}\\:::/);
    expect(unreal).not.toContain('## Extensions');
    expect(web).toContain('## Extensions');
    expect(web).toContain('## AI Noise Suppression');
  }, 30_000);
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
    expect(markdown).toContain('#### RTC SDK');
    expect(markdown).toContain(
      'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.7.0_FULL.zip',
    );
    expect(markdown).toContain('Version 4.7.0 Lite (Latest)');
    expect(markdown).toContain(
      'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.7.0_LITE.zip',
    );
    expect(Buffer.byteLength(markdown)).toBeLessThan(50_000);
  });

  it('exports Chinese component content as clean Markdown', async () => {
    const page = source.getPage(['introduction'], 'zh-CN');

    expect(page).toBeDefined();
    if (!page || !('getText' in page.data)) {
      throw new Error('Expected the Chinese introduction page');
    }

    const markdown = await getLLMText(page);
    expect(markdown).toContain(`# ${page.data.title} (${page.url})`);
    expect(markdown).toContain('[Voice agent 快速开始](/zh-CN/ai/quick-start)');
    expect(markdown).toContain('15 分钟内跑通一个可用的语音智能体。');
    expect(markdown).toContain('构建实时互动');
    expect(markdown).toContain('Signaling');
    expect(markdown).not.toMatch(
      /<\/?(?:OverviewSpotlight|CapabilityMatrix|div)\b/,
    );
  });

  it('keeps Chinese platform headings and prose in standard Markdown', async () => {
    const page = {
      data: {
        getText:
          async () => `<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="android" />
    ## Android 设置 [#android]
    Android 内容
<_PlatformProcessedMarker close="true" />
<_PlatformProcessedMarker groupMode="structured" canonicalPlatform="web" platform="web" />
    ## Web 设置 [#web]
    Web 内容
<_PlatformProcessedMarker close="true" />`,
        title: '快速开始',
      },
      path: 'zh-CN/test.mdx',
      url: '/zh-CN/test',
    } as unknown as Parameters<typeof getPlatformLLMText>[0];

    await expect(
      getPlatformLLMText(page, 'android'),
    ).resolves.toBe(`# 快速开始 (/zh-CN/test/android)

## Android 设置 \\[#android]

Android 内容
`);
  });

  it('links platform-specific Markdown variants from canonical pages', async () => {
    const page = source.getPage(
      [
        'realtime-media',
        'rtc',
        'build',
        'capture-and-render-video',
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
        'rtc',
        'build',
        'enhance-the-audio-experience',
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
