import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { compile } from '@mdx-js/mdx';
import { describe, expect, it } from 'vitest';

const docsRoot = resolve(process.cwd(), 'content/docs/en');
const allDocsRoot = resolve(process.cwd(), 'content/docs');
const voiceDocsRoot = resolve(docsRoot, 'realtime-media/voice');
const SOURCE_LOADER_TEST_TIMEOUT = 300_000;

describe('docs content regressions', () => {
  it('keeps RTC repository card names unchanged with inline platform icons', async () => {
    const source = readFileSync(
      resolve(allDocsRoot, 'zh-CN/realtime-media/rtc/get-started/run-demo.mdx'),
      'utf8',
    );
    const cards = [...source.matchAll(/<Card\b[^\n]+/g)];
    expect(cards).toHaveLength(23);
    for (const [card] of cards) {
      const href = card.match(/href="([^"]+)"/)?.[1];
      const provider = new URL(href ?? '').hostname.split('.')[0];
      expect(card).toContain(
        `title={<RepositoryCardTitle provider="${provider}">`,
      );
      expect(card).not.toMatch(/ · (Gitee|GitHub)/);
      expect(card).not.toContain('icon=');
    }
    await expect(compile(source)).resolves.toBeDefined();
  });

  function expectListItemToContainNestedOrderedList(
    compiled: string,
    marker: string,
  ) {
    const markerIndex = compiled.indexOf(marker);
    expect(markerIndex).toBeGreaterThanOrEqual(0);

    const nestedListIndex = compiled.indexOf('<_components.ol>', markerIndex);
    const itemCloseIndex = compiled.indexOf('</_components.li>', markerIndex);

    expect(nestedListIndex).toBeGreaterThan(markerIndex);
    expect(nestedListIndex).toBeLessThan(itemCloseIndex);
  }

  function expectCompiledSectionToHaveSingleOrderedList(
    compiled: string,
    startMarker: string,
    endMarker: string,
    itemCount: number,
  ) {
    const startIndex = compiled.indexOf(startMarker);
    const endIndex = compiled.indexOf(endMarker, startIndex + 1);

    expect(startIndex).toBeGreaterThanOrEqual(0);
    expect(endIndex).toBeGreaterThan(startIndex);

    const section = compiled.slice(startIndex, endIndex);

    expect(section.match(/<_components\.ol>/g) ?? []).toHaveLength(1);
    expect(section.match(/<_components\.li>/g) ?? []).toHaveLength(itemCount);
  }

  function expectMarkersToStayInSameOrderedList(
    compiled: string,
    markers: string[],
  ) {
    const markerIndexes = markers.map((marker) => {
      const markerIndex = compiled.indexOf(marker);
      expect(markerIndex).toBeGreaterThanOrEqual(0);

      return markerIndex;
    });
    const listRanges: Array<{ start: number; end: number }> = [];
    const openListIndexes: number[] = [];

    for (const match of compiled.matchAll(/<\/?_components\.ol>/g)) {
      const token = match[0];
      const index = match.index ?? 0;

      if (token === '<_components.ol>') {
        openListIndexes.push(index);
      } else {
        const start = openListIndexes.pop();

        if (start !== undefined) {
          listRanges.push({ start, end: index });
        }
      }
    }

    const containingList = listRanges.find(({ start, end }) => {
      return markerIndexes.every((markerIndex) => {
        return markerIndex > start && markerIndex < end;
      });
    });

    expect(containingList).toBeDefined();
  }

  function expectListItemToContainMarkers(
    compiled: string,
    startMarker: string,
    containedMarkers: string[],
  ) {
    const startIndex = compiled.indexOf(startMarker);
    expect(startIndex).toBeGreaterThanOrEqual(0);

    const itemCloseIndex = compiled.indexOf('</_components.li>', startIndex);
    expect(itemCloseIndex).toBeGreaterThan(startIndex);

    for (const marker of containedMarkers) {
      const markerIndex = compiled.indexOf(marker, startIndex);

      expect(markerIndex).toBeGreaterThan(startIndex);
      expect(markerIndex).toBeLessThan(itemCloseIndex);
    }
  }

  function listMarkdownFiles(root: string): string[] {
    const files: string[] = [];

    for (const entry of readdirSync(root, { withFileTypes: true })) {
      const entryPath = join(root, entry.name);

      if (entry.isDirectory()) {
        files.push(...listMarkdownFiles(entryPath));
        continue;
      }

      if (entry.isFile() && /\.(?:md|mdx)$/.test(entry.name)) {
        files.push(entryPath);
      }
    }

    return files;
  }

  function readVoiceDoc(relativePath: string) {
    return readFileSync(resolve(voiceDocsRoot, relativePath), 'utf8');
  }

  function readDoc(relativePath: string) {
    return readFileSync(resolve(docsRoot, relativePath), 'utf8');
  }

  function findMdxTabs(source: string) {
    return [...source.matchAll(/<Tabs\b([^>]*)>([\s\S]*?)<\/Tabs>/g)].map(
      (match) => ({
        attrs: match[1],
        line: source.slice(0, match.index).split('\n').length,
        values: [
          ...match[2].matchAll(/<TabsTrigger\b[^>]*value="([^"]+)"/g),
        ].map((valueMatch) => valueMatch[1]),
      }),
    );
  }

  function aiModelsDocSlugs(file: string) {
    const relativePath = relative(docsRoot, file).replace(/\\/g, '/');
    const withoutExtension = relativePath.replace(/\.mdx?$/, '');
    const segments = withoutExtension.split('/');

    if (segments.at(-1) === 'index') {
      return segments.slice(0, -1);
    }

    return segments;
  }

  it('keeps AI interrupt agent quickstart link on the Video Calling SDK quickstart', () => {
    const content = readDoc(
      'ai/build/shape-the-conversation/interrupt-agent.mdx',
    );

    expect(content).toContain(
      '[Quickstart](../../../realtime-media/video/quickstart)',
    );
    expect(content).not.toContain(
      '[Quickstart](../../introduction/realtime-audio-video)',
    );
    expect(content).not.toContain(
      '[Quickstart](../../../introduction/realtime-audio-video)',
    );
  });

  it('keeps AI build interrupt links in shape the conversation', () => {
    const files = listMarkdownFiles(resolve(docsRoot, 'ai/build'));
    const offenders = files.flatMap((file) => {
      const content = readFileSync(file, 'utf8');

      return [...content.matchAll(/\]\(interrupt-agent\)/g)].map(
        (match) => `${relative(process.cwd(), file)}:${match.index ?? 0}`,
      );
    });

    expect(offenders).toEqual([]);
  });

  it('keeps AI filler words MCP servers link on the Conversational AI join API', () => {
    const content = readDoc('ai/build/shape-the-conversation/filler-words.mdx');

    expect(content).toContain(
      '[MCP servers](/en/api-reference/api-ref/conversational-ai/join#properties-llm-mcp-servers)',
    );
    expect(content).not.toContain(
      '[MCP servers](../../api-reference/conversational-ai/rest-api/agent/join#properties-llm-mcp-servers)',
    );
  });

  it('keeps Ares ASR pricing link in the AI reference pricing page', () => {
    const content = readDoc('ai/models/asr/ares.mdx');

    expect(content).toContain('[pricing](../../reference/pricing)');
    expect(content).not.toContain('[pricing](/en/ai/pricing)');
  });

  it('keeps screenshot upload provider details grouped in tabs across screenshot upload docs', () => {
    const screenshotUploadDocs = [
      'realtime-media/video/build/add-advanced-video-features/screenshot-upload.mdx',
      'realtime-media/broadcast-streaming/build/process-raw-and-custom-media/screenshot-upload.mdx',
      'realtime-media/interactive-live-streaming/build/process-raw-and-custom-media/screenshot-upload.mdx',
    ];

    for (const relativePath of screenshotUploadDocs) {
      const content = readDoc(relativePath);
      const startMarker = 'Fill in the following information:';
      const endMarker = '3. **Integrate Video SDK**';
      const startIndex = content.indexOf(startMarker);
      const endIndex = content.indexOf(endMarker, startIndex + 1);

      expect(startIndex).toBeGreaterThanOrEqual(0);
      expect(endIndex).toBeGreaterThan(startIndex);

      const providerSection = content.slice(startIndex, endIndex);

      expect(providerSection).toContain(
        '<Tabs defaultValue="aws" groupId="storage-provider" persist>',
      );
      expect(providerSection).toContain('<TabsList>');
      expect(providerSection).toContain(
        '<TabsTrigger value="aws">AWS</TabsTrigger>',
      );
      expect(providerSection).toContain(
        '<TabsTrigger value="alibaba-cloud">Alibaba Cloud</TabsTrigger>',
      );
      expect(providerSection).toContain('<TabsContent value="aws">');
      expect(providerSection).toContain('<TabsContent value="alibaba-cloud">');
    }
  });

  it(
    'uses nested canonical build routes for voice docs content',
    async () => {
      const { source } = await import('./source.server');

      expect(
        source.getPage(
          [
            'realtime-media',
            'voice',
            'build',
            'set-up-token-authentication',
            'use-tokens',
          ],
          'en',
        ),
      ).toBeDefined();
      expect(
        source.getPage(
          [
            'realtime-media',
            'voice',
            'build',
            'set-up-your-project',
            'compile-run-sample-project',
          ],
          'en',
        ),
      ).toBeDefined();
      expect(
        source.getPage(
          [
            'realtime-media',
            'voice',
            'build',
            'manage-connection-and-quality',
            'cloud-proxy',
          ],
          'en',
        ),
      ).toBeDefined();

      expect(
        source.getPage(
          ['realtime-media', 'voice', 'build', 'use-tokens'],
          'en',
        ),
      ).toBeUndefined();
      expect(
        source.getPage(
          ['realtime-media', 'voice', 'build', 'compile-run-sample-project'],
          'en',
        ),
      ).toBeUndefined();
      expect(
        source.getPage(
          ['realtime-media', 'voice', 'build', 'cloud-proxy'],
          'en',
        ),
      ).toBeUndefined();
    },
    SOURCE_LOADER_TEST_TIMEOUT,
  );

  it(
    'preserves explicit table cell line breaks in processed markdown',
    async () => {
      const { source } = await import('./source.server');
      const page = source.getPage(
        ['ai', 'best-practices', 'optimize-latency'],
        'en',
      );

      expect(page).toBeDefined();
      expect(page?.type).toBe('docs');

      if (!page || !('getText' in page.data)) {
        throw new Error('Expected latency page to expose processed markdown.');
      }

      const processed = await page.data.getText('processed');

      expect(processed).toMatch(
        /TTFB: Time To First Byte, the first byte latency\.<br\s*\/>TTFS: Time To First Sentence/,
      );
    },
    SOURCE_LOADER_TEST_TIMEOUT,
  );

  it('keeps voice supported platforms expanded into the shared multi-platform structure', () => {
    const source = readFileSync(
      resolve(
        docsRoot,
        'realtime-media/voice/reference/supported-platforms.mdx',
      ),
      'utf8',
    );

    expect(source).toContain('<PlatformStructured platform="android">');
    expect(source).toContain('<PlatformStructured platform="ios">');
    expect(source).toContain('<PlatformStructured platform="web">');
    expect(source).toContain('<PlatformStructured platform="windows">');
    expect(source).toContain('<PlatformStructured platform="unreal">');
    expect(source).toContain('Voice SDK supports the following ABIs.');
    expect(source).not.toContain('| Android | <Slot name="android" /> |');
  });

  it('keeps voice error codes page populated with platform-specific reference content', () => {
    const source = readFileSync(
      resolve(docsRoot, 'realtime-media/voice/reference/error-codes.mdx'),
      'utf8',
    );

    expect(source).toContain('## Common error codes');
    expect(source).toContain('## Audio-related error codes');
    expect(source).toContain('## Data stream-related error codes');
    expect(source).toContain(
      '| `109` | The currently used token has expired and is no longer valid. Generate a new token on the server side and call `renewToken` to update the token. |',
    );
    expect(source).toContain(
      '| `1501` | There is no permission to use the camera. Check if camera permission has been turned on. |',
    );
    expect(source).toContain('<PlatformStructured platform="android">');
    expect(source).toContain('<PlatformStructured platform="web">');
  });

  it(
    'preserves AI model admonitions in the source-backed Markdown export',
    async () => {
      const { source } = await import('./source.server');
      const modelDocsRoot = resolve(docsRoot, 'ai/models');
      const filesWithCallouts = listMarkdownFiles(modelDocsRoot).filter(
        (file) => {
          const sourceText = readFileSync(file, 'utf8');
          return /^:{3,4}(?:caution|danger|info|note|tip|warn|warning)\b/m.test(
            sourceText,
          );
        },
      );

      for (const file of filesWithCallouts) {
        const page = source.getPage(aiModelsDocSlugs(file), 'en');

        expect(page).toBeDefined();
        expect(page?.type).toBe('docs');

        if (!page || !('getText' in page.data)) {
          throw new Error(
            `Expected AI model page ${relative(process.cwd(), file)} to expose processed markdown.`,
          );
        }

        const processed = await page.data.getText('processed');

        expect(processed).toMatch(
          /^:{3,4}(?:caution|danger|info|note|tip|warn|warning)\b/m,
        );
        expect(processed).toMatch(
          /^:{3,4}(?:info|note|caution|warning|warn|tip|danger)\b/m,
        );
      }
    },
    SOURCE_LOADER_TEST_TIMEOUT,
  );

  it(
    'keeps all nested and repeated AI model admonitions in Markdown',
    async () => {
      const { source } = await import('./source.server');
      const akool = source.getPage(['ai', 'models', 'avatar', 'akool'], 'en');
      const deepgram = source.getPage(
        ['ai', 'models', 'asr', 'deepgram'],
        'en',
      );
      const elevenLabs = source.getPage(
        ['ai', 'models', 'tts', 'elevenlabs'],
        'en',
      );

      for (const page of [akool, deepgram, elevenLabs]) {
        expect(page).toBeDefined();
        expect(page?.type).toBe('docs');
      }

      if (
        !akool ||
        !deepgram ||
        !elevenLabs ||
        !('getText' in akool.data) ||
        !('getText' in deepgram.data) ||
        !('getText' in elevenLabs.data)
      ) {
        throw new Error(
          'Expected AI model regression pages to expose processed markdown.',
        );
      }

      const akoolProcessed = await akool.data.getText('processed');
      const deepgramProcessed = await deepgram.data.getText('processed');
      const elevenLabsProcessed = await elevenLabs.data.getText('processed');

      expect(akoolProcessed.match(/:::info\[/g) ?? []).toHaveLength(3);
      expect(akoolProcessed).toContain('sales@agora.io');
      expect(deepgramProcessed).toMatch(/:::(?:caution|warning|warn)\[/);
      expect(deepgramProcessed).toContain('callback_method');
      expect(
        elevenLabsProcessed.match(/:::(?:caution|warning|warn)\[/g) ?? [],
      ).toHaveLength(2);
      expect(elevenLabsProcessed).toContain('Paid plan required');
    },
    SOURCE_LOADER_TEST_TIMEOUT,
  );

  it(
    'renders IoT authentication code tabs as MDX components',
    async () => {
      const { source } = await import('./source.server');
      const page = source.getPage(
        [
          'realtime-media',
          'iot',
          'build',
          'set-up-authentication-and-security',
          'authentication-workflow',
        ],
        'en',
      );

      expect(page).toBeDefined();
      expect(page?.type).toBe('docs');
      expect(page?.path).toBe(
        'en/realtime-media/iot/build/set-up-authentication-and-security/authentication-workflow.mdx',
      );

      if (!page || !('getText' in page.data)) {
        throw new Error(
          'Expected IoT authentication page to expose processed markdown.',
        );
      }

      const processed = await page.data.getText('processed');

      expect(processed).toContain('<CodeBlockTabs defaultValue="java">');
      expect(processed).toContain('<CodeBlockTab value="java">');
      expect(processed).toContain('<CodeBlockTab value="kotlin">');
      expect(processed).not.toContain('&lt;/CodeBlockTab&gt;');
      expect(processed).not.toContain('&lt;CodeBlockTab');
    },
    SOURCE_LOADER_TEST_TIMEOUT,
  );

  it(
    'renders stream channel platform sections as MDX components',
    async () => {
      const { source } = await import('./source.server');
      const page = source.getPage(
        [
          'realtime-media',
          'rtm',
          'build',
          'work-with-channels',
          'stream-channel',
        ],
        'en',
      );

      expect(page).toBeDefined();
      expect(page?.type).toBe('docs');
      expect(page?.path).toBe(
        'en/realtime-media/rtm/build/work-with-channels/stream-channel.mdx',
      );

      if (!page || !('getText' in page.data)) {
        throw new Error(
          'Expected stream channel page to expose processed markdown.',
        );
      }

      const processed = await page.data.getText('processed');

      expect(processed).toContain('<_PlatformTabsGroup');
      expect(processed).toContain('platform="web"');
      expect(processed).toContain('platform="android"');
      expect(processed).toContain('platform="ios"');
      expect(processed).not.toContain('&lt;/CodeBlockTab&gt;');
      expect(processed).not.toContain('&lt;CodeBlockTab');
      expect(processed).not.toContain('&lt;PlatformStructured');
    },
    SOURCE_LOADER_TEST_TIMEOUT,
  );
});
