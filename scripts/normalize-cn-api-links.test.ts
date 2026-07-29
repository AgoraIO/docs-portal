import { describe, expect, it } from 'vitest';
import { buildLocalFragmentIndex } from './lib/api-center/local-fragment-index.mjs';
import {
  isApprovedLegacyFallback,
  isApiRelatedMissingInternal,
  neutralizeUnresolvedBodyLinks,
  renderReport,
  resolveLegacyApiReferenceHref,
} from './normalize-cn-api-links.mjs';

describe('CN API link normalization', () => {
  it('includes missing pages linked from API reference content', () => {
    expect(
      isApiRelatedMissingInternal({
        href: '/zh-CN/retired-product',
        sourcePath: 'zh-CN/reference/faq/example.mdx',
      }),
    ).toBe(true);
  });

  it('includes missing API targets linked from product documentation', () => {
    expect(
      isApiRelatedMissingInternal({
        href: '/api-ref/rtc/android/removed-method',
        sourcePath: 'zh-CN/realtime-media/rtc/example.mdx',
      }),
    ).toBe(true);
  });

  it('includes missing pages linked from Chinese OpenAPI sources', () => {
    expect(
      isApiRelatedMissingInternal({
        href: '/zh-CN/retired-guide',
        sourcePath: 'openapi/example/example.zh-CN.yaml',
      }),
    ).toBe(true);
  });

  it('excludes unrelated missing product pages', () => {
    expect(
      isApiRelatedMissingInternal({
        href: '/zh-CN/realtime-media/rtc/retired-guide',
        sourcePath: 'zh-CN/realtime-media/rtc/example.mdx',
      }),
    ).toBe(false);
  });

  it('maps a legacy toc page before restoring its missing member alias', async () => {
    const fragmentIndex = await buildLocalFragmentIndex({
      repoRoot: '/tmp/cn-api-links-test',
      virtualPages: [
        {
          body: '## joinChannel [1/2]\n\n## joinChannel [2/2]\n',
          targetPath:
            'content/docs/zh-CN/api-reference/rtc/android/(current)/channel.mdx',
        },
      ],
    });

    await expect(
      resolveLegacyApiReferenceHref(
        '/api-ref/rtc/android/API/toc_channel#api_irtcengine_joinchannel',
        { fragmentIndex },
      ),
    ).resolves.toBe(
      '/zh-CN/api-reference/rtc/android/channel#api_irtcengine_joinchannel',
    );
  });

  it('renders an unavailable Markdown target as its original label', () => {
    const source =
      'Call [`removedMethod`](/api-ref/rtc/android/API/removed) now.\n';
    const result = neutralizeUnresolvedBodyLinks(source, {
      hrefs: ['/api-ref/rtc/android/API/removed'],
      sourcePath: 'content/docs/zh-CN/example.mdx',
    });

    expect(result.source).toBe('Call `removedMethod` now.\n');
    expect(result.changes).toHaveLength(1);
  });

  it('separates active broken links from archived unavailable targets', () => {
    const report = renderReport([], [
      {
        href: 'https://doc.shengwang.cn/removed',
        line: 12,
        reason: 'missing-migrated-content',
        sourcePath: 'content/docs/zh-CN/example.mdx',
      },
    ]);

    expect(report).toContain('- Active unresolved link occurrences: 0');
    expect(report).toContain(
      '- Unapproved legacy doc-host link occurrences: 0',
    );
    expect(report).toContain('- Approved legacy fallback link occurrences: 0');
    expect(report).toContain('- Archived unavailable target occurrences: 1');
    expect(report).toContain('No active unresolved links remain');
    expect(report).toContain('missing-migrated-content');
  });

  it('allows a verified legacy fallback only in its approved source file', () => {
    const href =
      'https://doc.shengwang.cn/codebox/detail?demo=24&platform=2';

    expect(
      isApprovedLegacyFallback(
        'content/docs/zh-CN/realtime-media/rtc/reference/downloads/android.mdx',
        href,
      ),
    ).toBe(true);
    expect(
      isApprovedLegacyFallback(
        'content/docs/zh-CN/realtime-media/rtc/reference/downloads/ios.mdx',
        href,
      ),
    ).toBe(false);
  });
});
