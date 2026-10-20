import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { docsMetaSchema } from '../src/lib/docs-meta-schema';

const contentRoot = 'content/docs/zh-CN/api-reference';
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
    expect(platforms.every((item) => item.history.length > 0)).toBe(true);
    expect(platforms.some((item) => item.directory.includes('react-sdk'))).toBe(
      false,
    );
  });

  it.each(platforms)(
    '$directory matches every inventory label and URL',
    ({ directory, history }) => {
      const meta = readMeta(directory);
      expect(meta.navScope?.defaultVersion).toBe('current');
      const versions = meta.navScope?.versions ?? [];
      expect(versions[0]?.id).toBe('current');
      expect(versions[0]?.href ?? '').not.toMatch(/^https?:/);
      expect(
        versions.slice(1).map(({ label, href }) => ({ label, href })),
      ).toEqual(history);
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

  it('does not add version menus to either deferred React series', () => {
    expect(readMeta('rtc/react-sdk').navScope?.versions).toBeUndefined();
    expect(
      existsSync(path.join(contentRoot, 'rtc/react-sdk/web-sdk/meta.json')),
    ).toBe(false);
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
