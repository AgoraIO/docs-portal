import { describe, expect, it } from 'vitest';
import { createKbDocument, type KbMetadata } from './corpus';

const metadata: KbMetadata = {
  url: '/zh-CN/realtime-media/rtc/demo/web',
  canonicalUrl: '/zh-CN/realtime-media/rtc/demo',
  title: 'Demo',
  locale: 'zh-CN',
  products: ['rtc', 'rtm'],
  platforms: ['web'],
  defaultPlatform: 'web',
  docType: 'docs',
  sections: [],
};
describe('KB document contract', () => {
  it('normalizes BOM and line endings without destroying code indentation', () => {
    const a = createKbDocument({
      metadata,
      content: '\uFEFF# Demo\r\n```ts\r\n  foo();\r\n```\r\n',
    });
    const b = createKbDocument({
      metadata,
      content: '# Demo\n```ts\n  foo();\n```\n',
    });
    expect(a.hash).toBe(b.hash);
    expect(a.content).toBe('# Demo\n```ts\n  foo();\n```\n');
    expect(a.sourceId).toBe('/zh-CN/realtime-media/rtc/demo/web');
  });
  it('normalizes set order and duplicate tags', () => {
    const a = createKbDocument({ metadata, content: 'demo' });
    expect(
      createKbDocument({
        metadata: { ...metadata, products: ['rtm', 'rtc', 'rtc'] },
        content: 'demo',
      }).hash,
    ).toBe(a.hash);
    expect(metadata.products).toEqual(['rtc', 'rtm']);
  });
  it('separates platform identities and hashes', () => {
    const a = createKbDocument({ metadata, content: 'demo' });
    const b = createKbDocument({
      metadata: {
        ...metadata,
        url: metadata.url.replace('/web', '/ios'),
        platforms: ['ios'],
      },
      content: 'demo',
    });
    expect(a.sourceId).not.toBe(b.sourceId);
    expect(a.hash).not.toBe(b.hash);
  });
  it('detects meaningful metadata and code whitespace changes', () => {
    const a = createKbDocument({ metadata, content: '  foo();' });
    expect(
      createKbDocument({
        metadata: { ...metadata, title: 'New' },
        content: '  foo();',
      }).hash,
    ).not.toBe(a.hash);
    expect(createKbDocument({ metadata, content: 'foo();' }).hash).not.toBe(
      a.hash,
    );
  });
  it('canonicalizes section order and object property order', () => {
    const sections = [
      { url: metadata.url + '#b', title: 'B', headingPath: ['Demo', 'B'] },
      { url: metadata.url + '#a', title: 'A', headingPath: ['Demo', 'A'] },
    ];
    const a = createKbDocument({
      metadata: { ...metadata, sections },
      content: 'demo',
    });
    const b = createKbDocument({
      metadata: { ...metadata, sections: [...sections].reverse() },
      content: 'demo',
    });
    expect(a.hash).toBe(b.hash);
    expect(a.metadata.sections.map((x) => x.title)).toEqual(['A', 'B']);
  });
  it.each([
    '',
    '   ',
    '/en/ai/demo',
    '/zh-CN/search',
    '/zh-CN/realtime-media/../demo',
    '/zh-CN/realtime-media/%2e%2e/demo',
    '/zh-CN/realtime-media/demo?x=1',
    '/zh-CN/realtime-media/demo#x',
    'https://evil.test/zh-CN/ai/demo',
    '/zh-CN/ai/demo/',
  ])('rejects noncanonical source path %s', (url) => {
    expect(() =>
      createKbDocument({ metadata: { ...metadata, url }, content: 'demo' }),
    ).toThrow();
  });
  it.each([
    { content: ' ' },
    { metadata: { ...metadata, title: '' } },
    { metadata: { ...metadata, locale: 'en' } },
    { metadata: { ...metadata, products: [''] } },
    { metadata: { ...metadata, docType: 'other' } },
    {
      metadata: {
        ...metadata,
        sections: [
          { title: 'x', url: '/zh-CN/ai/other#x', headingPath: ['x'] },
        ],
      },
    },
  ])('rejects invalid runtime input %#', (change) => {
    expect(() =>
      createKbDocument({
        ...{ metadata, content: 'demo' },
        ...change,
      } as Parameters<typeof createKbDocument>[0]),
    ).toThrow();
  });
});
