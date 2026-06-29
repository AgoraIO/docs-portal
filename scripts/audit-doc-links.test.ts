import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { getOpenApiPrerenderPaths } from '../src/lib/openapi/lanes';
import {
  auditDocsLinks,
  checkExternalLinks,
  formatReport,
  getOpenApiRoutePathsForAudit,
} from './audit-doc-links.mjs';

const tempDirs: string[] = [];

type AuditEntry = {
  anchor?: string;
  href: string;
  normalizedHref: string;
  reason?: string;
  resolution: string;
  resolvedTargetPath: string;
  sourcePath: string;
  target?: string;
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

  it('reports missing internal paths and missing hash anchors with source, target, and reason', async () => {
    const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'docs-link-audit-'));
    tempDirs.push(docsRoot);

    await writeDoc(
      path.join(docsRoot, 'en', 'ai', 'index.mdx'),
      [
        '# Source',
        '',
        '## Local Section',
        '',
        '[extensionless route](guide)',
        '[valid target hash](guide#target-heading)',
        '[valid code hash](guide#loadaudiosettings)',
        '[valid explicit hash](guide#explicit-anchor)',
        '[valid local hash](#local-section)',
        '[missing target hash](guide#missing-anchor)',
        '[missing local hash](#missing-local)',
        '[missing extensionless route](missing-topic)',
        '<Card href="/en/ai/missing-root#never" />',
      ].join('\n'),
    );
    await writeDoc(
      path.join(docsRoot, 'en', 'ai', 'guide.mdx'),
      [
        '# Guide',
        '',
        '## Target Heading',
        '',
        '### `loadAudioSettings`',
        '',
        '<a id="explicit-anchor" />',
      ].join('\n'),
    );

    const stats = auditDocsLinks({ docsRoot });
    const validHashLinks = stats.validHashLinks as AuditEntry[];
    const missingHashLinks = stats.missingHashLinks as AuditEntry[];
    const invalidInternalLinks = stats.invalidInternalLinks as AuditEntry[];
    const report = formatReport(stats, 30);

    expect(
      (stats.relativeMarkdownLinks as AuditEntry[]).map((entry) => entry.href),
    ).toContain('guide');
    expect(stats.missingRelativeMarkdownLinks).toHaveLength(1);
    expect(stats.missingRootLinks).toHaveLength(1);
    expect(validHashLinks.map((entry) => entry.anchor)).toEqual(
      expect.arrayContaining([
        'target-heading',
        'loadaudiosettings',
        'explicit-anchor',
        'local-section',
      ]),
    );
    expect(missingHashLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          anchor: 'missing-anchor',
          href: 'guide#missing-anchor',
          reason: 'missing-hash-anchor',
          sourcePath: 'en/ai/index.mdx',
          target: '/en/ai/guide#missing-anchor',
        }),
        expect.objectContaining({
          anchor: 'missing-local',
          href: '#missing-local',
          reason: 'missing-hash-anchor',
          sourcePath: 'en/ai/index.mdx',
          target: '#missing-local',
        }),
      ]),
    );
    expect(invalidInternalLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: 'missing-topic',
          reason: 'missing-internal-path',
          target: '/en/ai/missing-topic',
        }),
        expect.objectContaining({
          href: '/en/ai/missing-root#never',
          reason: 'missing-internal-path',
          target: '/en/ai/missing-root#never',
        }),
        expect.objectContaining({
          href: 'guide#missing-anchor',
          reason: 'missing-hash-anchor',
          target: '/en/ai/guide#missing-anchor',
        }),
      ]),
    );
    expect(report).toContain(
      'source: en/ai/index.mdx | target: /en/ai/guide#missing-anchor | reason: missing-hash-anchor | href: guide#missing-anchor',
    );
    expect(report).toContain(
      'source: en/ai/index.mdx | target: /en/ai/missing-topic | reason: missing-internal-path | href: missing-topic',
    );
  });

  it('checks external links with retry, timeout, and allowlist controls', async () => {
    const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'docs-link-audit-'));
    tempDirs.push(docsRoot);

    await writeDoc(
      path.join(docsRoot, 'en', 'ai', 'index.mdx'),
      [
        '[ok](https://ok.example/docs)',
        '[gone](https://gone.example/missing)',
        '[flaky](https://flaky.example/retry)',
        '[allowed](https://allowed.example/page)',
        '[auth](https://auth.example/page)',
        '[slow](https://slow.example/page)',
      ].join('\n'),
    );

    const attempts = new Map<string, number>();
    const fetchImpl = async (
      url: unknown,
      init: { signal?: AbortSignal | null } = {},
    ) => {
      const target = String(url);
      const signal = init?.signal ?? undefined;
      const attempt = (attempts.get(target) ?? 0) + 1;

      attempts.set(target, attempt);

      if (target.includes('ok.example')) {
        return { status: 204 } as Response;
      }

      if (target.includes('gone.example')) {
        return { status: 404 } as Response;
      }

      if (target.includes('flaky.example') && attempt === 1) {
        throw new Error('temporary network error');
      }

      if (target.includes('flaky.example')) {
        return { status: 200 } as Response;
      }

      if (target.includes('auth.example')) {
        return { status: 403 } as Response;
      }

      if (target.includes('slow.example')) {
        return new Promise<Response>((_resolve, reject) => {
          signal?.addEventListener('abort', () => {
            const error = new Error('aborted');

            error.name = 'AbortError';
            reject(error);
          });
        });
      }

      return { status: 500 } as Response;
    };

    const stats = auditDocsLinks({ docsRoot });

    await checkExternalLinks(stats, {
      allowlist: ['allowed.example'],
      fetchImpl: fetchImpl as unknown as typeof fetch,
      retries: 1,
      retryDelayMs: 0,
      timeoutMs: 1,
    });

    expect(stats.checkedExternalLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ target: 'https://ok.example/docs' }),
        expect.objectContaining({ target: 'https://flaky.example/retry' }),
      ]),
    );
    expect(stats.invalidExternalLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reason: 'external-http-404',
          target: 'https://gone.example/missing',
        }),
        expect.objectContaining({
          reason: 'external-request-timeout',
          target: 'https://slow.example/page',
        }),
      ]),
    );
    expect(stats.skippedExternalLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reason: 'external-allowlisted',
          target: 'https://allowed.example/page',
        }),
        expect.objectContaining({
          reason: 'external-http-403-not-actionable',
          target: 'https://auth.example/page',
        }),
      ]),
    );
    expect(attempts.get('https://allowed.example/page')).toBeUndefined();
    expect(attempts.get('https://flaky.example/retry')).toBe(2);
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
