import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Folder, Root } from 'fumadocs-core/page-tree';
import { describe, expect, it } from 'vitest';
import { type DocsMeta, docsMetaSchema } from './docs-meta-schema';
import { resolveDocsNavScope } from './docs-nav-scope';

const cases = [
  {
    platform: 'android',
    current: 'v4.7.0',
    version: '4.6.2',
    legacy: 'android',
  },
  { platform: 'ios', current: 'v4.7.0', version: '4.6.2', legacy: 'ios' },
  {
    platform: 'flutter',
    current: 'v6.6.4',
    version: '6.6.2',
    legacy: 'flutter',
  },
  {
    platform: 'react-native',
    current: 'v4.6.4',
    version: '4.6.2',
    legacy: 'rn',
  },
];

function contentPath(platform: string) {
  return resolve('content/docs/zh-CN/api-reference/rtc', platform);
}

function readMeta(platform: string) {
  return docsMetaSchema.parse(
    JSON.parse(
      readFileSync(resolve(contentPath(platform), 'meta.json'), 'utf8'),
    ),
  );
}

function archiveVersion(testCase: (typeof cases)[number]) {
  return {
    id: testCase.version,
    label: `v${testCase.version}`,
    path: testCase.version,
    href: `https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtc/${testCase.legacy}/API/rtc_api_overview`,
  };
}

function makeTree(platform: string) {
  const baseUrl = `/zh-CN/api-reference/rtc/${platform}`;
  const activePath = `${baseUrl}/rtc-api-overview`;
  const currentFolder: Folder = {
    $id: `${platform}-(current)-folder`,
    children: [
      {
        name: 'API 概览',
        type: 'page',
        url: activePath,
      },
    ],
    name: '(current)',
    type: 'folder',
  };
  const platformFolder: Folder = {
    $id: `${platform}-folder`,
    children: [currentFolder],
    name: platform,
    type: 'folder',
  };
  if (platform === 'android') {
    platformFolder.children.push({
      $id: 'android-4.6.0-folder',
      children: [
        {
          name: 'API 概览',
          type: 'page',
          url: `${baseUrl}/4.6.0/overview`,
        },
      ],
      name: '4.6.0',
      type: 'folder',
    });
  }
  const root: Root = {
    children: [
      {
        children: [
          {
            children: [platformFolder],
            index: {
              name: '参考',
              type: 'page',
              url: '/zh-CN/api-reference',
            },
            name: '参考',
            root: true,
            type: 'folder',
          },
        ],
        name: '简体中文',
        type: 'folder',
      },
    ],
    name: '文档',
  };
  return { activePath, currentFolder, platformFolder, root };
}

describe('RTC upstream PR #2113 historical API archive parity', () => {
  it.each(cases)(
    'maps $platform to the corrected archive version',
    (testCase) => {
      const meta = readMeta(testCase.platform);
      expect(
        meta.navScope?.versions?.find(
          (version) => version.id === testCase.version,
        ),
      ).toEqual(archiveVersion(testCase));
      expect(
        existsSync(resolve(contentPath(testCase.platform), testCase.version)),
      ).toBe(false);
    },
  );

  it.each(cases)(
    'preserves $platform current and local navigation',
    (testCase) => {
      const meta = readMeta(testCase.platform);
      expect(meta.navScope?.defaultVersion).toBe('current');
      expect(meta.navScope?.versions?.[0]).toEqual({
        id: 'current',
        label: testCase.current,
        path: '(current)',
      });
      expect(meta.pages).toEqual(
        testCase.platform === 'android'
          ? ['(current)', '4.6.0']
          : ['(current)'],
      );
      if (testCase.platform === 'android') {
        expect(
          meta.navScope?.versions?.find((version) => version.id === '4.6.0'),
        ).toEqual({ id: '4.6.0', label: 'v4.6.0', path: '4.6.0' });
      }
      expect(
        existsSync(
          resolve(
            contentPath(testCase.platform),
            '(current)',
            'rtc-api-overview.mdx',
          ),
        ),
      ).toBe(true);
    },
  );

  it.each(cases)(
    'resolves $platform archive links without a local folder',
    (testCase) => {
      const meta = readMeta(testCase.platform);
      const { activePath, currentFolder, platformFolder, root } = makeTree(
        testCase.platform,
      );
      const getNodeMeta = (node: Folder | Root): DocsMeta | undefined =>
        node === platformFolder ? meta : undefined;
      const scope = resolveDocsNavScope({
        activePath,
        getNodeMeta,
        root,
        tab: 'api-reference',
      });

      expect(scope?.activeVersion?.id).toBe('current');
      expect(scope?.sidebarRoot).toBe(currentFolder);
      expect(scope?.header.versionSwitcher?.currentId).toBe('current');
      const { href, id, label } = archiveVersion(testCase);
      expect(scope?.header.versionSwitcher?.versions).toEqual(
        expect.arrayContaining([
          { href: activePath, id: 'current', label: testCase.current },
          { href, id, label },
        ]),
      );
      if (testCase.platform === 'android') {
        expect(scope?.header.versionSwitcher?.versions).toContainEqual({
          href: '/zh-CN/api-reference/rtc/android/4.6.0/overview',
          id: '4.6.0',
          label: 'v4.6.0',
        });
      }
    },
  );
});
