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
  const cloudRecordingLane = OPENAPI_LANES.find(
    (item) => item.id === 'cloud-recording-rest',
  );

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

  it('loads localized Cloud Recording summaries from the Chinese YAML', async () => {
    expect(cloudRecordingLane).toBeDefined();

    const english = await getOpenApiOperation(
      cloudRecordingLane!,
      'acquire-cloud-recording-resource',
      'en',
    );
    const chinese = await getOpenApiOperation(
      cloudRecordingLane!,
      'acquire-cloud-recording-resource',
      'zh-CN',
    );
    const ncsIp = await getOpenApiOperation(
      cloudRecordingLane!,
      'get-ncs-ip',
      'zh-CN',
    );

    expect(english.summary).toBe('Acquire a resource ID');
    expect(chinese.summary).toBe('获取云端录制资源');
    expect(ncsIp.path).toBe('/v2/ncs/ip');
  });

  it('loads documented Cloud Recording error fields and an authentication failure example', async () => {
    if (!cloudRecordingLane) {
      throw new Error('Missing cloud-recording-rest OpenAPI lane');
    }
    const operation = await getOpenApiOperation(
      cloudRecordingLane,
      'start-cloud-recording',
      'zh-CN',
    );
    const errorResponse = operation.responses['非 200'];
    const json = errorResponse.content?.['application/json'];

    expect(errorResponse.description).toContain('响应状态码');
    expect(json?.schema).toMatchObject({
      type: 'object',
      properties: {
        message: { type: 'string' },
        code: { type: 'integer' },
        reason: { type: 'string' },
      },
    });
    expect(json?.schema).not.toHaveProperty('required');
    expect(json?.examples?.['authentication-error']?.value).toEqual({
      message: 'Invalid authentication credentials',
    });
  });

  it('loads documented error bodies for every Chinese RTC channel-management operation', async () => {
    const chineseRtcLane = OPENAPI_LANES.find(
      (item) => item.id === 'rtc-rest-zh-cn',
    );
    if (!chineseRtcLane) {
      throw new Error('Missing rtc-rest-zh-cn OpenAPI lane');
    }
    const operations = await getOpenApiOperations(chineseRtcLane, 'zh-CN');

    expect(operations).toHaveLength(9);
    for (const operation of operations) {
      const json = operation.responses['非 200']?.content?.['application/json'];
      expect(json?.schema, operation.operationId).toMatchObject({
        type: 'object',
        properties: {
          message: { type: 'string' },
          reason: { type: 'string' },
        },
      });
      expect(json?.schema).not.toHaveProperty('required');
      expect(json?.examples?.['invalid-app-id']?.value).toEqual({
        message: 'invalid appid',
      });
    }
  });

  it('keeps License message errors distinct from CallKit call responses', async () => {
    const callkitLane = OPENAPI_LANES.find(
      (item) => item.id === 'voip-callkit-rest',
    );
    if (!callkitLane) {
      throw new Error('Missing voip-callkit-rest OpenAPI lane');
    }
    const operations = await getOpenApiOperations(callkitLane, 'zh-CN');
    const licenseOperationIds = [
      'activateLicense',
      'getExpiringLicenses',
      'renewLicense',
      'getLicenseRenewals',
    ];
    const licenseOperations = operations.filter((operation) =>
      licenseOperationIds.includes(operation.operationId),
    );

    expect(licenseOperations).toHaveLength(4);
    for (const operation of licenseOperations) {
      const json = operation.responses['非 200']?.content?.['application/json'];
      expect(json?.schema, operation.operationId).toMatchObject({
        type: 'object',
        properties: { message: { type: 'string' } },
      });
      expect(json?.schema).not.toHaveProperty('required');
      expect(json?.schema).not.toHaveProperty('properties.msg');
      expect(json?.examples).toBeUndefined();
    }
    const call = operations.find(
      (operation) => operation.operationId === 'callMiniApp',
    );
    expect(
      call?.responses['非 200']?.content?.['application/json']?.schema,
    ).toMatchObject({
      properties: { msg: { type: 'string' } },
    });
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
