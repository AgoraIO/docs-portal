import { describe, expect, it } from 'vitest';
import {
  extractCnKbRecords,
  mergeGenericChildSection,
  readCnKbSourceDocuments,
  type SourceDocument,
} from './extract-cn-kb-records';
import { cnKbManifest } from './cn-kb-manifest';

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
    const merged = mergeGenericChildSection(removeHandler!, parameters!);

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
      new Set([
        `${source.route}#removehandler`,
        `${source.route}#parameters`,
      ]),
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

  it('reads the five selected CN MDX sources and preserves an API anchor', async () => {
    const documents = await readCnKbSourceDocuments(cnKbManifest);
    const records = extractCnKbRecords({ manifest: cnKbManifest, source: documents });

    expect(documents).toHaveLength(5);
    expect(records.length).toBeGreaterThan(0);
    expect(records).toContainEqual(
      expect.objectContaining({
        sectionTitle: 'manualSOS',
        url: '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi#manualsos',
      }),
    );
  });
});
