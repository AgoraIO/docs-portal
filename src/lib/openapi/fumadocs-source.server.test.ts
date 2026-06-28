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
    expect(pagePaths).not.toContain(
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
    expect(pagePaths).not.toContain(
      'zh-CN/api-reference/api-ref/rtmp-gateway/create-streaming-key.mdx',
    );
    expect(pagePaths).toContain(
      'en/api-reference/api-ref/speech-to-text/join.mdx',
    );
    expect(pagePaths).toHaveLength(91);
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
    expect(
      schemas?.['updateLayout-clientRequest']?.properties,
    ).toMatchObject({
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

  it('exposes the Fumadocs OpenAPI loader plugin', () => {
    expect(getOpenApiLoaderPlugin().name).toBe('fumadocs:openapi');
  });
});
