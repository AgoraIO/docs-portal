import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { runManualMdxMigration } from './lib/api-center/manual-mdx-runner.mjs';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  );
});

async function createFixture() {
  const repoRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), 'api-center-manual-mdx-'),
  );
  temporaryDirectories.push(repoRoot);
  const oldRoot = path.join(repoRoot, 'legacy');
  await fs.mkdir(path.join(repoRoot, 'docs/migration'), { recursive: true });
  await fs.writeFile(
    path.join(repoRoot, 'docs/migration/path-map.csv'),
    'source_path,target_path,migration_action,status,risk,batchable,blocked_reason,next_step,decision_refs\n',
  );
  return { oldRoot, repoRoot };
}

async function writeLegacyPage(
  oldRoot: string,
  sourcePath: string,
  content: string,
) {
  const absolute = path.join(oldRoot, sourcePath);
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(absolute, content);
}

async function writeManifest(repoRoot: string, pageEvidence: unknown[]) {
  await fs.writeFile(
    path.join(repoRoot, 'docs/migration/api-center-html-manifest.json'),
    JSON.stringify({
      source: { commit: 'legacy-fixture' },
      live: { capturedAt: '2026-07-16T00:00:00.000Z' },
      pageEvidence,
    }),
  );
}

async function writeManifestWithEntries(
  repoRoot: string,
  pageEvidence: unknown[],
  entries: unknown[],
) {
  await fs.writeFile(
    path.join(repoRoot, 'docs/migration/api-center-html-manifest.json'),
    JSON.stringify({
      source: { commit: 'legacy-fixture' },
      live: { capturedAt: '2026-07-16T00:00:00.000Z' },
      entries,
      pageEvidence,
    }),
  );
}

function manualPage({
  platform,
  requestedUrl,
  sourcePath,
  targetExists = false,
  targetPath,
}: {
  platform: string;
  requestedUrl: string;
  sourcePath: string;
  targetExists?: boolean;
  targetPath: string;
}) {
  return {
    requestedUrl,
    sourceResolution: {
      status: 'resolved',
      type: 'manual-mdx',
      sourcePath,
      targetPath,
      targetRoute: `/${targetPath
        .replace(/^content\/docs\//, '')
        .replace(/\.mdx$/, '')
        .replace(/\/index$/, '')}`,
      targetExists,
      route: { platform, scopeKey: `doc/rtc/${platform}` },
    },
  };
}

describe('API Center manual MDX runner', () => {
  it('substitutes runtime product and platform labels from the API Center source inventory', async () => {
    const { oldRoot, repoRoot } = await createFixture();
    const sourcePath = 'docs/cloud-recording/get-started/enable-service.mdx';
    const targetPath =
      'content/docs/zh-CN/api-reference/cloud-recording/restful/get-started/enable-service.mdx';
    const requestedUrl =
      'https://doc.shengwang.cn/doc/cloud-recording/restful/get-started/enable-service';
    await writeLegacyPage(
      oldRoot,
      sourcePath,
      `---\ntitle: 开通服务\n---\n\n本文介绍如何开通{frontMatter.ag_product_label}服务，并使用 {frontMatter.ag_platform_label} API。\n`,
    );
    const page = manualPage({
      platform: 'restful',
      requestedUrl,
      sourcePath,
      targetPath,
    });
    await writeManifestWithEntries(
      repoRoot,
      [page],
      [
        {
          product: '云端录制',
          label: 'RESTful',
          legacyUrl: requestedUrl,
          pageGraph: { pages: [{ url: requestedUrl }] },
        },
      ],
    );

    await runManualMdxMigration({ repoRoot, oldRoot });
    const output = await fs.readFile(path.join(repoRoot, targetPath), 'utf8');

    expect(output).toContain(
      '本文介绍如何开通云端录制服务，并使用 RESTful API。',
    );
    expect(output).not.toContain('cloud-recording服务');
  });

  it('migrates one legacy MDX page and rewrites old-site links locally', async () => {
    const { oldRoot, repoRoot } = await createFixture();
    const sourcePath = 'docs/rtc/overview.mdx';
    const targetPath =
      'content/docs/zh-CN/api-reference/rtc/android/overview.mdx';
    await writeLegacyPage(
      oldRoot,
      sourcePath,
      `---\ntitle: RTC 概览\n---\n\n正文。\n\n[目标页](/doc/rtc/android/target)\n`,
    );
    await writeManifest(repoRoot, [
      manualPage({
        platform: 'android',
        requestedUrl: 'https://doc.shengwang.cn/doc/rtc/android/overview',
        sourcePath,
        targetPath,
      }),
      {
        requestedUrl: 'https://doc.shengwang.cn/doc/rtc/android/target',
        sourceResolution: {
          status: 'resolved',
          type: 'generated-html',
          targetPath: 'content/docs/zh-CN/api-reference/rtc/android/target.mdx',
          targetRoute: '/zh-CN/api-reference/rtc/android/target',
          route: { platform: 'android', scopeKey: 'doc/rtc/android' },
        },
      },
    ]);

    const result = await runManualMdxMigration({
      repoRoot,
      oldRoot,
      mode: 'write',
    });
    const output = await fs.readFile(path.join(repoRoot, targetPath), 'utf8');

    expect(result.report.counts).toMatchObject({
      errors: 0,
      generatedFiles: 1,
    });
    expect(output).toContain('title: RTC 概览');
    expect(output).toContain(
      '[目标页](/zh-CN/api-reference/rtc/android/target)',
    );
    expect(output).toContain('type: manual-mdx');
    expect(output).toContain(`sourcePath: ${sourcePath}`);
  });

  it('rewrites relative OpenAPI links and nested-label links to canonical local targets', async () => {
    const { oldRoot, repoRoot } = await createFixture();
    const sourcePath = 'docs/convoai/user-guides/page.mdx';
    const targetPath =
      'content/docs/zh-CN/api-reference/conversational-ai/rest-api/user-guides/page.mdx';
    await writeLegacyPage(
      oldRoot,
      sourcePath,
      `---\ntitle: Guide\n---\n\n[创建 [1/2]](../convoai/operations/start-agent)\n\n[destroy](/api-ref/convoai/android/android-component/iconversationalaiapi#destroy)\n`,
    );
    await writeManifest(repoRoot, [
      manualPage({
        platform: 'restful',
        requestedUrl:
          'https://doc.shengwang.cn/doc/convoai/restful/user-guides/page',
        sourcePath,
        targetPath,
      }),
      {
        requestedUrl:
          'https://doc.shengwang.cn/doc/convoai/restful/convoai/operations/start-agent',
        sourceResolution: {
          status: 'resolved',
          type: 'openapi',
          targetPath: 'content/openapi/conversational-ai.yaml',
          targetRoute: '/zh-CN/api-reference/api-ref/conversational-ai/join',
          route: { platform: 'restful', scopeKey: 'doc/convoai/restful' },
        },
      },
    ]);

    await runManualMdxMigration({ repoRoot, oldRoot });
    const output = await fs.readFile(path.join(repoRoot, targetPath), 'utf8');

    expect(output).toContain(
      '[创建 [1/2]](/zh-CN/api-reference/api-ref/conversational-ai/join)',
    );
    expect(output).toContain(
      '[destroy](/zh-CN/api-reference/conversational-ai/android/iconversationalaiapi#destroy)',
    );
  });

  it('canonicalizes stale routes emitted by the legacy converter and trims link whitespace', async () => {
    const { oldRoot, repoRoot } = await createFixture();
    const sourcePath = 'docs/convoai/user-guides/auth.mdx';
    const targetPath =
      'content/docs/zh-CN/api-reference/conversational-ai/rest-api/user-guides/auth.mdx';
    await writeLegacyPage(
      oldRoot,
      sourcePath,
      `---\ntitle: Auth\n---\n\n[Token](https://doc.shengwang.cn/doc/rtc/android/basic-features/token-authentication)\n\n[IP](../cloud-recording/operations/get-v2-ncs-ip )\n`,
    );
    await writeManifest(repoRoot, [
      manualPage({
        platform: 'restful',
        requestedUrl:
          'https://doc.shengwang.cn/doc/convoai/restful/user-guides/auth',
        sourcePath,
        targetPath,
      }),
      {
        requestedUrl:
          'https://doc.shengwang.cn/doc/convoai/restful/cloud-recording/operations/get-v2-ncs-ip',
        sourceResolution: {
          status: 'resolved',
          type: 'openapi',
          targetPath: 'content/openapi/cloud-recording.yaml',
          targetRoute:
            '/zh-CN/api-reference/api-ref/cloud-recording/get-ncs-ip',
          route: { platform: 'restful', scopeKey: 'doc/convoai/restful' },
        },
      },
    ]);

    await runManualMdxMigration({ repoRoot, oldRoot });
    const output = await fs.readFile(path.join(repoRoot, targetPath), 'utf8');

    expect(output).toContain(
      '[Token](/zh-CN/realtime-media/rtc/build/setup-and-access/token-authentication)',
    );
    expect(output).toContain(
      '[IP](/zh-CN/api-reference/api-ref/cloud-recording/get-ncs-ip)',
    );
  });

  it('merges distinct platform sources into the shared PlatformStructured component', async () => {
    const { oldRoot, repoRoot } = await createFixture();
    const targetPath =
      'content/docs/zh-CN/api-reference/meeting/client-api/index.mdx';
    const androidSource = 'docs/meeting/client-api.android.mdx';
    const iosSource = 'docs/meeting/client-api.ios.mdx';
    await writeLegacyPage(
      oldRoot,
      androidSource,
      '---\ntitle: 客户端 API\n---\n\nAndroid 正文。\n',
    );
    await writeLegacyPage(
      oldRoot,
      iosSource,
      '---\ntitle: 客户端 API\n---\n\niOS 正文。\n',
    );
    await writeManifest(repoRoot, [
      manualPage({
        platform: 'android',
        requestedUrl: 'https://doc.shengwang.cn/doc/meeting/android/client-api',
        sourcePath: androidSource,
        targetPath,
      }),
      manualPage({
        platform: 'ios',
        requestedUrl: 'https://doc.shengwang.cn/doc/meeting/ios/client-api',
        sourcePath: iosSource,
        targetPath,
      }),
    ]);

    const result = await runManualMdxMigration({ repoRoot, oldRoot });
    const output = await fs.readFile(path.join(repoRoot, targetPath), 'utf8');

    expect(result.report.counts.errors).toBe(0);
    expect(output).toContain('<PlatformStructured platform="android">');
    expect(output).toContain('<PlatformStructured platform="ios">');
    expect(output).toContain('Android 正文。');
    expect(output).toContain('iOS 正文。');
    expect(output).toContain('code: manual-platform-merge');
  });

  it('preserves an existing unowned migration target', async () => {
    const { oldRoot, repoRoot } = await createFixture();
    const targetPath =
      'content/docs/zh-CN/api-reference/rtc/android/existing.mdx';
    await fs.mkdir(path.dirname(path.join(repoRoot, targetPath)), {
      recursive: true,
    });
    await fs.writeFile(path.join(repoRoot, targetPath), 'Existing body.\n');
    await writeManifest(repoRoot, [
      manualPage({
        platform: 'android',
        requestedUrl: 'https://doc.shengwang.cn/doc/rtc/android/existing',
        sourcePath: 'docs/rtc/existing.android.mdx',
        targetExists: true,
        targetPath,
      }),
    ]);

    const result = await runManualMdxMigration({ repoRoot, oldRoot });

    expect(await fs.readFile(path.join(repoRoot, targetPath), 'utf8')).toBe(
      'Existing body.\n',
    );
    expect(result.report.counts).toMatchObject({
      generatedFiles: 0,
      preservedExistingFiles: 1,
    });
  });
});
