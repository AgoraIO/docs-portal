import { describe, expect, it } from 'vitest';
import {
  createLocalizedOpenApiSource,
  getOpenApiLoaderPlugin,
} from './fumadocs-source.server';

describe('fumadocs openapi source', () => {
  it('generates localized operation pages with existing route leaves', async () => {
    const source = await createLocalizedOpenApiSource();
    const pagePaths = source.files
      .filter((file) => file.type === 'page')
      .map((file) => file.path)
      .sort();

    expect(pagePaths).toContain(
      'en/api-reference/api-ref/conversational-ai/join.mdx',
    );
    expect(pagePaths).toContain(
      'zh-CN/api-reference/api-ref/conversational-ai/join.mdx',
    );
    expect(pagePaths).toContain(
      'en/api-reference/api-ref/rtc/query-channel-list.mdx',
    );
    expect(pagePaths).toContain(
      'zh-CN/api-reference/api-ref/rtc/query-channel-list.mdx',
    );
    expect(pagePaths).toContain(
      'en/api-reference/api-ref/signaling/peer-to-peer-message.mdx',
    );
    expect(pagePaths).toContain(
      'en/api-reference/api-ref/cloud-recording/acquire.mdx',
    );
    expect(pagePaths).toContain(
      'en/api-reference/api-ref/cloud-transcoding/acquire.mdx',
    );
    expect(pagePaths).toContain(
      'en/api-reference/api-ref/rtmp-gateway/create-streaming-key.mdx',
    );
    expect(pagePaths).toContain(
      'zh-CN/api-reference/api-ref/rtmp-gateway/create-streaming-key.mdx',
    );
    expect(pagePaths).toContain(
      'en/api-reference/api-ref/speech-to-text/join.mdx',
    );
    expect(pagePaths).toContain(
      'zh-CN/api-reference/api-ref/whiteboard/restful/get-room.mdx',
    );
    expect(pagePaths).toHaveLength(237);
  });

  it('uses locale-specific document IDs in client page props', async () => {
    const source = await createLocalizedOpenApiSource();
    const englishJoin = source.files.find(
      (file) =>
        file.type === 'page' &&
        file.path === 'en/api-reference/api-ref/conversational-ai/join.mdx',
    );

    expect(englishJoin?.type).toBe('page');
    if (englishJoin?.type !== 'page') {
      throw new Error('Missing English OpenAPI join page');
    }

    const props = await englishJoin.data.getClientAPIPageProps();

    expect(props.operations).toEqual([
      {
        method: 'post',
        path: '/v2/projects/{appid}/join',
      },
    ]);
    expect(props.payload.bundled.info?.title).toBe(
      'Conversational AI RESTful API',
    );
  });

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

    const props = await page.data.getClientAPIPageProps();
    const operation = props.payload.bundled.paths?.['/v5/rooms/{uuid}']?.get as
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

  it('keeps Cloud Recording legacy-visible prose in generated endpoint payloads', async () => {
    const source = await createLocalizedOpenApiSource();
    const acquirePage = source.files.find(
      (file) =>
        file.type === 'page' &&
        file.path === 'en/api-reference/api-ref/cloud-recording/acquire.mdx',
    );

    expect(acquirePage?.type).toBe('page');
    if (acquirePage?.type !== 'page') {
      throw new Error('Missing English Cloud Recording acquire page');
    }

    const props = await acquirePage.data.getClientAPIPageProps();
    const acquireOperation =
      props.payload.bundled.paths?.['/v1/apps/{appid}/cloud_recording/acquire']
        ?.post;
    const acquireRecord = acquireOperation as Record<string, unknown>;
    const updateLayoutOperation =
      props.payload.bundled.paths?.[
        '/v1/apps/{appid}/cloud_recording/resourceid/{resourceid}/sid/{sid}/mode/{mode}/updateLayout'
      ]?.post;
    const updateLayoutRecord = updateLayoutOperation as Record<string, unknown>;
    const schemas = props.payload.bundled.components?.schemas as
      | Record<string, Record<string, unknown>>
      | undefined;

    expect(acquireOperation?.summary).toBe('Acquire a resource ID');
    expect(acquireOperation?.description).toBe(
      'Acquires a resource ID for a cloud recording session.',
    );
    expect(acquireOperation?.description).not.toContain(
      'call `start` within two seconds',
    );
    expect(acquireRecord['x-docs-callouts']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          position: 'after-description',
          markdown: expect.stringContaining(
            'Call [`start`](start) within two seconds',
          ),
        }),
      ]),
    );
    expect(acquireRecord['x-docs-sections']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          position: 'before-response-body',
          markdown: expect.stringContaining(
            'If the returned status code is `200`',
          ),
        }),
      ]),
    );
    expect(updateLayoutOperation?.description).toBe(
      'Updates the video mixing layout of an active composite recording.',
    );
    expect(updateLayoutRecord['x-docs-sections']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          position: 'after-description',
          markdown: expect.stringContaining(
            'Each call to this endpoint overwrites all previous layout settings',
          ),
        }),
      ]),
    );
    expect(updateLayoutRecord['x-docs-sections']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          markdown: expect.stringContaining(
            'the background color reverts to the default value `"#000000"`',
          ),
        }),
      ]),
    );
    expect(updateLayoutRecord['x-docs-callouts']).toBeUndefined();
    expect(schemas?.['updateLayout-clientRequest']?.properties).toMatchObject({
      maxResolutionUid: expect.objectContaining({
        description: expect.stringContaining('from 1 to (2³²−1)'),
      }),
      backgroundImage: expect.objectContaining({
        description: expect.stringContaining('Displayed in cropped mode'),
      }),
      defaultUserBackgroundImage: expect.objectContaining({
        description: expect.stringContaining(
          'stops sending video for more than 3.5 seconds',
        ),
      }),
    });
    expect(schemas?.mixedVideoLayout?.description).toEqual(
      expect.stringContaining('Floating layout'),
    );
    expect(schemas?.mixedVideoLayout?.description).toEqual(
      expect.stringContaining('Adaptive layout'),
    );
    expect(schemas?.mixedVideoLayout?.description).toEqual(
      expect.stringContaining('Vertical layout'),
    );
    expect(schemas?.mixedVideoLayout?.description).toEqual(
      expect.stringContaining('Custom layout'),
    );
    expect(schemas?.layoutConfig?.description).toContain(
      'Supports up to 17 users',
    );
    expect(schemas?.backgroundConfig).toMatchObject({
      items: expect.objectContaining({
        properties: expect.objectContaining({
          image_url: expect.objectContaining({
            description: expect.stringContaining('maximum 6 MB'),
          }),
        }),
      }),
    });
    expect(schemas?.cname?.description).toContain(
      'The name of the channel being recorded',
    );
    expect(schemas?.uid?.description).toContain(
      'The UID used by the cloud recording service in the RTC channel',
    );
    expect(schemas?.recordingFileConfig?.['x-docs-callouts']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          markdown: expect.stringContaining(
            'Cannot be set when taking screenshots only',
          ),
        }),
      ]),
    );
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

    const props = await acquirePage.data.getClientAPIPageProps();
    const acquireOperation =
      props.payload.bundled.paths?.['/v1/apps/{appid}/cloud_recording/acquire']
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

    for (const pathItem of Object.values(props.payload.bundled.paths ?? {})) {
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

  it('keeps English operation descriptions as short page summaries', async () => {
    const source = await createLocalizedOpenApiSource();
    const englishPages = source.files.filter(
      (file) =>
        file.type === 'page' &&
        file.path.startsWith('en/api-reference/api-ref/'),
    );
    const overloaded: string[] = [];
    const proceduralPattern =
      /\b(if|only|required|must|cannot|valid|invalid|success|failed|error|returns?|before|after|wait|call|use this endpoint|use this method)\b/i;

    for (const page of englishPages) {
      if (page.type !== 'page') {
        continue;
      }

      const props = await page.data.getClientAPIPageProps();
      for (const operation of props.operations ?? []) {
        const pathItem = props.payload.bundled.paths?.[operation.path];
        const method = operation.method.toLowerCase();
        const operationObject = pathItem?.[method as keyof typeof pathItem] as
          | { description?: unknown; operationId?: unknown }
          | undefined;
        const description =
          typeof operationObject?.description === 'string'
            ? operationObject.description
            : '';

        if (
          description.length > 120 ||
          proceduralPattern.test(description) ||
          /[`[\]]|https?:\/\//.test(description)
        ) {
          overloaded.push(
            `${page.path}:${String(operationObject?.operationId ?? operation.path)}:${description}`,
          );
        }
      }
    }

    expect(overloaded).toEqual([]);
  });

  it('keeps Chinese Speech-to-Text descriptions as short page summaries', async () => {
    const source = await createLocalizedOpenApiSource();
    const expectedDescriptions = new Map([
      [
        'zh-CN/api-reference/api-ref/speech-to-text/join.mdx',
        {
          description: '启动实时转录翻译任务。',
          prose: '你可以通过该方法设置是否需要启用字幕录制、字幕翻译功能。',
        },
      ],
      [
        'zh-CN/api-reference/api-ref/speech-to-text/query.mdx',
        {
          description: '获取实时转录翻译任务状态。',
        },
      ],
      [
        'zh-CN/api-reference/api-ref/speech-to-text/leave.mdx',
        {
          description: '停止实时转录翻译任务并离开频道。',
          prose:
            '开始实时转录翻译后，你可以调用 `leave` 方法离开频道，停止转写。',
        },
      ],
      [
        'zh-CN/api-reference/api-ref/speech-to-text/update.mdx',
        {
          description: '更新实时转录翻译任务配置。',
          prose:
            '通过 [`join`](./join) 方法开始转写任务后，你可以发起 `update` 请求更新转写任务配置。',
        },
      ],
      [
        'zh-CN/api-reference/api-ref/speech-to-text/list.mdx',
        {
          description: '获取符合指定条件的实时转录翻译任务列表。',
        },
      ],
    ]);

    for (const [pagePath, expected] of expectedDescriptions) {
      const page = source.files.find(
        (file) => file.type === 'page' && file.path === pagePath,
      );

      expect(page?.type).toBe('page');
      if (page?.type !== 'page') {
        throw new Error(`Missing OpenAPI page ${pagePath}`);
      }

      const props = await page.data.getClientAPIPageProps();
      const operation = props.operations?.[0];

      expect(operation).toBeDefined();
      if (!operation) {
        throw new Error(`Missing operation payload for ${pagePath}`);
      }

      const pathItem = props.payload.bundled.paths?.[operation.path];
      const method = operation.method.toLowerCase();
      const operationObject = pathItem?.[method as keyof typeof pathItem] as
        | { description?: unknown; ['x-docs-sections']?: unknown }
        | undefined;

      expect(
        typeof operationObject?.description === 'string'
          ? operationObject.description.trim()
          : operationObject?.description,
      ).toBe(expected.description);

      if (!expected.prose) {
        continue;
      }

      const sections = Array.isArray(operationObject?.['x-docs-sections'])
        ? operationObject['x-docs-sections']
        : [];

      expect(sections).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            position: 'after-description',
            markdown: expect.stringContaining(expected.prose),
          }),
        ]),
      );
    }
  });

  it('keeps English docs sections free of malformed leading fragments', async () => {
    const source = await createLocalizedOpenApiSource();
    const englishPages = source.files.filter(
      (file) =>
        file.type === 'page' &&
        file.path.startsWith('en/api-reference/api-ref/'),
    );
    const malformed: string[] = [];
    const malformedLeadingFragmentPattern = /^\s*\/[^\n]*"\s*>/;

    for (const page of englishPages) {
      if (page.type !== 'page') {
        continue;
      }

      const props = await page.data.getClientAPIPageProps();
      for (const operation of props.operations ?? []) {
        const pathItem = props.payload.bundled.paths?.[operation.path];
        const method = operation.method.toLowerCase();
        const operationObject = pathItem?.[method as keyof typeof pathItem] as
          | { ['x-docs-sections']?: unknown; operationId?: unknown }
          | undefined;
        const sections = Array.isArray(operationObject?.['x-docs-sections'])
          ? operationObject['x-docs-sections']
          : [];

        for (const section of sections) {
          if (
            typeof section !== 'object' ||
            section === null ||
            !('markdown' in section) ||
            typeof section.markdown !== 'string'
          ) {
            continue;
          }

          if (malformedLeadingFragmentPattern.test(section.markdown)) {
            malformed.push(
              `${page.path}:${String(operationObject?.operationId ?? operation.path)}:${section.markdown}`,
            );
          }
        }
      }
    }

    expect(malformed).toEqual([]);
  });

  it('exposes the Fumadocs OpenAPI loader plugin', () => {
    expect(getOpenApiLoaderPlugin().name).toBe('fumadocs:openapi');
  });
});
