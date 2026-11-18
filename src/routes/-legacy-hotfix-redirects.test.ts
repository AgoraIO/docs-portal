import { readFileSync } from 'node:fs';
import { isRedirect } from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';
import { collectCurrentDocTargets } from '../../scripts/shengwang-redirect-targets.mjs';
import reviewed from '../lib/shengwang-guide-redirects.json';
import { Route as ApiRoute } from './api-ref/$';
import { Route as DocRoute } from './doc/$';
import { Route as FaqRoute } from './faq/$';

const csv = readFileSync(
  'docs/agents/reports/2026-11-18-hotfix-new-doc-redirect-audit-missing-301.csv',
  'utf8',
);
const initialSources = [
  ...csv.matchAll(
    /https:\/\/doc\.shengwang\.cn((?:\/doc|\/api-ref)\/[^",\r\n]+)/g,
  ),
].map((match) => match[1]);
const pendingCsv = readFileSync(
  'docs/agents/reports/2026-11-18-hotfix-new-doc-redirect-audit.csv',
  'utf8',
);
const pendingSources = pendingCsv
  .split('\n')
  .filter((line) => line.startsWith('等待 PR #1443 合入,'))
  .map(
    (line) =>
      line.match(
        /https:\/\/doc\.shengwang\.cn((?:\/doc|\/api-ref|\/faq)\/[^",\r\n]+)/,
      )?.[1],
  )
  .filter((source): source is string => Boolean(source));
const sources = [...initialSources, ...pendingSources];

describe('published hotfix legacy URLs', () => {
  it('keeps unknown FAQ URLs unavailable', async () => {
    const { Route } = await import('./faq/$');
    const loader = Route.options.loader as (input: unknown) => unknown;
    expect(() => loader({ params: { _splat: 'unknown' } })).toThrow();
  });
  it('redirects every audited missing URL to its current content with HTTP 301', async () => {
    const targets = await collectCurrentDocTargets('content/docs/zh-CN');
    expect(sources).toHaveLength(715);
    expect(new Set(sources).size).toBe(715);
    const rules = reviewed as Record<string, string>;
    for (const source of sources) {
      const target = rules[source];
      expect(target, source).toBeTruthy();
      expect(targets.has(target), source).toBe(true);
      const route = source.startsWith('/api-ref/')
        ? ApiRoute
        : source.startsWith('/faq/')
          ? FaqRoute
          : DocRoute;
      const loader = route.options.loader as (input: unknown) => unknown;
      for (const ending of ['', '/']) {
        let caught: unknown;
        try {
          loader({
            params: {
              _splat: source.replace(/^\/(doc|api-ref|faq)\//, '') + ending,
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
      FaqRoute,
      'general-product-inquiry/rtm2-user-online-status',
      '/reference/faq/product/rtm2_user_online_status',
    ],
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
