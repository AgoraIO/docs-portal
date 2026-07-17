import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import yaml from 'js-yaml';
import { afterEach, describe, expect, it } from 'vitest';
import {
  normalizeOpenApiShortDescription,
  runOpenApiNormalizer,
  splitOpenApiDescription,
} from './lib/api-center/openapi-normalizer.mjs';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(
    roots
      .splice(0)
      .map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

describe('API Center OpenAPI description normalizer', () => {
  it('collapses block and Markdown descriptions without rewriting the YAML document', async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), 'api-center-openapi-normalizer-'),
    );
    roots.push(repoRoot);
    const targetPath = 'content/openapi/example.zh-CN.yaml';
    const manifestPath = 'docs/migration/api-center-html-manifest.json';
    const source = `# keep this comment
openapi: 3.0.0
info: {title: Example, version: 1}
paths:
  /items:
    get:
      summary: List
      description: |
        获取列表。
        > 仅支持最近 7 天。
      operationId: list-items
      responses: {'200': {description: OK}}
  /history:
    get:
      summary: History
      operationId: get-history
      description: "获取 \`RUNNING\` 状态。\\r\\n- 包含消息\\r\\n- 包含时间戳"
      responses: {'200': {description: OK}}
`;
    await fs.mkdir(path.dirname(path.join(repoRoot, targetPath)), {
      recursive: true,
    });
    await fs.writeFile(path.join(repoRoot, targetPath), source);
    await fs.mkdir(path.join(repoRoot, 'docs/migration'), { recursive: true });
    await fs.writeFile(
      path.join(repoRoot, manifestPath),
      JSON.stringify({
        source: { commit: 'fixture' },
        pageEvidence: [
          {
            requestedUrl: 'https://doc.shengwang.cn/doc/example/list',
            sourceResolution: { type: 'openapi', targetPath },
          },
        ],
      }),
    );

    const report = await runOpenApiNormalizer({ repoRoot, manifestPath });
    const output = await fs.readFile(path.join(repoRoot, targetPath), 'utf8');

    expect(report.counts).toEqual({
      normalizedFiles: 1,
      normalizedOperations: 2,
      warnings: 0,
      errors: 0,
    });
    expect(output).toContain('# keep this comment');
    const document = yaml.load(output) as {
      paths: Record<
        string,
        {
          get: {
            description: string;
            'x-docs-callouts'?: Array<{ markdown: string }>;
            'x-docs-sections'?: Array<{ markdown: string }>;
          };
        }
      >;
    };
    expect(document.paths['/items'].get).toMatchObject({
      description: '获取列表。',
      'x-docs-callouts': [{ markdown: '仅支持最近 7 天。' }],
    });
    expect(document.paths['/history'].get).toMatchObject({
      description: '获取 RUNNING 状态。',
      'x-docs-sections': [{ markdown: '- 包含消息\n- 包含时间戳' }],
    });
    expect(output).not.toContain('description: |');

    await runOpenApiNormalizer({ repoRoot, manifestPath });
    expect(await fs.readFile(path.join(repoRoot, targetPath), 'utf8')).toBe(
      output,
    );

    await expect(
      runOpenApiNormalizer({ repoRoot, manifestPath, mode: 'check' }),
    ).resolves.toEqual(report);
  });

  it('normalizes Markdown links, code, quotes, and line markers to short prose', () => {
    expect(
      normalizeOpenApiShortDescription(
        '> 查询 [`RUNNING`](/status) 状态。\n- 返回一条记录。',
      ),
    ).toBe('查询 RUNNING 状态。 返回一条记录。');
  });

  it('keeps long prose, lists, and restrictions in rendered documentation extensions', () => {
    expect(
      splitOpenApiDescription(
        '获取短期记忆。\n你可以获取以下信息：\n- 时间戳\n- 对话消息\n> 仅支持最近 7 天。',
      ),
    ).toEqual({
      description: '获取短期记忆。',
      sections: [
        {
          position: 'after-description',
          markdown: '你可以获取以下信息：\n- 时间戳\n- 对话消息',
        },
      ],
      callouts: [
        {
          position: 'after-description',
          markdown: '仅支持最近 7 天。',
        },
      ],
    });
  });

  it('preserves target-authored structured documentation over a stale ownership record', async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), 'api-center-openapi-preserved-target-'),
    );
    roots.push(repoRoot);
    const targetPath = 'content/openapi/example.zh-CN.yaml';
    const manifestPath = 'docs/migration/api-center-html-manifest.json';
    const ownershipPath =
      'docs/migration/api-center-openapi-normalized-descriptions.json';
    const source = `openapi: 3.0.0
info: {title: Example, version: 1}
paths:
  /join:
    post:
      summary: Join
      description: 启动目标任务。
      x-docs-sections:
        - position: after-description
          markdown: 目标站已经维护的详细说明。
      operationId: join
      responses: {'200': {description: OK}}
`;
    await fs.mkdir(path.dirname(path.join(repoRoot, targetPath)), {
      recursive: true,
    });
    await fs.writeFile(path.join(repoRoot, targetPath), source);
    await fs.mkdir(path.join(repoRoot, 'docs/migration'), { recursive: true });
    await fs.writeFile(
      path.join(repoRoot, manifestPath),
      JSON.stringify({
        source: { commit: 'fixture' },
        pageEvidence: [
          {
            sourceResolution: { type: 'openapi', targetPath },
          },
        ],
      }),
    );
    await fs.writeFile(
      path.join(repoRoot, ownershipPath),
      JSON.stringify({
        schemaVersion: 1,
        operations: [
          {
            targetPath,
            operationId: 'join',
            normalizedDescription: '旧站同名操作说明。',
            originalDescription: '旧站同名操作说明。\n',
            originalDescriptionHash: 'stale',
            docsSections: [],
            docsCallouts: [],
          },
        ],
      }),
    );

    const report = await runOpenApiNormalizer({ repoRoot, manifestPath });

    expect(report.counts.normalizedOperations).toBe(0);
    expect(await fs.readFile(path.join(repoRoot, targetPath), 'utf8')).toBe(
      source,
    );
    const ownership = JSON.parse(
      await fs.readFile(path.join(repoRoot, ownershipPath), 'utf8'),
    );
    expect(ownership.operations).toEqual([]);
  });
});
