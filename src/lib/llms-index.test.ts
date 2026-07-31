import { describe, expect, it } from 'vitest';
import {
  createMachineReadableDocsIndexes,
  validateMachineReadableDocsArtifacts,
} from './llms-index';

describe('machine-readable docs indexes', () => {
  it('creates a structured root index with one-level Markdown leaf indexes', () => {
    const files = createMachineReadableDocsIndexes({
      baseUrl: 'https://docs.example.com',
      docsIndex: [
        '# Existing index',
        '- [Quickstart](/en/ai/get-started/quickstart)',
        '- [RTC overview](/en/realtime-media/rtc/overview)',
        '- [External API reference](https://api-ref.example.com/rtc)',
      ].join('\n'),
      locale: 'en',
      maxCharacters: 500,
      publishedRoutes: [
        {
          canonicalPath: '/en/ai/get-started/quickstart',
          markdownPath: '/en/ai/get-started/quickstart.md',
          url: '/en/ai/get-started/quickstart',
        },
        {
          canonicalPath: '/en/realtime-media/rtc/overview',
          markdownPath: '/en/realtime-media/rtc/overview.md',
          url: '/en/realtime-media/rtc/overview',
        },
        {
          canonicalPath: '/en/realtime-media/rtc/overview',
          markdownPath: '/en/realtime-media/rtc/overview/android.md',
          platform: 'android',
          url: '/en/realtime-media/rtc/overview/android',
        },
      ],
    });

    expect(files[0]).toMatchObject({ path: '/llms.txt' });
    expect(files[0]?.content).toContain('# Agora Documentation');
    expect(files[0]?.content).toContain('> ');
    expect(files[0]?.content).toContain('## Documentation indexes');

    const sectionFiles = files.slice(1);
    expect(sectionFiles.length).toBeGreaterThan(0);
    expect(files.every((file) => file.content.length <= 500)).toBe(true);

    const rootTargets = getMarkdownTargets(files[0]?.content ?? '');
    expect(rootTargets.length).toBe(sectionFiles.length);
    expect(rootTargets.every((target) => target.endsWith('.txt'))).toBe(true);
    expect(rootTargets).toEqual(
      sectionFiles.map((file) => `https://docs.example.com${file.path}`),
    );
    expect(files[0]?.content).toContain('[AI](');

    const leafTargets = sectionFiles.flatMap((file) =>
      getMarkdownTargets(file.content),
    );
    expect(leafTargets).toEqual([
      'https://docs.example.com/en/ai/get-started/quickstart.md',
      'https://api-ref.example.com/rtc',
      'https://docs.example.com/en/realtime-media/rtc/overview.md',
      'https://docs.example.com/en/realtime-media/rtc/overview/android.md',
    ]);
    expect(
      leafTargets
        .filter((target) => target.startsWith('https://docs.example.com/'))
        .every((target) => target.endsWith('.md')),
    ).toBe(true);
    expect(leafTargets).toContain('https://api-ref.example.com/rtc');
    expect(
      sectionFiles.every((file) => file.content.includes('## Documentation')),
    ).toBe(true);
  });

  it('covers only the locale published for the configured region', () => {
    const publishedRoutes = [
      {
        canonicalPath: '/en/introduction',
        markdownPath: '/en/introduction.md',
        url: '/en/introduction',
      },
      {
        canonicalPath: '/zh-CN/introduction',
        markdownPath: '/zh-CN/introduction.md',
        url: '/zh-CN/introduction',
      },
    ];

    for (const locale of ['en', 'zh-CN']) {
      const files = createMachineReadableDocsIndexes({
        baseUrl: 'https://docs.example.com',
        docsIndex: '',
        locale,
        publishedRoutes,
      });
      const targets = files
        .slice(1)
        .flatMap((file) => getMarkdownTargets(file.content));

      expect(targets).toEqual([
        `https://docs.example.com/${locale}/introduction.md`,
      ]);
    }
  });

  it('splits oversized semantic groups without adding another index level', () => {
    const publishedRoutes = Array.from({ length: 12 }, (_, index) => ({
      canonicalPath: `/en/realtime-media/rtc/guide-${index}`,
      markdownPath: `/en/realtime-media/rtc/guide-${index}.md`,
      url: `/en/realtime-media/rtc/guide-${index}`,
    }));
    const files = createMachineReadableDocsIndexes({
      baseUrl: 'https://docs.example.com',
      docsIndex: '',
      locale: 'en',
      maxCharacters: 600,
      publishedRoutes,
    });

    expect(files.length).toBeGreaterThan(2);
    expect(files.every((file) => file.content.length <= 600)).toBe(true);
    expect(
      files
        .slice(1)
        .flatMap((file) => getMarkdownTargets(file.content))
        .every((target) => target.endsWith('.md')),
    ).toBe(true);
  });

  it('validates index references against published and emitted artifacts', async () => {
    const publishedRoutes = [
      {
        canonicalPath: '/en/ai/quickstart',
        markdownPath: '/en/ai/quickstart.md',
        url: '/en/ai/quickstart',
      },
    ];
    const files = createMachineReadableDocsIndexes({
      baseUrl: 'https://docs.example.com',
      docsIndex: '- [Quickstart](/en/ai/quickstart)',
      locale: 'en',
      publishedRoutes,
    });
    const emittedPaths = new Set([
      ...files.map((file) => file.path),
      '/en/ai/quickstart.md',
    ]);

    await expect(
      validateMachineReadableDocsArtifacts({
        artifactExists: async (path) => emittedPaths.has(path),
        baseUrl: 'https://docs.example.com',
        files,
        locale: 'en',
        publishedRoutes,
      }),
    ).resolves.toBeUndefined();

    emittedPaths.delete('/en/ai/quickstart.md');

    await expect(
      validateMachineReadableDocsArtifacts({
        artifactExists: async (path) => emittedPaths.has(path),
        baseUrl: 'https://docs.example.com',
        files,
        locale: 'en',
        publishedRoutes,
      }),
    ).rejects.toThrow('Missing machine-readable docs artifact');
  });

  it('normalizes encoded Unicode paths before checking emitted artifacts', async () => {
    const encodedMarkdownPath =
      '/zh-CN/introduction/terms/%E4%B8%AD%E6%96%87%E7%BF%BB%E8%AF%91/%E5%9B%BA%E5%AE%9A%E7%94%A8%E6%B3%95/%E5%9B%BA%E5%AE%9A%E7%94%A8%E6%B3%95-RTC.md';
    const publishedRoutes = [
      {
        canonicalPath: encodedMarkdownPath.replace(/\.md$/, ''),
        markdownPath: encodedMarkdownPath,
        url: encodedMarkdownPath.replace(/\.md$/, ''),
      },
    ];
    const files = createMachineReadableDocsIndexes({
      baseUrl: 'https://docs.example.com',
      docsIndex: '',
      locale: 'zh-CN',
      publishedRoutes,
    });
    const emittedPaths = new Set([
      ...files.map((file) => file.path),
      '/zh-CN/introduction/terms/中文翻译/固定用法/固定用法-RTC.md',
    ]);

    await expect(
      validateMachineReadableDocsArtifacts({
        artifactExists: async (path) => emittedPaths.has(path),
        baseUrl: 'https://docs.example.com',
        files,
        locale: 'zh-CN',
        publishedRoutes,
      }),
    ).resolves.toBeUndefined();
  });
});

function getMarkdownTargets(markdown: string) {
  return Array.from(markdown.matchAll(/\]\(([^)]+)\)/g), (match) => match[1]);
}
