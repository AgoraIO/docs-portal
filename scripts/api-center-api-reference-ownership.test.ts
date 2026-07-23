import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  buildApiReferenceRehomePlan,
  reconcileApiReferenceRehome,
} from './lib/api-center/api-reference-ownership.mjs';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(
    roots
      .splice(0)
      .map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

function fixtureManifest() {
  const androidUrl =
    'https://doc.shengwang.cn/doc/art-class/android/api/correction';
  const iosUrl = 'https://doc.shengwang.cn/doc/art-class/ios/api/correction';
  return {
    entries: [
      {
        product: '在线美术教学',
        productDescription: '帮助专业美术老师开展在线教学。',
        label: 'Android',
        pageGraph: {
          pages: [{ label: 'API 参考', url: androidUrl }],
        },
      },
      {
        product: '在线美术教学',
        productDescription: '帮助专业美术老师开展在线教学。',
        label: 'iOS',
        pageGraph: { pages: [{ label: 'API 参考', url: iosUrl }] },
      },
    ],
    pageEvidence: [
      {
        requestedUrl: androidUrl,
        sourceResolution: {
          sourcePath: 'docs/art-class/api/correction.android.mdx',
          supersededTargetPath:
            'content/docs/zh-CN/solutions/art-class/reference/correction.mdx',
          supersededTargetRoute:
            '/zh-CN/solutions/art-class/reference/correction',
          targetPath:
            'content/docs/zh-CN/api-reference/online-art-teaching/android/api/correction.mdx',
          targetRoute:
            '/zh-CN/api-reference/online-art-teaching/android/api/correction',
        },
      },
      {
        requestedUrl: iosUrl,
        sourceResolution: {
          sourcePath: 'docs/art-class/api/correction.ios.mdx',
          supersededTargetPath:
            'content/docs/zh-CN/solutions/art-class/reference/correction.mdx',
          supersededTargetRoute:
            '/zh-CN/solutions/art-class/reference/correction',
          targetPath:
            'content/docs/zh-CN/api-reference/online-art-teaching/ios/api/correction.mdx',
          targetRoute:
            '/zh-CN/api-reference/online-art-teaching/ios/api/correction',
        },
      },
    ],
  };
}

describe('API Center reference ownership', () => {
  it('uses an API supplement label when the page is outside the entry page graph', () => {
    const plan = buildApiReferenceRehomePlan({
      entries: [],
      pageEvidence: [
        {
          requestedUrl:
            'https://doc.shengwang.cn/doc/cloud-transcoder/restful/webhook/ncs-events',
          sourceResolution: {
            sourcePath: 'docs/cloud-transcoder/webhook/ncs-events.mdx',
            targetPath:
              'content/docs/zh-CN/api-reference/api-ref/cloud-transcoding/ncs-events.mdx',
            targetRoute:
              '/zh-CN/api-reference/api-ref/cloud-transcoding/ncs-events',
            supersededTargetPath:
              'content/docs/zh-CN/realtime-media/transcoding/reference/ncs-events.mdx',
            supersededTargetRoute:
              '/zh-CN/realtime-media/transcoding/reference/ncs-events',
            apiReferenceSupplement: { label: '事件类型' },
          },
        },
      ],
    });

    expect(plan.records).toEqual([
      expect.objectContaining({
        label: '事件类型',
        replacementRoute:
          '/zh-CN/api-reference/api-ref/cloud-transcoding/ncs-events',
      }),
    ]);
  });

  it('uses a real Reference Center landing when one solution page splits by platform', () => {
    const plan = buildApiReferenceRehomePlan(fixtureManifest());

    expect(plan.records).toEqual([
      expect.objectContaining({
        label: '在线美术教学 API 参考',
        replacementRoute: '/zh-CN/api-reference/online-art-teaching',
        targetRoutes: [
          '/zh-CN/api-reference/online-art-teaching/android/api/correction',
          '/zh-CN/api-reference/online-art-teaching/ios/api/correction',
        ],
      }),
    ]);
    expect(plan.sourcePages).toHaveLength(2);
    expect(plan.sourcePages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourcePath: 'docs/art-class/api/correction.android.mdx',
          targetRoute:
            '/zh-CN/api-reference/online-art-teaching/android/api/correction',
        }),
        expect.objectContaining({
          sourcePath: 'docs/art-class/api/correction.ios.mdx',
          targetRoute:
            '/zh-CN/api-reference/online-art-teaching/ios/api/correction',
        }),
      ]),
    );
    expect(plan.landingPages).toEqual([
      expect.objectContaining({
        route: '/zh-CN/api-reference/online-art-teaching',
        targetPath:
          'content/docs/zh-CN/api-reference/online-art-teaching/index.mdx',
        links: [
          {
            label: 'Android · API 参考',
            route:
              '/zh-CN/api-reference/online-art-teaching/android/api/correction',
          },
          {
            label: 'iOS · API 参考',
            route:
              '/zh-CN/api-reference/online-art-teaching/ios/api/correction',
          },
        ],
      }),
    ]);
  });

  it('removes the old page and converts its solution meta entry into a Reference Center link', async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), 'api-center-reference-ownership-'),
    );
    roots.push(repoRoot);
    const plan = buildApiReferenceRehomePlan(fixtureManifest());
    const metaPath =
      'content/docs/zh-CN/solutions/art-class/reference/meta.json';
    const oldPath =
      'content/docs/zh-CN/solutions/art-class/reference/correction.mdx';
    for (const filePath of [
      metaPath,
      oldPath,
      ...plan.records[0].targetPaths,
    ]) {
      await fs.mkdir(path.dirname(path.join(repoRoot, filePath)), {
        recursive: true,
      });
      await fs.writeFile(
        path.join(repoRoot, filePath),
        filePath.endsWith('meta.json')
          ? '{"title":"参考","pages":["downloads","correction"]}\n'
          : 'page\n',
      );
    }

    await reconcileApiReferenceRehome({ repoRoot, mode: 'write', plan });

    await expect(fs.access(path.join(repoRoot, oldPath))).rejects.toThrow();
    expect(
      JSON.parse(await fs.readFile(path.join(repoRoot, metaPath), 'utf8')),
    ).toEqual({
      title: '参考',
      pages: [
        'downloads',
        '[在线美术教学 API 参考](/zh-CN/api-reference/online-art-teaching)',
      ],
    });
    await expect(
      reconcileApiReferenceRehome({ repoRoot, mode: 'check', plan }),
    ).resolves.toMatchObject({ supersededApiPages: 1 });
  });
});
