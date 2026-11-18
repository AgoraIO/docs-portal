import { readFileSync } from 'node:fs';
import { isRedirect } from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';
import { collectCurrentDocTargets } from '../../scripts/shengwang-redirect-targets.mjs';
import reviewed from '../lib/shengwang-guide-redirects.json';
import { Route as ApiRoute } from './api-ref/$';
import { Route as DocRoute } from './doc/$';

const csv = readFileSync(
  'docs/agents/reports/2026-11-18-hotfix-new-doc-redirect-audit-missing-301.csv',
  'utf8',
);
const sources = [
  ...csv.matchAll(
    /https:\/\/doc\.shengwang\.cn((?:\/doc|\/api-ref)\/[^",\r\n]+)/g,
  ),
].map((match) => match[1]);

describe('published hotfix legacy URLs', () => {
  it('redirects every audited missing URL to its current content with HTTP 301', async () => {
    const targets = await collectCurrentDocTargets('content/docs/zh-CN');
    expect(sources).toHaveLength(703);
    expect(new Set(sources).size).toBe(703);
    const rules = reviewed as Record<string, string>;
    for (const source of sources) {
      const target = rules[source];
      expect(target, source).toBeTruthy();
      expect(targets.has(target), source).toBe(true);
      const route = source.startsWith('/api-ref/') ? ApiRoute : DocRoute;
      const loader = route.options.loader as (input: unknown) => unknown;
      for (const ending of ['', '/']) {
        let caught: unknown;
        try {
          loader({
            params: {
              _splat: source.replace(/^\/(doc|api-ref)\//, '') + ending,
            },
          });
        } catch (error) {
          caught = error;
        }
        expect(isRedirect(caught), source).toBe(true);
        expect(caught).toMatchObject({
          options: { href: target, statusCode: 301 },
          status: 301,
        });
      }
    }
  });

  it.each([
    [
      DocRoute,
      'rtc-server-sdk/cpp/advanced-features/video-metadata',
      '/realtime-media/rtc-server-sdk/build/video-metadata',
    ],
    [
      ApiRoute,
      'rtc-server-sdk/cpp/classagora_1_1rtc_1_1_i_metadata_observer',
      '/api-reference/rtc-server-sdk/cpp/classagora-1-1rtc-1-1-i-metadata-observer',
    ],
  ])(
    'preserves query parameters and encoded anchors for %s',
    (route, splat, target) => {
      const loader = route.options.loader as (input: unknown) => unknown;
      let caught: unknown;
      try {
        loader({
          params: { _splat: splat },
          location: { searchStr: '?from=legacy&tag=a&tag=b', hash: '元数据' },
        });
      } catch (error) {
        caught = error;
      }
      expect(caught).toMatchObject({
        options: {
          href: `${target}?from=legacy&tag=a&tag=b#%E5%85%83%E6%95%B0%E6%8D%AE`,
          statusCode: 301,
        },
      });
    },
  );
});
