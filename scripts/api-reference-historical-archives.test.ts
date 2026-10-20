import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { docsMetaSchema } from '../src/lib/docs-meta-schema';

const contentRoot = 'content/docs/zh-CN/api-reference';
type ArchiveOverride = {
  newPlatform: string;
  sdkVersion: string;
  sourceSiteVersion: string;
  verifiedArchiveVersion: string;
  href: string;
  renderedVersion: string;
};
const { overrides } = JSON.parse(
  readFileSync(
    'docs/migration/api-reference-archive-url-overrides-20261020.json',
    'utf8',
  ),
) as { overrides: ArchiveOverride[] };
const overrideByVersion = new Map(
  overrides.map((override) => [
    `${override.newPlatform}:${override.sdkVersion}`,
    override,
  ]),
);
const initialAudit = JSON.parse(
  readFileSync(
    'docs/migration/api-reference-historical-archive-url-check-20261020.json',
    'utf8',
  ),
) as { results: { url: string; notFound: boolean }[] };
const inventory = readFileSync(
  'docs/migration/api-reference-historical-archive-inventory-20261020.md',
  'utf8',
)
  .split('## 完整逐平台清单')[1]
  .split('## current、')[0];

const products: Record<string, string> = {
  convoai: 'conversational-ai',
  rtc: 'rtc',
  rtm2: 'rtm',
  rtsa: 'rtsa',
  whiteboard: 'whiteboard/whiteboard-sdk',
  fastboard: 'whiteboard/fastboard',
  recording: 'local-server-recording',
  'rtc-server-sdk': 'rtc-server-sdk',
  'flexible-classroom': 'flexible-classroom',
};
const platformAliases: Record<string, Record<string, string>> = {
  convoai: { typescript: 'web', go: 'restclient-go', java: 'restclient-java' },
  rtc: { javascript: 'web', windows: 'cpp-all-platforms', rn: 'react-native' },
  rtm2: { javascript: 'web' },
  whiteboard: { javascript: 'web' },
  fastboard: { javascript: 'web' },
  'rtc-server-sdk': { python: 'python-api', go: 'go-api' },
  'flexible-classroom': { javascript: 'web' },
};
type Platform = {
  directory: string;
  history: { label: string; href: string }[];
};
const platforms: Platform[] = [];
let product = '';
let platform: Platform | undefined;
for (const line of inventory.split('\n')) {
  const productHeading = line.match(/^### .+（([^）]+)）$/);
  if (productHeading) product = productHeading[1];
  const platformHeading = line.match(/^#### .+（([^）]+)）：/);
  if (platformHeading) {
    const legacyPlatform = platformHeading[1];
    platform = undefined;
    if (product === 'rtc' && legacyPlatform === 'react') continue;
    platform = {
      directory: `${products[product]}/${platformAliases[product]?.[legacyPlatform] ?? legacyPlatform}`,
      history: [],
    };
    platforms.push(platform);
  }
  const row = line.match(/^\| (v[^|]+) \| `[^`]+` \| \[([^\]]+)\]\(([^)]+)\)/);
  if (row && platform) {
    if (row[2] !== row[3])
      throw new Error(`Mismatched inventory link: ${line}`);
    platform.history.push({ label: row[1], href: row[3] });
  }
}

function readMeta(directory: string) {
  return docsMetaSchema.parse(
    JSON.parse(
      readFileSync(path.join(contentRoot, directory, 'meta.json'), 'utf8'),
    ),
  );
}

describe('Chinese API Reference historical archives', () => {
  it('covers exactly the agreed inventory excluding both RTC React series', () => {
    expect(platforms).toHaveLength(43);
    const history = platforms.flatMap((item) => item.history);
    expect(history).toHaveLength(219);
    expect(new Set(history.map((item) => item.href)).size).toBe(214);
    expect(
      new Set(
        platforms.flatMap(({ directory, history }) =>
          history.map(
            (item) =>
              overrideByVersion.get(`${directory}:${item.label}`)?.href ??
              item.href,
          ),
        ),
      ).size,
    ).toBe(214);
    expect(platforms.every((item) => item.history.length > 0)).toBe(true);
    expect(platforms.some((item) => item.directory.includes('react-sdk'))).toBe(
      false,
    );
  });

  it.each(platforms)(
    '$directory matches the inventory with verified URL overrides',
    ({ directory, history }) => {
      const meta = readMeta(directory);
      expect(meta.navScope?.defaultVersion).toBe('current');
      const versions = meta.navScope?.versions ?? [];
      expect(versions[0]?.id).toBe('current');
      expect(versions[0]?.href ?? '').not.toMatch(/^https?:/);
      expect(
        versions.slice(1).map(({ label, href }) => ({ label, href })),
      ).toEqual(
        history.map((entry) => ({
          ...entry,
          href:
            overrideByVersion.get(`${directory}:${entry.label}`)?.href ??
            entry.href,
        })),
      );
      expect(new Set(versions.map((version) => version.id)).size).toBe(
        versions.length,
      );
      for (const version of versions.slice(1)) {
        expect(version.href).toMatch(
          /^https:\/\/doc-archive\.shengwang\.cn\/archive\//,
        );
        expect(version.id).not.toBe('legacy');
      }
    },
  );

  it('has exactly one verified override for each initially broken URL', () => {
    expect(overrides).toHaveLength(13);
    expect(overrideByVersion.size).toBe(13);
    const replacedUrls = overrides.map((override) => {
      const matches = platforms
        .find((item) => item.directory === override.newPlatform)
        ?.history.filter((entry) => entry.label === override.sdkVersion);
      expect(matches).toHaveLength(1);
      const originalHref = matches?.[0].href ?? '';
      const original = new URL(originalHref);
      const replacement = new URL(override.href);
      expect(original.pathname.split('/')[2]).toBe(override.sourceSiteVersion);
      expect(replacement.origin).toBe(original.origin);
      expect(replacement.pathname.split('/')[2]).toBe(
        override.verifiedArchiveVersion,
      );
      expect(replacement.pathname.split('/').slice(3)).toEqual(
        original.pathname.split('/').slice(3),
      );
      expect(override.renderedVersion).toBe(override.sdkVersion);
      return originalHref;
    });
    expect(new Set(replacedUrls)).toEqual(
      new Set(
        initialAudit.results
          .filter((item) => item.notFound)
          .map((item) => item.url),
      ),
    );
  });

  it.each(overrides)(
    '$newPlatform $sdkVersion uses its verified replacement',
    (override) => {
      const versions = readMeta(override.newPlatform).navScope?.versions ?? [];
      expect(
        versions.filter((version) => version.label === override.sdkVersion),
      ).toEqual([
        expect.objectContaining({
          href: override.href,
          id: override.sdkVersion.slice(1),
        }),
      ]);
    },
  );

  it('keeps the React SDK and underlying Web SDK version series isolated', () => {
    const meta = readMeta('rtc/react-sdk');
    const navScope = meta.navScope;
    const rawInventory = readFileSync(
      'docs/migration/api-reference-historical-archive-inventory-20261020.md',
      'utf8',
    );
    const reactTable = rawInventory
      .split('#### React（react）：9 项')[1]
      .split('### 实时消息')[0];
    const history = reactTable.split('\n').flatMap((line) => {
      const row = line.match(
        /^\| (v[^|]+) \| `[^`]+` \| \[[^\]]+\]\(([^)]+)\)/,
      );
      return row ? [{ label: row[1].replace(/（.*$/, ''), href: row[2] }] : [];
    });
    expect(history).toHaveLength(9);
    expect(navScope?.defaultVersion).toBe('current');
    expect(navScope?.versions?.[0]).toEqual({
      id: 'current',
      label: 'v2.5.0',
      path: '.',
      href: '/zh-CN/api-reference/rtc/react-sdk/overview',
    });
    expect(
      navScope?.versions?.slice(1).map(({ label, href }) => ({ label, href })),
    ).toEqual(history.filter((v) => v.href.includes('/react/react-sdk/')));
    expect(navScope?.versions).toHaveLength(7);
    const versionOverrides = navScope?.versionOverrides;
    expect(versionOverrides).toHaveLength(1);
    expect(versionOverrides?.[0].path).toBe('web-sdk');
    const webVersions = versionOverrides?.[0].versions;
    expect(webVersions?.[0]).toEqual({
      id: 'current',
      label: 'v4.22.0',
      path: '.',
      href: '/zh-CN/api-reference/rtc/react-sdk/web-sdk/overview',
    });
    expect(webVersions).toHaveLength(4);
    expect(
      webVersions?.slice(1).map(({ label, href }) => ({ label, href })),
    ).toEqual(history.filter((v) => !v.href.includes('/react/react-sdk/')));
    expect(new Set(navScope?.versions?.map((v) => v.id)).size).toBe(7);
    expect(new Set(webVersions?.map((v) => v.id)).size).toBe(4);
    // The child folder remains part of the shared React sidebar, not a new scope.
    expect(readMeta('rtc/react-sdk/web-sdk').navScope).toBeUndefined();
  });

  it.each(['cpp', 'java'])(
    'keeps local recording %s Legacy pages outside version options',
    (language) => {
      const meta = readMeta(`local-server-recording/${language}`);
      expect(meta.pages).toContain('legacy');
      const legacyMeta = readMeta(`local-server-recording/${language}/legacy`);
      expect(legacyMeta.navScope).toEqual({});
      expect(
        legacyMeta.pages?.filter(
          (page) => typeof page === 'string' && page.startsWith('(current)/'),
        ),
      ).toHaveLength(4);
      expect(legacyMeta.pages).toContain('(current)/overview');
      expect(meta.sidebarLabels).toHaveProperty(
        `/zh-CN/api-reference/local-server-recording/${language}/legacy/overview`,
      );
      expect(meta.navScope?.versions?.map((version) => version.id)).toEqual([
        'current',
        '4.4.150',
      ]);
    },
  );
});
