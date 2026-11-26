import { describe, expect, it } from 'vitest';
import {
  extractDocument,
  extractOpenApiDocument,
  resolveOccurrence,
  sourceRoute,
} from './lib/cn-link-audit/inventory.mjs';

describe('CN link source inventory', () => {
  it('extracts actual links with source locations and ignores code and comments', () => {
    const result = extractDocument(
      `---\ntitle: Example\n---\n[go][ref]\n\n[ref]: ./target.mdx#中文\n\n![image](/img/a.png)\n\n<Card href={'/zh-CN/ai/start'} />\n\n<OverviewActions actions={[{ href: '/zh-CN/ai/next' }]} />\n\n\`[fake](/missing)\`\n\n\`\`\`md\n[also fake](/missing2)\n\`\`\`\n\n{/* <a href="/comment" /> */}\n`,
      { sourcePath: 'content/docs/zh-CN/ai/index.mdx' },
    );
    expect(result.links.map((x) => x.href)).toEqual([
      './target.mdx#中文',
      '/img/a.png',
      '/zh-CN/ai/start',
      '/zh-CN/ai/next',
    ]);
    expect(result.links[0].line).toBe(4);
    expect(result.links[1].kind).toBe('resource');
    expect(result.gaps).toEqual([]);
  });

  it('records unsupported dynamic href rather than silently skipping it', () => {
    const result = extractDocument('<Card href={getUrl()} />', {
      sourcePath: 'content/docs/zh-CN/ai/a.mdx',
    });
    expect(result.gaps).toEqual([
      expect.objectContaining({ reason: 'dynamic-link-expression', line: 1 }),
    ]);
  });

  it('tracks platform and accordion context and extracts JSX images', () => {
    const result = extractDocument(
      '<PlatformStructured platform="ios">\n\n<Accordion id="release-1"><DocsImage src="https://cdn.example/a.png" /></Accordion>\n\n</PlatformStructured>',
      { sourcePath: 'content/docs/zh-CN/ai/a.mdx' },
    );
    expect(result.links[0]).toMatchObject({
      platform: 'ios',
      state: 'release-1',
      kind: 'resource',
      href: 'https://cdn.example/a.png',
    });
    expect(result.anchors).toContain('release-1');
  });

  it('handles HTML and GFM autolinks in Markdown and flags malformed MDX', () => {
    const result = extractDocument(
      '<img src="/one.png"><a href="/two">Hi</a>\n\nhttps://example.com',
      { sourcePath: 'content/docs/zh-CN/ai/a.md' },
    );
    expect(result.links.map((x) => x.href)).toEqual([
      '/one.png',
      '/two',
      'https://example.com',
    ]);
    expect(
      extractDocument('<Card href={', {
        sourcePath: 'content/docs/zh-CN/ai/a.mdx',
      }).gaps[0].reason,
    ).toBe('parse-error');
  });

  it('uses application route normalization for groups and relative Markdown links', () => {
    expect(
      sourceRoute('content/docs/zh-CN/api-reference/rtc/(current)/index.mdx'),
    ).toBe('/api-reference/rtc');
    const resolved = resolveOccurrence({
      href: '../next.mdx?q=1#中文',
      sourcePath: 'content/docs/zh-CN/ai/group/a.mdx',
      pageUrl: '/ai/group/a',
      kind: 'link',
    });
    expect(resolved.target).toBe('/ai/next?q=1#%E4%B8%AD%E6%96%87');
    expect(
      resolveOccurrence({
        href: 'https://other.example/zh-CN/a',
        pageUrl: '/ai',
        sourcePath: '',
        kind: 'link',
      }).target,
    ).toBe('https://other.example/zh-CN/a');
  });
});

describe('source inventory coverage regressions', () => {
  it('records dynamic render data even after comments and supports Link to', () => {
    for (const input of [
      '{/* comment */ globalThis.items.map(x => <a href={x.url}>go</a>)}',
      '<OverviewActions actions={globalThis.items} />',
      '<div style={{backgroundImage: globalThis.image}} />',
    ]) {
      expect(
        extractDocument(input, { sourcePath: 'content/docs/zh-CN/ai/a.mdx' })
          .gaps.length,
      ).toBeGreaterThan(0);
    }
    expect(
      extractDocument('<Link to="/missing">go</Link>', {
        sourcePath: 'content/docs/zh-CN/ai/a.mdx',
      }).links[0].href,
    ).toBe('/missing');
  });
  it('keeps commas inside srcset URLs', () => {
    const result = extractDocument(
      '<img srcSet="data:image/png;base64,AAAA 1x, https://cdn.example/a,b.png 2x" />',
      { sourcePath: 'content/docs/zh-CN/ai/a.mdx' },
    );
    expect(result.links.map((x) => x.href)).toEqual([
      'data:image/png;base64,AAAA',
      'https://cdn.example/a,b.png',
    ]);
  });
  it('resolves OpenAPI operation descriptions and extension Markdown in their endpoint context', () => {
    const raw = `paths:
  /things:
    get:
      operationId: getThings
      description: '[next](next)'
      x-docs-callouts:
        - markdown: '[start](start)'
`;
    const lane = {
      parentUrl: { 'zh-CN': '/zh-CN/api-reference/group' },
      routePrefix: 'api-reference/group',
      operations: { getThings: { routeLeaf: 'get' } },
    };
    const result = extractOpenApiDocument(raw, {
      sourcePath: 'content/openapi/test.yaml',
      lane,
    });
    expect(result.links.map((x) => resolveOccurrence(x).target)).toEqual([
      '/api-reference/group/next',
      '/api-reference/group/start',
    ]);
    expect(result.links[0]).toMatchObject({
      pageUrl: '/api-reference/group/get',
      line: 5,
    });
  });
});

it('locates individual HTML attributes within a multiline Markdown block', () => {
  const result = extractDocument(
    '<div>\n<a href="/one">One</a>\n<img src="/two.png">\n</div>',
    { sourcePath: 'content/docs/zh-CN/ai/a.md' },
  );
  expect(result.links.map((link) => link.line)).toEqual([2, 3]);
});
