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
    expect(result?.header.title).toBe(
      'Test API (mock documentation) · v2 — Test new version',
    );
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
        { 'test-api': 'v2', other: 'b' },
        scopes,
      ),
    ).toEqual({ 'test-api': 'v1', other: 'b' });
    expect(
      getDocVersionSelections(
        root,
        { 'test-api': 'v2', other: 'removed' },
        scopes,
      ),
    ).toEqual({ 'test-api': 'v2', other: 'a' });
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
    expect(markdown).toContain(
      'Documentation version: v2 — Test new version (v2)',
    );
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
});
