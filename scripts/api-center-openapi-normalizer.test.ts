import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  normalizeOpenApiShortDescription,
  runOpenApiNormalizer,
} from './lib/api-center/openapi-normalizer.mjs';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) =>
      fs.rm(root, { recursive: true, force: true }),
    ),
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
    expect(output).toContain(
      'description: "获取列表。 仅支持最近 7 天。"',
    );
    expect(output).toContain(
      'description: "获取 RUNNING 状态。 包含消息 包含时间戳"',
    );
    expect(output).not.toContain('description: |');

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
});
