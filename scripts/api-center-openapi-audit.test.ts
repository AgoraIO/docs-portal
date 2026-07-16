import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { auditApiCenterOpenApi } from './lib/api-center/openapi-audit.mjs';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      fs.rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe('API Center OpenAPI audit', () => {
  it('verifies legacy/target/lane parity and live sidebar coverage', async () => {
    const repoRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'openapi-audit-'));
    temporaryDirectories.push(repoRoot);
    const oldRoot = path.join(repoRoot, 'legacy');
    const legacySourcePath = 'html-docs/example/rest.yaml';
    const targetPath = 'content/openapi/example/rest.zh-CN.yaml';
    const yamlSource = `openapi: 3.0.0
info: {title: Example, version: 1}
paths:
  /v1/items/{id}:
    get:
      operationId: get-item
      summary: Get item
      description: Get one item.
      responses: {'200': {description: OK}}
`;
    for (const [root, relative, source] of [
      [
        oldRoot,
        legacySourcePath,
        yamlSource.replace(
          '  /v1/items/{id}:',
          "  '/v1/items/{id}?limit={limit}':",
        ),
      ],
      [repoRoot, targetPath, yamlSource],
    ]) {
      const absolute = path.join(root, relative);
      await fs.mkdir(path.dirname(absolute), { recursive: true });
      await fs.writeFile(absolute, source);
    }
    const docsRoot = path.join(
      repoRoot,
      'content/docs/zh-CN/api-reference/api-ref/example',
    );
    await fs.mkdir(docsRoot, { recursive: true });
    await fs.writeFile(path.join(docsRoot, 'index.mdx'), '---\ntitle: Example\n---\n');
    await fs.writeFile(
      path.join(docsRoot, 'meta.json'),
      JSON.stringify({
        pages: [
          'index',
          {
            type: 'group',
            title: 'Items',
            pages: ['[Get item](./get-item)'],
          },
        ],
      }),
    );
    const legacyUrl =
      'https://doc.shengwang.cn/doc/example/restful/rest/operations/get-item';
    const manifest = {
      entries: [
        {
          pageGraph: {
            pages: [{ url: legacyUrl, order: 0 }],
          },
        },
      ],
      pageEvidence: [
        {
          requestedUrl: legacyUrl,
          sourceResolution: {
            type: 'openapi',
            laneId: 'example-rest',
            legacyOperationId: 'get-item',
            targetOperationId: 'get-item',
            sourcePath: legacySourcePath,
            targetPath,
            targetRoute:
              '/zh-CN/api-reference/api-ref/example/get-item',
            route: { scopeKey: 'doc/example/restful' },
          },
        },
      ],
    };
    const lanes = [
      {
        id: 'example-rest',
        parentUrl: {
          en: '/en/api-reference/api-ref/example',
          'zh-CN': '/zh-CN/api-reference/api-ref/example',
        },
        sourcePath: { en: targetPath, 'zh-CN': targetPath },
        operations: {
          'get-item': { routeLeaf: 'get-item' },
        },
      },
    ];

    const report = await auditApiCenterOpenApi({
      repoRoot,
      oldRoot,
      manifest,
      lanes,
      sourceTextRegistry: `'${targetPath}'`,
      scope: 'doc/example/restful',
    });

    expect(report.counts).toEqual({
      lanes: 1,
      reachableOperations: 1,
      liveSidebarOperations: 1,
      errors: 0,
      warnings: 0,
    });
    expect(report.lanes[0].issues).toEqual([]);
  });
});
