import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { getOpenApiPrerenderPaths } from '../src/lib/openapi/lanes';
import {
  auditDocsLinks,
  getOpenApiRoutePathsForAudit,
} from './audit-doc-links.mjs';

const tempDirs: string[] = [];

type AuditEntry = {
  href: string;
  normalizedHref: string;
  resolution: string;
  resolvedTargetPath: string;
  sourcePath: string;
};

async function writeDoc(filePath: string, markdown = '# Test\n') {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, markdown);
}

describe('auditDocsLinks', () => {
  afterEach(async () => {
    await Promise.all(
      tempDirs
        .splice(0)
        .map((dir) => rm(dir, { force: true, recursive: true })),
    );
  });

  it('keeps the OpenAPI generated route list aligned with the site registry', () => {
    expect(getOpenApiRoutePathsForAudit()).toEqual(getOpenApiPrerenderPaths());
  });

  it('resolves route-equivalent and generated OpenAPI markdown links', async () => {
    const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'docs-link-audit-'));
    tempDirs.push(docsRoot);

    await writeDoc(
      path.join(docsRoot, 'en', 'ai', 'index.md'),
      [
        '[mdx route](quickstart.md)',
        '[index route](guide.md)',
        '[legacy operation](../operations/start-agent.md#llm-max_history)',
        '[generated endpoint](../api-reference/conversational-ai/rest-api/agent/join.md)',
        '[missing](missing.md)',
      ].join('\n'),
    );
    await writeDoc(path.join(docsRoot, 'en', 'ai', 'quickstart.mdx'));
    await writeDoc(path.join(docsRoot, 'en', 'ai', 'guide', 'index.mdx'));

    const stats = auditDocsLinks({ docsRoot });
    const missingRelativeMarkdownLinks =
      stats.missingRelativeMarkdownLinks as AuditEntry[];
    const resolvedByHref = new Map(
      (stats.relativeMarkdownLinks as AuditEntry[]).map((entry) => [
        entry.href,
        entry,
      ]),
    );

    expect(missingRelativeMarkdownLinks).toHaveLength(1);
    expect(missingRelativeMarkdownLinks[0]).toMatchObject({
      href: 'missing.md',
      normalizedHref: '/en/ai/missing',
    });
    expect(resolvedByHref.get('quickstart.md')).toMatchObject({
      normalizedHref: '/en/ai/quickstart',
      resolution: 'route',
      resolvedTargetPath: 'en/ai/quickstart.mdx',
    });
    expect(resolvedByHref.get('guide.md')).toMatchObject({
      normalizedHref: '/en/ai/guide',
      resolution: 'route',
      resolvedTargetPath: 'en/ai/guide/index.mdx',
    });
    expect(
      resolvedByHref.get('../operations/start-agent.md#llm-max_history'),
    ).toMatchObject({
      normalizedHref:
        '/en/api-reference/api-ref/conversational-ai/join#llm-max_history',
      resolution: 'openapi-route',
      resolvedTargetPath:
        'openapi:/en/api-reference/api-ref/conversational-ai/join',
    });
    expect(
      resolvedByHref.get(
        '../api-reference/conversational-ai/rest-api/agent/join.md',
      ),
    ).toMatchObject({
      normalizedHref: '/en/api-reference/api-ref/conversational-ai/join',
      resolution: 'openapi-route',
      resolvedTargetPath:
        'openapi:/en/api-reference/api-ref/conversational-ai/join',
    });
  });

  it('checks root JSX links against known docs and OpenAPI routes', async () => {
    const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'docs-link-audit-'));
    tempDirs.push(docsRoot);

    await writeDoc(
      path.join(docsRoot, 'en', 'introduction', 'index.mdx'),
      [
        '<Card href="/en/ai" />',
        '<Card href="/en/api-reference/api-ref/rtc/query-channel-list" />',
        '<Card href="/en/api-reference/rtc/android/overview" />',
        '<Card href="/en/missing-page" />',
        '<Card href="https://example.com/docs" />',
      ].join('\n'),
    );
    await writeDoc(path.join(docsRoot, 'en', 'ai', 'index.mdx'));

    const stats = auditDocsLinks({ docsRoot });
    const rootLinks = stats.rootLinks as AuditEntry[];
    const skippedRootLinks = stats.skippedRootLinks as AuditEntry[];
    const missingRootLinks = stats.missingRootLinks as AuditEntry[];

    expect(rootLinks.map((entry) => entry.href)).toEqual([
      '/en/ai',
      '/en/api-reference/api-ref/rtc/query-channel-list',
    ]);
    expect(rootLinks.at(1)).toMatchObject({
      resolution: 'openapi-route',
      resolvedTargetPath:
        'openapi:/en/api-reference/api-ref/rtc/query-channel-list',
    });
    expect(skippedRootLinks).toHaveLength(1);
    expect(skippedRootLinks[0]).toMatchObject({
      href: '/en/api-reference/rtc/android/overview',
      resolution: 'hosted-reference',
    });
    expect(missingRootLinks).toHaveLength(1);
    expect(missingRootLinks[0]).toMatchObject({
      href: '/en/missing-page',
      normalizedHref: '/en/missing-page',
      sourcePath: 'en/introduction/index.mdx',
    });
    expect(stats.externalLinks).toBe(1);
  });

  it('keeps visible English overview cards and toolkit links routable', () => {
    const docsRoot = path.join(process.cwd(), 'content', 'docs');
    const stats = auditDocsLinks({
      docsRoot,
      sourcePaths: [
        'en/introduction/index.mdx',
        'en/ai/index.mdx',
        'en/realtime-media/overview.mdx',
        'en/solutions/index.mdx',
        'en/api-reference/index.mdx',
      ],
    });

    expect(stats.docsFiles).toBe(5);
    expect(stats.rootLinks).not.toHaveLength(0);
    expect(stats.missingRootLinks).toEqual([]);
    expect(stats.missingRelativeMarkdownLinks).toEqual([]);
  });
});
