import { describe, expect, it } from 'vitest';
import {
  findLegacyBodyLinks,
  rewriteLegacyBodyLinks,
} from './lib/api-center/legacy-links.mjs';

describe('API Center legacy links', () => {
  it('ignores links inside indented fenced code blocks', () => {
    const links = findLegacyBodyLinks(
      [
        '  ```md',
        '  [sample](/api-ref/rtc/android/sample)',
        '```',
        '',
        '[reference](/api-ref/rtc/android/reference)',
      ].join('\n'),
    );

    expect(links.map((link) => link.href)).toEqual([
      '/api-ref/rtc/android/reference',
    ]);
  });

  it('preserves selected unresolved links', () => {
    const source = '[reference](/api-ref/rtc/android/reference)';
    const result = rewriteLegacyBodyLinks(source, {
      preserveHref: () => true,
      routeMap: new Map([
        [
          '/api-ref/rtc/android/reference',
          '/zh-CN/api-reference/rtc/android/reference',
        ],
      ]),
      sourceUrl: 'https://doc.shengwang.cn',
    });

    expect(result.source).toBe(source);
    expect(result.changes).toEqual([]);
  });
});
