import { describe, expect, it } from 'vitest';
import {
  createLocalizedOpenApiSource,
  getOpenApiLoaderPlugin,
} from './fumadocs-source.server';

describe('fumadocs openapi source', () => {
  it('omits empty request bodies from generated whiteboard GET operation payloads', async () => {
    const source = await createLocalizedOpenApiSource();
    const page = source.files.find(
      (file) =>
        file.type === 'page' &&
        file.path ===
          'zh-CN/api-reference/api-ref/whiteboard/restful/get-room.mdx',
    );

    expect(page?.type).toBe('page');
    if (page?.type !== 'page') {
      throw new Error('Missing Chinese Whiteboard get-room page');
    }

    const props = await page.data.getOpenAPIPageProps();
    const operation = props.payload.bundled?.paths?.['/v5/rooms/{uuid}']?.get as
      | { requestBody?: unknown; responses?: unknown }
      | undefined;

    expect(operation).toBeDefined();
    expect(operation?.requestBody).toBeUndefined();
    expect(operation?.responses).toMatchObject({
      '200': {
        content: {
          'application/json': expect.any(Object),
        },
      },
    });
  });

  it('keeps localized Cloud Recording operation descriptions short and moves zh-CN prose into renderable sections', async () => {
    const source = await createLocalizedOpenApiSource();
    const acquirePage = source.files.find(
      (file) =>
        file.type === 'page' &&
        file.path === 'zh-CN/api-reference/api-ref/cloud-recording/acquire.mdx',
    );

    expect(acquirePage?.type).toBe('page');
    if (acquirePage?.type !== 'page') {
      throw new Error('Missing Chinese Cloud Recording acquire page');
    }

    const props = await acquirePage.data.getOpenAPIPageProps();
    const acquireOperation =
      props.payload.bundled?.paths?.['/v1/apps/{appid}/cloud_recording/acquire']
        ?.post;
    const acquireRecord = acquireOperation as Record<string, unknown>;

    expect(acquireOperation?.summary).toBe('获取云端录制资源');
    expect(acquireOperation?.description).toBe(
      '获取用于云端录制任务的 Resource ID。',
    );
    expect(acquireOperation?.description).not.toContain('`acquire`');
    expect(acquireRecord['x-docs-sections']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          position: 'after-description',
          markdown: expect.stringContaining(
            '在开始云端录制之前，你需要调用 `acquire` 方法获取一个 Resource ID。',
          ),
        }),
      ]),
    );
    expect(acquireRecord['x-docs-callouts']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          position: 'after-description',
          markdown: expect.stringContaining(
            '在每次 `acquire` 请求获取到 Resource ID 后的 2 秒内立即发起对应的 [`start`](start) 请求。',
          ),
        }),
      ]),
    );

    const shortDescriptions: Record<string, string> = {
      'acquire-cloud-recording-resource':
        '获取用于云端录制任务的 Resource ID。',
      'start-cloud-recording': '开始一个云端录制任务。',
      'update-cloud-recording': '更新进行中的云端录制任务设置。',
      'update-cloud-recording-layout': '更新进行中的合流录制任务布局。',
      'query-cloud-recording': '查询云端录制任务的当前状态。',
      'stop-cloud-recording': '停止一个云端录制任务。',
      'get-ncs-ip': '查询消息通知服务器的 IP 地址。',
    };

    for (const pathItem of Object.values(props.payload.bundled?.paths ?? {})) {
      for (const operation of Object.values(pathItem ?? {})) {
        const operationObject = operation as
          | { description?: unknown; operationId?: unknown }
          | undefined;
        const operationId = String(operationObject?.operationId ?? '');
        const expected = shortDescriptions[operationId];

        if (!expected) {
          continue;
        }

        expect(operationObject?.description).toBe(expected);
        expect(operationObject?.description).not.toMatch(/[`[\]\n>]/);
      }
    }
  });
});
