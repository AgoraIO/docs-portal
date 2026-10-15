import { describe, expect, it } from 'vitest';
import type { PublishedDocsRoute } from '../published-docs-routes';
import type { SearchSection } from '../search/kb-record';
import { buildKbCorpus } from './corpus.server';

const canonical = '/zh-CN/realtime-media/rtc/demo';
const url = `${canonical}/web`;
const route: PublishedDocsRoute = {
  canonicalPath: canonical,
  url,
  markdownPath: `${url}.md`,
  platform: 'web',
  defaultPlatform: 'web',
};
const section: SearchSection = {
  id: `${url}::heading:example`,
  url: `${url}#example`,
  canonicalUrl: canonical,
  pageTitle: 'Demo',
  sectionTitle: 'Example',
  headingPath: ['Demo', 'Example'],
  content: 'flattened',
  locale: 'zh-CN',
  platform: ['web'],
  defaultPlatform: 'web',
  isDefaultPlatform: true,
  product: 'rtc',
  docType: 'docs',
  audience: ['developer'],
  status: 'published',
  hidden: false,
};
const markdown = '# Demo\n\n## Example\n```ts\n  foo()\n```\n';
const input = {
  routes: [route],
  sections: [section],
  scope: 'cn-demo',
  revision: 'r1',
  readMarkdown: async () => markdown,
};
describe('KB published corpus', () => {
  it('keeps original Markdown and aggregates sections into one document', async () => {
    const corpus = await buildKbCorpus({
      ...input,
      sections: [
        section,
        {
          ...section,
          id: url,
          url,
          sectionTitle: 'Demo',
          headingPath: ['Demo'],
        },
      ],
    });
    expect(corpus.complete).toBe(true);
    expect(corpus.documents).toHaveLength(1);
    expect(corpus.documents[0].content).toBe(markdown);
    expect(corpus.documents[0].metadata.sections.map((s) => s.url)).toEqual([
      url,
      `${url}#example`,
    ]);
  });
  it('keeps both default and nondefault platform variants', async () => {
    const ios = `${canonical}/ios`;
    const corpus = await buildKbCorpus({
      ...input,
      routes: [
        route,
        { ...route, url: ios, markdownPath: `${ios}.md`, platform: 'ios' },
      ],
      sections: [
        section,
        {
          ...section,
          id: ios,
          url: ios,
          platform: ['ios'],
          isDefaultPlatform: false,
        },
      ],
    });
    expect(corpus.documents.map((d) => d.sourceId)).toEqual([ios, url]);
    expect(corpus.documents[0].metadata.platforms).toEqual(['ios']);
  });
  it.each(['docs', 'openapi'] as const)(
    'exports nonvariant %s pages',
    async (docType) => {
      const corpus = await buildKbCorpus({
        ...input,
        routes: [
          {
            canonicalPath: canonical,
            url: canonical,
            markdownPath: `${canonical}.md`,
          },
        ],
        sections: [
          {
            ...section,
            url: canonical,
            id: canonical,
            platform: undefined,
            defaultPlatform: undefined,
            docType,
          },
        ],
      });
      expect(corpus.documents[0].metadata.docType).toBe(docType);
    },
  );
  it('ignores hidden/internal sections even if caller supplies them', async () => {
    await expect(
      buildKbCorpus({ ...input, sections: [{ ...section, hidden: true }] }),
    ).rejects.toThrow();
    await expect(
      buildKbCorpus({
        ...input,
        sections: [{ ...section, status: 'internal' }],
      }),
    ).rejects.toThrow();
  });
  it('validates sample identities and preserves explicit selection', async () => {
    const result = await buildKbCorpus({ ...input, selectedSourceIds: [url] });
    expect(result.selection).toEqual([url]);
    await expect(
      buildKbCorpus({ ...input, selectedSourceIds: [] }),
    ).rejects.toThrow(/select/i);
    await expect(
      buildKbCorpus({ ...input, selectedSourceIds: ['/zh-CN/ai/missing'] }),
    ).rejects.toThrow(/select/i);
  });
  it('rejects duplicate routes, unknown routes and inconsistent page metadata', async () => {
    await expect(
      buildKbCorpus({ ...input, routes: [route, route] }),
    ).rejects.toThrow(/duplicate/i);
    await expect(buildKbCorpus({ ...input, routes: [] })).rejects.toThrow(
      /route/i,
    );
    await expect(
      buildKbCorpus({
        ...input,
        sections: [
          section,
          { ...section, url, id: url, pageTitle: 'Conflict' },
        ],
      }),
    ).rejects.toThrow(/metadata/i);
  });
  it('does not silently skip unreadable Markdown or empty bodies', async () => {
    await expect(
      buildKbCorpus({
        ...input,
        readMarkdown: async () => {
          throw new Error('missing Markdown');
        },
      }),
    ).rejects.toThrow(/missing/);
    await expect(
      buildKbCorpus({ ...input, readMarkdown: async () => '' }),
    ).rejects.toThrow(/content/i);
  });
});
