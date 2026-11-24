import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { extractMdxAnchors } from '../../scripts/lib/api-center/local-fragment-index.mjs';
import {
  LEGACY_API_HASH_TARGETS,
  resolveLegacyApiHashRedirect,
} from './docs-api-hash-redirects';

describe('legacy API hash targets', () => {
  it.each(
    Object.entries(LEGACY_API_HASH_TARGETS).flatMap(([source, targets]) =>
      Object.entries(targets).map(([hash, target]) => ({
        source,
        hash,
        target,
      })),
    ),
  )(
    'preserves $source#$hash on a page that contains the anchor',
    ({ source, hash, target }) => {
      expect(
        resolveLegacyApiHashRedirect(
          'zh-CN',
          'api-reference',
          source.split('/'),
          hash,
        ),
      ).toBe(`/zh-CN/api-reference/${target}`);
      const root = `content/docs/zh-CN/api-reference/${target}`;
      const file = [`${root}.mdx`, `${root}/index.mdx`].find(existsSync);
      if (!file) throw new Error(`Missing target page: ${target}`);
      expect(extractMdxAnchors(readFileSync(file, 'utf8')).has(hash)).toBe(
        true,
      );
    },
  );

  it('leaves unrelated locales, pages and unknown anchors to normal routing', () => {
    const slug = 'whiteboard/fastboard/fastboard-api'.split('/');
    expect(
      resolveLegacyApiHashRedirect(
        'zh-CN',
        'api-reference',
        ['constructor'],
        'prototype',
      ),
    ).toBeNull();
    expect(
      resolveLegacyApiHashRedirect('en', 'api-reference', slug, 'ui'),
    ).toBeNull();
    expect(
      resolveLegacyApiHashRedirect('zh-CN', 'realtime-media', slug, 'ui'),
    ).toBeNull();
    expect(
      resolveLegacyApiHashRedirect('zh-CN', 'api-reference', slug, 'unknown'),
    ).toBeNull();
    expect(
      resolveLegacyApiHashRedirect(
        'zh-CN',
        'api-reference',
        slug,
        'constructor',
      ),
    ).toBeNull();
    expect(
      resolveLegacyApiHashRedirect('zh-CN', 'api-reference', slug, '%invalid'),
    ).toBeNull();
  });
});
