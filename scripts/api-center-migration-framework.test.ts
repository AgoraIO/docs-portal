import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  ApiCenterMigrationRun,
  assertApiCenterOutputPath,
  buildLegacyRouteMap,
  renderCallout,
  renderCodeFence,
  renderGeneratedMdx,
  renderSimpleTable,
  rewriteLegacyHref,
} from './lib/api-center/migration-framework.mjs';

const temporaryDirectories: string[] = [];

async function temporaryRepo() {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), 'api-center-framework-'),
  );
  temporaryDirectories.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  );
});

const manifest = {
  source: { commit: 'legacy-commit' },
  live: { capturedAt: '2026-07-16T00:00:00.000Z' },
};

describe('API Center shared migration framework', () => {
  it('allows only generated API Reference MDX/meta and asset paths', () => {
    expect(
      assertApiCenterOutputPath(
        '/repo',
        'content/docs/zh-CN/api-reference/rtc/android/page.mdx',
      ).relative,
    ).toBe('content/docs/zh-CN/api-reference/rtc/android/page.mdx');
    expect(() =>
      assertApiCenterOutputPath('/repo', 'content/docs/zh-CN/index.mdx'),
    ).toThrow('outside allowlist');
    expect(() => assertApiCenterOutputPath('/repo', '../outside.mdx')).toThrow(
      'outside repository',
    );
  });

  it('renders Markdown-native callouts, code fences, and simple tables', () => {
    expect(
      renderCallout({
        type: 'danger',
        title: '注意',
        body: '停止后不可恢复。',
      }),
    ).toBe(':::error[注意]\n停止后不可恢复。\n:::');
    expect(
      renderCallout({
        type: 'caution',
        title: '注意',
        body: '继续操作前请检查配置。',
      }),
    ).toBe(':::caution[注意]\n继续操作前请检查配置。\n:::');
    expect(renderCodeFence('const value = `x`;', 'typescript')).toContain(
      '```ts\n',
    );
    expect(renderSimpleTable(['A', 'B'], [['x|y', '<value>']])).toContain(
      '| x\\|y | &lt;value&gt; |',
    );
  });

  it('puts migration status and warning details in MDX frontmatter', () => {
    const content = renderGeneratedMdx({
      title: 'Client',
      body: '正文。',
      migration: {
        type: 'generated-html',
        sourceUrl: 'https://doc.shengwang.cn/api-ref/rtc/web/client',
        sourcePath: 'html-docs/rtc/Web/classes/Client.html',
        generator: 'typedoc',
        warnings: [
          {
            code: 'unresolved-link',
            severity: 'warning',
            message: 'No local route.',
          },
        ],
      },
    });

    expect(content).toContain('_migration:');
    expect(content).toContain('status: warning');
    expect(content).toContain('code: unresolved-link');
    expect(content).toContain('\n---\n\n正文。\n');
  });

  it('does not add a blank line after frontmatter for an empty page', () => {
    const content = renderGeneratedMdx({
      title: 'Empty generated page',
      body: '',
      migration: {
        type: 'generated-html',
        sourceUrl: 'https://doc.shengwang.cn/api-ref/example/empty',
        sourcePath: 'html-docs/example/empty.html',
        generator: 'typedoc',
        warnings: [],
      },
    });

    expect(content).toMatch(/\n---\n$/);
    expect(content).not.toMatch(/\n---\n\n$/);
  });

  it('rewrites old-site links through a local route map and preserves externals', () => {
    const routeMap = new Map([
      [
        '/api-ref/rtc/web/classes/client',
        '/zh-CN/api-reference/rtc/web/classes/client',
      ],
    ]);
    expect(
      rewriteLegacyHref('/api-ref/rtc/web/classes/client#join', {
        sourceUrl: 'https://doc.shengwang.cn/api-ref/rtc/web/overview',
        routeMap,
      }),
    ).toMatchObject({
      href: '/zh-CN/api-reference/rtc/web/classes/client#join',
      warning: null,
    });
    expect(
      rewriteLegacyHref('https://example.com/page', {
        sourceUrl: 'https://doc.shengwang.cn/api-ref/rtc/web/overview',
        routeMap,
      }).href,
    ).toBe('https://example.com/page');
    expect(
      rewriteLegacyHref('#//api/name/)', {
        sourceUrl:
          'https://doc.shengwang.cn/api-ref/whiteboard/ios/Classes/Foo',
        routeMap: new Map([
          [
            '/api-ref/whiteboard/ios/Classes/Foo',
            '/zh-CN/api-reference/whiteboard/ios/classes/foo',
          ],
        ]),
      }).href,
    ).toBe('/zh-CN/api-reference/whiteboard/ios/classes/foo#//api/name/%29');
  });

  it('repairs platformized and empty-platform legacy routes before lookup', () => {
    const routeMap = new Map([
      [
        '/api-ref/rtc/android/API/rtc_api_overview',
        '/zh-CN/api-reference/rtc/android/rtc-api-overview',
      ],
      [
        '/doc/rtc/billing/billing-strategy',
        '/zh-CN/realtime-media/rtc/reference/billing-strategy',
      ],
    ]);

    expect(
      rewriteLegacyHref('/api-ref/rtc//API/rtc_api_overview', {
        sourceUrl:
          'https://doc.shengwang.cn/doc/art-class/android/api/correction',
        routeMap,
      }).href,
    ).toBe('/zh-CN/api-reference/rtc/android/rtc-api-overview');
    expect(
      rewriteLegacyHref(
        'https://doc.shengwang.cn/doc/rtc/android/billing/billing-strategy',
        {
          sourceUrl: 'https://doc.shengwang.cn/api-ref/rtc/android/overview',
          routeMap,
        },
      ).href,
    ).toBe('/zh-CN/realtime-media/rtc/reference/billing-strategy');
  });

  it('does not preserve unresolved historical docs domains as external links', () => {
    expect(
      rewriteLegacyHref('https://docs.agora.io/cn/Recording/token_server', {
        sourceUrl: 'https://doc.shengwang.cn/api-ref/recording/cpp/overview',
        routeMap: new Map(),
      }),
    ).toMatchObject({ href: null, warning: { code: 'unresolved-link' } });
    expect(
      rewriteLegacyHref(
        'https://docs.agora.io/cn/Agora%20Platform/ticket?platform=All%20Platforms',
        {
          sourceUrl: 'https://doc.shengwang.cn/api-center',
          routeMap: new Map(),
        },
      ).href,
    ).toBe('https://ticket.shengwang.cn/');
  });

  it('prefers already-migrated canonical ConvoAI pages over stale path-map targets', () => {
    const routeMap = new Map([
      [
        '/api-ref/convoai/android/android-component/iconversationalaiapi',
        '/zh-CN/api-reference/conversational-ai/client-toolkit/iconversationalaiapi',
      ],
      [
        '/api-ref/convoai/go/go-api/overview',
        '/zh-CN/api-reference/conversational-ai/client-toolkit/overview.go',
      ],
    ]);

    expect(
      rewriteLegacyHref(
        '/api-ref/convoai/android/android-component/iconversationalaiapi#destroy',
        {
          sourceUrl: 'https://doc.shengwang.cn/doc/convoai/restful/overview',
          routeMap,
        },
      ).href,
    ).toBe(
      '/zh-CN/api-reference/conversational-ai/android/iconversationalaiapi#destroy',
    );
    expect(
      rewriteLegacyHref('/api-ref/convoai/go/go-api/overview', {
        sourceUrl: 'https://doc.shengwang.cn/api-center',
        routeMap,
      }).href,
    ).toBe('/zh-CN/api-reference/conversational-ai/restclient-go/overview');
    expect(
      rewriteLegacyHref(
        '/zh-CN/realtime-media/rtc/build/security-and-auth/firewall',
        {
          sourceUrl: 'https://doc.shengwang.cn/api-center',
          routeMap,
        },
      ).href,
    ).toBe('/zh-CN/realtime-media/rtc/build/setup-and-access/firewall');
  });

  it('rewrites Shengwang and Agora legacy FAQ aliases to migrated local FAQ pages', () => {
    const routeMap = buildLegacyRouteMap(
      { pageEvidence: [] },
      [],
      [
        {
          sourceSlug: 'string-uid',
          targetPath:
            'content/docs/zh-CN/api-reference/faq/integration/string_uid.mdx',
        },
      ],
    );

    for (const href of [
      '/faq/integration-issues/string-uid',
      'https://docs.agora.io/cn/live-streaming-premium-4.x/faq/string',
    ]) {
      expect(
        rewriteLegacyHref(href, {
          sourceUrl: 'https://doc.shengwang.cn/api-ref/rtc/web/client',
          routeMap,
        }),
      ).toEqual({
        href: '/zh-CN/api-reference/faq/integration/string_uid',
        warning: null,
      });
    }
  });

  it('preserves unowned targets and records the warning in both reports', async () => {
    const repoRoot = await temporaryRepo();
    const target = 'content/docs/zh-CN/api-reference/rtc/android/existing.mdx';
    await fs.mkdir(path.dirname(path.join(repoRoot, target)), {
      recursive: true,
    });
    await fs.writeFile(path.join(repoRoot, target), 'user content\n');
    const run = await ApiCenterMigrationRun.create({ repoRoot, manifest });
    run.planFile({
      targetPath: target,
      contents: 'generated content\n',
      sourcePath: 'legacy.html',
      sourceUrl: 'https://doc.shengwang.cn/legacy',
      type: 'generated-html',
    });

    const report = await run.finish();

    expect(await fs.readFile(path.join(repoRoot, target), 'utf8')).toBe(
      'user content\n',
    );
    expect(report.warningSummary['unowned-target-preserved'].count).toBe(1);
    expect(
      await fs.readFile(
        path.join(repoRoot, 'docs/migration/api-center-migration-report.md'),
        'utf8',
      ),
    ).toContain('unowned-target-preserved');
  });

  it('adopts an existing target only when the caller explicitly requests it', async () => {
    const repoRoot = await temporaryRepo();
    const target = 'content/docs/zh-CN/api-reference/meta.json';
    await fs.mkdir(path.dirname(path.join(repoRoot, target)), {
      recursive: true,
    });
    await fs.writeFile(path.join(repoRoot, target), '{"pages":["old"]}\n');
    const run = await ApiCenterMigrationRun.create({
      repoRoot,
      manifest,
      ownershipPath: 'docs/migration/navigation-ownership.json',
      reportJsonPath: 'docs/migration/navigation-report.json',
      reportMarkdownPath: 'docs/migration/navigation-report.md',
    });
    run.planFile({
      targetPath: target,
      contents: '{"pages":["overview"]}\n',
      sourcePath: 'api-center-manifest.json',
      sourceUrl: 'https://doc.shengwang.cn/api-center',
      type: 'navigation-meta',
      adoptExisting: true,
    });

    const report = await run.finish();

    expect(await fs.readFile(path.join(repoRoot, target), 'utf8')).toBe(
      '{"pages":["overview"]}\n',
    );
    expect(report.counts).toMatchObject({
      generatedFiles: 1,
      preservedExistingFiles: 0,
    });
  });

  it('writes owned files, is checkable, and removes only unchanged stale owned files', async () => {
    const repoRoot = await temporaryRepo();
    const target = 'content/docs/zh-CN/api-reference/rtc/web/client.mdx';
    const first = await ApiCenterMigrationRun.create({ repoRoot, manifest });
    first.planFile({
      targetPath: target,
      contents: 'generated\n',
      sourcePath: 'Client.html',
      sourceUrl: 'https://doc.shengwang.cn/client',
      type: 'generated-html',
    });
    await first.finish();

    const check = await ApiCenterMigrationRun.create({
      repoRoot,
      manifest,
      mode: 'check',
    });
    check.planFile({
      targetPath: target,
      contents: 'generated\n',
      sourcePath: 'Client.html',
      sourceUrl: 'https://doc.shengwang.cn/client',
      type: 'generated-html',
    });
    await expect(check.finish()).resolves.toMatchObject({
      counts: { generatedFiles: 1 },
    });

    const emptyRun = await ApiCenterMigrationRun.create({ repoRoot, manifest });
    const report = await emptyRun.finish();
    expect(report.counts.removedOwnedFiles).toBe(1);
    await expect(fs.access(path.join(repoRoot, target))).rejects.toThrow();
  });

  it('never deletes a stale owned file that was changed outside the generator', async () => {
    const repoRoot = await temporaryRepo();
    const target = 'content/docs/zh-CN/api-reference/rtc/web/client.mdx';
    const first = await ApiCenterMigrationRun.create({ repoRoot, manifest });
    first.planFile({
      targetPath: target,
      contents: 'generated\n',
      sourcePath: 'Client.html',
      sourceUrl: 'https://doc.shengwang.cn/client',
      type: 'generated-html',
    });
    await first.finish();
    await fs.writeFile(path.join(repoRoot, target), 'user edited\n');

    const emptyRun = await ApiCenterMigrationRun.create({ repoRoot, manifest });
    const report = await emptyRun.finish();

    expect(await fs.readFile(path.join(repoRoot, target), 'utf8')).toBe(
      'user edited\n',
    );
    expect(report.warningSummary['owned-file-modified'].count).toBe(1);
  });
});
