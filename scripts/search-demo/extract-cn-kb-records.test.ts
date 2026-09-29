import { describe, expect, it } from 'vitest';
import { cnKbManifest } from './cn-kb-manifest';
import {
  extractCnKbRecords,
  mergeGenericChildSection,
  readCnKbSourceDocuments,
  type SourceDocument,
} from './extract-cn-kb-records';

const manifest = [cnKbManifest[2]] as const;

const source: SourceDocument = {
  route: manifest[0].route,
  title: 'Conversational AI API',
  content: 'API reference content',
  hidden: false,
  headings: [
    {
      title: 'removeHandler',
      anchor: 'removehandler',
      content: '移除事件处理器。',
    },
    {
      title: 'Parameters',
      anchor: 'parameters',
      content: '参数说明。',
    },
  ],
};

describe('extractCnKbRecords', () => {
  it('creates an anchored record for each meaningful heading', () => {
    const records = extractCnKbRecords({ manifest, source: [source] });
    const removeHandler = records.find(
      (record) => record.sectionTitle === 'removeHandler',
    );

    expect(records).toHaveLength(2);
    expect(removeHandler).toMatchObject({
      sectionTitle: 'removeHandler',
      url: `${source.route}#removehandler`,
      headingPath: ['Conversational AI API', 'removeHandler'],
      content: '移除事件处理器。',
    });
  });

  it('merges a generic child section into its meaningful parent', () => {
    const records = extractCnKbRecords({ manifest, source: [source] });
    const removeHandler = records.find(
      (record) => record.sectionTitle === 'removeHandler',
    );
    const parameters = records.find(
      (record) => record.sectionTitle === 'Parameters',
    );
    expect(removeHandler).toBeDefined();
    expect(parameters).toBeDefined();
    if (!removeHandler || !parameters)
      throw new Error('fixture sections missing');
    const merged = mergeGenericChildSection(removeHandler, parameters);

    expect(merged.sectionTitle).toBe('removeHandler');
    expect(merged.content).toContain('移除事件处理器。');
    expect(merged.content).toContain('参数说明。');
    expect(merged.url).toBe(`${source.route}#removehandler`);
  });

  it('omits hidden source documents', () => {
    const records = extractCnKbRecords({
      manifest,
      source: [{ ...source, hidden: true }],
    });

    expect(records).toEqual([]);
  });

  it('deduplicates md and mdx variants by canonical route', () => {
    const mdVariant = { ...source, route: `${source.route}.md` };
    const mdxVariant = { ...source, route: `${source.route}.mdx` };

    const records = extractCnKbRecords({
      manifest,
      source: [mdVariant, mdxVariant],
    });

    expect(records).toHaveLength(2);
    expect(new Set(records.map((record) => record.id)).size).toBe(2);
    expect(new Set(records.map((record) => record.url))).toEqual(
      new Set([`${source.route}#removehandler`, `${source.route}#parameters`]),
    );
  });

  it('ignores source documents outside the manifest', () => {
    const records = extractCnKbRecords({
      manifest,
      source: [{ ...source, route: '/zh-CN/not-in-demo' }],
    });

    expect(records).toEqual([]);
  });

  it('keeps a page-level record when a document has no headings', () => {
    const records = extractCnKbRecords({
      manifest,
      source: [{ ...source, headings: [], content: 'FAQ 正文。' }],
    });

    expect(records).toMatchObject([
      expect.objectContaining({
        sectionTitle: source.title,
        content: 'FAQ 正文。',
        url: source.route,
        headingPath: [source.title],
      }),
    ]);
  });

  it('rejects oversized sections instead of silently passing them to the KB', () => {
    expect(() =>
      extractCnKbRecords({
        manifest,
        source: [{ ...source, headings: [], content: '长'.repeat(30001) }],
      }),
    ).toThrow(/section exceeds 30000 characters.*page/);
  });

  it('reads the five selected CN MDX sources and preserves an API anchor', async () => {
    const documents = await readCnKbSourceDocuments(cnKbManifest);
    const records = extractCnKbRecords({
      manifest: cnKbManifest,
      source: documents,
    });

    expect(new Set(documents.map((document) => document.route)).size).toBe(25);
    expect(records.length).toBeGreaterThan(0);
    expect(
      Math.max(...records.map((record) => record.content.length)),
    ).toBeLessThan(30000);
    expect(new Set(records.map((record) => record.id)).size).toBe(
      records.length,
    );
    expect(records).toContainEqual(
      expect.objectContaining({
        sectionTitle: 'manualSOS',
        url: '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi#manualsos',
      }),
    );
    expect(
      records.some(
        (record) =>
          record.sectionTitle === '参数' &&
          record.url.includes('conversationalaiapi'),
      ),
    ).toBe(false);
    const webManualSos = records.find(
      (record) =>
        record.url ===
        '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi#manualsos',
    );
    expect(webManualSos?.content).toContain('参数');
    expect(webManualSos?.platform).toEqual(['web']);
    expect(
      records.find((record) => record.url.includes('/rtc/android/4.6.0/'))
        ?.version,
    ).toBe('4.6.0');
  });

  it('does not index headings inside code fences or frontmatter as sections', async () => {
    const entry = { ...manifest[0], sourcePath: 'fixture.mdx' };
    const documents = await readCnKbSourceDocuments(
      [entry],
      async () =>
        '---\ntitle: "Example"\n---\nIntro before headings.\n## Method\nBody.\n```md\n## Fake method\n```\n<a id="real-anchor"></a>\n## Another method\nDetails.',
    );
    const records = extractCnKbRecords({
      manifest: [entry],
      source: documents,
    });

    expect(records.map((record) => record.sectionTitle).sort()).toEqual(
      ['Another method', 'Method'].sort(),
    );
    expect(
      records.find((record) => record.sectionTitle === 'Another method')?.url,
    ).toBe(`${entry.route}#real-anchor`);
    expect(
      records.find((record) => record.sectionTitle === 'Method')?.content,
    ).toContain('Intro before headings.');
    expect(
      records.find((record) => record.sectionTitle === 'Method')?.content,
    ).not.toContain('<a id="real-anchor"');
  });

  it('omits draft MDX and disambiguates repeated heading anchors', async () => {
    const entry = { ...manifest[0], sourcePath: 'fixture.mdx' };
    const draft = await readCnKbSourceDocuments(
      [entry],
      async () => '---\ntitle: Draft\ndraft: true\n---\n## Method\nSecret.',
    );
    expect(extractCnKbRecords({ manifest: [entry], source: draft })).toEqual(
      [],
    );

    const published = await readCnKbSourceDocuments(
      [entry],
      async () =>
        '---\ntitle: Published\n---\n## Method\nFirst.\n## Method\nSecond.',
    );
    expect(
      extractCnKbRecords({ manifest: [entry], source: published }).map(
        (record) => record.url,
      ),
    ).toEqual([`${entry.route}#method`, `${entry.route}#method-1`]);
  });

  it('merges generic subsections into their nearest method and preserves hierarchy', () => {
    const records = extractCnKbRecords({
      manifest,
      source: [
        {
          ...source,
          headings: [
            { title: 'API', anchor: 'api', content: '概述。', level: 2 },
            {
              title: 'manualSOS',
              anchor: 'manualsos',
              content: '方法说明。',
              level: 3,
            },
            {
              title: '参数',
              anchor: 'params',
              content: '参数说明。',
              level: 4,
            },
            {
              title: '返回值',
              anchor: 'return',
              content: '返回说明。',
              level: 4,
            },
            {
              title: 'manualEOS',
              anchor: 'manualeos',
              content: '结束说明。',
              level: 3,
            },
          ],
        },
      ],
    });

    expect(records.map((record) => record.sectionTitle)).toEqual([
      'API',
      'manualEOS',
      'manualSOS',
    ]);
    expect(
      records.find((record) => record.sectionTitle === 'manualSOS'),
    ).toMatchObject({
      headingPath: ['Conversational AI API', 'API', 'manualSOS'],
      url: `${source.route}#manualsos`,
    });
    expect(
      records.find((record) => record.sectionTitle === 'manualSOS')?.content,
    ).toContain('参数说明。');
    expect(
      records.find((record) => record.sectionTitle === 'manualSOS')?.content,
    ).toContain('返回说明。');
    expect(
      records.find((record) => record.sectionTitle === 'manualEOS')?.content,
    ).not.toContain('参数说明。');
  });

  it('separates structured platform chapters and links to their platform routes', async () => {
    const entry = { ...manifest[0], sourcePath: 'fixture.mdx' };
    const documents = await readCnKbSourceDocuments(
      [entry],
      async () => `---
title: 跨平台教程
---
<PlatformStructured platform="android">
## 前提条件
Android Studio。
## 加入频道
Android joinChannel 示例。
</PlatformStructured>
<PlatformStructured platform="web">
## 前提条件
浏览器。
## 加入频道
Web joinChannel 示例。
</PlatformStructured>`,
    );
    const records = extractCnKbRecords({
      manifest: [entry],
      source: documents,
    });

    expect(records).toHaveLength(4);
    expect(
      records.filter((record) => record.sectionTitle === '加入频道'),
    ).toEqual([
      expect.objectContaining({
        url: `${entry.route}/android#加入频道`,
        platform: ['android'],
        content: expect.stringContaining('Android joinChannel'),
      }),
      expect.objectContaining({
        url: `${entry.route}/web#加入频道`,
        platform: ['web'],
        content: expect.stringContaining('Web joinChannel'),
      }),
    ]);
    expect(
      records.find((record) => record.platform?.[0] === 'android')?.content,
    ).not.toContain('Web joinChannel');
    expect(new Set(records.map((record) => record.id)).size).toBe(4);
  });

  it('splits headings inside MDX tabs instead of swallowing the entire tab into the preceding section', async () => {
    const entry = { ...manifest[0], sourcePath: 'fixture.mdx' };
    const documents = await readCnKbSourceDocuments(
      [entry],
      async () => `---
title: Windows 教程
---
<PlatformStructured platform="windows">
## 前提条件
准备环境。
<Tabs>
<TabsContent value="cpp">
## 创建项目
C++ 操作步骤。
## 集成 SDK
C++ SDK。
</TabsContent>
</Tabs>
</PlatformStructured>
<PlatformStructured platform="web">
## 前提条件
浏览器。
</PlatformStructured>`,
    );
    const records = extractCnKbRecords({
      manifest: [entry],
      source: documents,
    });

    expect(
      records.find(
        (record) => record.url === `${entry.route}/windows#创建项目`,
      ),
    ).toMatchObject({
      sectionTitle: '创建项目',
      content: expect.stringContaining('C++ 操作步骤'),
    });
    expect(
      records.find((record) => record.url === `${entry.route}/windows#前提条件`)
        ?.content,
    ).not.toContain('C++ SDK');
    expect(
      records.find((record) => record.url === `${entry.route}/web#前提条件`)
        ?.content,
    ).not.toContain('C++');
  });
});
