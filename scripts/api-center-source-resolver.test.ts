import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { resolveExistingApiCenterTarget } from './lib/api-center/existing-targets.mjs';
import {
  buildPathMapIndex,
  oxygenTocTargetIndex,
  parseCsv,
  parseOxygenNavigationHtml,
  resolveLegacyPage,
  resolveManifestSources,
} from './lib/api-center/source-resolver.mjs';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  );
});

function baseIndex() {
  return {
    oldRoot: '/legacy',
    manualSpecific: new Map(),
    manualGeneric: new Map(),
    platforms: new Map([
      [
        'api-ref/rtc/android',
        {
          platformMeta: { docType: 'oxygen' },
        },
      ],
    ]),
    generatedFiles: new Map([
      [
        'api-ref/rtc/android',
        new Map([
          [
            'api/class_client.html',
            {
              absolute: '/legacy/html-docs/rtc/Android/API/Class_Client.html',
              relative: 'API/Class_Client.html',
            },
          ],
          [
            'index.html',
            {
              absolute: '/legacy/html-docs/rtc/Android/index.html',
              relative: 'index.html',
            },
          ],
        ]),
      ],
    ]),
    generatedTocTargets: new Map(),
    yamlFiles: new Map(),
  };
}

const noPathMap = buildPathMapIndex([]);

async function resolve(
  sourceIndex: ReturnType<typeof baseIndex>,
  relative: string,
) {
  return resolveLegacyPage({
    page: {
      requestedUrl: `https://doc.shengwang.cn/api-ref/rtc/android/${relative}`,
      status: 'resolved',
    },
    sourceIndex,
    pathMap: noPathMap,
    lanes: [],
    newRoot: '/new',
  });
}

describe('API Center source resolver', () => {
  it('adds the complete Edu Store TypeDoc trees with portable source paths', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'api-center-edu-store-source-'),
    );
    temporaryDirectories.push(root);
    const oldRoot = path.join(root, 'legacy');
    const newRoot = path.join(root, 'portal');
    for (const folder of ['docs-api-reference', 'docs']) {
      await fs.mkdir(path.join(oldRoot, folder), { recursive: true });
      await fs.writeFile(
        path.join(oldRoot, folder, '_products_.meta.js'),
        'module.exports = [];\n',
      );
    }
    for (const sourcePlatform of ['Web', 'Electron']) {
      const sourceRoot = path.join(
        oldRoot,
        'html-docs/flexible-classroom',
        sourcePlatform,
      );
      await fs.mkdir(path.join(sourceRoot, 'classes'), { recursive: true });
      await fs.writeFile(
        path.join(sourceRoot, 'index.html'),
        '<main>Index</main>',
      );
      await fs.writeFile(
        path.join(sourceRoot, 'classes/cloud-drive.html'),
        '<main>CloudDriveStore</main>',
      );
    }
    const manifest: {
      entries: unknown[];
      pageEvidence: unknown[];
      sourceResolutionSummary?: {
        classifiedPageCount: number;
        unresolvedPageCount: number;
      };
    } = { entries: [], pageEvidence: [] };

    await resolveManifestSources(manifest, {
      oldRoot,
      newRoot,
      pathMapRows: [],
      lanes: [],
    });

    expect(manifest.pageEvidence).toHaveLength(4);
    expect(manifest.sourceResolutionSummary).toMatchObject({
      classifiedPageCount: 4,
      unresolvedPageCount: 0,
    });
    expect(manifest.pageEvidence).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          requestedUrl:
            'https://doc.shengwang.cn/api-ref/flexible-classroom/javascript/overview',
          adoptExisting: true,
          sourceResolution: expect.objectContaining({
            sourcePath: 'html-docs/flexible-classroom/Web/index.html',
            targetPath:
              'content/docs/zh-CN/api-reference/flexible-classroom/web/api-reference/edu-store.mdx',
          }),
        }),
        expect.objectContaining({
          requestedUrl:
            'https://doc.shengwang.cn/api-ref/flexible-classroom/electron/classes/cloud-drive.html',
          sourceResolution: expect.objectContaining({
            sourcePath:
              'html-docs/flexible-classroom/Electron/classes/cloud-drive.html',
            targetRoute:
              '/zh-CN/api-reference/flexible-classroom/electron/api-reference/edu-store/classes/cloud-drive',
          }),
        }),
      ]),
    );
    expect(JSON.stringify(manifest)).not.toContain(oldRoot);
  });

  it.each([
    [
      '/api-ref/meeting/ios/client-api',
      'content/docs/zh-CN/api-reference/meeting/client-api.mdx',
      '/zh-CN/api-reference/meeting/ios',
    ],
    [
      '/api-ref/fastboard/javascript/fastboard-api',
      'content/docs/zh-CN/api-reference/whiteboard/fastboard/fastboard-api.mdx',
      '/zh-CN/api-reference/whiteboard/fastboard/web',
    ],
    [
      '/api-ref/rtm2/harmonyos/toc-configuration/configuration',
      'content/docs/zh-CN/api-reference/rtm/toc-configuration/configuration.mdx',
      '/zh-CN/api-reference/rtm/harmonyos/configuration',
    ],
    [
      '/api-ref/rtm2/android/toc-message/enum',
      'content/docs/zh-CN/api-reference/rtm/android/enumv.mdx',
      '/zh-CN/api-reference/rtm/android/enumv',
    ],
    [
      '/doc/console/general/user-guides/manage_authentication',
      'content/docs/zh-CN/introduction/user-guides/manage-authentication.mdx',
      '/zh-CN/introduction/user-guides/manage-authentication',
    ],
    [
      '/basics/security/video-sdk',
      'content/docs/zh-CN/introduction/security/sdk-compliance/video-sdk.mdx',
      '/zh-CN/introduction/security/sdk-compliance/video-sdk',
    ],
    [
      '/basics/security/voice-sdk',
      'content/docs/zh-CN/introduction/security/sdk-compliance/voice-sdk.mdx',
      '/zh-CN/introduction/security/sdk-compliance/voice-sdk',
    ],
  ])('resolves merged platform source %s to its rendered platform route', (legacyPath, targetPath, targetRoute) => {
    expect(resolveExistingApiCenterTarget(legacyPath)).toEqual({
      targetPath,
      targetRoute,
    });
  });

  it('parses quoted CSV fields without losing commas', () => {
    expect(
      parseCsv('source_path,target_path,notes\r\na.mdx,b.mdx,"one, two"\r\n'),
    ).toEqual([
      { source_path: 'a.mdx', target_path: 'b.mdx', notes: 'one, two' },
    ]);
  });

  it('freezes the complete Oxygen navigation hierarchy from the source HTML', () => {
    const navigation = parseOxygenNavigationHtml({
      legacyUrl:
        'https://doc.shengwang.cn/api-ref/rtc/android/API/rtc_api_overview',
      html: `
        <nav class="toc">
          <ul><li><span>Android API Reference</span><ul>
            <li><a href="../API/rtc_api_overview.html">API 概览</a></li>
            <li><a href="../API/toc_audio.html">音频功能</a><ul>
              <li><a href="../API/toc_audio_basic.html">音频基础功能</a></li>
              <li><a href="../API/toc_audio_capture.html">音频采集</a></li>
            </ul></li>
          </ul></li></ul>
        </nav>
      `,
    });

    expect(navigation).toEqual([
      {
        excludedReason: null,
        kind: 'link',
        label: 'API 概览',
        link: expect.objectContaining({
          path: '/api-ref/rtc/android/API/rtc_api_overview',
        }),
      },
      {
        items: [
          expect.objectContaining({
            kind: 'link',
            label: '音频基础功能',
            link: expect.objectContaining({
              path: '/api-ref/rtc/android/API/toc_audio_basic',
            }),
          }),
          expect.objectContaining({ kind: 'link', label: '音频采集' }),
        ],
        kind: 'category',
        label: '音频功能',
        link: expect.objectContaining({
          path: '/api-ref/rtc/android/API/toc_audio',
        }),
      },
    ]);
  });

  it('lets platform-specific MDX override generated HTML', async () => {
    const sourceIndex = baseIndex();
    sourceIndex.manualSpecific.set('api-ref/rtc/android/api/class_client', [
      {
        sourcePath: 'docs-api-reference/rtc/API/class_client.android.mdx',
        sourceAbsolutePath:
          '/legacy/docs-api-reference/rtc/API/class_client.android.mdx',
        override: 'platform-specific',
      },
    ]);

    const result = await resolve(sourceIndex, 'API/class_client');

    expect(result).toMatchObject({
      status: 'resolved',
      type: 'manual-mdx',
      override: 'platform-specific',
    });
  });

  it('uses generated HTML before generic MDX and resolves source case-insensitively', async () => {
    const sourceIndex = baseIndex();
    sourceIndex.manualGeneric.set('api-ref/rtc/android/api/class_client', [
      {
        sourcePath: 'docs-api-reference/rtc/API/class_client.mdx',
        sourceAbsolutePath:
          '/legacy/docs-api-reference/rtc/API/class_client.mdx',
        override: 'generic-fallback',
      },
    ]);

    const result = await resolve(sourceIndex, 'API/class_client');

    expect(result).toMatchObject({
      status: 'resolved',
      type: 'generated-html',
      generator: 'oxygen',
      sourcePath: 'html-docs/rtc/Android/API/Class_Client.html',
    });
  });

  it('uses generic MDX only when no generated page exists', async () => {
    const sourceIndex = baseIndex();
    sourceIndex.manualGeneric.set('api-ref/rtc/android/guides/setup', [
      {
        sourcePath: 'docs-api-reference/rtc/guides/setup.mdx',
        sourceAbsolutePath: '/legacy/docs-api-reference/rtc/guides/setup.mdx',
        override: 'generic-fallback',
      },
    ]);

    const result = await resolve(sourceIndex, 'guides/setup');

    expect(result).toMatchObject({
      status: 'resolved',
      type: 'manual-mdx',
      override: 'generic-fallback',
    });
  });

  it('prefers an existing current-layout MDX over a stale path-map target', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'api-center-current-'),
    );
    temporaryDirectories.push(root);
    const currentTarget = path.join(
      root,
      'content/docs/zh-CN/api-reference/rtc/android/guides/setup.mdx',
    );
    await fs.mkdir(path.dirname(currentTarget), { recursive: true });
    await fs.writeFile(currentTarget, '---\ntitle: Setup\n---\n');
    const sourceIndex = baseIndex();
    sourceIndex.manualGeneric.set('api-ref/rtc/android/guides/setup', [
      {
        sourcePath: 'docs-api-reference/rtc/guides/setup.mdx',
        sourceAbsolutePath: '/legacy/docs-api-reference/rtc/guides/setup.mdx',
        override: 'generic-fallback',
      },
    ]);
    const pathMap = buildPathMapIndex([
      {
        source_path: 'docs-api-reference/rtc/guides/setup.mdx',
        target_path:
          'content/docs/zh-CN/api-reference/rtc/stale-setup-location.mdx',
      },
    ]);

    const result = await resolveLegacyPage({
      page: {
        requestedUrl:
          'https://doc.shengwang.cn/api-ref/rtc/android/guides/setup',
        status: 'resolved',
      },
      sourceIndex,
      pathMap,
      lanes: [],
      newRoot: root,
    });

    expect(result).toMatchObject({
      targetPath:
        'content/docs/zh-CN/api-reference/rtc/android/guides/setup.mdx',
      targetExists: true,
      targetDecision: 'existing-target-layout-over-stale-path-map',
    });
  });

  it('reuses the canonical ConvoAI REST client MDX instead of generating a duplicate tree', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'api-center-convoai-'),
    );
    temporaryDirectories.push(root);
    const canonicalTarget = path.join(
      root,
      'content/docs/zh-CN/api-reference/conversational-ai/restclient-go/overview.mdx',
    );
    await fs.mkdir(path.dirname(canonicalTarget), { recursive: true });
    await fs.writeFile(canonicalTarget, '---\ntitle: API 概览\n---\n');
    const sourceIndex = baseIndex();
    sourceIndex.platforms.set('api-ref/convoai/go', {
      platformMeta: { docType: 'manual' },
    });
    sourceIndex.manualSpecific.set('api-ref/convoai/go/go-api/overview', [
      {
        sourcePath: 'docs-api-reference/convoai/go-api/overview.go.mdx',
        sourceAbsolutePath: '/legacy/convoai/overview.go.mdx',
        override: 'platform-specific',
      },
    ]);
    const pathMap = buildPathMapIndex([
      {
        source_path: 'docs-api-reference/convoai/go-api/overview.go.mdx',
        target_path:
          'content/docs/zh-CN/api-reference/conversational-ai/client-toolkit/overview.go.mdx',
      },
    ]);

    const result = await resolveLegacyPage({
      page: {
        requestedUrl:
          'https://doc.shengwang.cn/api-ref/convoai/go/go-api/overview',
        status: 'resolved',
      },
      sourceIndex,
      pathMap,
      lanes: [],
      newRoot: root,
    });

    expect(result).toMatchObject({
      targetPath:
        'content/docs/zh-CN/api-reference/conversational-ai/restclient-go/overview.mdx',
      targetRoute:
        '/zh-CN/api-reference/conversational-ai/restclient-go/overview',
      targetExists: true,
      migrationAction: 'audit-existing-target',
    });
  });

  it('falls back to the API Reference tree when an external path-map target is missing', async () => {
    const sourceIndex = baseIndex();
    sourceIndex.manualGeneric.set('api-ref/rtc/android/guides/setup', [
      {
        sourcePath: 'docs-api-reference/rtc/guides/setup.mdx',
        sourceAbsolutePath: '/legacy/docs-api-reference/rtc/guides/setup.mdx',
        override: 'generic-fallback',
      },
    ]);
    const pathMap = buildPathMapIndex([
      {
        source_path: 'docs-api-reference/rtc/guides/setup.mdx',
        target_path: 'content/docs/zh-CN/realtime-media/rtc/setup.mdx',
        new_url: '/zh-CN/realtime-media/rtc/setup',
      },
    ]);

    const result = await resolveLegacyPage({
      page: {
        requestedUrl:
          'https://doc.shengwang.cn/api-ref/rtc/android/guides/setup',
        status: 'resolved',
      },
      sourceIndex,
      pathMap,
      lanes: [],
      newRoot: '/new',
    });

    expect(result).toMatchObject({
      targetPath:
        'content/docs/zh-CN/api-reference/rtc/android/guides/setup.mdx',
      targetRoute: '/zh-CN/api-reference/rtc/android/guides/setup',
      targetDecision: 'api-reference-fallback-over-missing-external-path-map',
    });
  });

  it('recognizes an existing MDX alternate for a stale .md target extension', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'api-center-extension-'),
    );
    temporaryDirectories.push(root);
    const actualTarget = path.join(
      root,
      'content/docs/zh-CN/api-reference/rtc/android/guides/setup.mdx',
    );
    await fs.mkdir(path.dirname(actualTarget), { recursive: true });
    await fs.writeFile(actualTarget, '---\ntitle: Setup\n---\n');
    const sourceIndex = baseIndex();
    sourceIndex.manualGeneric.set('api-ref/rtc/android/guides/setup', [
      {
        sourcePath: 'docs-api-reference/rtc/guides/setup.mdx',
        sourceAbsolutePath: '/legacy/docs-api-reference/rtc/guides/setup.mdx',
        override: 'generic-fallback',
      },
    ]);
    const pathMap = buildPathMapIndex([
      {
        source_path: 'docs-api-reference/rtc/guides/setup.mdx',
        target_path:
          'content/docs/zh-CN/api-reference/rtc/android/guides/setup.md',
        new_url: '/zh-CN/api-reference/rtc/android/guides/setup',
      },
    ]);

    const result = await resolveLegacyPage({
      page: {
        requestedUrl:
          'https://doc.shengwang.cn/api-ref/rtc/android/guides/setup',
        status: 'resolved',
      },
      sourceIndex,
      pathMap,
      lanes: [],
      newRoot: root,
    });

    expect(result).toMatchObject({
      targetPath:
        'content/docs/zh-CN/api-reference/rtc/android/guides/setup.mdx',
      targetExists: true,
      targetDecision: 'path-map-alternate-extension',
    });
  });

  it('maps generated overview pages back to index.html', async () => {
    const result = await resolve(baseIndex(), 'overview');

    expect(result).toMatchObject({
      status: 'resolved',
      sourcePath: 'html-docs/rtc/Android/index.html',
    });
  });

  it('derives nested Oxygen target folders from the legacy platform TOC', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'api-center-oxygen-'));
    temporaryDirectories.push(root);
    await fs.writeFile(
      path.join(root, 'index.html'),
      `<nav><ul class="map"><li>Android API Reference<ul>
        <li><a href="API/toc_audio.html">音频功能</a><ul>
          <li><a href="API/toc_audio_basic.html">音频基础功能</a></li>
        </ul></li>
        <li><a href="API/toc_network.html">网络及其他</a></li>
      </ul></li></ul></nav>`,
    );

    const targets = await oxygenTocTargetIndex(root);

    expect(targets.get('api/toc_audio.html')).toBe('audio/index');
    expect(targets.get('api/toc_audio_basic.html')).toBe('audio/audio-basic');
    expect(targets.get('api/toc_network.html')).toBe('network');
  });

  it('reports same-priority MDX collisions as ambiguous', async () => {
    const sourceIndex = baseIndex();
    sourceIndex.manualSpecific.set('api-ref/rtc/android/guides/setup', [
      { sourcePath: 'first.android.mdx' },
      { sourcePath: 'second.android.mdx' },
    ]);

    const result = await resolve(sourceIndex, 'guides/setup');

    expect(result).toMatchObject({
      status: 'ambiguous',
      candidates: ['first.android.mdx', 'second.android.mdx'],
    });
  });

  it('maps legacy OpenAPI operation IDs to registered target operations by method and path', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'api-center-source-'));
    temporaryDirectories.push(root);
    const oldYaml = path.join(root, 'legacy.yaml');
    const newYaml = path.join(root, 'new.yaml');
    await fs.writeFile(
      oldYaml,
      'openapi: 3.0.0\ninfo: {title: Old, version: 1}\npaths:\n  /v1/items/{itemId}:\n    get:\n      operationId: get-v1-item\n      responses: {"200": {description: ok}}\n',
    );
    await fs.writeFile(
      newYaml,
      'openapi: 3.0.0\ninfo: {title: New, version: 1}\npaths:\n  /v1/items/{id}:\n    get:\n      operationId: get-item\n      responses: {"200": {description: ok}}\n',
    );
    const sourceIndex = {
      ...baseIndex(),
      oldRoot: root,
      platforms: new Map([
        ['doc/example/restful', { platformMeta: { docType: 'restful' } }],
      ]),
      yamlFiles: new Map([
        [
          'doc/example/restful',
          [
            {
              absolute: oldYaml,
              relative: 'example.yaml',
            },
          ],
        ],
      ]),
    };
    const lane = {
      id: 'example-rest',
      parentUrl: { 'zh-CN': '/zh-CN/api-reference/api-ref/example' },
      routePrefix: 'api-reference/api-ref/example',
      sourcePath: { 'zh-CN': path.relative(process.cwd(), newYaml) },
      operations: {
        'get-item': { routeLeaf: 'get-item' },
      },
    };

    const result = await resolveLegacyPage({
      page: {
        requestedUrl:
          'https://doc.shengwang.cn/doc/example/restful/example/operations/get-v1-item',
        status: 'resolved',
      },
      sourceIndex,
      pathMap: noPathMap,
      lanes: [lane],
      newRoot: process.cwd(),
    });

    expect(result).toMatchObject({
      status: 'resolved',
      type: 'openapi',
      legacyOperationId: 'get-v1-item',
      targetOperationId: 'get-item',
      targetRoute: '/zh-CN/api-reference/api-ref/example/get-item',
    });
  });

  it('excludes broken live body links instead of inventing a source', async () => {
    const result = await resolveLegacyPage({
      page: {
        requestedUrl:
          'https://doc.shengwang.cn/api-ref/rtc/android/API/missing',
        status: 'warning',
        warnings: [{ code: 'broken-live-body-link' }],
      },
      sourceIndex: baseIndex(),
      pathMap: noPathMap,
      lanes: [],
      newRoot: '/new',
    });

    expect(result).toMatchObject({
      status: 'excluded',
      type: 'broken-live-link',
    });
  });
});
