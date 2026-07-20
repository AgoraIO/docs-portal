import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { runHtmlGenerators } from './lib/api-center/generator-runner.mjs';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  );
});

describe('API Center generated HTML runner', () => {
  it('uses generator-specific body/title selectors and writes only generated MDX', async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), 'api-center-generator-repo-'),
    );
    temporaryDirectories.push(repoRoot);
    const oldRoot = path.join(repoRoot, 'legacy');
    const sourcePath = 'html-docs/rtc/Web/interfaces/client.html';
    await fs.mkdir(path.dirname(path.join(oldRoot, sourcePath)), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(oldRoot, sourcePath),
      `<header><div class="tsd-page-title"><h1>Interface Client</h1></div></header>
       <div class="col-content"><p>Client body.</p><a name="join"></a><h2>Join</h2></div>`,
    );
    const manifest = {
      schemaVersion: 1,
      source: { commit: 'fixture' },
      pageEvidence: [
        {
          requestedUrl:
            'https://doc.shengwang.cn/api-ref/rtc/javascript/interfaces/client',
          title: 'Client fallback',
          sourceResolution: {
            status: 'resolved',
            type: 'generated-html',
            generator: 'typedoc',
            sourcePath,
            targetPath:
              'content/docs/zh-CN/api-reference/rtc/web/interfaces/client.mdx',
            targetRoute: '/zh-CN/api-reference/rtc/web/interfaces/client',
            targetExists: false,
            route: { scopeKey: 'api-ref/rtc/javascript' },
          },
        },
      ],
    };
    const manifestPath = path.join(
      repoRoot,
      'docs/migration/api-center-html-manifest.json',
    );
    await fs.mkdir(path.dirname(manifestPath), { recursive: true });
    await fs.writeFile(manifestPath, JSON.stringify(manifest));

    const result = await runHtmlGenerators({
      repoRoot,
      oldRoot,
      generators: ['typedoc'],
      mode: 'write',
    });

    const output = await fs.readFile(
      path.join(
        repoRoot,
        'content/docs/zh-CN/api-reference/rtc/web/interfaces/client.mdx',
      ),
      'utf8',
    );
    expect(result.report.counts).toMatchObject({
      generatedFiles: 1,
      errors: 0,
    });
    expect(output).toContain('title: Interface Client');
    expect(output).toContain('Client body.');
    expect(output).toContain('<a id="join"></a>');
    expect(output).toContain('## Join');
    expect(output).not.toContain('<header');
  });

  it('overwrites an existing zh-CN MDX target from its authoritative HTML source', async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), 'api-center-generator-existing-'),
    );
    temporaryDirectories.push(repoRoot);
    const oldRoot = path.join(repoRoot, 'legacy');
    const sourcePath = 'html-docs/rtc/Web/interfaces/existing.html';
    const targetPath =
      'content/docs/zh-CN/api-reference/rtc/web/interfaces/existing.mdx';
    await fs.mkdir(path.dirname(path.join(oldRoot, sourcePath)), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(oldRoot, sourcePath),
      `<div class="tsd-page-title"><h1>Existing API</h1></div>
       <div class="col-content">
         <p>Legacy generated body.</p>
         <div class="note"><ul><li><a href="#enable-local-audio">enableLocalAudio</a> controls capture.</li></ul></div>
         <h2 id="enable-local-audio">enableLocalAudio</h2>
       </div>`,
    );
    await fs.mkdir(path.dirname(path.join(repoRoot, targetPath)), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(repoRoot, targetPath),
      'Existing migrated body.\n',
    );
    const manifest = {
      pageEvidence: [
        {
          requestedUrl:
            'https://doc.shengwang.cn/api-ref/rtc/javascript/interfaces/existing',
          sourceResolution: {
            status: 'resolved',
            type: 'generated-html',
            generator: 'typedoc',
            sourcePath,
            targetPath,
            targetRoute: '/zh-CN/api-reference/rtc/web/interfaces/existing',
            targetExists: true,
            route: { scopeKey: 'api-ref/rtc/javascript' },
          },
        },
      ],
    };
    const manifestPath = path.join(
      repoRoot,
      'docs/migration/api-center-html-manifest.json',
    );
    await fs.mkdir(path.dirname(manifestPath), { recursive: true });
    await fs.writeFile(manifestPath, JSON.stringify(manifest));

    const result = await runHtmlGenerators({
      repoRoot,
      oldRoot,
      generators: ['typedoc'],
      mode: 'write',
    });

    const output = await fs.readFile(path.join(repoRoot, targetPath), 'utf8');
    expect(output).toContain('title: Existing API');
    expect(output).toContain('Legacy generated body.');
    expect(output).toContain(
      '[enableLocalAudio](/zh-CN/api-reference/rtc/web/interfaces/existing#enable-local-audio)',
    );
    expect(output).not.toContain('Existing migrated body.');
    expect(result.report.counts).toMatchObject({
      generatedFiles: 1,
      preservedExistingFiles: 0,
    });
  });

  it('normalizes fragments referenced across generated HTML pages', async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), 'api-center-generator-fragments-'),
    );
    temporaryDirectories.push(repoRoot);
    const oldRoot = path.join(repoRoot, 'legacy');
    const fixtures = [
      {
        generator: 'typedoc',
        sourcePath: 'html-docs/rtc/Web/overview.html',
        targetPath: 'content/docs/zh-CN/api-reference/rtc/web/overview.mdx',
        targetRoute: '/zh-CN/api-reference/rtc/web/overview',
        url: 'https://doc.shengwang.cn/api-ref/rtc/javascript/overview',
        html: `<div class="tsd-page-title"><h1>Overview</h1></div>
          <div class="col-content"><p>See <a href="capture.html#api_enableLocalAudio">enableLocalAudio</a> and <a href="capture.html#class_enable_local_audio_method">the legacy anchor</a>.</p></div>`,
      },
      {
        generator: 'doxygen',
        sourcePath: 'html-docs/rtc/Web/capture.html',
        targetPath: 'content/docs/zh-CN/api-reference/rtc/web/capture.mdx',
        targetRoute: '/zh-CN/api-reference/rtc/web/capture',
        url: 'https://doc.shengwang.cn/api-ref/rtc/javascript/capture',
        html: `<div class="headertitle"><div class="title">Capture</div></div>
          <div class="contents"><h2>enableLocalAudio</h2><p>Controls capture.</p></div>`,
      },
    ];
    for (const fixture of fixtures) {
      await fs.mkdir(path.dirname(path.join(oldRoot, fixture.sourcePath)), {
        recursive: true,
      });
      await fs.writeFile(path.join(oldRoot, fixture.sourcePath), fixture.html);
    }
    const manifestPath = path.join(
      repoRoot,
      'docs/migration/api-center-html-manifest.json',
    );
    await fs.mkdir(path.dirname(manifestPath), { recursive: true });
    await fs.writeFile(
      manifestPath,
      JSON.stringify({
        pageEvidence: fixtures.map((fixture) => ({
          requestedUrl: fixture.url,
          sourceResolution: {
            status: 'resolved',
            type: 'generated-html',
            generator: fixture.generator,
            sourcePath: fixture.sourcePath,
            targetPath: fixture.targetPath,
            targetRoute: fixture.targetRoute,
            targetExists: false,
            route: { scopeKey: 'api-ref/rtc/javascript' },
          },
        })),
      }),
    );

    await runHtmlGenerators({
      repoRoot,
      oldRoot,
      generators: ['typedoc', 'doxygen'],
      mode: 'write',
    });

    const overview = await fs.readFile(
      path.join(repoRoot, fixtures[0].targetPath),
      'utf8',
    );
    const capture = await fs.readFile(
      path.join(repoRoot, fixtures[1].targetPath),
      'utf8',
    );
    expect(overview).toContain(
      '[enableLocalAudio](/zh-CN/api-reference/rtc/web/capture#enablelocalaudio)',
    );
    expect(overview).toContain('code: generated-fragment-normalized');
    expect(capture).toContain('<a id="class_enable_local_audio_method"></a>');
    expect(capture).toContain('## enableLocalAudio');

    await runHtmlGenerators({
      repoRoot,
      oldRoot,
      generators: ['doxygen'],
      mode: 'write',
    });
    expect(
      await fs.readFile(path.join(repoRoot, fixtures[1].targetPath), 'utf8'),
    ).toContain('<a id="class_enable_local_audio_method"></a>');
  });

  it('collapses query variants onto one canonical generated target', async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), 'api-center-generator-alias-'),
    );
    temporaryDirectories.push(repoRoot);
    const oldRoot = path.join(repoRoot, 'legacy');
    const sourcePath = 'html-docs/rtc/Web/interfaces/client.html';
    const targetPath =
      'content/docs/zh-CN/api-reference/rtc/web/interfaces/client.mdx';
    await fs.mkdir(path.dirname(path.join(oldRoot, sourcePath)), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(oldRoot, sourcePath),
      '<div class="tsd-page-title"><h1>Client</h1></div><div class="col-content"><p>Body.</p></div>',
    );
    const baseResolution = {
      status: 'resolved',
      type: 'generated-html',
      generator: 'typedoc',
      sourcePath,
      targetPath,
      targetRoute: '/zh-CN/api-reference/rtc/web/interfaces/client',
      targetExists: false,
      route: { scopeKey: 'api-ref/rtc/javascript' },
    };
    const canonicalUrl =
      'https://doc.shengwang.cn/api-ref/rtc/javascript/interfaces/client';
    const manifest = {
      pageEvidence: [
        { requestedUrl: canonicalUrl, sourceResolution: baseResolution },
        {
          requestedUrl: `${canonicalUrl}?platform=All%20Platforms`,
          sourceResolution: baseResolution,
        },
      ],
    };
    const manifestPath = path.join(
      repoRoot,
      'docs/migration/api-center-html-manifest.json',
    );
    await fs.mkdir(path.dirname(manifestPath), { recursive: true });
    await fs.writeFile(manifestPath, JSON.stringify(manifest));

    const result = await runHtmlGenerators({
      repoRoot,
      oldRoot,
      generators: ['typedoc'],
      mode: 'write',
    });

    expect(result.report.counts.generatedFiles).toBe(1);
    expect(
      result.report.results.map((entry: { status: string }) => entry.status),
    ).toContain('alias');
    expect(
      await fs.readFile(path.join(repoRoot, targetPath), 'utf8'),
    ).toContain(`sourceUrl: ${canonicalUrl}`);
  });

  it('replaces the Web and Electron Edu Store placeholders from TypeDoc overview sources', async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), 'api-center-generator-edu-store-'),
    );
    temporaryDirectories.push(repoRoot);
    const oldRoot = path.join(repoRoot, 'legacy');
    const manifestPath = path.join(
      repoRoot,
      'docs/migration/api-center-html-manifest.json',
    );
    await fs.mkdir(path.dirname(manifestPath), { recursive: true });
    const pageEvidence = [];
    const overviewHtml = `<header><div class="tsd-page-title"><h1>Edu Store Typescript API Reference for Web</h1></div></header>
      <div class="col-content">
        <div class="alert info">本文档仅适用于声网 Classroom SDK v2.3.x 及之后版本。</div>
        <p>不同的 Store 代表灵动课堂中不同的业务功能模块。</p>
        <h3 id="cloud-drive-store">Cloud Drive Store</h3>
        <table><thead><tr><th>方法</th><th>描述</th></tr></thead><tbody>
          <tr><td><a href="classes/cloud-drive.html#cancelUpload">CloudDriveStore.cancelUpload</a></td><td>取消上传资源</td></tr>
        </tbody></table>
      </div>`;
    for (const [sourcePlatform, targetPlatform, oldPlatform] of [
      ['Web', 'web', 'javascript'],
      ['Electron', 'electron', 'electron'],
    ]) {
      const sourcePath = `html-docs/flexible-classroom/${sourcePlatform}/index.html`;
      await fs.mkdir(path.dirname(path.join(oldRoot, sourcePath)), {
        recursive: true,
      });
      await fs.writeFile(path.join(oldRoot, sourcePath), overviewHtml);
      const classSourcePath = `html-docs/flexible-classroom/${sourcePlatform}/classes/cloud-drive.html`;
      await fs.mkdir(path.dirname(path.join(oldRoot, classSourcePath)), {
        recursive: true,
      });
      await fs.writeFile(
        path.join(oldRoot, classSourcePath),
        `<header><div class="tsd-page-title"><h1>CloudDriveStore</h1></div></header>
         <div class="col-content"><h2 id="cancelUpload">cancelUpload</h2><p>取消正在进行的上传任务。</p><h3>返回值</h3><p>Promise&lt;void&gt;</p></div>`,
      );
      const targetPath = `content/docs/zh-CN/api-reference/flexible-classroom/${targetPlatform}/api-reference/edu-store.mdx`;
      await fs.mkdir(path.dirname(path.join(repoRoot, targetPath)), {
        recursive: true,
      });
      await fs.writeFile(
        path.join(repoRoot, targetPath),
        `---\ntitle: Edu Store API\n---\n\n尚未迁移。 [旧站](https://doc.shengwang.cn/api-ref/flexible-classroom/${oldPlatform}/overview)\n`,
      );
      const targetRoute = `/zh-CN/api-reference/flexible-classroom/${targetPlatform}/api-reference/edu-store`;
      const scopeKey = `api-ref/flexible-classroom/${oldPlatform}`;
      pageEvidence.push(
        {
          requestedUrl: `https://doc.shengwang.cn/api-ref/flexible-classroom/${oldPlatform}/overview`,
          adoptExisting: true,
          sourceResolution: {
            status: 'resolved',
            type: 'generated-html',
            generator: 'typedoc',
            sourcePath,
            targetPath,
            targetRoute,
            targetExists: true,
            route: { scopeKey },
          },
        },
        {
          requestedUrl: `https://doc.shengwang.cn/api-ref/flexible-classroom/${oldPlatform}/classes/cloud-drive.html`,
          sourceResolution: {
            status: 'resolved',
            type: 'generated-html',
            generator: 'typedoc',
            sourcePath: classSourcePath,
            targetPath: `${targetPath.slice(0, -'.mdx'.length)}/classes/cloud-drive.mdx`,
            targetRoute: `${targetRoute}/classes/cloud-drive`,
            targetExists: false,
            route: { scopeKey },
          },
        },
      );
    }
    await fs.writeFile(
      manifestPath,
      JSON.stringify({
        schemaVersion: 1,
        source: { commit: 'fixture' },
        pageEvidence,
      }),
    );

    const result = await runHtmlGenerators({
      repoRoot,
      oldRoot,
      generators: ['typedoc'],
      mode: 'write',
    });

    expect(result.report.counts).toMatchObject({
      errors: 0,
      generatedFiles: 4,
    });
    for (const targetPlatform of ['web', 'electron']) {
      const output = await fs.readFile(
        path.join(
          repoRoot,
          `content/docs/zh-CN/api-reference/flexible-classroom/${targetPlatform}/api-reference/edu-store.mdx`,
        ),
        'utf8',
      );
      expect(output).toContain(
        'title: Edu Store Typescript API Reference for Web',
      );
      expect(output).toContain('Cloud Drive Store');
      expect(output).toContain('CloudDriveStore.cancelUpload');
      expect(output).toContain('取消上传资源');
      expect(output).toContain(
        `](/zh-CN/api-reference/flexible-classroom/${targetPlatform}/api-reference/edu-store/classes/cloud-drive#cancelUpload)`,
      );
      expect(output).not.toContain('尚未迁移');
      expect(output.replace(/^---\r?\n[\s\S]*?\r?\n---\s*/, '')).not.toContain(
        'https://doc.shengwang.cn',
      );
      expect(
        await fs.readFile(
          path.join(
            repoRoot,
            `content/docs/zh-CN/api-reference/flexible-classroom/${targetPlatform}/api-reference/edu-store/classes/cloud-drive.mdx`,
          ),
          'utf8',
        ),
      ).toContain('取消正在进行的上传任务。');
    }
  });
});
