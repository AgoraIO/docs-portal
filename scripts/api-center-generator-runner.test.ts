import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { runHtmlGenerators } from './lib/api-center/generator-runner.mjs';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      fs.rm(directory, { recursive: true, force: true }),
    ),
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
            targetRoute:
              '/zh-CN/api-reference/rtc/web/interfaces/client',
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

  it('skips a migrated unowned MDX target instead of overwriting it', async () => {
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
      '<div class="col-content"><p>Legacy generated body.</p></div>',
    );
    await fs.mkdir(path.dirname(path.join(repoRoot, targetPath)), {
      recursive: true,
    });
    await fs.writeFile(path.join(repoRoot, targetPath), 'Existing migrated body.\n');
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
            targetRoute:
              '/zh-CN/api-reference/rtc/web/interfaces/existing',
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

    expect(await fs.readFile(path.join(repoRoot, targetPath), 'utf8')).toBe(
      'Existing migrated body.\n',
    );
    expect(result.report.counts).toMatchObject({
      generatedFiles: 0,
      preservedExistingFiles: 1,
    });
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
    expect(await fs.readFile(path.join(repoRoot, targetPath), 'utf8')).toContain(
      `sourceUrl: ${canonicalUrl}`,
    );
  });
});
