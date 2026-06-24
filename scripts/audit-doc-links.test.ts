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
        '/en/api-reference/conversational-ai/rest-api/agent/join#llm-max_history',
      resolution: 'openapi-route',
      resolvedTargetPath:
        'openapi:/en/api-reference/conversational-ai/rest-api/agent/join',
    });
    expect(
      resolvedByHref.get(
        '../api-reference/conversational-ai/rest-api/agent/join.md',
      ),
    ).toMatchObject({
      normalizedHref: '/en/api-reference/conversational-ai/rest-api/agent/join',
      resolution: 'openapi-route',
      resolvedTargetPath:
        'openapi:/en/api-reference/conversational-ai/rest-api/agent/join',
    });
  });
});
