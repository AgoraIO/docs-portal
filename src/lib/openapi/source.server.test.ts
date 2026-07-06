import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  getOpenApiLaneLocales,
  getOpenApiOperationIds,
  OPENAPI_LANES,
} from './lanes';
import { getOpenApiOperation, getOpenApiOperations } from './source.server';

describe('openapi source loader', () => {
  const lane = OPENAPI_LANES[0];
  const rtcLane = OPENAPI_LANES.find((item) => item.id === 'rtc-rest');

  it('loads lane operations by operationId', async () => {
    const operations = await getOpenApiOperations(lane);

    expect(operations.map((operation) => operation.operationId)).toContain(
      'start-agent',
    );
    expect(operations).toHaveLength(10);
  });

  it('normalizes method, path, and request body', async () => {
    const operation = await getOpenApiOperation(lane, 'start-agent');

    expect(operation.method).toBe('POST');
    expect(operation.path).toBe('/v2/projects/{appid}/join');
    expect(operation.requestBody?.contentTypes).toContain('application/json');
  });

  it('normalizes grouped request samples using the HTML renderer precedence', async () => {
    const operation = await getOpenApiOperation(lane, 'start-agent');

    expect(operation.codeSampleGroups.map((group) => group.title)).toEqual([
      'Basic configuration',
      'Saved agent configuration',
      'Advanced configuration',
      'String UID',
      'MCP server integration',
      'Preset models',
    ]);
    expect(
      operation.codeSampleGroups.flatMap((group) => group.samples),
    ).toHaveLength(18);
    expect(operation.codeSamples).toEqual([]);
  });

  it('dereferences local parameter refs before normalization', async () => {
    expect(rtcLane).toBeDefined();
    if (!rtcLane) {
      throw new Error('Missing rtc-rest OpenAPI lane');
    }

    const operation = await getOpenApiOperation(
      rtcLane,
      'cma-query-channel-list',
    );

    expect(operation.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          in: 'path',
          name: 'appid',
        }),
        expect.objectContaining({
          in: 'query',
          name: 'page_no',
        }),
      ]),
    );
  });

  it('preserves OpenAPI security without treating auth as a parameter', async () => {
    const operation = await getOpenApiOperation(lane, 'start-agent');

    expect(operation.security).toEqual([{ tokenAuth: [] }, { basicAuth: [] }]);
    expect(operation.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          in: 'path',
          name: 'appid',
        }),
      ]),
    );
    expect(operation.parameters).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          in: 'header',
          name: 'Authorization',
        }),
      ]),
    );
  });

  it('serializes normalized operations without parser objects', async () => {
    const operation = await getOpenApiOperation(lane, 'start-agent');

    expect(JSON.parse(JSON.stringify(operation))).toMatchObject({
      method: 'POST',
      operationId: 'start-agent',
      path: '/v2/projects/{appid}/join',
    });
  });

  it.each(OPENAPI_LANES)(
    'keeps registry operation IDs in sync with YAML for $id',
    async (openApiLane) => {
      const fromRegistry = getOpenApiOperationIds(openApiLane).sort();

      for (const locale of getOpenApiLaneLocales(openApiLane)) {
        const operations = await getOpenApiOperations(openApiLane, locale);
        const fromYaml = operations
          .map((operation) => operation.operationId)
          .sort();

        expect(fromRegistry).toEqual(fromYaml);
      }
    },
  );

  it('loads localized operation summaries from locale-specific YAML', async () => {
    const english = await getOpenApiOperation(lane, 'start-agent', 'en');
    const chinese = await getOpenApiOperation(lane, 'start-agent', 'zh-CN');

    expect(english.summary).toBe('Start a conversational AI agent');
    expect(chinese.summary).toBe('创建对话式智能体');
    expect(chinese.servers).toEqual([
      {
        url: 'https://api.agora.io/cn/api/conversational-ai-agent',
      },
    ]);
  });

  it('loads OpenAPI data when runtime cwd has no content or public folders', async () => {
    const originalCwd = process.cwd();
    const runtimeCwd = await fs.mkdtemp(
      path.join(os.tmpdir(), 'docs-openapi-runtime-'),
    );
    const uncachedLane = {
      ...lane,
      id: `${lane.id}-runtime-cwd`,
    };

    try {
      process.chdir(runtimeCwd);

      const operation = await getOpenApiOperation(
        uncachedLane,
        'start-agent',
        'en',
      );

      expect(operation.method).toBe('POST');
      expect(operation.path).toBe('/v2/projects/{appid}/join');
    } finally {
      process.chdir(originalCwd);
      await fs.rm(runtimeCwd, { force: true, recursive: true });
    }
  });
});
