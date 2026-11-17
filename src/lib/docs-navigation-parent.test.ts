import type { Folder, Root } from 'fumadocs-core/page-tree';
import { describe, expect, it } from 'vitest';
import type { DocsMeta } from './docs-meta-schema';
import { resolveNavigationParent } from './docs-navigation-parent';

const folder: Folder = {
  type: 'folder',
  name: 'SDK',
  children: [
    { type: 'page', name: 'Types', url: '/en/sdk/types' },
    { type: 'page', name: 'Guide', url: '/en/sdk/guide' },
  ],
};
const root: Root = { name: 'Docs', children: [folder] };
const metadata: DocsMeta = {
  navigationParents: {
    '/en/sdk/types': ['/en/sdk/enum-state', '/en/sdk/guide'],
  },
};

describe('explicit navigation ownership', () => {
  it('resolves an omitted detail without relying on locale, API routes or history', () => {
    expect(
      resolveNavigationParent(
        root,
        '/en/sdk/enum-state?apiTrail=ignored#value',
        () => metadata,
      ),
    ).toEqual({ title: 'Types', url: '/en/sdk/types' });
  });
  it('leaves visible pages and undeclared documents unchanged', () => {
    for (const path of [
      '/en/sdk/guide',
      '/en/sdk/other',
      '/zh-CN/sdk/enum-state',
      '/en/sdk/v1/enum-state',
    ]) {
      expect(
        resolveNavigationParent(root, path, () => metadata),
      ).toBeUndefined();
    }
  });
  it('does not invent missing parents or choose between conflicting parents', () => {
    expect(
      resolveNavigationParent(root, '/en/sdk/detail', () => ({
        navigationParents: {
          '/en/sdk/missing': ['/en/sdk/detail'],
        },
      })),
    ).toBeUndefined();
    expect(
      resolveNavigationParent(root, '/en/sdk/detail', () => ({
        navigationParents: {
          '/en/sdk/types': ['/en/sdk/detail'],
          '/en/sdk/guide': ['/en/sdk/detail'],
        },
      })),
    ).toBeUndefined();
  });
});
