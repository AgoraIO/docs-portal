import { describe, expect, it } from 'vitest';
import { createKbDocument, type KbCorpus } from './corpus';
import { previewKbCorpus } from './preview';

function corpus(content: string): KbCorpus {
  const url = '/zh-CN/ai/demo/web';
  return {
    schema: 1,
    scope: 'sample',
    revision: 'r1',
    complete: true,
    documents: [
      createKbDocument({
        content,
        metadata: {
          url,
          canonicalUrl: '/zh-CN/ai/demo',
          title: 'Demo',
          locale: 'zh-CN',
          products: ['rtc'],
          platforms: ['web'],
          docType: 'docs',
          sections: [
            {
              title: 'Install',
              url: `${url}#install`,
              headingPath: ['Demo', 'Install'],
            },
          ],
        },
      }),
    ],
  };
}

describe('offline KB chunk preview', () => {
  it('covers the exact input without dropping whitespace and inherits platform metadata', () => {
    const c = corpus(
      '# Demo\n\n## Install [#install]\n\nInstall now.\n\nMore text.\n',
    );
    const p = previewKbCorpus(c, 40);
    expect(p.chunks.map((x) => x.content).join('')).toBe(
      c.documents[0].content,
    );
    expect(p.chunks.every((x) => x.metadata.platforms.join() === 'web')).toBe(
      true,
    );
    expect(
      p.chunks.find((x) => x.content.includes('Install now'))?.citationUrl,
    ).toBe('/zh-CN/ai/demo/web#install');
    expect(
      p.chunks.every(
        (x) => c.documents[0].content.slice(x.start, x.end) === x.content,
      ),
    ).toBe(true);
  });
  it('preserves oversized fenced code, lists, tables and JSX components as complete blocks', () => {
    const blocks = [
      '```ts\n' + '  initialize();\n'.repeat(20) + '```',
      '- item\n  continuation\n'.repeat(15),
      '| a | b |\n|---|---|\n' + '| long | value |\n'.repeat(20),
      '<CalloutContainer>\n\n## Nested\n\n' +
        'body\n\n'.repeat(20) +
        '</CalloutContainer>',
    ];
    for (const block of blocks) {
      const p = previewKbCorpus(corpus(`# Demo\n\n${block}\n`), 80);
      expect(p.chunks.some((x) => x.content.includes(block))).toBe(true);
      expect(p.issues.some((x) => x.code === 'oversized-block')).toBe(true);
    }
  });
  it('never invents slugs and does not reuse a previous heading anchor', () => {
    const p = previewKbCorpus(
      corpus(
        '# Demo\n\n## Install [#install]\n\nFirst.\n\n## Unknown [#made-up]\n\nSecond.\n',
      ),
      100,
    );
    const last = p.chunks.find((x) => x.content.includes('Second.'));
    expect(last?.citationUrl).toBe('/zh-CN/ai/demo/web');
    expect(p.issues.some((x) => x.code === 'unmapped-heading')).toBe(true);
  });
  it('has deterministic IDs across revisions and rejects a tampered corpus', () => {
    const c = corpus('# Demo\n\nBody.');
    expect(previewKbCorpus(c).chunks.map((x) => x.id)).toEqual(
      previewKbCorpus({ ...c, revision: 'r2' }).chunks.map((x) => x.id),
    );
    c.documents[0].content += 'tampered';
    expect(() => previewKbCorpus(c)).toThrow();
  });
  it('reports malformed MDX and keeps it intact instead of guessing boundaries', () => {
    const c = corpus('# Demo\n\n<Callout>\n\nunclosed');
    const p = previewKbCorpus(c);
    expect(p.issues.some((x) => x.code === 'parse-error')).toBe(true);
    expect(p.chunks[0].content).toBe(c.documents[0].content);
    expect(p.ready).toBe(false);
  });
});
