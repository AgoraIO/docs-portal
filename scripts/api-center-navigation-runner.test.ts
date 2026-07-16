import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { auditApiCenterMigration } from './lib/api-center/migration-audit.mjs';
import { runApiCenterNavigation } from './lib/api-center/navigation-runner.mjs';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) =>
      fs.rm(root, { recursive: true, force: true }),
    ),
  );
});

describe('API Center navigation runner', () => {
  it('generates ordered overview/root navigation, entry meta, and a missing OpenAPI landing', async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), 'api-center-navigation-'),
    );
    roots.push(repoRoot);
    const manifestPath = 'docs/migration/api-center-html-manifest.json';
    const rtcOverviewUrl =
      'https://doc.shengwang.cn/api-ref/rtc/android/overview';
    const rtcClientUrl =
      'https://doc.shengwang.cn/api-ref/rtc/android/client';
    const speechUrl =
      'https://doc.shengwang.cn/doc/speech-to-text/restful/v7/operations/join';
    const manifest = {
      source: { commit: 'fixture' },
      live: { capturedAt: '2026-07-16T00:00:00.000Z' },
      entries: [
        {
          category: '基础能力',
          subcategories: [],
          product: '实时互动 RTC',
          productDescription: '实时互动能力。',
          apiGroup: 'client',
          label: 'Android',
          legacyUrl: rtcOverviewUrl,
          urlFamily: 'api-ref',
          targetRoute: '/zh-CN/api-reference/rtc/android/overview',
          pageGraph: {
            pages: [
              { url: rtcOverviewUrl, label: '概览', trail: [] },
              {
                url: rtcClientUrl,
                label: '客户端',
                trail: ['核心接口'],
              },
            ],
            navigation: [
              { kind: 'link', label: '概览', link: { url: rtcOverviewUrl } },
              {
                kind: 'category',
                label: '核心接口',
                items: [
                  {
                    kind: 'link',
                    label: '客户端',
                    link: { url: rtcClientUrl },
                  },
                ],
              },
              {
                kind: 'link',
                label: '客户端组件 API',
                link: {
                  url: 'https://doc.shengwang.cn/api-ref/convoai/android/android-component/overview',
                },
              },
            ],
          },
        },
        {
          category: '基础能力',
          subcategories: [],
          product: '即时通讯 IM',
          productDescription: '即时通讯能力。',
          apiGroup: 'client',
          label: 'Web',
          legacyUrl: 'https://im.shengwang.cn/docs/sdk/web.html',
          urlFamily: 'external',
          targetRoute: null,
          pageGraph: null,
        },
        {
          category: '基础能力',
          subcategories: [],
          product: '实时互动 RTC',
          productDescription: '实时互动能力。',
          apiGroup: 'client',
          label: 'iOS',
          legacyUrl: 'https://doc.shengwang.cn/api-ref/rtc/ios/overview',
          urlFamily: 'api-ref',
          targetRoute: '/zh-CN/api-reference/rtc/android/overview',
          pageGraph: { pages: [], navigation: [] },
        },
        {
          category: '扩展能力',
          subcategories: [],
          product: '实时转录翻译',
          productDescription: '把频道语音转成文本。',
          apiGroup: 'server',
          label: 'RESTful',
          legacyUrl: speechUrl,
          urlFamily: 'doc',
          targetRoute: '/zh-CN/api-reference/api-ref/speech-to-text/join',
          pageGraph: {
            pages: [
              {
                url: speechUrl,
                label: '开始转写',
                trail: ['服务端 API'],
              },
            ],
            navigation: [
              {
                kind: 'category',
                label: '服务端 API',
                items: [
                  {
                    kind: 'link',
                    label: '开始转写',
                    link: { url: speechUrl },
                  },
                ],
              },
            ],
          },
        },
      ],
      pageEvidence: [
        {
          requestedUrl: rtcOverviewUrl,
          sourceResolution: {
            type: 'generated-html',
            targetPath:
              'content/docs/zh-CN/api-reference/rtc/android/(current)/overview.mdx',
            targetRoute: '/zh-CN/api-reference/rtc/android/overview',
            route: { scopeKey: 'api-ref/rtc/android' },
          },
        },
        {
          requestedUrl: rtcClientUrl,
          sourceResolution: {
            type: 'generated-html',
            targetPath:
              'content/docs/zh-CN/api-reference/rtc/android/(current)/client.mdx',
            targetRoute: '/zh-CN/api-reference/rtc/android/client',
            route: { scopeKey: 'api-ref/rtc/android' },
          },
        },
        {
          requestedUrl: speechUrl,
          sourceResolution: {
            type: 'openapi',
            laneId: 'speech-fixture',
            targetPath: 'content/openapi/speech.yaml',
            targetRoute: '/zh-CN/api-reference/api-ref/speech-to-text/join',
            route: { scopeKey: 'doc/speech-to-text/restful' },
          },
        },
      ],
    };
    await fs.mkdir(path.join(repoRoot, 'docs/migration'), { recursive: true });
    await fs.writeFile(
      path.join(repoRoot, manifestPath),
      JSON.stringify(manifest),
    );
    for (const target of [
      'content/docs/zh-CN/api-reference/rtc/android/(current)/overview.mdx',
      'content/docs/zh-CN/api-reference/rtc/android/(current)/client.mdx',
    ]) {
      await fs.mkdir(path.dirname(path.join(repoRoot, target)), {
        recursive: true,
      });
      await fs.writeFile(path.join(repoRoot, target), '---\ntitle: Fixture\n---\n');
    }
    await fs.mkdir(
      path.join(repoRoot, 'content/docs/zh-CN/api-reference'),
      { recursive: true },
    );
    await fs.writeFile(
      path.join(repoRoot, 'content/docs/zh-CN/api-reference/overview.mdx'),
      'old overview\n',
    );
    await fs.writeFile(
      path.join(repoRoot, 'content/docs/zh-CN/api-reference/meta.json'),
      JSON.stringify({ title: '参考中心', root: true, pages: ['old'] }),
    );
    const lanes = [
      {
        id: 'speech-fixture',
        parentUrl: {
          en: '/en/api-reference/api-ref/speech-to-text',
          'zh-CN': '/zh-CN/api-reference/api-ref/speech-to-text',
        },
        sourcePath: {
          en: 'content/openapi/speech.yaml',
          'zh-CN': 'content/openapi/speech.yaml',
        },
        operations: { join: { routeLeaf: 'join' } },
      },
    ];

    const result = await runApiCenterNavigation({
      repoRoot,
      manifestPath,
      lanes,
    });
    const overview = await fs.readFile(
      path.join(repoRoot, 'content/docs/zh-CN/api-reference/overview.mdx'),
      'utf8',
    );
    const rootMeta = JSON.parse(
      await fs.readFile(
        path.join(repoRoot, 'content/docs/zh-CN/api-reference/meta.json'),
        'utf8',
      ),
    );
    const rtcMeta = JSON.parse(
      await fs.readFile(
        path.join(
          repoRoot,
          'content/docs/zh-CN/api-reference/rtc/android/(current)/meta.json',
        ),
        'utf8',
      ),
    );
    const speechMeta = JSON.parse(
      await fs.readFile(
        path.join(
          repoRoot,
          'content/docs/zh-CN/api-reference/api-ref/speech-to-text/meta.json',
        ),
        'utf8',
      ),
    );

    expect(result.report.counts).toMatchObject({ errors: 0, warnings: 0 });
    expect(result.parity.counts).toMatchObject({
      entries: 4,
      overviewActions: 4,
      rootActions: 3,
      collapsedRootDuplicates: 1,
      visibleNavigationLeaves: 4,
      missingNavigationTargets: 0,
      errors: 0,
    });
    expect(overview.indexOf('实时互动 RTC')).toBeLessThan(
      overview.indexOf('即时通讯 IM'),
    );
    expect(overview).toContain('https://im.shengwang.cn/docs/sdk/web.html');
    expect(rootMeta.root).toBe(true);
    expect(rootMeta.pages).toContain('api-ref');
    expect(rootMeta.pages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: '实时互动 RTC' }),
        expect.objectContaining({ title: '实时转录翻译' }),
      ]),
    );
    expect(JSON.stringify(rootMeta.pages)).toContain(
      '[Android / iOS](./rtc/android/overview)',
    );
    expect(rtcMeta.pages).toEqual([
      '[概览](./overview)',
      '---核心接口---',
      '[客户端](./client)',
      '[客户端组件 API](/zh-CN/api-reference/conversational-ai/android/overview)',
    ]);
    expect(speechMeta.pages[0]).toBe('index');
    expect(speechMeta.pages).toContain('---服务端 API---');
    expect(speechMeta.pages).toContain('join');
    expect(
      await fs.readFile(
        path.join(
          repoRoot,
          'content/docs/zh-CN/api-reference/api-ref/speech-to-text/index.mdx',
        ),
        'utf8',
      ),
    ).toContain('[开始转写](/zh-CN/api-reference/api-ref/speech-to-text/join)');

    await expect(
      runApiCenterNavigation({
        repoRoot,
        manifestPath,
        lanes,
        mode: 'check',
      }),
    ).resolves.toBeTruthy();
    const { report: audit } = await auditApiCenterMigration({
      repoRoot,
      ownershipPath:
        'docs/migration/api-center-navigation-generated-files.json',
    });
    expect(audit.counts).toMatchObject({ errors: 0, metaFiles: 3 });
  });
});
