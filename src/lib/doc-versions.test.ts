import { describe, expect, it } from 'vitest';
import {
  DOC_VERSION_SCOPES,
  type DocVersionScope,
  getDocVersionSelections,
  getDocVersionTarget,
  resolveDocVersion,
  validateDocVersionScopes,
  withDocVersionMetadata,
} from './doc-versions';
import { resolveDocsNavScope } from './docs-nav-scope';
import { createMachineReadableDocsIndexes } from './llms-index';

const root = '/en/api-reference/versioning-demo';

describe('documentation releases', () => {
  it('maps ordinary guides by topic key and rejects incompatible groups sharing a preference key', () => {
    expect(
      getDocVersionTarget(
        '/en/introduction/versioning-demo/new/configure',
        'v1',
      ),
    ).toEqual({
      href: '/en/introduction/versioning-demo/previous/setup',
      fallback: false,
    });
    expect(() =>
      validateDocVersionScopes([
        DOC_VERSION_SCOPES[0],
        { ...DOC_VERSION_SCOPES[1], defaultVersion: 'v1' },
      ]),
    ).toThrow(
      'Inconsistent documentation releases for preference key: convoai-v3',
    );
    expect(
      resolveDocVersion('/en/introduction/versioning-demo/new/configure')?.scope
        .preferenceKey,
    ).toBe('convoai-v3');
  });
  it('defaults to preview without changing the explicit previous release', () => {
    expect(getDocVersionSelections(root)['test-api']).toBe('v2');
    expect(
      getDocVersionSelections(root, { 'convoai-v3': 'v1' })['test-api'],
    ).toBe('v1');
    expect(DOC_VERSION_SCOPES[0].previousVersion).toBe('v1');
    expect(() =>
      validateDocVersionScopes([
        { ...DOC_VERSION_SCOPES[0], previousVersion: 'removed' },
      ]),
    ).toThrow('Missing previous documentation release: test-api/removed');
  });
  it('rejects an unpublished default before the site can publish invalid entry links', () => {
    expect(() =>
      validateDocVersionScopes([
        { ...DOC_VERSION_SCOPES[0], defaultVersion: 'unpublished' },
      ]),
    ).toThrow('Missing default documentation release: test-api/unpublished');
  });
  it('owns a version sidebar without relying on product-specific metadata', () => {
    const result = resolveDocsNavScope({
      activePath: `${root}/v2/list-widgets`,
      tab: 'api-reference',
      getNodeMeta: () => undefined,
      root: {
        name: 'Docs',
        children: [
          {
            type: 'folder',
            name: 'Reference',
            children: [
              { type: 'page', name: 'Reference', url: '/en/api-reference' },
              {
                type: 'folder',
                name: 'New version',
                children: [
                  { type: 'page', name: 'Overview', url: `${root}/v2` },
                  {
                    type: 'page',
                    name: 'Widgets',
                    url: `${root}/v2/list-widgets`,
                  },
                ],
              },
            ],
          },
        ],
      },
    });
    expect(result?.header.title).toBe('Test API');
    expect(result?.header.backHref).toBe('/en/api-reference');
    expect(result?.sidebarRoot.children).toHaveLength(2);
  });
  it('pins explicit links while remembering each independent family at its entry', () => {
    const other: DocVersionScope = {
      id: 'other',
      label: 'Other API',
      entryUrl: '/en/other',
      defaultVersion: 'a',
      versions: [
        {
          id: 'a',
          label: 'A',
          rootUrl: '/en/other/a',
          pages: { overview: '' },
        },
        {
          id: 'b',
          label: 'B',
          rootUrl: '/en/other/b',
          pages: { overview: '' },
        },
      ],
    };
    const scopes = [...DOC_VERSION_SCOPES, other];
    expect(
      getDocVersionSelections(
        `${root}/v1/authentication`,
        { 'convoai-v3': 'v2', other: 'b' },
        scopes,
      ),
    ).toEqual({ 'test-api': 'v1', 'test-guides': 'v2', other: 'b' });
    expect(
      getDocVersionSelections(
        root,
        { 'convoai-v3': 'v2', other: 'removed' },
        scopes,
      ),
    ).toEqual({ 'test-api': 'v2', 'test-guides': 'v2', other: 'a' });
    expect(resolveDocVersion(`${root}/v20/widgets`)).toBeUndefined();
  });

  it('switches the same topic across renamed pages and explains missing topics', () => {
    expect(
      getDocVersionTarget(`${root}/v1/widgets?unrelated=1#stale`, 'v2'),
    ).toEqual({ href: `${root}/v2/list-widgets`, fallback: false });
    expect(getDocVersionTarget(`${root}/v1/legacy-notes`, 'v2')).toEqual({
      href: `${root}/v2?versionFallback=1`,
      fallback: true,
    });
    expect(getDocVersionTarget(`${root}/v2`, 'unpublished')).toBeUndefined();
    expect(getDocVersionTarget('/en/introduction', 'v2')).toBeUndefined();
  });

  it('maps an old single-page anchor to its new standalone page', () => {
    const scope: DocVersionScope = {
      id: 'anchors',
      label: 'Anchors',
      entryUrl: '/en/anchors',
      defaultVersion: 'old',
      versions: [
        {
          id: 'old',
          label: 'Old',
          rootUrl: '/en/anchors/old',
          pages: { overview: '', auth: '#authentication' },
        },
        {
          id: 'new',
          label: 'New',
          rootUrl: '/en/anchors/new',
          pages: { overview: '', auth: 'authenticate' },
        },
      ],
    };
    expect(
      getDocVersionTarget('/en/anchors/old#authentication', 'new', [scope])
        ?.href,
    ).toBe('/en/anchors/new/authenticate');
  });

  it('gives Markdown and discovery indexes a fixed version identity', () => {
    const url = `${root}/v2/list-widgets`;
    const markdown = withDocVersionMetadata(
      '# List widgets\n\nMock payload.',
      url,
    );
    expect(markdown).toContain('Documentation version: New docs (v2)');
    expect(markdown).toContain('/llms/doc-versions-test-api-v2.txt');
    expect(withDocVersionMetadata('# Ordinary docs', '/en/introduction')).toBe(
      '# Ordinary docs',
    );
    const urls = [`${root}/v1/widgets`, url];
    const files = createMachineReadableDocsIndexes({
      baseUrl: 'https://docs.example',
      locale: 'en',
      docsIndex: '',
      publishedRoutes: urls.map((value) => ({
        url: value,
        canonicalPath: value,
        markdownPath: `${value}.md`,
      })),
    });
    const newIndex = files.find(
      (file) => file.path === '/llms/doc-versions-test-api-v2.txt',
    );
    expect(newIndex?.content).toContain(`${url}.md`);
    expect(newIndex?.content).not.toContain('/v1/');
    expect(newIndex?.content).toContain('doc-versions-test-api-v2-full.txt');
  });

  it('keeps the advertised release index stable when a large API needs shards', () => {
    const files = createMachineReadableDocsIndexes({
      baseUrl: 'https://docs.example',
      docsIndex: '',
      locale: 'en',
      maxCharacters: 1000,
      publishedRoutes: Array.from({ length: 12 }, (_, index) => {
        const url = `${root}/v2/long-reference-topic-${index}`;
        return { url, canonicalPath: url, markdownPath: `${url}.md` };
      }),
    });
    const stable = files.find(
      (file) => file.path === '/llms/doc-versions-test-api-v2.txt',
    );
    expect(stable?.content).toContain('/llms/doc-versions-test-api-v2-1.txt');
    expect(
      files.filter((file) => /v2-\d+\.txt$/.test(file.path)).length,
    ).toBeGreaterThan(1);
    expect(files.every((file) => file.content.length <= 1000)).toBe(true);
  });
});
