import { describe, expect, it } from 'vitest';
import {
  getOpenApiEndpointUrl,
  getOpenApiLanes,
  getOpenApiOperationIds,
  getOpenApiPrerenderPaths,
  resolveOpenApiEndpointRoute,
  resolveOpenApiLaneRoute,
} from './lanes';

describe('openapi lanes', () => {
  it('describes each YAML lane as one IA mapping record', () => {
    expect(getOpenApiLanes()).toEqual([
      expect.objectContaining({
        id: 'convoai',
        publicSourceUrl: {
          en: '/openapi/conversational-ai/rest-api.en.yaml',
          'zh-CN': '/openapi/conversational-ai/rest-api.zh-CN.yaml',
        },
        routePrefix: 'api-reference/api-ref/conversational-ai',
        sourcePath: {
          en: 'content/openapi/conversational-ai/rest-api.en.yaml',
          'zh-CN': 'content/openapi/conversational-ai/rest-api.zh-CN.yaml',
        },
        tab: 'api-reference',
      }),
      expect.objectContaining({
        id: 'rtc-rest',
        locales: ['en'],
        publicSourceUrl: {
          en: '/openapi/rtc/channel-management.en.yaml',
          'zh-CN': '/openapi/rtc/channel-management.en.yaml',
        },
        routePrefix: 'api-reference/api-ref/rtc',
        sourcePath: {
          en: 'content/openapi/rtc/channel-management.en.yaml',
          'zh-CN': 'content/openapi/rtc/channel-management.en.yaml',
        },
        tab: 'api-reference',
      }),
      expect.objectContaining({
        id: 'signaling-rest',
        routePrefix: 'api-reference/api-ref/signaling',
        tab: 'api-reference',
      }),
      expect.objectContaining({
        id: 'cloud-recording-rest',
        routePrefix: 'api-reference/api-ref/cloud-recording',
        tab: 'api-reference',
      }),
      expect.objectContaining({
        id: 'cloud-transcoding-rest',
        routePrefix: 'api-reference/api-ref/cloud-transcoding',
        tab: 'api-reference',
      }),
      expect.objectContaining({
        id: 'media-gateway-rest',
        locales: ['en'],
        publicSourceUrl: {
          en: '/openapi/media-gateway/media-gateway.en.yaml',
          'zh-CN': '/openapi/media-gateway/media-gateway.en.yaml',
        },
        routePrefix: 'api-reference/api-ref/rtmp-gateway',
        sourcePath: {
          en: 'content/openapi/media-gateway/media-gateway.en.yaml',
          'zh-CN': 'content/openapi/media-gateway/media-gateway.en.yaml',
        },
        tab: 'api-reference',
      }),
      expect.objectContaining({
        id: 'speech-to-text-rest',
        routePrefix: 'api-reference/api-ref/speech-to-text',
        tab: 'api-reference',
      }),
    ]);
  });

  it('builds endpoint and parent URLs from the lane mapping', () => {
    const [lane] = getOpenApiLanes();

    expect(lane.parentUrl.en).toBe(
      '/en/api-reference/api-ref/conversational-ai',
    );
    expect(getOpenApiEndpointUrl(lane, 'en', 'start-agent')).toBe(
      '/en/api-reference/api-ref/conversational-ai/join',
    );
    expect(getOpenApiEndpointUrl(lane, 'zh-CN', 'start-agent')).toBe(
      '/zh-CN/api-reference/api-ref/conversational-ai/join',
    );
  });

  it('resolves endpoint routes without product-specific loader logic', () => {
    expect(
      resolveOpenApiEndpointRoute('en', 'api-reference', [
        'api-ref',
        'conversational-ai',
        'join',
      ]),
    ).toMatchObject({
      lane: expect.objectContaining({ id: 'convoai' }),
      operationId: 'start-agent',
      routeLeaf: 'join',
      url: '/en/api-reference/api-ref/conversational-ai/join',
    });
  });

  it('derives operation order and static paths from lane operations', () => {
    const [lane] = getOpenApiLanes();

    expect(getOpenApiOperationIds(lane)).toEqual([
      'start-agent',
      'stop-agent',
      'agent-update',
      'query-agent-status',
      'get-agent-list',
      'agent-speak',
      'agent-interrupt',
      'agent-think',
      'get-history',
      'get-turns',
    ]);
    expect(getOpenApiPrerenderPaths()).toContain(
      '/en/api-reference/api-ref/conversational-ai/join',
    );
    expect(getOpenApiPrerenderPaths()).toContain(
      '/en/api-reference/api-ref/rtc/query-channel-list',
    );
    expect(getOpenApiPrerenderPaths()).toContain(
      '/en/api-reference/api-ref/signaling/peer-to-peer-message',
    );
    expect(getOpenApiPrerenderPaths()).toContain(
      '/en/api-reference/api-ref/cloud-recording/acquire',
    );
    expect(getOpenApiPrerenderPaths()).toContain(
      '/en/api-reference/api-ref/cloud-transcoding/acquire',
    );
    expect(getOpenApiPrerenderPaths()).toContain(
      '/en/api-reference/api-ref/rtmp-gateway/create-streaming-key',
    );
    expect(getOpenApiPrerenderPaths()).toContain(
      '/en/api-reference/api-ref/speech-to-text/join',
    );
    expect(getOpenApiPrerenderPaths()).toHaveLength(91);
  });

  it('resolves RTC REST endpoint routes in the api-reference tab', () => {
    expect(
      resolveOpenApiEndpointRoute('en', 'api-reference', [
        'api-ref',
        'rtc',
        'query-channel-list',
      ]),
    ).toMatchObject({
      lane: expect.objectContaining({ id: 'rtc-rest' }),
      operationId: 'cma-query-channel-list',
      routeLeaf: 'query-channel-list',
      url: '/en/api-reference/api-ref/rtc/query-channel-list',
    });
  });

  it('resolves signaling REST endpoint routes in the api-reference tab', () => {
    expect(
      resolveOpenApiEndpointRoute('en', 'api-reference', [
        'api-ref',
        'signaling',
        'peer-to-peer-message',
      ]),
    ).toMatchObject({
      lane: expect.objectContaining({ id: 'signaling-rest' }),
      operationId: 'send-peer-message',
      routeLeaf: 'peer-to-peer-message',
      url: '/en/api-reference/api-ref/signaling/peer-to-peer-message',
    });
  });

  it('resolves Cloud Recording REST endpoint routes in the api-reference tab', () => {
    expect(
      resolveOpenApiEndpointRoute('en', 'api-reference', [
        'api-ref',
        'cloud-recording',
        'acquire',
      ]),
    ).toMatchObject({
      lane: expect.objectContaining({ id: 'cloud-recording-rest' }),
      operationId: 'acquire-cloud-recording-resource',
      routeLeaf: 'acquire',
      url: '/en/api-reference/api-ref/cloud-recording/acquire',
    });
  });

  it('keeps Cloud Recording endpoint titles aligned with the legacy REST pages', () => {
    const route = resolveOpenApiEndpointRoute('en', 'api-reference', [
      'api-ref',
      'cloud-recording',
      'acquire',
    ]);

    expect(route?.lane.operations).toMatchObject({
      'acquire-cloud-recording-resource': {
        title: { en: 'Acquire a resource ID' },
      },
      'start-cloud-recording': {
        title: { en: 'Start a cloud recording task' },
      },
      'update-cloud-recording': {
        title: { en: 'Update task settings' },
      },
      'update-cloud-recording-layout': {
        title: { en: 'Update layout' },
      },
      'query-cloud-recording': {
        title: { en: 'Query status' },
      },
      'stop-cloud-recording': {
        title: { en: 'Stop a cloud recording task' },
      },
    });
  });

  it('resolves Cloud Transcoding REST endpoint routes in the api-reference tab', () => {
    expect(
      resolveOpenApiEndpointRoute('en', 'api-reference', [
        'api-ref',
        'cloud-transcoding',
        'acquire',
      ]),
    ).toMatchObject({
      lane: expect.objectContaining({ id: 'cloud-transcoding-rest' }),
      operationId: 'acquire-cloud-transcoding-builder-token',
      routeLeaf: 'acquire',
      url: '/en/api-reference/api-ref/cloud-transcoding/acquire',
    });
  });

  it('resolves Media Gateway REST endpoint routes in the api-reference tab', () => {
    expect(
      resolveOpenApiEndpointRoute('en', 'api-reference', [
        'api-ref',
        'rtmp-gateway',
        'create-streaming-key',
      ]),
    ).toMatchObject({
      lane: expect.objectContaining({ id: 'media-gateway-rest' }),
      operationId: 'create-media-gateway-streaming-key',
      routeLeaf: 'create-streaming-key',
      url: '/en/api-reference/api-ref/rtmp-gateway/create-streaming-key',
    });
  });

  it('does not match the api-reference catalog routes to any lane', () => {
    for (const slug of [['recipes'], ['sdks'], ['faq'], ['api-ref']]) {
      expect(resolveOpenApiLaneRoute('en', 'api-reference', slug)).toBeNull();
    }
  });
});
