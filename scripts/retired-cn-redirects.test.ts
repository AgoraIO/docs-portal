import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { resolveLegacySitemapRedirectPath } from '../src/lib/legacy-sitemap/redirects';
import { resolveStaticLegacySitemapRedirect } from '../src/lib/legacy-sitemap/static-redirects';
import {
  isRetiredCnDocsPath,
  isRetiredCnLegacyDocsPath,
} from '../src/lib/retired-cn-docs.mjs';

const inputRoot = 'docs/migration/redirect-inputs/';
const readJson = (name: string) =>
  JSON.parse(readFileSync(inputRoot + name, 'utf8'));
const finalMap = readJson('legacy-url-map.json');
const redirects = readJson('legacy-url-redirects.vercel.json');
const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
const retiredRoutes = readJson('legacy-url-retired.vercel.json').routes;

describe('retired Chinese products in legacy redirect delivery', () => {
  it.each([
    '/doc/fusion-cdn/restful/overview/product-overview',
    '/doc/fusion-cdn/restful/mcp-integrate',
    '/doc/flexible-classroom/android/advanced-features/custom-ui',
    '/doc/flexible-classroom/javascript/skills-integrate',
    '/api-ref/flexible-classroom/android/API/api_data_type',
    '/api-ref/flexible-classroom/android/edu-context/dummy',
    '/doc/sdk-extension/android/metakit/landing-page',
    '/doc/sdk-extension/ios/portrait-rhythm/skills-integrate',
    '/basics/security/flexible-classroom-sdk',
    '/faq/integration-issues/class-courseware',
    '/faq/quality-issues/class-audio-video',
    '/doc/analytics/general/fls/data',
  ])('returns 404 instead of redirecting %s', (legacyPath) => {
    expect(
      finalMap.records.find(
        (record: { legacyPath: string }) => record.legacyPath === legacyPath,
      ),
    ).toMatchObject({ status: 'retired', target: '', targetExists: false });
    expect(
      redirects.some((rule: { source: string }) => rule.source === legacyPath),
    ).toBe(false);
    const nginx = readFileSync(
      `${inputRoot}legacy-url-redirects.nginx.conf`,
      'utf8',
    );
    expect(nginx).toContain(`location = ${legacyPath} {\n  return 404;\n}`);
  });

  it('delivers every retired source as 404 in Vercel and Nginx', () => {
    const retired = finalMap.records.filter(
      (record: { status: string }) => record.status === 'retired',
    );
    expect(retired).toHaveLength(1100);
    const nginx = readFileSync(
      `${inputRoot}legacy-url-redirects.nginx.conf`,
      'utf8',
    );
    const nginxPaths = [
      ...nginx.matchAll(/^location = (\S+) \{\n {2}return 404;\n\}/gm),
    ].map((match) => match[1]);
    expect(new Set(nginxPaths)).toEqual(
      new Set(
        retired.map((record: { legacyPath: string }) => record.legacyPath),
      ),
    );
    for (const record of retired) {
      for (const rules of [config.routes, retiredRoutes]) {
        expect(
          rules.find((rule: { src: string }) =>
            new RegExp(rule.src).test(record.legacyPath),
          ),
        ).toMatchObject({ status: 404, dest: '/404.html' });
      }
      // The broad /doc and /api-ref passthroughs are evaluated before routes.
      const passthroughs = config.redirects.filter((rule: { source: string }) =>
        rule.source.includes(':path('),
      );
      expect(
        passthroughs.some((rule: { source: string }) =>
          new RegExp(`^${rule.source.replace(':path(', '(')}$`).test(
            record.legacyPath,
          ),
        ),
      ).toBe(false);
    }
    expect(finalMap.summary).toMatchObject({
      total: 8221,
      redirect: 7119,
      noRedirect: 2,
      retired: 1100,
    });
  });

  it.each([
    '/doc/sdk-extension/ios/metakit/new-deep-link?platform=ios',
    '/api-ref/flexible-classroom/ios/unknown.html#member',
    '/basics/security/flexible-classroom-sdk.html',
    '/faq/integration-issues/class-courseware.md',
  ])('covers old deep links and alternate forms: %s', (path) => {
    expect(isRetiredCnLegacyDocsPath(path)).toBe(true);
  });

  it.each([
    '/doc/fusion-cdn-other/overview',
    '/doc/flexible-classroom-other/overview',
    '/doc/sdk-extension-other/overview',
    '/faq/integration-issues/class-courseware-other',
    '/doc/analytics/general/rtc/data',
    '/en/realtime-media/flexible-classroom',
    '/doc/%E0%A4%A',
  ])('keeps unrelated paths outside retirement: %s', (path) => {
    expect(isRetiredCnLegacyDocsPath(path)).toBe(false);
  });

  it('removes retired 301s from both deployed and app fallback configurations', () => {
    const old =
      '/zh-CN/realtime-media/fusion-cdn/build/setup-and-access/enable-service';
    const bulk = JSON.parse(
      readFileSync('vercel-legacy-redirects.json', 'utf8'),
    );
    expect(bulk.some((rule: { source: string }) => rule.source === old)).toBe(
      false,
    );
    expect(resolveLegacySitemapRedirectPath(old)).toBeNull();
    expect(resolveStaticLegacySitemapRedirect(old)).toBeNull();
    expect(
      config.redirects.some(
        (rule: { source: string }) =>
          rule.source === '/basics/security/flexible-classroom-sdk-third-party',
      ),
    ).toBe(false);
  });

  it('emits no 301 destination under the retired publication boundary', () => {
    expect(
      redirects.filter((rule: { destination: string }) =>
        isRetiredCnDocsPath(`/zh-CN${rule.destination}`),
      ),
    ).toHaveLength(0);
  });

  it('keeps shared classroom FAQ and independent products redirected', () => {
    const shared = finalMap.records.find((record: { target: string }) =>
      record.target.endsWith('/dynamic_storage_path'),
    );
    expect(shared).toMatchObject({ status: 'candidate' });
    for (const product of [
      'rtc',
      'rtm2',
      'whiteboard',
      'one-to-one-classroom',
      'small-classroom',
    ]) {
      const rules = redirects.filter((rule: { source: string }) =>
        rule.source.startsWith(`/doc/${product}/`),
      );
      expect(rules.length).toBeGreaterThan(0);
      expect(
        rules.every((rule: { statusCode: number }) => rule.statusCode === 301),
      ).toBe(true);
    }
  });
});
